/**
 * Created by clx on 2017/10/13.
 */
const {
    update,
    remove,
    findById
} = require('../biz').Program

module.exports = {
    url: '/cross/api/programs/:id',
    transitions: {
    },
    rests: [{
            type: 'read',
            handler: findById
        },
        {
            type: 'update',
            conditional: false,
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