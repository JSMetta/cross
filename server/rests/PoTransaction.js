
const {findTransactionById} = require('../biz').Purchases;

module.exports = {
    url: '/cross/api/pur/purchas/transactions/:id',
    transitions: {
        PoTransactions: {id: 'context.id'}
    },
    rests: [{
            type: 'read',
            dataRef: {User: 'actor'},
            handler: findTransactionById
        }
    ]
}