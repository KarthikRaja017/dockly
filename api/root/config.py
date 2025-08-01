from dotenv import load_dotenv
import os
from datetime import timedelta
import firebase_admin
from firebase_admin import auth, credentials


load_dotenv()  # Load variables from .env file

# Configs
POSTGRES_URI = os.getenv("POSTGRES_URI")

CLIENT_SECRET = os.getenv("CLIENT_SECRET")
CLIENT_ID = os.getenv("CLIENT_ID")
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

G_ACCESS_EXPIRES = timedelta(minutes=50000000)
G_REFRESH_EXPIRES = timedelta(days=30)
G_SECRET_KEY = os.getenv("G_SECRET_KEY")
SECRET_KEY = os.getenv("SECRET_KEY")

AUTH_ENDPOINT = os.getenv("QUILTT_API_SECRET_KEY")

API_SECRET_KEY = "https://auth.quiltt.io/v1/users/sessions"
# API_URL = "http://localhost:5000/server/api"
# API_URL = "https://dockly.onrender.com/server/api"
# # WEB_URL = "http://192.168.1.14:3000"
# WEB_URL = "https://docklyme.vercel.app"

API_URL = os.getenv("API_URL", "http://localhost:5000/server/api")
print(f"API_URL: {API_URL}")
WEB_URL = os.getenv("WEB_URL", "http://localhost:3000")
print(f"WEB_URL: {WEB_URL}")
uri = "https://oauth2.googleapis.com/token"

SCOPE = (
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


# firebase_cred_path = os.getenv("FIREBASE_CRED_PATH")
# cred = credentials.Certificate(firebase_cred_path)
# firebase_admin.initialize_app(cred)
