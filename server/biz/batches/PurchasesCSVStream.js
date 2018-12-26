const createStream = require('../../../finelets/streams/CSVStream'),
    parser = require('./PurchaseCsvParser'),
    mq = require('./PublishPurchaseCsvTask');


module.exports = () => {
    return mq()
        .then((saver) => {
            return createStream(saver, parser)
        })

}