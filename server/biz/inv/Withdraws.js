const schema = require('../../../db/schema/inv/Withdraw'),
    createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity')

const config = {
    schema,
    searchables:['code', 'remark']
}

const create = (mqPublish) => {
    const addins = {
        create(data) {
            return new schema(data).save()
                .then(doc => {
                    msg = doc.toJSON()
                    mqPublish(msg)
                    return msg
                })
        }
    }
    return createEntity(config, addins)
}
module.exports = create