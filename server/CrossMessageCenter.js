const mq = require('../finelets/mq/RabbitMessageCenter'),
    logger = require('@finelets/hyper-rest/app/Logger'),
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
        let publish = mq.getPublish('cross')
        return publish('importPurchaseTransactions', msg)
    }
}

module.exports = crossMC