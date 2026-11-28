from pydantic_settings import BaseSettings, SettingsConfigDict
class Settings(BaseSettings):
    database_url: str = 'postgresql+psycopg://jansahayak:jansahayak@localhost:5432/jansahayak'
    jwt_secret: str = 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET'
    jwt_expire_minutes: int = 1440
    cors_origins: str = 'http://localhost:5173'
    upload_dir: str = 'uploads'
    gemini_api_key: str|None = None
    gemini_model: str = 'gemini-2.5-flash'
    redis_url: str = 'redis://localhost:6379/0'
    model_config = SettingsConfigDict(env_file='.env',extra='ignore')
settings=Settings()
