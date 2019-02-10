const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    transformOption = require('@finelets/hyper-rest/db/mongoDb/DocTransformOption')

// TODO: set autoIndex, autoCreate to false in product mode
/*
The autoIndex option is set to true by default. You can change this
default by setting mongoose.use('autoIndex', false);
*/

const SupplierSchema = new Schema({
        type: Number,
        code: String,
        name: String
    },
    { 
        ...transformOption,
        autoCreate: true,
        timestamps: { updatedAt: 'modifiedDate' }
     }
)

// SupplierSchema.index({code: 1}, {unique: true})
SupplierSchema.index({name: 1}, {unique: true})

module.exports = mongoose.model('Supplier', SupplierSchema);