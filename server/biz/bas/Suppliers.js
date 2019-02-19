const schema = require('../../../db/schema/bas/Supplier'),
    dbSave = require('../../../finelets/db/mongoDb/saveNotExist'),
    createEntity = require('../../../finelets/db/mongoDb/CreateEntity')

const config = {
    schema,
    updatables:['type', 'code', 'name', 'address'],
    searchables: ['name', 'code', 'address']
}

const obj = {
    create: (data) => {
        if (!data.name) return Promise.reject('supplier name is required')
        return dbSave(schema, ['name'], data)
    }
}

module.exports = createEntity(config, obj)