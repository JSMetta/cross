const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    transformOption = require('@finelets/hyper-rest/db/mongoDb/DocTransformOption')

const SupplierSchema = new Schema({
        type: Number,
        name: String
    },
    transformOption
)

module.exports = mongoose.model('Supplier', SupplierSchema);