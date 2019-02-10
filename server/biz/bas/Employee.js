const schema = require('../../../db/schema/bas/Employee'),
    createEntity = require('../../../finelets/db/mongoDb/Entity'),
    dbSave = require('../../../finelets/db/mongoDb/saveNotExist')

const employeeEntity = createEntity({
    schema,
    updatables: ['userId', 'password', 'name', 'pic', 'email'],
    searchables: ['userId', 'name', 'email'],
    setValues: (doc, data) => {
        if (data.userId && !doc.password) {
            doc.password = '9'
        }
    }
})

const obj = {
    create: (data) => {
        if (!data.name) return Promise.reject('employee name is required')
        return dbSave(schema, ['name'], data)
    },

    search(cond, text) {
        return employeeEntity.search(cond, text)
    },

    ifUnmodifiedSince(id, version){
        return employeeEntity.ifUnmodifiedSince(id, version)
    },
    
    update(data){
        return employeeEntity.update(data)
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
            }, ['userId', 'name', 'pic', 'email', 'modifiedDate'])
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

module.exports = obj