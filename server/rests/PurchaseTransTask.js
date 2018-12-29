/**
 * Created by clx on 2017/10/13.
 */
const taskDb = require('../biz/batches/ImportPurTransTask');
module.exports = {
    url: '/cross/task/purTransTasks/:id',
    rests: [{
        type: 'read',
        handler: function (req, res) {
            var id = req.params["id"];
            return taskDb.findById(id);
        }
    }]
}