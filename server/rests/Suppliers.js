const bizObj = require('../biz/bas/Suppliers');

const list = function (query) {
    let condi
    try {
        condi = JSON.parse(query.q);
    } catch (e) {
        condi = {}
    }
    let text = query.s ? query.s : '.'
    text = text.length > 0 ? text : '.' 
    return bizObj.search(condi, text)
        .then(function (list) {
            return {
                items: list
            }
        })
};

module.exports = {
    url: '/cross/api/bas/suppliers',
    rests: [{
            type: 'create',
            target: 'Supplier',
            handler: bizObj.create
        },
        {
            type: 'query',
            element: 'Supplier',
            handler: list
        }
    ]
}