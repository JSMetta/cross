const dbSave = require('../../../finelets/db/mongoDb/SaveDoc'),
    schema = require('../../../db/schema/PurTransTask'),
    publish = require('../../CrossMessageCenter').importPurTransTaskCreated;

module.exports = {
    create: (doc) => {
        return dbSave(schema, doc)
            .then((doc) => {
                publish(doc)
                return
            })
    }
}