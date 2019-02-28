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
        qty: {
            type: Number,
            required: true
        },
        left: Number,  // 在单量
        price: Number,
        amount: {
            type: Number,
            required: true
        },
        supplier: ObjectId,
        refNo: String,  // 参考单号
        purPeriod: Number,      // 采购周期
        applier: ObjectId,  // 申请人
        appDate: Date,      // 申请日期
        reviewer: ObjectId, // 审核人
        reviewDate: Date,   // 审核日期
        creator: ObjectId,  // 采购人
        createDate: Date,   // 采购日期
        state: {type: String, default: 'Draft'},   // Draft, Approved, Open, Closed, Canceled
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