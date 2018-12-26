const Promise = require('bluebird'),
    mq = require('../finelets/mq/RabbitMessageCenter'),
    importPurchaseTransactions = require('./biz/batches/ImportPurchaseTransactions')
    exName = 'cross'

const config = {
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
    publish: mq.getPublish(exName)
}

module.exports = crossMC
