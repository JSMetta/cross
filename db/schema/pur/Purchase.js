const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    transformOption = require('@finelets/hyper-rest/db/mongoDb/DocTransformOption')

const PurchaseSchema = new Schema({
        part: {
            type: ObjectId,
            required: true
        },
        qty: {
            type: Number,
            required: true
        },
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
        remark: String,
        source: {
            type: String,
            unique: true
        }
    },
    transformOption
)

module.exports = mongoose.model('PurApply', PurchaseSchema);