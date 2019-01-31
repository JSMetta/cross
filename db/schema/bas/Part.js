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
        img: String,
        createDate: {
            type: Date,
            default: Date.now
        },
        updateDate: {
            type: Date,
            default: Date.now
        }
    },
    transformOption
)

PartSchema.index({
    name: 1,
    spec: 1,
}, {
    unique: true,
    background: false
});

module.exports = mongoose.model('Part', PartSchema);