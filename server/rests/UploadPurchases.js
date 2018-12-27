const PurchasesCSVStream = require('../biz/batches/PurchasesCSVStream');

module.exports = {
    url: '/cross/purchases/csv',
    rests: [{
        type: 'upload',
        handler: PurchasesCSVStream
    }]
}