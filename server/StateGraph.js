module.exports = {
    Cross: {
        parts: 'Parts',
        suppliers: 'Suppliers',
        purchases: 'Purchases',
        withdraws: 'Withdraws',
        reportPeriodPurchases: 'ReportPeriodPurchases',
        programs: 'Programs',
        users: 'Users',
        register: 'RegisterUser',
        currentUser: 'CurrentUser'
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
    Purchases: {
        add: 'Purchases',
        home: 'Cross'
    },
    Purchase: {
        self: 'Purchase',
        collection: 'Purchases',
        transactions: 'PoTransactions'
    },
    PoTransactions: {
        add: 'PoTransactions',
        po: 'Purchase'
    },
    PoTransaction: {
        self: 'PoTransaction',
        po: 'Purchase'
    },
    PeriodPurchases: {
        exit: 'Cross'
    },
    Withdraws: {
        add: 'Withdraws',
        home: 'Cross'
    },
    Withdraw: {
        self: 'Withdraw',
        collection: 'Withdraws'
    },
    Programs: {
        add: 'Programs',
        home: 'Cross'
    },
    Program: {
        self: "Program",
        collection: "Programs",
        processes: 'Processes'
    },
    Users: {
        add: 'RegisterUser',
        home: 'Cross'
    },
    User: {
        password: 'Password',
        authorize: 'Authorization'
    }
}