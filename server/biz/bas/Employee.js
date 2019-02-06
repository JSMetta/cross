const schema = require('../../../db/schema/bas/Employee'),
    dbSave = require('../../../finelets/db/mongoDb/saveNotExist'),
    moment = require('moment'),
    logger = require('@finelets/hyper-rest/app/Logger')

const userFields =  ['userId', 'name', 'pic', 'email', 'modifiedDate']
const obj = {
    create: (data) => {
        if (!data.name) return Promise.reject('employee name is required')
        return dbSave(schema, ['name'], data)
    },

    ifUnmodifiedSince(id, modifiedDate) {
        return schema.findById(id)
            .then(doc => {
                if(doc){
                    doc = doc.toJSON()
                    return doc.modifiedDate === modifiedDate
                }
                return false
            })
    },

    update(data) {
        return schema.findById(data.id)
            .then(doc => {
                if (doc && doc.modifiedDate.toJSON() === data.modifiedDate) {
                    if (data.userId){
                        if(!doc.password) doc.password = '9'
                        doc.userId = data.userId
                    } 
                    if (data.name) doc.name = data.name
                    if (data.email) doc.email = data.email
                    return doc.save()
                        .then(doc => {
                            return doc.toJSON()
                        })
                }
            })
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
        return schema.findById(id)
            .then(doc => {
                return doc.toJSON()
            })
    }
}

module.exports = obj