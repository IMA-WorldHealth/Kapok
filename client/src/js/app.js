var bhima = angular.module('bhima', ['bhima.controllers', 'bhima.services', 'bhima.directives', 'bhima.filters', 'ngRoute', 'ui.bootstrap', 'pascalprecht.translate', 'LocalForageModule', 'chart.js', 'tmh.dynamicLocale', 'ngFileUpload']);

function bhimaconfig($routeProvider) {
  //TODO: Dynamic routes loaded from unit database?
  $routeProvider
  .when('/', {
    controller : 'HomeController as HomeCtrl',
    templateUrl : 'partials/home/home.html'
  })
  .when('/login', {
    controller : 'LoginController as LoginCtrl',
    templateUrl : 'partials/auth/login.html'
  })
  .when('/budgeting/edit', {
    controller: 'editAccountBudget',
    templateUrl: 'partials/budget/edit/edit_budget.html'
  })
  .when('/budgeting/analysis', {
    controller: 'AnalysisBudgetController as BudgetCtrl',
    templateUrl: 'partials/budget/analysis/analysis_budget.html'
  })
  .when('/budgeting/new', {
    controller: 'NewBudgetController as BudgetCtrl',
    templateUrl: 'partials/budget/new/new_budget.html'
  })
  .when('/budgeting/:accountID?', {
    controller: 'budget',
    templateUrl: 'partials/budget/budget.html'
  })
  .when('/project', {
    controller : 'project',
    templateUrl: 'partials/project/project.html'
  })
  .when('/permission', {
    controller: 'PermissionsController as PermissionsCtrl',
    templateUrl: 'partials/user_permission/permissions.html'
  })
  .when('/enterprise', {
    controller: 'enterprise',
    templateUrl: 'partials/enterprise/enterprise.html'
  })
  .when('/journal', {
    controller: 'journal.grid',
    templateUrl:'partials/journal/journal.html'
  })
  .when('/projects', {
    controller : 'project',
    templateUrl : 'partials/projects/projects.html'
  })
  .when('/fiscal', {
    controller: 'FiscalController as FiscalCtrl',
    templateUrl: 'partials/fiscal/fiscal.html'
  })
  .when('/patient/edit/:patientID?', {
    controller: 'patientEdit',
    templateUrl: 'partials/patient/edit/edit.html'
  })
  .when('/patient/register', {
    controller: 'patientRegistration',
    templateUrl: 'partials/patient/registration/registration.html'
  })
  .when('/reports/patient_visit_status', {
    controller: 'ReportPatientVisitStatus as ReportCtrl',
    templateUrl: 'partials/reports/patient_visit_status/patient_visit_status.html'
  })
  .when('/debtor/debtor_group', {
    controller : 'DebtorGroupController as GroupCtrl',
    templateUrl: 'partials/debtor/debtor_group.html'
  })
  .when('/journal_voucher', {
    controller: 'JournalVoucherController as JournalVoucherCtrl',
    templateUrl: 'partials/journal_voucher/journal_voucher.html'
  })
  .when('/reference_group', {
    controller: 'reference_group',
    templateUrl: 'partials/reference_group/reference_group.html'
  })
  .when('/reference', {
    controller: 'reference',
    templateUrl: 'partials/reference/reference.html'
  })
  .when('/inventory/', {
    controller: 'inventory',
    templateUrl: '/partials/inventory/inventory.html'
  })
  .when('/inventory/view', {
    controller : 'inventoryView',
    templateUrl:'/partials/inventory/view/view.html'
  })
  .when('/inventory/register', {
    controller: 'inventoryRegister',
    templateUrl: '/partials/inventory/register/register.html'
  })
  .when('/inventory/update', {
    controller : 'inventory.update',
    templateUrl : 'partials/inventory/update_item/update_item.html'
  })
  .when('/inventory/groups', {
    controller : 'inventory.groups',
    templateUrl : 'partials/inventory/groups/groups.html'
  })
  .when('/inventory/types',  {
    controller : 'inventory.types',
    templateUrl : 'partials/inventory/types/types.html'
  })
  .when('/inventory/manifest', {
    controller : 'inventory.manifest',
    templateUrl : 'partials/inventory/manifest/manifest.html'
  })
  .when('/patient/search/:patientID?', {
    controller: 'patientRecords',
    templateUrl: '/partials/patient/search/search.html'
  })
  .when('/sales/:debtorID?/:inventoryID?', {
    controller: 'sales',
    templateUrl: '/partials/sales/sales.html'
  })
  .when('/sale_records/:recordID?', {
    controller: 'salesRecords',
    templateUrl: '/partials/records/sales_records/sales_records.html'
  })
  .when('/cash', {
    controller: 'CashController as CashCtrl',
    templateUrl: '/partials/cash/cash.html'
  })
  .when('/auxillary_cash_records/:recordID?', {
    controller: 'auxillaryRecords',
    templateUrl: '/partials/records/auxillary_cash_records/auxillary_cash_records.html'
  })
  .when('/creditor', {
    controller: 'creditors',
    templateUrl: '/partials/creditor/creditor.html'
  })
  .when('/creditors/creditor_group', {
    controller: 'group.creditor',
    templateUrl: 'partials/creditor/group/creditor_group.html'
  }).
  when('/purchase/create/', {
    controller: 'purchaseOrder',
    templateUrl: 'partials/purchase/create/purchase.html'
  })
  .when('/purchase/view/', {
    controller: 'purchaseRecords as purchaseRecordsCtrl',
    templateUrl: 'partials/purchase/view/purchase_records.html'
  })
  .when('/purchase/view/:option', {
    controller: 'purchase_view',
    templateUrl: 'partials/purchase/view/purchase_view.html'
  })
  .when('/purchase/confirm/', {
    controller: 'PurchaseConfirm as purchaseConfirmCtrl',
    templateUrl: 'partials/purchase/confirm/confirm.html'
  })
  .when('/purchase/validate/', {
    controller: 'purchaseValidate',
    templateUrl: 'partials/purchase/validate/validate.html'
  })
  .when('/purchase/authorization/', {
    controller: 'purchaseAuthorization',
    templateUrl: 'partials/purchase/authorization/authorization.html'
  })
  .when('/inventory/price_list', {
    controller: 'priceList',
    templateUrl: 'partials/price_list/pricelist.html'
  })
  .when('/exchange_rate', {
    controller : 'ExchangeRateController as ExchangeCtrl',
    templateUrl: 'partials/exchange_rate/exchange_rate.html'
  })
  .when('/create_account', {
    controller: 'manageAccount',
    templateUrl: 'partials/accounts/create_account/create.html'
  })
  .when('/reports/finance', {
    controller: 'reportFinance',
    templateUrl: 'partials/reports/finance/finance_report.html'
  })
  .when('/reports/patient_group/:uuid', {
    controller : 'report.patientGroup',
    templateUrl : 'partials/reports/patient_group/patient_group.html'
  })
  .when('/reports/prices', {
    controller : 'report.prices',
    templateUrl : 'partials/reports/prices/prices.html'
  })
  .when('/reports/transactions/account', {
    controller : 'report.transactions.account',
    templateUrl : 'partials/reports/transactions/account.html'
  })
  .when('/reports/transaction_report', {
    controller: 'reportTransaction',
    templateUrl: 'partials/reports/transaction_report/transaction_report.html'
  })
  .when('/reports/patient_standing/', {
    controller : 'reportPatientStanding',
    templateUrl : '/partials/reports/patient_standing/patient_standing.html'
  })
  .when('/reports/employee_standing/', {
    controller : 'reportEmployeeStanding',
    templateUrl : '/partials/reports/employee_standing/employee_standing.html'
  })
  .when('/reports/ledger/general_ledger', {
    controller: 'reportGeneralLedger',
    templateUrl: '/partials/reports/ledger/general_ledger.html'
  })
  .when('/reports/summary', {
    controller: 'summary',
    templateUrl: 'partials/reports/summary/summary.html'
  })
  .when('/reports/debtor_aging/', {
    controller: 'reportDebitorAging',
    templateUrl: 'partials/reports/debtor_aging/debtor_aging.html'
  })
  .when('/reports/account_statement/:id?', {
    controller: 'accountStatement',
    templateUrl: 'partials/reports/account_statement/account_statement.html'
  })
  .when('/reports/income_expensive/', {
    controller: 'reportIncomeExpensive',
    templateUrl: 'partials/reports/income_expensive/income_expensive.html'
  })
  .when('/reports/service_exploitation/', {
    controller: 'report.service_exploitation',
    templateUrl: 'partials/reports/service_exploitation/service_exploitation.html'
  })
  .when('/reports/global_transaction/', {
    controller: 'ReportGlobalTransactionController as ReportCtrl',
    templateUrl: 'partials/reports/global_transaction/global_transaction.html'
  })
  .when('/reports/balance_mensuelle/', {
    controller: 'ReportBalanceMensuelleController as ReportCtrl',
    templateUrl: 'partials/reports/balance_mensuelle/balance_mensuelle.html'
  })
  .when('/reports/donation/', {
    controller: 'ReportDonationController as ReportCtrl',
    templateUrl: 'partials/reports/donation/donation.html'
  })
  .when('/location', {
    controller : 'location',
    templateUrl: 'partials/location/location.html'
  })
  .when('/location/village', {
    controller : 'village',
    templateUrl: 'partials/location/village/village.html'
  })
  .when('/location/sector', {
    controller : 'sector',
    templateUrl: 'partials/location/sector/sector.html'
  })
  .when('/location/province', {
    controller : 'province',
    templateUrl: 'partials/location/province/province.html'
  })
  .when('/location/country', {
    controller : 'country',
    templateUrl: 'partials/location/country/country.html'
  })
  .when('/settings/:route?', {
    controller: 'settings',
    templateUrl: 'partials/settings/settings.html'
  })
  .when('/patient/group/assignment/', {
    controller: 'AssignPatientGroup',
    templateUrl: 'partials/patient/group/assignment.html'
  })
  .when('/reports/chart_of_accounts/', {
    controller: 'ReportChartOfAccountsController',
    templateUrl: 'partials/reports/chart_of_accounts/chart.html'
  })
  .when('/invoice/:originId/:invoiceId', {
    controller: 'receipts',
    templateUrl: 'partials/receipts/receipts.html'
  })
  .when('/credit_note/:invoiceId?/', {
    controller: 'CreditNoteController as NoteCtrl',
    templateUrl: 'partials/credit_note/credit_note.html'
  })
  .when('/cash_discard/:receiptId?/', {
    controller: 'cashDiscard',
    templateUrl: 'partials/cash_discard/cash_discard.html'
  })
  .when('/cost_center/', {
    controller: 'CostCenterController as CenterCtrl',
    templateUrl: 'partials/cost_center/cost_center.html'
  })
  .when('/profit_center/', {
    controller: 'ProfitCenterController as CenterCtrl',
    templateUrl: 'partials/profit_center/profit_center.html'
  })
  .when('/profit_center/center/', {
    controller: 'AnalysisProfitCenterController as CenterCtrl',
    templateUrl: 'partials/profit_center/center/analysis_profit_center.html'
  })
  .when('/cost_center/center/', {
    controller: 'AnalysisCostCenterController as CenterCtrl',
    templateUrl: 'partials/cost_center/center/analysis_center.html'
  })
  .when('/cost_center/assigning/', {
    controller: 'CostCenterAssignmentController',
    templateUrl: 'partials/cost_center/assigning/assigning.html'
  })
  .when('/cost_center/allocation/', {
    controller: 'CostCenterAllocationController as CenterCtrl',
    templateUrl: 'partials/cost_center/allocation/allocation.html'
  })
  .when('/profit_center/allocation/', {
    controller: 'ProfitCenterAllocationController as ProfitCtrl',
    templateUrl: 'partials/profit_center/allocation/allocation.html'
  })
  .when('/section_bilan/', {
    controller : 'sectionBilan',
    templateUrl : 'partials/section_bilan/section_bilan.html'
  })
  .when('/section_resultat/', {
    controller : 'sectionResultat',
    templateUrl : 'partials/section_resultat/section_resultat.html'
  })
  .when('/variation_exploitation/', {
    controller : 'variationExploitationController as variationCtrl',
    templateUrl : 'partials/reports_proposed/variation_exploitation/variation_exploitation.html'
  })
  .when('/patient/groups/', {
    controller: 'patientGroup',
    templateUrl: 'partials/patient/group/groups.html'
  })
  .when('/group_invoice/', {
    controller : 'GroupInvoiceController as InvoiceCtrl',
    templateUrl : 'partials/group_invoice/group_invoice.html'
  })
  .when('/support/:id?', {
    controller : 'support',
    templateUrl : 'partials/support/support.html'
  })
  .when('/reports/patient_registrations', {
    controller : 'reportPatientRegistrations',
    templateUrl : 'partials/reports/patient_registrations/patient_registrations.html'
  })
  .when('/reports/cash_payments', {
    controller: 'reportCashPayments',
    templateUrl: 'partials/reports/cash_payments/cash_payments.html'
  })
  .when('/patient/debtor/', {
    controller : 'group.debtor.reassignment',
    templateUrl : 'partials/patient/debtor/swap.html'
  })
  .when('/reports/all_transactions', {
    controller : 'allTransactions',
    templateUrl : 'partials/reports/all_transactions/all_transactions.html'
  })
  .when('/reports/expiring', {
    controller : 'ReportStockExpirationsController as ReportCtrl',
    templateUrl : 'partials/reports/expiring_stock/expiring_stock.html'
  })
  .when('/reports/stock_store', {
    controller : 'StockStoreReportController as ReportCtrl',
    templateUrl : 'partials/reports/stock_store/report_store.html'
  })
  .when('/reports/stock_store/:depotId', {
    controller : 'stock_store',
    templateUrl : 'partials/reports/stock_store/stock_store.html'
  })
  .when('/reports/purchase_order', {
    controller : 'purchase_order',
    templateUrl : 'partials/reports/purchase_order/purchase_order.html'
  })
  .when('/reports/donation_confirmation', {
    controller : 'donation_confirmation',
    templateUrl : 'partials/reports/donation_confirmation/donation_confirmation.html'
  })
  .when('/reports/stock_integration', {
    controller : 'ReportStockIntegrationController as ReportCtrl',
    templateUrl : 'partials/reports/stock_integration/stock_integration.html'
  })
  .when('/reports/stock_movement', {
    controller : 'stock_movement',
    templateUrl : 'partials/reports/stock_movement/stock_movement.html'
  })
  .when('/caution', {
    controller : 'CautionController as CautionCtrl',
    templateUrl : 'partials/caution/caution.html'
  })
  .when('/primary_cash', {
    controller : 'PrimaryCashController as PrimaryCtrl',
    templateUrl : 'partials/primary_cash/primary.html'
  })
  .when('/primary_cash/transfert/:cashbox_id', {
    controller : 'PrimaryCashIncomeTransferController as TransferCtrl',
    templateUrl : 'partials/primary_cash/income/transfer/transfer.html'
  })
   .when('/primary_cash/convention/:cashbox_id', {
    controller : 'PrimaryCashConventionController as ConventionCtrl',
    templateUrl : 'partials/primary_cash/income/convention/convention.html'
  })
   .when('/primary_cash/support/:cashbox_id', {
    controller : 'PrimaryCashSupportController as SupportCtrl',
    templateUrl : 'partials/primary_cash/income/support/support.html'
  })
  .when('/primary_cash/income/generic/:id', {
    controller : 'PrimaryCashIncomeGenericController as GenericIncomeCtrl',
    templateUrl : 'partials/primary_cash/income/generic/generic.html'
  })
  .when('/trialbalance/print', {
    controller : 'TrialBalancePrintController as PrintCtrl',
    templateUrl : 'partials/journal/trialbalance/print.html'
  })
  .when('/employee', {
    controller : 'EmployeeController as EmployeeCtrl',
    templateUrl : 'partials/employee/employee.html'
  })
  .when('/service', {
    controller : 'admin.service',
    templateUrl : 'partials/service/service.html'
  })
  .when('/journal/print', {
    controller : 'journal.print',
    templateUrl : 'partials/journal/print.html'
  })
  .when('/primary_cash/expense/generic/:id?', {
    controller : 'PrimaryCashExpenseGenericController as GenericExpenseCtrl',
    templateUrl: 'partials/primary_cash/expense/generic.html'
  })
  .when('/primary_cash/expense/purchase/:cashbox', {
    controller : 'PurchaseOrderCashController as PurchaseCtrl',
    templateUrl : 'partials/primary_cash/expense/purchase.html'
  })
  .when('/primary_cash/expense/payroll/:cashbox', {
    controller : 'payroll',
    templateUrl : 'partials/primary_cash/expense/payroll.html'
  })
  .when('/primary_cash/expense/cash_return/:cashbox', {
    controller : 'PrimaryCashReturnController as ReturnCtrl',
    templateUrl : 'partials/primary_cash/expense/cash_return.html'
  })
  .when('/primary_cash/expense/multi_payroll/', {
    controller : 'MultiPayrollController as PayrollCtrl',
    templateUrl : 'partials/primary_cash/expense/multi_payroll.html'
  })
  .when('/primary_cash/expense/tax_payment/:cashbox', {
    controller : 'primary_cash.tax_payment',
    templateUrl : 'partials/primary_cash/expense/tax_payment.html'
  })
  .when('/primary_cash/expense/enterprise_tax_payment/:cashbox', {
    controller : 'primary_cash.enterprise_tax_payment',
    templateUrl : 'partials/primary_cash/expense/enterprise_tax_payment.html'
  })
  .when('/primary_cash/expense/cotisation_payment/:cashbox', {
    controller : 'primary_cash.cotisation_payment',
    templateUrl : 'partials/primary_cash/expense/cotisation_payment.html'
  })
  .when('/primary_cash/expense/salary_payment/:cashbox', {
    controller : 'primary_cash.salary_payment',
    templateUrl : 'partials/primary_cash/expense/salary_payment.html'
  })
  .when('/primary_cash/expense/partial_payment/:cashbox', {
    controller : 'primary_cash.partial_payment',
    templateUrl : 'partials/primary_cash/expense/partial_payment.html'
  })
  .when('/primary_cash/expense/payday_advance/:cashbox', {
    controller : 'primary_cash.payday_advance',
    templateUrl : 'partials/primary_cash/expense/payday_advance.html'
  })
  .when('/inventory/depot', {
    controller : 'inventory.depot',
    templateUrl : 'partials/inventory/depot/depot.html'
  })

  /* depots */
  .when('/depots', {
    controller : 'DepotController as DepotCtrl',
    templateUrl : 'partials/depots/depots.html'
  })
  .when('/depots/:depotId/entry', {
    controller : 'DepotEntryController',
    templateUrl : 'partials/depots/entry/entry.html'
  })
  .when('/depots/:depotId/losses', {
    controller : 'DepotLossController as LossCtrl',
    templateUrl : 'partials/depots/loss/loss.html'
  })
  .when('/depots/:depotId/movements', {
    controller : 'StockMovementController as MovementCtrl',
    templateUrl : 'partials/depots/movement/movement.html'
  })
  .when('/depots/:depotId/distributions/patients', {
    controller : 'StockDistributionsController as StockDistributionsCtrl',
    templateUrl : 'partials/depots/distributions/patients/patients.html'
  })
  .when('/depots/:depotId/distributions/services', {
    controller : 'StockServiceDistributionsController as DistributionsCtrl',
    templateUrl : 'partials/stock/exit_service/distribution_service.html'
  })
  .when('/depots/:depotId/distributions/:consumptionId/cancel', {
    controller : 'DepotDistributionsCancelController as CancelCtrl',
    templateUrl : 'partials/depots/distributions/cancel/cancel.html'
  })
  .when('/depots/:depotId/integrations', {
    controller : 'stockIntegration as integrationCtrl',
    templateUrl : 'partials/stock/integration/integration.html'
  })
  .when('/depots/:depotId/service_return_stock', {
    controller : 'ServiceReturnStockController as ReturnCtrl',
    templateUrl : 'partials/stock/service_return_stock/service_return_stock.html'
  })

  // depot reports
  .when('/depots/:depotId/reports/distributions/:type', {
    controller : 'DepotStockDistributionsController as DistributionsCtrl',
    templateUrl : 'partials/depots/reports/distributions/distributions.html'
  })
  .when('/reports/distributions/', {
    controller : 'ReportDepotDistributionsController as ReportCtrl',
    templateUrl : 'partials/reports/distributions/distributions.html'
  })
  .when('/reports/stock_entry/', {
    controller : 'ReportStockEntryController as ReportCtrl',
    templateUrl : 'partials/reports/stock/stock_entry/stock_entry.html'
  })
  .when('/stock/entry/report/:documentId?', {
    controller : 'stock.entry.report',
    templateUrl : 'partials/stock/entry/report.html'
  })
  .when('/stock/search/', {
    controller : 'stock.search',
    templateUrl: 'partials/stock/search/search.html'
  })

  // TODO -- these should probably have an /inventory/ or /depot/ prefix
  .when('/stock/count/', {
    controller : 'stock.count',
    templateUrl : 'partials/stock/count/count.html'
  })
  .when('/stock/expiring/:depotId', {
    controller : 'stock.expiring',
    templateUrl : 'partials/stock/expiring/expiring.html'
  })
  .when('/donation/confirm_donation/', {
    controller : 'ConfirmDonationController as ConfirmCtrl',
    templateUrl : 'partials/stock/donation_management/confirm_donation.html'
  })
  .when('/stock/donation_management/:depotId?', {
    controller : 'DonationManagementController as DonationCtrl',
    templateUrl : 'partials/stock/donation_management/donation_management.html'
  })
  .when('/stock/donation_management/report/:documentId', {
    controller : 'donation_management.report',
    templateUrl : 'partials/stock/donation_management/report.html'
  })


  // TODO -- these should be namespaced/prefixed by depot
  .when('/stock/integration_confirm/', {
    controller : 'ConfirmStockIntegrationController as ConfirmCtrl',
    templateUrl : 'partials/stock/integration/confirm_integration/confirm_integration.html'
  })
  .when('/reports/loss_record/', {
    controller : 'loss_record',
    templateUrl : 'partials/reports/loss_record/loss_record.html'
  })
  .when('/inventory/distribution/:depotId?', {
    controller : 'inventory.distribution',
    templateUrl : 'partials/inventory/distribution/distribution.html'
  })
  .when('/stock/dashboard', {
    controller : 'StockDashboardController as StockDashCtrl',
    templateUrl : 'partials/stock/dashboard/dashboard.html'
  })
  .when('/snis/', {
    controller : 'SnisController as SnisCtrl',
    templateUrl : 'partials/snis/snis.html'
  })
  .when('/snis/new_report', {
    controller : 'snis.new_report',
    templateUrl : 'partials/snis/snis_new_report.html'
  })
  .when('/snis/edit_report/:id', {
    controller : 'snis.edit_report',
    templateUrl : 'partials/snis/snis_edit_report.html'
  })
  .when('/snis/print_report/:id/:section', {
    controller : 'snis.print_report as SnisCtrl',
    templateUrl : 'partials/snis/snis_print_report.html'
  })
  .when('/purchase_menu/', {
    controller : 'purchase.menu',
    templateUrl : 'partials/purchase/purchase_menu.html'
  })
  .when('/reports/income_report/', {
    controller : 'primary_cash.incomeReport',
    templateUrl : 'partials/reports/primary_cash/income/income_report.html'
  })
  .when('/reports/expense_report/', {
    controller : 'primary_cash.expenseReport',
    templateUrl : 'partials/reports/primary_cash/expense/expense_report.html'
  })
  .when('/reports/stock_report/', {
    controller : 'stock_report',
    templateUrl : 'partials/reports/stock/stock_report.html'
  })
  .when('/grade_employers/', {
    controller : 'GradeEmployeeController as GradeCtrl',
    templateUrl : 'partials/grade_employers/grade_employers.html'
  })
  .when('/taxes_management/', {
    controller : 'taxes_management.menu',
    templateUrl : 'partials/taxe/taxe_management.html'
  })
  .when('/cotisations_management/', {
    controller : 'cotisations_management.menu',
    templateUrl : 'partials/cotisation/cotisation_management.html'
  })
  .when('/taxes_management/create/', {
    controller : 'taxes_management.create',
    templateUrl : 'partials/taxe/create/create_taxe.html'
  })
  .when('/cotisations_management/create/', {
    controller : 'cotisations_management.create',
    templateUrl : 'partials/cotisation/create/create_cotisation.html'
  })
  .when('/taxes_management/ipr/', {
    controller : 'taxes_management.ipr',
    templateUrl : 'partials/taxe/ipr/ipr.html'
  })
  .when('/taxes_management/config_tax/', {
    controller : 'config_tax',
    templateUrl : 'partials/taxe/config_tax/config_tax.html'
  })
  .when('/cotisations_management/config_cotisation/', {
    controller : 'config_cotisation',
    templateUrl : 'partials/cotisation/config_cotisation/config_cotisation.html'
  })
  .when('/offday_management/', {
    controller : 'OffdayController as OffdayCtrl',
    templateUrl : 'partials/offdays/offdays.html'
  })
  .when('/hollyday_management/', {
    controller : 'HolidayController as HolidayCtrl',
    templateUrl : 'partials/hollydays/hollydays.html'
  })
  .when('/payment_period/', {
    controller : 'payment_period',
    templateUrl : 'partials/payment_period/payment_period.html'
  })
  .when('/rubric_management/', {
    controller : 'rubric_management.menu',
    templateUrl : 'partials/rubric/rubric_management.html'
  })
  .when('/rubric_management/config_rubric/', {
    controller : 'config_rubric',
    templateUrl : 'partials/rubric/config_rubric/config_rubric.html'
  })
  .when('/rubric_management/rubriques_payroll/', {
    controller : 'RubriquePayrollController as RubriqueCtrl',
    templateUrl : 'partials/rubric/rubriques_payroll/rubriques_payroll.html'
  })
  .when('/reports/daily_consumption/', {
    controller : 'ReportDailyConsumptionController as ReportCtrl',
    templateUrl : 'partials/reports/daily_consumption/daily_consumption.html'
  })
  .when('/config_accounting/', {
    controller: 'ConfigAccountingController as ConfigAccountCtrl',
    templateUrl: 'partials/config_accounting/config_accounting.html'
  })
  .when('/reports/payroll_report/', {
    controller : 'payroll_report',
    templateUrl : 'partials/reports/payroll_report/payroll_report.html'
  })
  .when('/reports/cotisation_payment/', {
    controller : 'cotisation_payment',
    templateUrl : 'partials/reports/cotisation_payment/cotisation_payment.html'
  })
  .when('/reports/salary_payment/', {
    controller : 'salary_payment',
    templateUrl : 'partials/reports/salary_payment/salary_payment.html'
  })
  .when('/reports/taxes_payment/', {
    controller : 'taxes_payment',
    templateUrl : 'partials/reports/taxes_payment/taxes_payment.html'
  })
  .when('/reports/stock_status/', {
    controller : 'StockStatusReportController as StatusCtrl',
    templateUrl : 'partials/reports/stock_status/stock_status.html'
  })
  .when('/fonction', {
    controller : 'fonction',
    templateUrl : 'partials/fonction/fonction.html'
  })
  .when('/donor_management/', {
    controller: 'donor',
    templateUrl: '/partials/donor_management/donor_management.html'
  })
  .when('/reports/operating_account/', {
    controller : 'OperatingAccountController as OperatingCtrl',
    templateUrl : 'partials/reports/operating_account/operating_account.html'
  })
  .when('/subsidy', {
    controller : 'subsidy',
    templateUrl : 'partials/subsidy/subsidy.html'
  })
  .when('/cashbox_management', {
    controller : 'cash.cashbox',
    templateUrl : 'partials/cash/cashbox/cashbox.html'
  })
  .when('/cashbox_account_management', {
    controller : 'cash.cashbox_account',
    templateUrl : 'partials/cash/cashbox_account_currency/cashbox_account_currency.html'
  })
  .when('/extra_payment', {
    controller : 'ExtraPaymentController as PaymentCtrl',
    templateUrl : 'partials/cash/extra_payment/extra_payment.html'
  })
  // Proposed formal report building structure
  .when('/report/invoice/:target', {
    controller : 'configureInvoice',
    templateUrl : 'partials/reports_proposed/invoice/invoice.html'
  })
  .when('/reports/bilan/', {
    controller : 'configureBilan',
    templateUrl : 'partials/reports_proposed/bilan/bilan.html'
  })
  .when('/reports/debitor_group_report/', {
    controller : 'DebtorGroupReportController as debtorGroupReportCtrl',
    templateUrl : 'partials/reports_proposed/debitor_group_report/debitor_group_report.html'
  })
  .when('/reports/result_account/', {
    controller : 'configureResult',
    templateUrl : 'partials/reports_proposed/result_account/result_account.html'
  })
  .when('/reports/balance/', {
    controller : 'configureBalance',
    templateUrl : 'partials/reports_proposed/balance/balance.html'
  })
  .when('/reports/debtorgroup/annual', {
    controller : 'DebtorGroupAnnualReportController as AnnualCtrl',
    templateUrl : 'partials/reports_proposed/debtor_group/annual.html'
  })
  .when('/reports/grand_livre/', {
    controller : 'configureGrandLivre',
    templateUrl : 'partials/reports_proposed/grand_livre/grand_livre.html'
  })
  .when('/reports/employee_state/', {
    controller : 'configureEmployeeState',
    templateUrl : 'partials/reports_proposed/employee_state/employee_state.html'
  })
  .when('/reports/cash_flow/', {
    controller : 'cashFlowReportController as ReportCtrl',
    templateUrl : 'partials/reports/cash_flow/cash_flow.html'
  })


  .when('/exchangeRateModal/', {
    controller : 'exchangeRateModal',
    templateUrl : 'partials/exchangeRateModal/exchangeRateModal.html'
  })
  .when('/justifyModal/', {
    controller : 'justifyModal',
    templateUrl : 'partials/cash/justify_modal.html'
  })
  .when('/dashboards/finance', {
    templateUrl : 'partials/dashboard/finance.html'
  })
  .otherwise({ redirectTo : '/' });
}

