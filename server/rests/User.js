/**
 * Created by clx on 2017/10/13.
 */
const {
    ifMatch,
    ifNoneMatch,
    update,
    remove,
    findById
} = require('../biz/bas/Employee');

module.exports = {
    url: '/cross/api/bas/users/:id',
    transitions: {
        Purchase: {id: 'context'},
        Withdraw: {id: 'context.actor'},
        PoTransaction: {id: 'context.actor'}
    },
    rests: [{
            type: 'read',
            ifNoneMatch,
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
