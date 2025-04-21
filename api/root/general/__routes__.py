from root.general.currentUser import CurrentUser
from . import general_api

general_api.add_resource(CurrentUser, "/currentUser", endpoint="CurrentUser")

