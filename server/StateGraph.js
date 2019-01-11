module.exports = {
    Cross: {
        uploadPurTransTasks: "UploadPurchases",
        queryPurchaseTransTasks: 'PurchaseTransTasks',
        reportPeriodPurchases: 'ReportPeriodPurchases'
    },
    PurchaseTransTasks: {
        exit: 'Cross'
    },
    /* PeriodPurchases: {
        exit: 'Cross'
    } */
}