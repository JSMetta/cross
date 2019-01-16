const parts = require('../biz/bas/Parts');

const list = function (query) {
    var condi;
    try {
        condi = JSON.parse(query.q);
    } catch (e) {
        condi = {}
    }
    return parts.find(condi)
        .then(function (list) {
            return {
                items: list
            }
        })
};

module.exports = {
    url: '/cross/bas/parts',
    rests: [{
            type: 'create',
            target: 'Part',
            handler: parts.create
        },
        {
            type: 'query',
            element: 'Part',
            handler: list
        }
    ]
}