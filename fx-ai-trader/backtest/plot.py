"""Visualize a backtest's equity curve as a PNG."""
import matplotlib

matplotlib.use("Agg")  # headless -- no display available, and none needed
import matplotlib.pyplot as plt


def plot_equity_curve(equity_curve: list[float], path, title: str = "Backtest equity curve") -> None:
    """Save a simple line chart of account balance over the sequence of
    closed trades, with the starting balance marked for reference."""
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.plot(equity_curve, linewidth=1.5, color="#2563eb")
    ax.axhline(equity_curve[0], color="gray", linestyle="--", linewidth=0.8, label="starting balance")
    ax.set_xlabel("trade #")
    ax.set_ylabel("account balance")
    ax.set_title(title)
    ax.legend()
    fig.tight_layout()
    fig.savefig(path, dpi=120)
    plt.close(fig)
