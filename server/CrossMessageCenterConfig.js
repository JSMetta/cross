const importPurchaseTransactions = require('./biz/batches/ImportPurchaseTransactions');

module.exports = {
    connect: process.env.MQ,
    exchanges: {
        cross: {
            queues: {
                ImportPurchaseTransactionsTasks: {
                    topic: 'importPurchaseTransactions',
                    consumer: importPurchaseTransactions
                }
            }
        }
    }
}