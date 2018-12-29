const logger = require('@finelets/hyper-rest/app/Logger'),
saver = require('./ImportPurTransTask').create;

module.exports = (obj) => {
    return saver(obj)
        .catch((err) => {
            logger.error('ImportPurTrans error: [' + obj.transNo + ']\r\n' + JSON.stringify(err))
        })
}