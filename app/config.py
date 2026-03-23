from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379/0"
    STOCKFISH_PATH: str
    STOCKFISH_DEPTH: int = 18
    STOCKFISH_THREADS: int = 2
    STOCKFISH_HASH_MB: int = 256

    class Config:
        env_file = ".env"


settings = Settings()
