const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    transformOption = require('@finelets/hyper-rest/db/mongoDb/DocTransformOption')

const PurchaseSchema = new Schema({
        code: String,
        part: {
            type: ObjectId,
            required: true
        },
        purDate: Date,
        qty: {
            type: Number,
            required: true
        },
        left: Number,
        price: Number,
        amount: {
            type: Number,
            required: true
        },
        supplier: ObjectId,
        refNo: String,
        supplyLink: String,
        purPeriod: Number,
        applier: ObjectId,
        appDate: Date,
        reviewer: ObjectId,
        reviewDate: Date,
        creator: ObjectId,
        createDate: Date,
        state: {type: String, default: 'Open'},   // Draft, Approved, Open, Closed, Canceled
        remark: String,
        source: String
    },
    { 
        ...transformOption,
        autoCreate: true,
        timestamps: { updatedAt: 'modifiedDate' }
     }
)

module.exports = mongoose.model('Purchase', PurchaseSchema);