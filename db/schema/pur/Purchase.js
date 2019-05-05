const mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    createCollection = require('@finelets/hyper-rest/db/mongoDb/CreateCollection')

const dbModel = createCollection({
    name: 'Purchase',
    schema: {
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
    timestamps: { updatedAt: 'modifiedDate' }
})

module.exports = dbModel