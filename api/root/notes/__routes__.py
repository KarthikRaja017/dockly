from .models import *
from . import notes_api

notes_api.add_resource(AddNotes, "/add/sticky-notes")
notes_api.add_resource(GetNotes, "/get/sticky-notes")
