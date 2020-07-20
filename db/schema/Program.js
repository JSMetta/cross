const createCollection = require('@finelets/hyper-rest/db/mongoDb/CreateCollection')

const dbModel = createCollection({
    name: 'Program',
    schema: {
      name: {type: String, required: true, unique: true, index: true},
      desc: String,
      code: String,
      prog: {type: String, required: true},
      tags: String
    }
})

module.exports = dbModel