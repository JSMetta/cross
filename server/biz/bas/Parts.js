const schema = require('../../../db/schema/bas/Part'),
    __ = require('underscore'),
    dbSave = require('../../../finelets/db/mongoDb/saveNotExist')
const parts = {
    create: (data) => {
        if (!data.name) return Promise.reject('part name is required')
        return dbSave(schema, ['name', 'spec'], data)
    },

    findById: (id) => {
        return schema.findById(id)
            .then((doc) => {
                if (doc) return doc.toJSON()
            })
    },

    find: () => {
        let items = []
        return schema.find({}, null, {
                limit: 30
            })
            .then(data => {
                __.each(data, part => {
                    items.push(part.toJSON())
                })
                return items
            })
    },

    search(cond, text) {
        let items = []
        let query = {
            $and: [cond, {$or: [
                {name: { $regex: text, $options: 'si'}},
                {code: { $regex: text, $options: 'si'}},
                {spec: { $regex: text, $options: 'si'}},
            ]}]
        }
        return schema.find(query)
            .then(data => {
                __.each(data, part => {
                    items.push(part.toJSON())
                })
                return items
            })
    }
}

module.exports = parts