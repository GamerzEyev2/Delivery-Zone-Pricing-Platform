from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "ZonePilot API"
    ENV: str = "dev"

    DATABASE_URL: str

    JWT_SECRET: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 720

    CORS_ORIGINS: str = "http://localhost:3000"

    SEED_ADMIN_EMAIL: str = "admin@zonepilot.local"
    SEED_ADMIN_PASSWORD: str = "Admin@123"

    SEED_DEMO: int = 1

    def cors_list(self) -> list[str]:
        return [x.strip() for x in self.CORS_ORIGINS.split(",") if x.strip()]


settings = Settings()
