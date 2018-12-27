const createStream = require('../../../finelets/streams/CSVStream'),
    parser = require('./PurchaseCsvParser'),
    save = require('../../CrossMessageCenter');


module.exports = () => {
    return createStream(save, parser)
}