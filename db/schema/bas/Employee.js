const createCollection = require('@finelets/hyper-rest/db/mongoDb/CreateCollection')

const dbModel = createCollection({
    name: 'Employee',
    schema: {
        userId: String,
        name: String,
        password: String,
        pic: String,
        email: String
    },
    timestamps: { updatedAt: 'modifiedDate' },
    indexes: [
        {
            index: {name: 1},
            options: {unique: true}
        },
        {
            index: {userId: 1},
            options: {unique: true}
        }
    ]
})

module.exports = dbModel