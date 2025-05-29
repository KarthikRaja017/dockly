
from .models import AddGoogle, GoogleCallback
from . import google_api


google_api.add_resource(AddGoogle, "/add-googleAccount")
google_api.add_resource(GoogleCallback, "/auth/google/callback")