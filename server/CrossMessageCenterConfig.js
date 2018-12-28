const importPurchaseTransactions = require('./biz/batches/ImportPurchaseTransactions'),
importPurTransTaskCreated = require('./biz/pur/ImportPurTransTaskCreated');

module.exports = {
    connect: process.env.MQ,
    exchanges: {
        cross: {
            isDefault: true,
            publishes: [
                'importPurchaseTransactions',
                'importPurTransTaskCreated'
            ],
            queues: {
                ImportPurchaseTransactionsTasks: {
                    topic: 'importPurchaseTransactions',
                    consumer: importPurchaseTransactions
                },
                CreatePurApply: {
                    topic: 'importPurTransTaskCreated',
                    consumer: importPurTransTaskCreated
                },
            }
        }
    }
}