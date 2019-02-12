const bizObj = require('../biz/pur/Purchases');

const list = function (query) {
    let condi
    try {
        condi = JSON.parse(query.q);
    } catch (e) {
        condi = {}
    }
    let text = query.s
    return bizObj.search(condi, text)
        .then(function (list) {
            return {
                items: list
            }
        })
};

module.exports = {
    url: '/cross/api/pur/purchases',
    rests: [{
            type: 'create',
            target: 'Purchase',
            handler: bizObj.create
        },
        {
            type: 'query',
            element: 'Purchase',
            handler: list
        }
    ]
}