module.exports = {
    Cross: {
        parts: 'Parts',
        uploadPurTransTasks: "UploadPurchases",
        queryPurchaseTransTasks: 'PurchaseTransTasks',
        reportPeriodPurchases: 'ReportPeriodPurchases',
        reportInvLocStates: 'InvLocStates'
    },
    Parts: {
        createPart: 'Parts'
    },
    Part: {
        self: "Part",
        /* edit: {
            id: "DraftOrder",
            condition: __checkIfModifyIsPermited
        },
        cancel: {
            id: "DraftOrder",
            condition: __checkIfModifyIsPermited
        }, */
        parts: "Parts"
    },
    PurchaseTransTasks: {
        exit: 'Cross'
    },
    /* PeriodPurchases: {
        exit: 'Cross'
    } */
}