module.exports = {
    Cross: {
        uploadPurTransTasks: "UploadPurchases",
        queryPurchaseTransTasks: 'PurchaseTransTasks',
        reportPeriodPurchases: 'ReportPeriodPurchases',
        reportInvLocStates: 'InvLocStates'
    },
    PurchaseTransTasks: {
        exit: 'Cross'
    },
    /* PeriodPurchases: {
        exit: 'Cross'
    } */
}