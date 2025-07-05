from .models import *
from . import dashboard_api

dashboard_api.add_resource(GetBoards, "/get/dashboard/boards")
dashboard_api.add_resource(GetUserHubs, "/get/user/hubs")
dashboard_api.add_resource(GetConnectedAccounts, "/get/connected-accounts")
