const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    createCollection = require('@finelets/hyper-rest/db/mongoDb/CreateCollection'),
    createSchema = require('@finelets/hyper-rest/db/mongoDb/CreateSchema')

const ContactSchema = createSchema({
        nick: String,
        name: String,
        phone: String,
        email: String
    }
)

const dbModel = createCollection({
    name: 'Supplier',
    schema: {
        type: Number,
        code: String,
        name: String,
        address: String,
        account: String,
        link: String,
        tags: String,
        contacts: [ContactSchema]
    },
    timestamps: {
        updatedAt: 'modifiedDate'
    },
    indexes: [{
        index: {
            name: 1
        },
        options: {
            unique: true
        }
    }]
})

module.exports = dbModel