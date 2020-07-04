const schema = require('../../../db/schema/bas/Part'),
    createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity')

const config = {
    schema,
    updatables:['type', 'code', 'name', 'brand', 'spec', 'unit', 'tags'],
    searchables:['code', 'name', 'brand', 'spec', 'tags']
}

const parts = {
    updateInvQty: (id, qty) => {
        return schema.findById(id)
            .then(data => {
                if(!data) return Promise.reject()
                data.qty = data.qty ? data.qty + qty : qty
                return data.save()
            })
    }
}

module.exports = createEntity(config, parts)