/**
 * Created by clx on 2017/10/13.
 */
const {
    ifNoneMatch,
    remove,
    findById
} = require('../biz').Process

module.exports = {
    url: '/cross/api/processes/:id',
    transitions: {
    },
    rests: [{
            type: 'read',
            cache: 'no-store',
            handler: findById
        },
        {
            type: 'delete',
            handler: remove
        }
    ]
}