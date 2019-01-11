const periodPurchases = require('../biz/pur/Purchases').periodPurchases

module.exports = {
    url: '/cross/reports/periodPurchases',
    rests: [{
        type: 'get',
        handler: periodPurchases
    }]
};