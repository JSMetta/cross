const createCollection = require('@finelets/hyper-rest/db/mongoDb/CreateCollection')

const dbModel = createCollection({
    name: 'Part',
    schema: {
        type: Number,
        code: String,
        name: String,
        brand: String,
        spec: String,
        unit: String,
        img: String,
        tags: String
    },
    timestamps: { updatedAt: 'modifiedDate' },
    indexes: [
        {
            index: {name: 1, brand: 1, spec: 1},
            options: {unique: true}
        }
    ]
})

module.exports = dbModel