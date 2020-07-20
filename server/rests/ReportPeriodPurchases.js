const periodPurchases = require('../biz').Purchases.periodPurchases

module.exports = {
    url: '/cross/api/reports/pur/periodPurchases',
    rests: [{
        type: 'get',
        handler: periodPurchases
    }]
};