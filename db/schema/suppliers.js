const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.Types.ObjectId,
  transformOption = require('@finelets/hyper-rest/db/mongoDb/DocTransformOption')

const SupplierSchema = new Schema({
    name: String,
    addr: String,
  },
  transformOption
)

module.exports = mongoose.model('Supplier', SupplierSchema);