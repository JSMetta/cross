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
    Suppliers: {
        create: 'Suppliers'
    },
    Supplier: {
        self: "Supplier",
        /* edit: {
            id: "DraftOrder",
            condition: __checkIfModifyIsPermited
        },
        cancel: {
            id: "DraftOrder",
            condition: __checkIfModifyIsPermited
        }, */
        suppliers: "Suppliers"
    },
    PurchaseTransTasks: {
        exit: 'Cross'
    },
    /* PeriodPurchases: {
        exit: 'Cross'
    } */
}