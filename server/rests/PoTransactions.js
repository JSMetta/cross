const {POTransactions, Purchases} = require('../biz')

const list = function (query) {
    const {id} = query
    return Purchases.listTransactions(id)
        .then(function (list) {
            return {
                items: list
            }
        })
}

module.exports = {
    url: '/cross/api/pur/purchases/:id/transactions',
    rests: [{
            type: 'create',
            target: 'PoTransaction',
            handler: (req) => {
                const id = req.params['id']
                const type = req.query['type']
                return POTransactions[type](id, req.body)
            }
        },
        {
            type: 'query',
            element: 'PoTransaction',
            handler: list
        }
    ]
}