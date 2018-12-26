const Promise = require('bluebird'),
    logger = require('@finelets/hyper-rest/app/Logger'),
    mq = require('../finelets/mq/RabbitMessageCenter'),
    exName = 'cross'

const startup = () => {
    return mq.connect(process.env.MQ)
        .then(() => {
            return mq.createExchanges()
        })
}
const crossMC = {
    start: startup
}

module.exports = crossMC

/* module.exports = () => {
    let instance
    return mq.start(process.env.MQ)
        .then(() => {
            return mq.getInstance(name)
        })
        .then((inst) => {
            instance = inst
            let subscribers = [
                inst.subscribe('logger', '#', (data) => {
                    logger.info('MQ:\n\r' + JSON.stringify(data))
                    return Promise.resolve()
                })
            ]
            return Promise.all(subscribers)
        })
        .then(() => {
            return instance
        })
} */