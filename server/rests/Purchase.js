/**
 * Created by clx on 2017/10/13.
 */
const {ifUnmodifiedSince, update, findById} = require('../biz/pur/Purchases');

module.exports = {
    url: '/cross/api/pur/purchases/:id',
    rests: [{
            type: 'read',
            handler: function (req, res) {
                var id = req.params["id"];
                return findById(id);
            }
        },
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