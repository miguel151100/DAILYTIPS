import csv

import pytest

from report import _read_trades, generate_report, save_report, summarize_trades


class _FakeMessage:
    def __init__(self, content):
        self.content = content


class _FakeChoice:
    def __init__(self, content):
        self.message = _FakeMessage(content)


class _FakeResponse:
    def __init__(self, content):
        self.choices = [_FakeChoice(content)]


class _FakeCompletions:
    def __init__(self, reply):
        self._reply = reply
        self.last_call = None

    def create(self, model, messages):
        self.last_call = {"model": model, "messages": messages}
        return _FakeResponse(self._reply)


class _FakeClient:
    def __init__(self, reply="El bot abrió 2 operaciones."):
        self.chat = self
        self.completions = _FakeCompletions(reply)


_FIELDNAMES = [
    "time",
    "instrument",
    "direction",
    "probability_up",
    "entry_price",
    "stop_price",
    "target_price",
    "units",
    "balance_before",
]


def _write_trades_csv(path, rows):
    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=_FIELDNAMES)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def _trade_row(instrument="EUR_USD", direction="long"):
    return {
        "time": "2024-06-01T10:00:00",
        "instrument": instrument,
        "direction": direction,
        "probability_up": 0.62,
        "entry_price": 1.1000,
        "stop_price": 1.0980,
        "target_price": 1.1040,
        "units": 50000,
        "balance_before": 10000,
    }


def test_read_trades_returns_empty_list_when_file_missing(tmp_path):
    assert _read_trades(tmp_path / "does_not_exist.csv") == []


def test_read_trades_parses_existing_csv(tmp_path):
    path = tmp_path / "trades.csv"
    _write_trades_csv(path, [_trade_row()])

    trades = _read_trades(path)
    assert len(trades) == 1
    assert trades[0]["instrument"] == "EUR_USD"


def test_summarize_trades_counts_by_instrument_and_direction():
    trades = [
        _trade_row("EUR_USD", "long"),
        _trade_row("EUR_USD", "short"),
        _trade_row("USD_JPY", "long"),
    ]
    summary = summarize_trades(trades)

    assert summary["n_trades"] == 3
    assert summary["by_instrument"] == {"EUR_USD": 2, "USD_JPY": 1}
    assert summary["by_direction"] == {"long": 2, "short": 1}
    assert summary["instruments_traded"] == ["EUR_USD", "USD_JPY"]


def test_generate_report_skips_llm_call_when_no_trades():
    client = _FakeClient()
    report = generate_report(trades=[], client=client)

    assert "no se abrieron" in report.lower()
    assert client.completions.last_call is None


def test_generate_report_calls_llm_with_trade_summary():
    client = _FakeClient(reply="Resumen generado.")
    trades = [_trade_row("EUR_USD", "long")]

    report = generate_report(trades=trades, client=client)

    assert report == "Resumen generado."
    prompt = client.completions.last_call["messages"][-1]["content"]
    assert "EUR_USD" in prompt
    assert "1" in prompt  # n_trades


def test_save_report_writes_to_logs_dir_with_date_in_filename(monkeypatch, tmp_path):
    import config

    monkeypatch.setattr(config, "LOG_DIR", tmp_path)
    path = save_report("contenido del reporte", date="2024-06-01")

    assert path == tmp_path / "report_2024-06-01.txt"
    assert path.read_text() == "contenido del reporte"
