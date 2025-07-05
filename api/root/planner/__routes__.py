# from flask import Blueprint
# from flask_restful import Api
# from .models import (
#     AddEvents,
#     AddWeeklyGoals,
#     GetEvents,
#     GetWeeklyGoals,
#     UpdateEvents,
#     DeleteEvents,
#     GetGoals,
#     UpdateGoals,
#     DeleteGoals,
#     AddTodos,
#     GetTodos,
#     UpdateTodos,
#     DeleteTodos,
#     AddNote,
#     GetNotes,
#     UpdateNotes,
#     DeleteNotes,
# )
from .models import (
    AddEvents,
    AddWeeklyGoals,
    AddWeeklyTodos,
    GetWeeklyGoals,
    GetWeeklyTodos,
    AddWeeklyFocus,
    GetWeeklyFocus,
)
from . import planner_api

# # Event Routes
planner_api.add_resource(AddEvents, "/add/events")
# planner_api.add_resource(GetEvents, "/get/events")
# planner_api.add_resource(UpdateEvents, "/update/events/<string:event_id>")
# planner_api.add_resource(DeleteEvents, "/delete/events/<string:event_id>")

# # Goal Routes
# # planner_api.add_resource(AddGoals, "/add/goals")
# planner_api.add_resource(AddWeeklyGoals, "/add/weekly-goals")
# planner_api.add_resource(GetWeeklyGoals, "/get/weekly-goals")
# planner_api.add_resource(GetGoals, "/get/goals")
# planner_api.add_resource(UpdateGoals, "/update/goals/<string:goal_id>")
# planner_api.add_resource(DeleteGoals, "/delete/goals/<string:goal_id>")

# # Todo Routes
# planner_api.add_resource(AddTodos, "/add/todos")
# planner_api.add_resource(GetTodos, "/get/todos")
# planner_api.add_resource(UpdateTodos, "/update/todos/<string:todo_id>")
# planner_api.add_resource(DeleteTodos, "/delete/todos/<string:todo_id>")

# # Note Routes
# planner_api.add_resource(AddNote, "/add/note")
# planner_api.add_resource(GetNotes, "/get/notes")
# planner_api.add_resource(UpdateNotes, "/update/notes/<string:note_id>")
# planner_api.add_resource(DeleteNotes, "/delete/notes/<string:note_id>")

# # # Project Routes
# # planner_api.add_resource(AddProjects, "/add/projects")
# # planner_api.add_resource(GetProjects, "/get/projects")
# # planner_api.add_resource(UpdateProjects, "/update/projects/<string:project_id>")
# # planner_api.add_resource(DeleteProjects, "/delete/projects/<string:project_id>")


planner_api.add_resource(AddWeeklyGoals, "/add/weekly-goals")
planner_api.add_resource(GetWeeklyGoals, "/get/weekly-goals")

planner_api.add_resource(AddWeeklyTodos, "/add/weekly-todos")
planner_api.add_resource(GetWeeklyTodos, "/get/weekly-todos")

planner_api.add_resource(AddWeeklyFocus, "/add/weekly-focus")
planner_api.add_resource(GetWeeklyFocus, "/get/weekly-focus")
