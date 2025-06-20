from .models import *
from . import dashboard_api

dashboard_api.add_resource(GetBoards, "/get/dashboard/boards")
# dashboard_api.add_resource(GetNotes, "/get/sticky-notes")
