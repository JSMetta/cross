const logger = require('@finelets/hyper-rest/app/Logger');

const executePurTransTask = require('./biz/batches/ExecutePurTransTask'),
// purchaseInInv = require('./biz/pur/Purchases').inInv,
InvInInv = require('./biz/inv/Invs').inInv //,
// InvLocInInv = require('./biz/inv/Locs').inInv

module.exports = {
    connect: process.env.MQ,
    exchanges: {
        cross: {
            isDefault: true,
            publishes: [
                'importPurTransTaskCreated',
                'poInInv',
                'outInv'
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
                /* PoInInv_Purchase: {
                    topic: 'poInInv',
                    consumer: purchaseInInv
                }, */
                PoInInv_Inv: {
                    topic: 'poInInv',
                    consumer: InvInInv
                }/* ,
                PoInInv_InvLoc: {
                    topic: 'poInInv',
                    consumer: InvLocInInv
                }, */
            }
        }
    }
}