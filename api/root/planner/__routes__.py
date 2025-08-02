# Route registrations
from .models import (
    AddEvents,
    AddPlannerNotes,
    AddSmartNote,
    AddWeeklyGoals,
    AddWeeklyTodos,
    DeletePlannerNotes,
    FrequentNotes,
    GetPlanner,
    GetPlannerNotes,
    GetSmartNotes,
    GetWeeklyGoals,
    GetWeeklyTodos,
    AddWeeklyFocus,
    GetWeeklyFocus,
    UpdatePlannerNotes,
    UpdateWeeklyGoals,
    UpdateWeeklyTodos,
    GetCalendarEvents,
    GetPlannerDataComprehensive,  # New comprehensive endpoint
)
from . import planner_api

# New comprehensive endpoint for optimal loading
planner_api.add_resource(GetPlannerDataComprehensive, "/get/planner-data-comprehensive")

planner_api.add_resource(AddEvents, "/add/events")

planner_api.add_resource(AddWeeklyGoals, "/add/weekly-goals")
planner_api.add_resource(UpdateWeeklyGoals, "/update/weekly-goals")
planner_api.add_resource(GetWeeklyGoals, "/get/weekly-goals")

planner_api.add_resource(GetPlanner, "/get/planner")
planner_api.add_resource(GetCalendarEvents, "/get/calendar/events")

planner_api.add_resource(AddWeeklyTodos, "/add/weekly-todos")
planner_api.add_resource(UpdateWeeklyTodos, "/update/weekly-todos")
planner_api.add_resource(GetWeeklyTodos, "/get/weekly-todos")

planner_api.add_resource(AddWeeklyFocus, "/add/weekly-focus")
planner_api.add_resource(GetWeeklyFocus, "/get/weekly-focus")

planner_api.add_resource(AddSmartNote, "/add/smart-notes")
planner_api.add_resource(GetSmartNotes, "/get/smart-notes")
planner_api.add_resource(FrequentNotes, "/smartnotes/suggestions/<string:uid>")

planner_api.add_resource(AddPlannerNotes, "/add/planner-notes")
planner_api.add_resource(GetPlannerNotes, "/get/planner-notes")
planner_api.add_resource(UpdatePlannerNotes, "/update/planner-notes")
planner_api.add_resource(DeletePlannerNotes, "/delete/planner-notes")
