const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    transformOption = require('@finelets/hyper-rest/db/mongoDb/DocTransformOption')

const PartSchema = new Schema({
        type: Number,
        code: String,
        name: String,
        spec: String,
        unit: String,
        img: String
    },
    { 
        ...transformOption,
        autoCreate: true,
        timestamps: { updatedAt: 'modifiedDate' }
     }
)

PartSchema.index({
    name: 1,
    spec: 1,
}, {
    unique: true,
    background: false
});

module.exports = mongoose.model('Part', PartSchema);