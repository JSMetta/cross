const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.Types.ObjectId,
  transformOption = require('@finelets/hyper-rest/db/mongoDb/DocTransformOption')

const PurTransTaskSchema = new Schema({
    transNo: String,
    task: Map,
    state: Number,
    createDate: Date
  },
  transformOption
)

module.exports = mongoose.model('PurTransTask', PurTransTaskSchema);