const logger = require('@finelets/hyper-rest/app/Logger');

const executePurTransTask = require('./biz/batches/ExecutePurTransTask')

module.exports = {
    connect: process.env.MQ,
    exchanges: {
        cross: {
            isDefault: true,
            publishes: [
                'importPurTransTaskCreated'
            ],
            queues: {
                ImportedPurchaseTransactions: {
                    topic: 'importPurTransTaskCreated',
                    consumer: (doc) => {
                        let task = executePurTransTask()
                        logger.debug('Begin to exec task ........')
                        return task.exec(doc)
                            .then(() => {
                                return true
                            })
                    }
                },
            }
        }
    }
}