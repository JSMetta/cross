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

EmployeeSchema.index({
    name: 1
}, {
    unique: true,
    background: false
})

module.exports = mongoose.model('Employee', EmployeeSchema);