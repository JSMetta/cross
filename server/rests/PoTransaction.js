module.exports = {
    url: '/cross/aaa/index.html',
    rests: [
        {
            type: 'entry'
        }
    ]
}

/* const {
    ifMatch,
    ifNoneMatch,
    update,
    remove,
    findById
} = require('../biz/pur/Purchases');

module.exports = {
    url: '/cross/api/pur/purchases/:parent/transactions/:id',
    rests: [{
            type: 'read',
            ifNoneMatch,
            dataRef: {Part: 'part', Supplier: 'supplier', User: ['applier', 'creator', 'reviewer']},
            handler: findById
        },
        {
            type: 'update',
            ifMatch,
            handler: (id, data) => {
                data.id = id
                return update(data)
            }
        },
        {
            type: 'delete',
            handler: remove
        }
    ]
} */