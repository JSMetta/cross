/**
 * Created by clx on 2017/10/13.
 */
const Process = require('../biz').Process

module.exports = {
    url: '/cross/api/running/programs/:id',
    rests: [
        {
            type: 'create',
            target: 'Process',
            handler: (req) => {
                const id = req.params.id
                return Process.runProcess(id)
            }
        }
    ]
}