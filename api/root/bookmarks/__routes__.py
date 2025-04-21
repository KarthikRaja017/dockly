from .models import GetBookmarks, SaveAllBookmarks, SaveBookmarks
from . import bookmarks_api


bookmarks_api.add_resource(SaveBookmarks, "/save")
bookmarks_api.add_resource(SaveAllBookmarks, "/all/save")
bookmarks_api.add_resource(GetBookmarks, "/get")
