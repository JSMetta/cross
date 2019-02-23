const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    transformOption = require('@finelets/hyper-rest/db/mongoDb/DocTransformOption')

// TODO: set autoIndex, autoCreate to false in product mode
/*
The autoIndex option is set to true by default. You can change this
default by setting mongoose.use('autoIndex', false);
*/
const ContactSchema = new Schema({
    nick: String,
    name: String,
    phone: String,
    email: String
  },
  transformOption
)

const SupplierSchema = new Schema({
        type: Number,
        code: String,
        name: String,
        address: String,
        account: String,
        link: String,
        contacts: [ContactSchema]
    },
    { 
        ...transformOption,
        autoCreate: true,
        timestamps: { updatedAt: 'modifiedDate' }
     }
)

// SupplierSchema.index({code: 1}, {unique: true})
SupplierSchema.index({name: 1}, {unique: true})

module.exports = mongoose.model('Supplier', SupplierSchema);