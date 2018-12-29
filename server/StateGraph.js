module.exports = {
    Cross: {
        uploadPurTransTasks: "UploadPurchases",
        queryPurchaseTransTasks: 'PurchaseTransTasks'
    },
    PurchaseTransTasks: {
        exit: 'Cross'
    }
}