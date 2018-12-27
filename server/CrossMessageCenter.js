const mq = require('../finelets/mq/RabbitMessageCenter'),
    config = require('./CrossMessageCenterConfig');

const startup = () => {
    return mq.start(config)
}

const __publishMessage = (type, msg) => {
    return mq.publish('cross', type, msg)
}

const crossMC = {
    start: startup,
    importPurchaseTransactions: (msg) => {
        return __publishMessage('importPurchaseTransactions', msg)
    }
}

module.exports = crossMC