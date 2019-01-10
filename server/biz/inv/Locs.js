const locSchema = require('../../../db/schema/inv/Loc'),
    PO = require('../pur/Purchases'),
    logger = require('@finelets/hyper-rest/app/Logger'),
    dbSave = require('../../../finelets/db/mongoDb/dbSave');

const __defaultLoc = '@@@CROSS@@@'

module.exports = {
    inInv: (doc) => {
        let partId
        let loc = doc.loc || __defaultLoc
        let date = doc.date || new Date()
        return PO.getPart(doc.po)
            .then((data) => {
                partId = data.id
                return dbSave(locSchema, {
                    loc: loc,
                    part: partId,
                    date: date,
                    qty: doc.qty
                })
            })
            .then((doc) => {
                logger.debug('料品移入库位：\r\n' + JSON.stringify(doc, null, 2))
                return true
            })
    }
}