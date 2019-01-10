const schema = require('../../../db/schema/pur/Purchase'),
    part = require('../bas/Parts'),
    logger = require('@finelets/hyper-rest/app/Logger'),
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
    },

    inInv: (doc) => {
        return schema.findById(doc.po)
            .then((data) => {
                if (data.left === undefined) {
                    data.left = data.qty
                }
                data.left -= doc.qty
                if (data.left < 0) data.left = 0
                return data.save()
            })
            .then(() => {
                logger.debug('Purchase qty is updated by InInv !')
                return true
            })
    },

    getPart: (purId) => {
        return schema.findById(purId)
            .then((data) => {
                return part.findById(data.part)
            })
    }
}

module.exports = func