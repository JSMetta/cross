const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    transformOption = require('@finelets/hyper-rest/db/mongoDb/DocTransformOption')

const PartSchema = new Schema({
        type: Number,
        name: String,
        spec: String,
        unit: String
    },
    transformOption
)

module.exports = mongoose.model('Part', PartSchema);