function translateConfig($translateProvider) {
  //TODO Review i18n and determine if this it the right solution/grade_employers/
  $translateProvider.useStaticFilesLoader({
    prefix: '/i18n/',
    suffix: '.json'
  });

  $translateProvider.useSanitizeValueStrategy('escape');

  $translateProvider.preferredLanguage('fr');
}

function localeConfig(tmhDynamicLocaleProvider) {

  // TODO Hardcoded default translation/ localisation
  tmhDynamicLocaleProvider.localeLocationPattern('/i18n/locale/angular-locale_{{locale}}.js');
  tmhDynamicLocaleProvider.defaultLocale('fr-be');
}

// Logs HTTP errors to the console, even if uncaught
// TODO - in production, we shouldn't log as many errors
function authConfig($httpProvider) {
  $httpProvider.interceptors.push(['$injector', function ($injector) {
    return $injector.get('AuthInjectorFactory');
  }]);
}

// Redirect to login if not signed in.
function startupConfig($rootScope, $location, SessionService) {
  $rootScope.$on('$routeChangeStart', function (event, next) {
    if (!SessionService.user) {
      $location.url('/login');
    }
  });
}

function localForageConfig($localForageProvider) {
  $localForageProvider.config({
    name : 'bhima-v1',
    version : 1.0
  });
}

// configuration
bhima.config(['$routeProvider', bhimaconfig]);
bhima.config(['$translateProvider', translateConfig]);
bhima.config(['tmhDynamicLocaleProvider', localeConfig]);
bhima.config(['$httpProvider', authConfig]);
bhima.config(['$localForageProvider', localForageConfig]);
// run
bhima.run(['$rootScope', '$location', 'SessionService', startupConfig]);
