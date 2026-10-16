"""Deduplicación de eventos: el mismo evento enviado en vivo y en el cierre de fase cuenta una vez."""
from datetime import datetime, timedelta, timezone

from app.services.events import _key


def test_same_event_same_key_regardless_of_timezone_form():
    aware = datetime(2026, 10, 15, 22, 0, 0, 123000, tzinfo=timezone.utc)
    naive = aware.replace(tzinfo=None)
    bogota = aware.astimezone(timezone(timedelta(hours=-5)))
    assert _key("ATTEMPT", aware) == _key("ATTEMPT", naive) == _key("ATTEMPT", bogota)


def test_different_type_or_millisecond_is_a_different_event():
    t = datetime(2026, 10, 15, 22, 0, 0, 123000, tzinfo=timezone.utc)
    assert _key("ATTEMPT", t) != _key("BOARD_STATE", t)
    assert _key("ATTEMPT", t) != _key("ATTEMPT", t + timedelta(milliseconds=1))
