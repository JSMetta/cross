const schema = require('../../../db/schema/bas/Employee'),
    dbSave = require('../../../finelets/db/mongoDb/saveNotExist'),
    logger = require('@finelets/hyper-rest/app/Logger')

const userFields = ['name', 'pic']
const obj = {
    create: (data) => {
        if(!data.name) return Promise.reject('employee name is required')
        return dbSave(schema, ['name'], data)
    },
    authenticate: (userName, password) => {
        logger.debug('Begin authenticate, userName = ' + userName + ' password: ' + password)
        return schema.findOne({
                $or: [{
                    userId: userName,
                    password: password
                }, {
                    $and: [{
                        name: userName
                    }, {
                        userId: {
                            $exists: false
                        }
                    }, {
                        password: {
                            $exists: false
                        }
                    }]
                }]
            }, userFields)
            .then(doc => {
                logger.debug('find user: ' + doc ? JSON.stringify(doc.toJSON()) : 'null')
                if (doc) {
                    return doc.toJSON()
                }
            })
    },
    getUser: (id) => {
        return schema.findById(id, userFields)
        .then(doc => {
            return doc.toJSON()
        })
    }
}

module.exports = obj