const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    transformOption = require('@finelets/hyper-rest/db/mongoDb/DocTransformOption')

const EmployeeSchema = new Schema({
        userId: String,
        name: String,
        password: String,
        pic: String
    },
    transformOption
)

module.exports = mongoose.model('Employee', EmployeeSchema);