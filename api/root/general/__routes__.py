from root.general.bank import BankConnect, GetBankAccount, SaveBankAccount
from root.general.currentUser import CurrentUser
from . import general_api

general_api.add_resource(CurrentUser, "/currentUser", endpoint="CurrentUser")
general_api.add_resource(BankConnect, "/connect/bank")
general_api.add_resource(GetBankAccount, "/get/bank-account")
general_api.add_resource(SaveBankAccount, "/save/bank-account")
