const schema = require('../../../db/schema/bas/Employee'),
    createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity'),
    dbSave = require('../../../finelets/db/mongoDb/saveNotExist')

const config = {
    schema,
    updatables: ['userId', 'password', 'name', 'pic', 'email'],
    searchables: ['userId', 'name', 'email'],
    setValues: (doc, data) => {
        if (data.userId && !doc.password) {
            doc.password = '9'
        }
    }
}

const obj = {
    createNotExist: (data) => {
        if (!data.name) return Promise.reject('employee name is required')
        return dbSave(schema, ['name'], data)
    },

    authenticate: (userName, password) => {
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
            }, ['userId', 'name', 'pic', 'email', 'updatedAt', '__v'])
            .then(doc => {
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

module.exports = createEntity(config, obj)