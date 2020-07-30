/**
 * Created by clx on 2017/10/13.
 */
const {
    findProcessById
} = require('../biz').Process

module.exports = {
    url: '/cross/api/processes/:id',
    transitions: {
    },
    rests: [{
            type: 'read',
            cache: 'no-store',
            handler: findProcessById
        }
    ]
}