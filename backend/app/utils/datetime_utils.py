from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from backend.app.core.constants import UTC_TZ, LONDON_TZ

def parse_iso_datetime(dt_str: str) -> datetime:
    if dt_str.endswith("Z"):
        dt = datetime.fromisoformat(dt_str[:-1]).replace(tzinfo=timezone.utc)
    else:
        dt = datetime.fromisoformat(dt_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

def to_iso_string(dt: datetime) -> str:
    utc_dt = dt.astimezone(timezone.utc)
    return utc_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

def settlement_period_from_datetime(dt: datetime) -> int:
    london_dt = dt.astimezone(LONDON_TZ)
    return (london_dt.hour * 60 + london_dt.minute) // 30 + 1

def settlement_date_from_datetime(dt: datetime) -> str:
    london_dt = dt.astimezone(LONDON_TZ)
    return london_dt.strftime("%Y-%m-%d")

def is_half_hour_aligned(dt: datetime) -> bool:
    return dt.minute in (0, 30) and dt.second == 0 and dt.microsecond == 0

def quantize_to_half_hour(dt: datetime) -> datetime:
    minute = 0 if dt.minute < 30 else 30
    return dt.replace(minute=minute, second=0, microsecond=0)

def generate_january_2026_periods() -> list[datetime]:
    start = datetime(2026, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
    periods = []
    for step in range(1488):
        periods.append(start + timedelta(minutes=30 * step))
    return periods