/**
 * Created by clx on 2017/10/13.
 */
const parts = require('../biz/bas/Parts');

module.exports = {
    url: '/cross/api/bas/parts/:id',
    rests: [
        {
            type: 'read',
            handler: function (req, res) {
                var id = req.params["id"];
                return parts.findById(id);
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
