const dbSave = require('@finelets/hyper-rest/db/mongoDb/SaveObjectToDb'),
    schema = require('../../../db/schema/PurTransTask'),
    extract = require('../BizDataExtractors').importPurTransTask,
    logger = require('@finelets/hyper-rest/app/Logger');

module.exports = {
    create: (doc) => {
        let obj;
        try {
            obj = extract(doc)
        } catch (err) {
            return Promise.reject(err)
        }
        obj = Object.assign({}, {
            transNo: obj.transNo,
            task: obj
        })
        logger.debug('Create import purchase transaction task: \r\n' + JSON.stringify(obj))
        return schema.findOne({
                transNo: obj.transNo
            })
            .then((doc) => {
                if (doc) {
                    // doc = doc.toJSON()
                    logger.info('The purTransTask - ' + obj.transNo + ' already exists, it will be ignored!')
                    logger.info(JSON.stringify(doc, null, 2))
                    return doc
                }
                return dbSave(schema, obj)
                    .then((doc) => {
                        logger.debug('Publish importPurTransTaskCreated message:\r\n' + JSON.stringify(doc, null, 2))
                        let publish = require('../../CrossMessageCenter').importPurTransTaskCreated
                        publish(doc)
                        return doc
                    })
            })

    }
}