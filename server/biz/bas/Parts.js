const schema = require('../../../db/schema/bas/Part'),
    __ = require('underscore'),
    dbSave = require('../../../finelets/db/mongoDb/dbSave')
const parts = {
    create: (data) => {
        if (!data.name) return Promise.reject('part name is required')
        return schema.findOne({
                name: data.name,
                spec: data.spec
            })
            .then((doc) => {
                if (doc) {
                    return doc.toJSON()
                }
                return dbSave(schema, data)
            })
    },

    findById: (id) => {
        return schema.findById(id)
            .then((doc) => {
                if (doc) return doc.toJSON()
            })
    },

    find: (cond) => {
        let items = []
        return schema.find()
            .then(data => {
                __.each(data, part => {
                    items.push(part.toJSON())
                })
                return items
            })
    }
}

module.exports = parts