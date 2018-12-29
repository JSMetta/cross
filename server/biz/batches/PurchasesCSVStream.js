const createStream = require('../../../finelets/streams/CSVStream'),
    parser = require('./PurchaseCsvParser'),
    saver = require('./ImportPurTransTask').create;


module.exports = () => {
    return createStream(saver, parser)
}