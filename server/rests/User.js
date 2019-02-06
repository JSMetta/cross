/**
 * Created by clx on 2017/10/13.
 */
const {ifUnmodifiedSince, update} = require('../biz/bas/Employee'),
logger = require('@finelets/hyper-rest/app/Logger');

module.exports = {
    url: '/cross/api/bas/users/:id',
    rests: [
        {
            type: 'update',
            handler: {
                condition: ifUnmodifiedSince,
                handle: (id, data) => {
                    data.id = id
                    return update(data)
                }
            }
        },
        /* {
            type: 'delete',
            conditional: true,
            handler: {
                condition: salesOrders.checkVersion,
                handle: salesOrders.cancelDraft
            }
        } */
    ]
}
