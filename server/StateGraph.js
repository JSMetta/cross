module.exports = {
    Cross: {
        parts: 'Parts',
        suppliers: 'Suppliers',
        purchases: 'Purchases',
        auth: 'Users',
        register: 'RegisterUser',
        uploadPurTransTasks: "UploadPurchases",
        queryPurchaseTransTasks: 'PurchaseTransTasks',
        reportPeriodPurchases: 'ReportPeriodPurchases',
        reportInvLocStates: 'InvLocStates'
    },
    Parts: {
        add: 'Parts',
        home: 'Cross'
    },
    Part: {
        self: "Part",
        collection: "Parts"
    },
    Suppliers: {
        add: 'Suppliers',
        home: 'Cross'
    },
    Supplier: {
        self: "Supplier",
        collection: "Suppliers"
    },
    Users: {
        add: 'RegisterUser',
        home: 'Cross'
    },
    PurchaseTransTasks: {
        exit: 'Cross'
    },
    PeriodPurchases: {
        exit: 'Cross'
    }
}