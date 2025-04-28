from dotenv import load_dotenv
import os
from datetime import timedelta
import firebase_admin
from firebase_admin import auth, credentials


load_dotenv()  # Load variables from .env file

# Configs
POSTGRES_URI = os.getenv("POSTGRES_URI")

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

G_ACCESS_EXPIRES = timedelta(minutes=50000000)
G_REFRESH_EXPIRES = timedelta(days=30)
G_SECRET_KEY = os.getenv("G_SECRET_KEY")

AUTH_ENDPOINT = os.getenv('QUILTT_API_SECRET_KEY')

API_SECRET_KEY='https://auth.quiltt.io/v1/users/sessions'


# firebase_cred_path = os.getenv("FIREBASE_CRED_PATH")
# cred = credentials.Certificate(firebase_cred_path)
# firebase_admin.initialize_app(cred)
