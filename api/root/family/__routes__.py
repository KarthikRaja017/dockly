# _routes_.py
from .models import *
from . import family_api


family_api.add_resource(InviteFamily, "/family/invite")
family_api.add_resource(AddFamilyMembers, "/add/family-member")
family_api.add_resource(AddContacts, "/add/contacts")
family_api.add_resource(AddSchoolChurch, "/add/school_church")
family_api.add_resource(AddFamilyGuidelines, "/add/family-guidelines")
family_api.add_resource(mealplanning, "/add/meal-planning")
family_api.add_resource(addsharedtasks, "/add/sharedtasks")
family_api.add_resource(addcustomsection, "/add/customsection")
family_api.add_resource(GetFamilyMembers, "/get/family-members")
family_api.add_resource(GetContacts, "/get/contacts")
family_api.add_resource(GetSchedules, "/get/family-schedules")
# family_api.add_resource(GetFamilyGuidelines, "/get/guidelines")
family_api.add_resource(GetFamilyTasks, "/get/family-tasks")
family_api.add_resource(GetMealPlanning, "/get/family-mealplan")
family_api.add_resource(GetFamilyGuidelines, "/get/familyguidelines")
