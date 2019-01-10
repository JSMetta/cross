const invSchema = require('../../../db/schema/inv/Inv'),
    PO = require('../pur/Purchases'),
    logger = require('@finelets/hyper-rest/app/Logger'),
    dbSave = require('../../../finelets/db/mongoDb/dbSave');

module.exports = {
    inInv: (doc) => {
        let partId
        return PO.getPart(doc.po)
            .then((data) => {
                partId = data.id
                return invSchema.findOne({
                    part: partId
                })
            })
            .then((data) => {
                if (!data)
                    return dbSave(invSchema, {
                        part: partId,
                        qty: doc.qty
                    })
                data.qty += doc.qty
                return data.save()
            })
            .then(() => {
                logger.debug('Inventory qty is updated by InInv !!!')
                return true
            })
    }
}