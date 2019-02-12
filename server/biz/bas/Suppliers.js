const schema = require('../../../db/schema/bas/Supplier'),
    dbSave = require('../../../finelets/db/mongoDb/saveNotExist'),
    createEntity = require('../../../finelets/db/mongoDb/CreateEntity')

const config = {
    schema,
    updatables:['type', 'code', 'name'],
    searchables: ['name', 'code']
}

const obj = {
    create: (data) => {
        if (!data.name) return Promise.reject('supplier name is required')
        return dbSave(schema, ['name'], data)
    },

    findById: (id) => {
        return schema.findById(id)
        .then(doc => {
            let result
            if(doc) result = doc.toJSON()
            return result
        })
    }
}

module.exports = createEntity(config, obj)