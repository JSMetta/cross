const schema = require('../../../db/schema/pur/Purchase'),
    dbSave = require('../../../finelets/db/mongoDb/dbSave')
const func = {
    createBySource: (data) => {
        return schema.findOne({
                source: data.source
            })
            .then((doc) => {
                if (doc) return doc.toJSON()
                return dbSave(schema, data)
            })
    }
}

module.exports = func