from pydantic import BaseSettings
from datetime import timedelta
from typing import Optional


class Settings(BaseSettings):
    # Database
    POSTGRES_URI: str

    # Secrets
    CLIENT_SECRET: str
    DROPBOX_CLIENT_ID: str
    DROPBOX_CLIENT_SECRET: str
    DROPBOX_REDIRECT_URI: str
    CLIENT_ID: str
    G_SECRET_KEY: str
    SECRET_KEY: str

    # Required for fastapi-jwt-auth
    authjwt_secret_key: str  # <-- ✅ added (can reuse SECRET_KEY if you want)

    # Email / SMTP
    SMTP_SERVER: str
    SMTP_PORT: int
    EMAIL_SENDER: str
    EMAIL_PASSWORD: str

    # JWT Settings
    G_ACCESS_EXPIRES: timedelta = timedelta(minutes=50000000)
    G_REFRESH_EXPIRES: timedelta = timedelta(days=30)

    # API & Web URLs
    API_URL: str = "http://localhost:5000/server/api"
    WEB_URL: str = "http://localhost:3000"

    # External services
    AUTH_ENDPOINT: Optional[str] = None
    API_SECRET_KEY: str = "https://auth.quiltt.io/v1/users/sessions"
    GOOGLE_TOKEN_URI: str = "https://oauth2.googleapis.com/token"

    # Google Scopes
    SCOPE: str = (
        "email profile "
        "https://www.googleapis.com/auth/calendar "
        "https://www.googleapis.com/auth/drive "
        "https://www.googleapis.com/auth/fitness.activity.read "
        "https://www.googleapis.com/auth/fitness.body.read "
        "https://www.googleapis.com/auth/fitness.location.read "
        "https://www.googleapis.com/auth/fitness.sleep.read "
        "https://www.googleapis.com/auth/userinfo.email "
        "https://www.googleapis.com/auth/userinfo.profile "
        "openid"
    )

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
