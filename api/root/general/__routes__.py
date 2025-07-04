from root.general.bank import *

# BankConnect,
# GetBankAccount,
# GetSavedTransactions,
# RecurringTransactions,
# SaveBankAccount,
# SaveBankTransactions,


from root.general.currentUser import CurrentUser
from . import general_api

general_api.add_resource(CurrentUser, "/currentUser", endpoint="CurrentUser")
general_api.add_resource(BankConnect, "/connect/bank")
general_api.add_resource(GetBankAccount, "/get/bank-account")
general_api.add_resource(SaveBankAccount, "/save/bank-account")

general_api.add_resource(SaveBankTransactions, "/save/bank-transactions")
general_api.add_resource(GetSavedTransactions, "/get/saved-transactions")
general_api.add_resource(RecurringTransactions, "/get/recurring-transactions")


general_api.add_resource(AddAccounts, "/add/accounts")
general_api.add_resource(GetAccounts, "/get/accounts")


general_api.add_resource(GetIncomeExpense, "/get/income-expense")
general_api.add_resource(getTotalBalance, "/get/total-balance")
