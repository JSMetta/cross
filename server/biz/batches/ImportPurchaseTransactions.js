const logger = require('@finelets/hyper-rest/app/Logger'),
    extract = require('../BizDataExtractors').importPurTransTask,
    createTask = require('./ImportPurTransTask').create

const handler = (obj) => {
    let doc;
    try {
        doc = extract(obj)
    } catch (err) {
        return Promise.reject(err)
    }

    logger.debug('Purchase transaction: \r\n' + JSON.stringify(doc))
    return createTask(doc)
        .then(() => {
            return true
        })
        .catch(() => {
            return false
        })
}
module.exports = handler