const mq = require('../finelets/mq/RabbitMessageCenter'),
    config = require('./CrossMessageCenterConfig'),
    __ = require('underscore');

const startup = () => {
    return mq.start(config)
        .then(() => {
            __.each(config.exchanges, (ex) => {
                if (ex.publishes && ex.publishes.length > 0) {
                    let exPublishes = {}
                    ex.publishes.forEach((p) => {
                        exPublishes[p] = (msg) => {
                            return mq.publish(ex, p, msg)
                        }
                    })
                    if (ex.isDefault) {
                        Object.assign(crossMC, exPublishes)
                    } else {
                        crossMC[ex] = exPublishes
                    }
                }
            })
        })
}

/* const __publishMessage = (type, msg) => {
    return mq.publish('cross', type, msg)
} */

const crossMC = {
    start: startup,
    /* importPurchaseTransactions: (msg) => {
        return __publishMessage('importPurchaseTransactions', msg)
    },
    createImportPurTransTask: (msg) => {
        return __publishMessage('createImportPurTransTask', msg)
    } */
}

module.exports = crossMC