# _routes_.py
from .models import *
from . import family_api


family_api.add_resource(InviteFamily, "/family/invite")
family_api.add_resource(AddFamilyMembers, "/add/family-member")
# family_api.add_resource(AddContacts, "/add/contacts")
# family_api.add_resource(AddSchoolChurch, "/add/school_church")
family_api.add_resource(AddFamilyGuidelines, "/add/family-guidelines")
# family_api.add_resource(mealplanning, "/add/meal-planning")
# family_api.add_resource(addsharedtasks, "/add/sharedtasks")
# family_api.add_resource(addcustomsection, "/add/customsection")
family_api.add_resource(GetFamilyMembers, "/get/family-members")
# family_api.add_resource(GetContacts, "/get/contacts")
# family_api.add_resource(GetSchedules, "/get/family-schedules")
# family_api.add_resource(GetFamilyGuidelines, "/get/guidelines")
family_api.add_resource(GetFamilyTasks, "/get/family-tasks")
# family_api.add_resource(GetMealPlanning, "/get/family-mealplan")
# family_api.add_resource(GetFamilyGuidelines, "/get/familyguidelines")
family_api.add_resource(SendInvitation, "/send/invitation")


# family_api.add_resource(AddContacts, "/add/contacts")
# family_api.add_resource(GetContacts, "/get/contacts")
# family_api.add_resource(AddGuardianEmergencyInfo, "/add/guardian-emergency-info")
# family_api.add_resource(GetGuardianEmergencyInfo, "/get/guardian-emergency-info")

family_api.add_resource(AddNotes, "/family/add/notes")
family_api.add_resource(GetNotes, "/family/get/notes")

family_api.add_resource(AddPet, "/add/pet")
family_api.add_resource(GetPets, "/get/pets")
family_api.add_resource(AddContacts, "/add/contacts")
family_api.add_resource(GetContacts, "/get/contacts")
family_api.add_resource(AddGuardianEmergencyInfo, "/add/guardian-emergency-info")
family_api.add_resource(GetGuardianEmergencyInfo, "/get/guardian-emergency-info")


family_api.add_resource(AddProject, "/add/project")
family_api.add_resource(GetProjects, "/get/projects")

family_api.add_resource(AddTask, "/add/task")
family_api.add_resource(GetTasks, "/get/tasks")
family_api.add_resource(UpdateTask, "/update/task")
