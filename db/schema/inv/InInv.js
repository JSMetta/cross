const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    transformOption = require('@finelets/hyper-rest/db/mongoDb/DocTransformOption')

const InInvSchema = new Schema({
        po: ObjectId,
        qty: Number,
        date: Date,
        loc: String,
        source: {type:String, unique:true}
    },
    { 
        ...transformOption,
        autoCreate: true,
        timestamps: { updatedAt: 'modifiedDate' }
     }
)

module.exports = mongoose.model('InInv', InInvSchema);