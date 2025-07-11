from .models import *

from . import home_api


home_api.add_resource(AddMaintenanceTask, "/add/maintenance")
home_api.add_resource(GetMaintenanceTasks, "/get/maintenance")
home_api.add_resource(UpdateMaintenanceTask, "/update//maintenance/<string:task_id>")
home_api.add_resource(DeleteMaintenanceTask, "/delete/maintenance/<string:task_id>")
home_api.add_resource(DeleteAllMaintenanceTasks, "/delete-all/maintenance")

home_api.add_resource(AddUtility, "/add/utility")
home_api.add_resource(GetUtilities, "/get/utility")
home_api.add_resource(UpdateUtility, "/utility/update/<string:utility_id>")
home_api.add_resource(DeleteUtility, "/utility/delete/<string:utility_id>")

home_api.add_resource(AddInsurance, "/add/insurance")
home_api.add_resource(GetInsurance, "/get/insurance")
home_api.add_resource(UpdateInsurance, "/update/insurance/<string:insurance_id>")
home_api.add_resource(DeleteInsurance, "/delete/insurance/<string:insurance_id>")


home_api.add_resource(AddProperty, "/add/property")
home_api.add_resource(GetProperties, "/get/property")
home_api.add_resource(UpdateProperty, "/property/update/<string:property_id>")
# home_api.add_resource(DeleteProperty, "/property/delete/<string:property_id>")

home_api.add_resource(GetLoansAndMortgages, "/get/loans_and_mortgages")


# from .models import *
# from . import home_api

# home_api.add_resource(AddMaintenanceTask, "/maintenance/add")
# home_api.add_resource(GetMaintenanceTasks, "/maintenance/get")
# home_api.add_resource(UpdateMaintenanceTask, "/maintenance/update/<string:task_id>")
# home_api.add_resource(DeleteMaintenanceTask, "/maintenance/delete/<string:task_id>")
# home_api.add_resource(DeleteAllMaintenanceTasks, "/maintenance/delete-all")
