"""Position sizing, stop-loss/take-profit levels, and a portfolio-wide daily
loss circuit breaker. This is the one component that stands between a bad
model signal and losing real (even if only demo) money across every pair the
bot trades -- keep it simple and conservative.
"""
from dataclasses import dataclass, field

import config


@dataclass
class RiskManager:
    starting_balance: float
    risk_per_trade: float = config.RISK_PER_TRADE
    stop_loss_pips: float = config.STOP_LOSS_PIPS
    take_profit_pips: float = config.TAKE_PROFIT_PIPS
    max_daily_loss_fraction: float = config.MAX_DAILY_LOSS_FRACTION
    max_positions_per_instrument: int = config.MAX_POSITIONS_PER_INSTRUMENT
    max_total_risk_fraction: float = config.MAX_TOTAL_RISK_FRACTION

    day_start_balance: float = field(init=False)
    # open trade count per instrument, e.g. {"EUR_USD": 1, "USD_JPY": 1} --
    # resynced from the broker every run via
    # execution.oanda_client.get_open_trades_by_instrument()
    open_positions: dict[str, int] = field(default_factory=dict)
    halted: bool = field(default=False, init=False)

    def __post_init__(self) -> None:
        self.day_start_balance = self.starting_balance

    def position_size(self, balance: float, instrument: str) -> float:
        """Units such that hitting the stop-loss costs exactly
        `risk_per_trade` fraction of the current balance."""
        risk_amount = balance * self.risk_per_trade
        stop_distance = self.stop_loss_pips * config.pip_size_for(instrument)
        return risk_amount / stop_distance

    def stop_loss_price(self, entry_price: float, direction: str, instrument: str) -> float:
        distance = self.stop_loss_pips * config.pip_size_for(instrument)
        return entry_price - distance if direction == "long" else entry_price + distance

    def take_profit_price(self, entry_price: float, direction: str, instrument: str) -> float:
        distance = self.take_profit_pips * config.pip_size_for(instrument)
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

    def can_open_trade(self, balance: float, instrument: str) -> bool:
        if self.halted:
            return False
        if self.open_positions.get(instrument, 0) >= self.max_positions_per_instrument:
            return False
        # approximated as (open positions * risk_per_trade) since every
        # position is sized to risk the same fraction of balance -- doesn't
        # account for cross-pair correlation (e.g. EUR/USD + GBP/USD longs
        # are both USD-exposure bets), a deliberate simplification, not an
        # oversight (see README).
        if self.total_open_positions() * self.risk_per_trade >= self.max_total_risk_fraction:
            return False
        if self.daily_drawdown(balance) >= self.max_daily_loss_fraction:
            self.halted = True
            return False
        return True

    def register_open(self, instrument: str) -> None:
        self.open_positions[instrument] = self.open_positions.get(instrument, 0) + 1

    def register_close(self, instrument: str, balance: float) -> None:
        self.open_positions[instrument] = max(0, self.open_positions.get(instrument, 0) - 1)
        if self.daily_drawdown(balance) >= self.max_daily_loss_fraction:
            self.halted = True
