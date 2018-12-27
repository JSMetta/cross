const logger = require('@finelets/hyper-rest/app/Logger')

module.exports = (obj) => {
    logger.info('Purchase transaction: \r\n' + JSON.stringify(obj))
    return Promise.resolve(true)
}