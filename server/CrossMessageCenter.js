const mq = require('../finelets/mq/RabbitMessageCenter'),
    importPurchaseTransactions = require('./biz/batches/ImportPurchaseTransactions'),
    config = {
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

const startup = () => {
    return mq.start(config)
}

const crossMC = {
    start: startup,
    importPurchaseTransactions: (msg) => {
        return mq.getPublish('cross')('importPurchaseTransactions', msg)
    }
    // publish: mq.getPublish('cross')
}

module.exports = crossMC