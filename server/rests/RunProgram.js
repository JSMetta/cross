/**
 * Created by clx on 2017/10/13.
 */
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