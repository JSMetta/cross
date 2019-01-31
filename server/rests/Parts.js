const parts = require('../biz/bas/Parts');

const list = function (query) {
    let condi
    try {
        condi = JSON.parse(query.q);
    } catch (e) {
        condi = {}
    }
    let text = query.s ? query.s : '.'
    text = text.length > 0 ? text : '.' 
    return parts.search(condi, text)
        .then(function (list) {
            return {
                items: list
            }
        })
};

module.exports = {
    url: '/cross/api/bas/parts',
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