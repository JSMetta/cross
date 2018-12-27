const createStream = require('../../../finelets/streams/CSVStream'),
    parser = require('./PurchaseCsvParser'),
    importPurchaseTransactions = require('../../CrossMessageCenter').importPurchaseTransactions;


module.exports = () => {
    return createStream((obj) => {
        importPurchaseTransactions(obj)
        return Promise.resolve()
    }, parser)
}