const dbSave = require('../../../finelets/db/mongoDb/SaveDoc'),
    schema = require('../../../db/schema/PurTransTask'),
    extract = require('../BizDataExtractors').importPurTransTask,
    publish = require('../../CrossMessageCenter').importPurTransTaskCreated,
    logger = require('@finelets/hyper-rest/app/Logger');

module.exports = {
    create: (doc) => {
        let obj;
        try {
            obj = extract(doc)
        } catch (err) {
            return Promise.reject(err)
        }

        logger.debug('Create import purchase transaction task: \r\n' + JSON.stringify(obj))
        return dbSave(schema, obj)
            .then((doc) => {
                publish(doc)
                return doc
            })
    }
}