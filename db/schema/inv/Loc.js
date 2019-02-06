const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    transformOption = require('@finelets/hyper-rest/db/mongoDb/DocTransformOption')

const LocSchema = new Schema({
        loc: String,
        part: ObjectId,
        date: Date,
        qty: Number,
    },
    { 
        ...transformOption,
        autoCreate: true,
        timestamps: { updatedAt: 'modifiedDate' }
     }
)

module.exports = mongoose.model('Loc', LocSchema);