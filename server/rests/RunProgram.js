/**
 * Created by clx on 2017/10/13.
 */
const { findById } = require('../biz/Program'),
Process = require('../biz').Process

module.exports = {
    url: '/cross/api/running/programs/:id',
    rests: [
        {
            type: 'create',
            target: 'Process',
            handler: () => {}
        }
    ]
}