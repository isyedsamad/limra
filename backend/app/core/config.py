from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="ENERGYBOARD_")

    PROJECT_ROOT: Path = Path(__file__).resolve().parents[3]
    DATA_DIR: Path = PROJECT_ROOT / "data"
    RAW_DATA_DIR: Path = DATA_DIR / "raw"
    PROCESSED_DATA_DIR: Path = DATA_DIR / "processed"
    
    ELEXON_BASE_URL: str = "https://data.elexon.co.uk/bmrs/api/v1"
    REQUEST_TIMEOUT_SECONDS: float = 60.0
    MAX_RETRIES: int = 4
    RETRY_BACKOFF_FACTOR: float = 1.5

settings = Settings()