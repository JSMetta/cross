const schema = require('../../../db/schema/bas/Part'),
    createEntity = require('../../../finelets/db/mongoDb/CreateEntity'),
    dbSave = require('../../../finelets/db/mongoDb/saveNotExist')

const config = {
    schema,
    updatables:['type', 'code', 'name', 'spec', 'unit', 'img'],
    searchables:['code', 'name', 'spec']
}

const parts = {
    create: (data) => {
        if (!data.name) return Promise.reject('part name is required')
        return dbSave(schema, ['name', 'spec'], data)
    },

    findById: (id) => {
        return schema.findById(id)
            .then((doc) => {
                if (doc) return doc.toJSON()
            })
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