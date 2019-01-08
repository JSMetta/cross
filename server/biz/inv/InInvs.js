const schema = require('../../../db/schema/inv/InInv'),
dbSave = require('../../../finelets/db/mongoDb/dbSave')
const inInvs = {
    create: (data) => {
        return schema.findOne({
                source: data.source
            })
            .then((doc) => {
                if (doc) {
                    return Promise.reject('InInv: Source ' + data.source + ' is duplicated')
                }
                return dbSave(schema, data)
            })
    }
}

module.exports = inInvs