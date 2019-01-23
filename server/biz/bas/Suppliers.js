const schema = require('../../../db/schema/bas/Supplier'),
dbSave = require('../../../finelets/db/mongoDb/saveNotExist')
const obj = {
    create: (data) => {
        if (!data.name) return Promise.reject('supplier name is required')
        return dbSave(schema, ['name'], data)
    }
}

module.exports = obj