const mongoose = require('mongoose'),
      ObjectId = mongoose.Schema.Types.ObjectId,
      createSchema = require('@finelets/hyper-rest/db/mongoDb/CreateSchema')

const logSchema = createSchema({
    start: Date,
    message: String
})

const dbModel = mongoose.model('Process', createSchema({
  prog: {type: ObjectId, required: true},
  logs: [logSchema],
  progress: {type: Number, default: 0},
  state: {type: String, default: 'open', enum: ['open', 'running', 'over']}
}, { versionKey: false }))

module.exports = dbModel