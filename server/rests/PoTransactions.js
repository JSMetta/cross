const entity = require('../biz/pur/Purchases') 

module.exports = {
    url: '/cross/api/pur/purchases/:id/transactions',
    rests: [{
            type: 'create',
            target: 'PoTransaction',
            handler: (req) => {
                const id = req.params['id']
                const type = req.query['type']
                return entity.doTransaction(id, type, req.body)
            }
        }
    ]
}