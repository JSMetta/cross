const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.Types.ObjectId,
  transformOption = require('@finelets/hyper-rest/db/mongoDb/DocTransformOption')

const PurTransTaskSchema = new Schema({
    transNo: String,
    task: Map,
    state: {
      type: Number,
      default: 0
    },
    createDate: {type: Date, default: new Date()}
  },
  transformOption
)

module.exports = mongoose.model('PurTransTask', PurTransTaskSchema);