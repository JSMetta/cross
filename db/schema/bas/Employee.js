const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    transformOption = require('@finelets/hyper-rest/db/mongoDb/DocTransformOption')

const EmployeeSchema = new Schema({
        userId: String,
        name: String,
        password: String,
        pic: String,
        email: String
    },
    { 
        ...transformOption,
        autoCreate: true,
        timestamps: { updatedAt: 'modifiedDate' }
     }
)

// EmployeeSchema.index({userId: 1}, {unique: true})
EmployeeSchema.index({name: 1}, {unique: true})

module.exports = mongoose.model('Employee', EmployeeSchema);