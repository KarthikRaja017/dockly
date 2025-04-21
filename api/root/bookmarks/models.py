from flask import request
from flask_restful import Resource

from root.db.dbHelper import DBHelper


class SaveBookmarks(Resource):
    def post(self):
        data = request.get_json()
        uid = data.get("uid")
        bookmark = data.get("bookmarks")[0]

        bookmark_data = {
            "uid": str(uid),
            "title": bookmark.get("title"),
            "url": bookmark.get("url"),
            "favicon": bookmark.get("favicon"),
        }
        DBHelper.insert("bookmarks", **bookmark_data)

        return {
            "status": 1,
            "message": "Bookmark Saved successfully",
        }


class SaveAllBookmarks(Resource):
    def post(self):
        data = request.get_json()
        print(f"data: {data}")

        uid = data.get("uid")
        bookmarks = data.get("bookmarks")
        for bookmark in bookmarks:
            # Include the uid in each bookmark record
            bookmark_data = {
                "uid": str(uid),
                "title": bookmark.get("title"),
                "url": bookmark.get("url"),
                "favicon": bookmark.get("favicon"),
            }
            DBHelper.insert("bookmarks", **bookmark_data)

        return {
            "status": 1,
            "message": "Bookmarks saved successfully",
        }


class GetBookmarks(Resource):
    def get(self):
        uid = request.args.get("uid")  # ✅ use query param
        # print(f"uid: {uid}")

        if not uid:
            return {
                "status": 0,
                "message": "UID is required"
            }, 400

        # Get bookmarks for the provided UID
        bookmarks = DBHelper.find_many("bookmarks", {"uid": uid})  
        # print(f"bookmarks: {bookmarks}")

        return {
            "status": 1,
            "message": "Bookmarks fetched successfully",
            "bookmarks": bookmarks
        }
