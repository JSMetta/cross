const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    transformOption = require('@finelets/hyper-rest/db/mongoDb/DocTransformOption')

const SupplierSchema = new Schema({
        type: Number,
        name: String
    },
    { 
        ...transformOption,
        autoCreate: true,
        timestamps: { updatedAt: 'modifiedDate' }
     }
)

SupplierSchema.index({
    name: 1
}, {
    unique: true,
    background: false
})

module.exports = mongoose.model('Supplier', SupplierSchema);