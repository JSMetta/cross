const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    transformOption = require('@finelets/hyper-rest/db/mongoDb/DocTransformOption')

const OutInvSchema = new Schema({
        part: ObjectId,
        qty: Number,
        user: ObjectId,
        date: Date,
        project: String,
        source: {
            type: String,
            unique: true
        }
    },
    transformOption
)

module.exports = mongoose.model('OutInv', OutInvSchema);