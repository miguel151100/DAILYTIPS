"""Position sizing, stop-loss/take-profit levels, and a portfolio-wide daily
loss circuit breaker. This is the one component that stands between a bad
model signal and losing real (even if only testnet) money across every
symbol the bot trades -- keep it simple and conservative.

Distances are percent-of-entry-price, not a fixed price amount: crypto
prices span orders of magnitude (BTC ~$60,000, a small-cap token ~$0.002),
so a fixed distance (forex's "pip") doesn't generalize the way a percentage
does. This is simpler than the forex version, not just different -- there's
no more per-symbol lookup needed here (that lives in
execution/binance_client.py, sourced from the real exchange, for the
quantity/price *rounding* that this module doesn't need to know about).
"""
from dataclasses import dataclass, field

import config


@dataclass
class RiskManager:
    starting_balance: float
    risk_per_trade: float = config.RISK_PER_TRADE
    stop_loss_percent: float = config.STOP_LOSS_PERCENT
    take_profit_percent: float = config.TAKE_PROFIT_PERCENT
    max_daily_loss_fraction: float = config.MAX_DAILY_LOSS_FRACTION
    max_positions_per_instrument: int = config.MAX_POSITIONS_PER_INSTRUMENT
    max_total_risk_fraction: float = config.MAX_TOTAL_RISK_FRACTION

    day_start_balance: float = field(init=False)
    # open position count per symbol, e.g. {"BTCUSDT": 1, "ETHUSDT": 1} --
    # resynced from the exchange every run via
    # execution.binance_client.get_open_positions_by_symbol()
    open_positions: dict[str, int] = field(default_factory=dict)
    halted: bool = field(default=False, init=False)

    def __post_init__(self) -> None:
        self.day_start_balance = self.starting_balance

    def position_size(self, balance: float, entry_price: float) -> float:
        """Quantity (in base-asset units) such that hitting the stop-loss
        costs exactly `risk_per_trade` fraction of the current balance.
        Callers must still round this to the symbol's quantity step via
        execution.binance_client.round_quantity before sending an order."""
        risk_amount = balance * self.risk_per_trade
        stop_distance = entry_price * self.stop_loss_percent
        return risk_amount / stop_distance

    def stop_loss_price(self, entry_price: float, direction: str) -> float:
        distance = entry_price * self.stop_loss_percent
        return entry_price - distance if direction == "long" else entry_price + distance

    def take_profit_price(self, entry_price: float, direction: str) -> float:
        distance = entry_price * self.take_profit_percent
        return entry_price + distance if direction == "long" else entry_price - distance

    def start_new_day(self, balance: float) -> None:
        self.day_start_balance = balance
        self.halted = False

    def daily_drawdown(self, balance: float) -> float:
        if self.day_start_balance <= 0:
            return 0.0
        return max(0.0, (self.day_start_balance - balance) / self.day_start_balance)

    def total_open_positions(self) -> int:
        return sum(self.open_positions.values())

    def can_open_trade(self, balance: float, symbol: str) -> bool:
        if self.halted:
            return False
        if self.open_positions.get(symbol, 0) >= self.max_positions_per_instrument:
            return False
        # approximated as (open positions * risk_per_trade) since every
        # position is sized to risk the same fraction of balance -- doesn't
        # account for cross-symbol correlation (e.g. BTCUSDT + ETHUSDT longs
        # are both "crypto market up" bets), a deliberate simplification,
        # not an oversight (see README).
        if self.total_open_positions() * self.risk_per_trade >= self.max_total_risk_fraction:
            return False
        if self.daily_drawdown(balance) >= self.max_daily_loss_fraction:
            self.halted = True
            return False
        return True

    def register_open(self, symbol: str) -> None:
        self.open_positions[symbol] = self.open_positions.get(symbol, 0) + 1

    def register_close(self, symbol: str, balance: float) -> None:
        self.open_positions[symbol] = max(0, self.open_positions.get(symbol, 0) - 1)
        if self.daily_drawdown(balance) >= self.max_daily_loss_fraction:
            self.halted = True
