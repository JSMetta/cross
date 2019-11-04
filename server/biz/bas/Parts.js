const schema = require('../../../db/schema/bas/Part'),
    createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity'),
    dbSave = require('../../../finelets/db/mongoDb/saveNotExist')

const config = {
    schema,
    updatables:['type', 'code', 'name', 'brand', 'spec', 'unit', 'img', 'tags'],
    searchables:['code', 'name', 'brand', 'spec', 'tags']
}

const parts = {
    createNotExist: (data) => {
        if (!data.name) return Promise.reject('part name is required')
        return dbSave(schema, ['name', 'brand', 'spec'], data)
    },

    find: () => {
        let items = []
        return schema.find({}, null, {
                limit: 30
            })
            .then(data => {
                __.each(data, part => {
                    items.push(part.toJSON())
                })
                return items
            })
    }
}

module.exports = createEntity(config, parts)