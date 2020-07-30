const createSchema = require('@finelets/hyper-rest/db/mongoDb/CreateSchema'),
    mongoose = require('mongoose')

const logSchema = createSchema({
      start: Date,
      message: String
  })
  
const processSchema = createSchema({
    date: {type: Date, default: new Date()},
    logs: [logSchema],
    state: {type: String, default: 'open', enum: ['open', 'running', 'over']}
  })

const dbModel = mongoose.model('Program', createSchema({
  name: {type: String, required: true, unique: true, index: true},
  desc: String,
  code: String,
  prog: {type: String, required: true},
  tags: String,
  processes: [processSchema]
}, { versionKey: false }))

module.exports = dbModel