const createStream = require('../../../finelets/streams/CSVStream'),
    parser = require('./PurchaseCsvParser'),
    saver = require('./PurchaseCsvSaver');


module.exports = () => {
    return createStream(saver, parser)
}