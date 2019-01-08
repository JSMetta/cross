const schema = require('../../../db/schema/bas/Supplier'),
dbSave = require('../../../finelets/db/mongoDb/dbSave')
const obj = {
    create: (data) => {
        if (!data.name) return Promise.reject('supplier name is required')
        return schema.findOne({
                name: data.name
            })
            .then((doc) => {
                if (doc) {
                    return doc.toJSON()
                }
                return dbSave(schema, data)
            })
    }
}

module.exports = obj