import time
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
import httpx
from backend.app.core.config import settings
from backend.app.core.constants import ELEXON_BASE_URL, FUELHH_ENDPOINT, WINDFOR_ENDPOINT
from backend.app.utils.datetime_utils import to_iso_string

class ElexonService:
    def __init__(self, base_url: Optional[str] = None, timeout: Optional[float] = None) -> None:
        self.base_url = (base_url or settings.ELEXON_BASE_URL).rstrip("/")
        self.timeout = timeout or settings.REQUEST_TIMEOUT_SECONDS
        self.max_retries = settings.MAX_RETRIES
        self.backoff_factor = settings.RETRY_BACKOFF_FACTOR

    def _get_with_retry(self, endpoint: str, params: Dict[str, Any]) -> List[Dict[str, Any]]:
        url = f"{self.base_url}{endpoint}"
        last_exception: Optional[Exception] = None
        
        with httpx.Client(timeout=self.timeout) as client:
            for attempt in range(1, self.max_retries + 1):
                try:
                    response = client.get(url, params=params)
                    if response.status_code == 200:
                        data = response.json()
                        if isinstance(data, list):
                            return data
                        return []
                    if response.status_code in (429, 500, 502, 503, 504):
                        sleep_time = self.backoff_factor ** attempt
                        time.sleep(sleep_time)
                        continue
                    response.raise_for_status()
                except (httpx.RequestError, httpx.HTTPStatusError) as exc:
                    last_exception = exc
                    sleep_time = self.backoff_factor ** attempt
                    time.sleep(sleep_time)

        if last_exception:
            raise last_exception
        return []

    def fetch_fuelhh_range(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        params = {
            "settlementDateFrom": start_date,
            "settlementDateTo": end_date,
        }
        return self._get_with_retry(FUELHH_ENDPOINT, params)

    def fetch_windfor_chunk(self, publish_from: datetime, publish_to: datetime) -> List[Dict[str, Any]]:
        params = {
            "publishDateTimeFrom": to_iso_string(publish_from),
            "publishDateTimeTo": to_iso_string(publish_to),
        }
        return self._get_with_retry(WINDFOR_ENDPOINT, params)

    def fetch_windfor_range(
        self,
        publish_start: datetime,
        publish_end: datetime,
        chunk_days: int = 3,
    ) -> List[Dict[str, Any]]:
        all_records: List[Dict[str, Any]] = []
        current_start = publish_start
        
        while current_start < publish_end:
            current_end = min(current_start + timedelta(days=chunk_days), publish_end)
            chunk_records = self.fetch_windfor_chunk(current_start, current_end)
            all_records.extend(chunk_records)
            current_start = current_end

        return all_records