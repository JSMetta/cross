const schema = require('../../../db/schema/bas/Employee'),
    createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity'),
    dbSave = require('../../../finelets/db/mongoDb/saveNotExist')

const config = {
    schema,
    updatables: ['userId', 'password', 'name', 'pic', 'email', 'isAdmin', 'roles', 'inUse'],
    searchables: ['userId', 'name', 'email'],
    listable: 'name',
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
                userId: userName,
                password: password,
                inUse: true
            }, ['name', 'pic', 'isAdmin', 'roles'])
            .then(doc => {
                if (doc) {
                    return doc.toJSON()
                }
            })
    }
}

module.exports = createEntity(config, obj)