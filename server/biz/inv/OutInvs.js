const schema = require('../../../db/schema/inv/OutInv'),
dbSave = require('../../../finelets/db/mongoDb/dbSave')
const outInvs = {
    create: (data) => {
        return schema.findOne({
                source: data.source
            })
            .then((doc) => {
                if (doc) {
                    return Promise.reject('OutInv: Source ' + data.source + ' is duplicated')
                }
                return dbSave(schema, data)
            })
    }
}

module.exports = outInvs