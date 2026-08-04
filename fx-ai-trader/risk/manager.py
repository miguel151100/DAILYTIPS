"""Position sizing, stop-loss/take-profit levels, and a daily-loss circuit
breaker. This is the one component that stands between a bad model signal
and losing real (even if only demo) money -- keep it simple and conservative.
"""
from dataclasses import dataclass, field

import config


@dataclass
class RiskManager:
    starting_balance: float
    risk_per_trade: float = config.RISK_PER_TRADE
    stop_loss_pips: float = config.STOP_LOSS_PIPS
    take_profit_pips: float = config.TAKE_PROFIT_PIPS
    pip_size: float = config.PIP_SIZE
    max_daily_loss_fraction: float = config.MAX_DAILY_LOSS_FRACTION
    max_open_positions: int = config.MAX_OPEN_POSITIONS

    day_start_balance: float = field(init=False)
    open_positions: int = field(default=0, init=False)
    halted: bool = field(default=False, init=False)

    def __post_init__(self) -> None:
        self.day_start_balance = self.starting_balance

    def position_size(self, balance: float) -> float:
        """Units such that hitting the stop-loss costs exactly
        `risk_per_trade` fraction of the current balance."""
        risk_amount = balance * self.risk_per_trade
        stop_distance = self.stop_loss_pips * self.pip_size
        return risk_amount / stop_distance

    def stop_loss_price(self, entry_price: float, direction: str) -> float:
        distance = self.stop_loss_pips * self.pip_size
        return entry_price - distance if direction == "long" else entry_price + distance

    def take_profit_price(self, entry_price: float, direction: str) -> float:
        distance = self.take_profit_pips * self.pip_size
        return entry_price + distance if direction == "long" else entry_price - distance

    def start_new_day(self, balance: float) -> None:
        self.day_start_balance = balance
        self.halted = False

    def daily_drawdown(self, balance: float) -> float:
        if self.day_start_balance <= 0:
            return 0.0
        return max(0.0, (self.day_start_balance - balance) / self.day_start_balance)

    def can_open_trade(self, balance: float) -> bool:
        if self.halted:
            return False
        if self.open_positions >= self.max_open_positions:
            return False
        if self.daily_drawdown(balance) >= self.max_daily_loss_fraction:
            self.halted = True
            return False
        return True

    def register_open(self) -> None:
        self.open_positions += 1

    def register_close(self, balance: float) -> None:
        self.open_positions = max(0, self.open_positions - 1)
        if self.daily_drawdown(balance) >= self.max_daily_loss_fraction:
            self.halted = True
