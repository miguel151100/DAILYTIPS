from backtest.plot import plot_equity_curve


def test_plot_equity_curve_writes_a_nonempty_png(tmp_path):
    equity_curve = [10_000, 10_050, 9_980, 10_120, 10_200]
    out_path = tmp_path / "equity_curve.png"

    plot_equity_curve(equity_curve, out_path)

    assert out_path.exists()
    assert out_path.stat().st_size > 0
    with open(out_path, "rb") as f:
        assert f.read(8) == b"\x89PNG\r\n\x1a\n"
