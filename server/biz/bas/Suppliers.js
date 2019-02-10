const schema = require('../../../db/schema/bas/Supplier'),
    dbSave = require('../../../finelets/db/mongoDb/saveNotExist'),
    __ = require('underscore'),
    createEntity = require('../../../finelets/db/mongoDb/Entity')

const supplierEntity = createEntity({
    schema,
    updatables:['type', 'code', 'name'],
    searchables: ['name', 'code']
})

const obj = {
    create: (data) => {
        if (!data.name) return Promise.reject('supplier name is required')
        return dbSave(schema, ['name'], data)
    },

    search(cond, text) {
        return supplierEntity.search(cond, text)
    },

    ifUnmodifiedSince(id, version){
        return supplierEntity.ifUnmodifiedSince(id, version)
    },
    
    update(data){
        return supplierEntity.update(data)
    }
}

module.exports = obj