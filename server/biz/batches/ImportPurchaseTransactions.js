const logger = require('@finelets/hyper-rest/app/Logger')

const handler = (obj) => {
    if(!obj || !obj.transNo) return Promise.reject('no transNo')

    logger.debug('Purchase transaction: \r\n' + JSON.stringify(obj))
    return Promise.resolve(true)
}
module.exports = handler