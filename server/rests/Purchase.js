/**
 * Created by clx on 2017/10/13.
 */
const {
    ifMatch,
    ifNoneMatch,
    update,
    remove,
    findById
} = require('../biz/pur/Purchases');

module.exports = {
    url: '/cross/api/pur/purchases/:id',
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
}