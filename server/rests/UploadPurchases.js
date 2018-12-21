const Promise = require('bluebird'),
    logger = require('@finelets/hyper-rest/app/Logger'),
    CSVStream = require('../../finelets/streams/CSVStream');

const handler = () => {
    return CSVStream((obj) => {
        logger.debug('save: ' + JSON.stringify(obj))
        return Promise.resolve()
    }, (text) => {
        logger.debug('parse: ' + text)
        return {
            foo: 'foo'
        }
    })
}

module.exports = {
    url: '/cross/purchases/csv',
    rests: [{
        type: 'upload',
        handler: handler
    }]
}