from .models import *
from . import notifications_api

notifications_api.add_resource(RespondNotification, "/respond/notification")
notifications_api.add_resource(GetNotifications, "/get/notifications")
