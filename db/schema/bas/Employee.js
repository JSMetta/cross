const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    transformOption = require('@finelets/hyper-rest/db/mongoDb/DocTransformOption')

const EmployeeSchema = new Schema({
        name: String
    },
    transformOption
)

module.exports = mongoose.model('Employee', EmployeeSchema);