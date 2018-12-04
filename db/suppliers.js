const dbsave = require('@finelets/hyper-rest/db/mongoDb/SaveObjectToDb'),
supplierSchema = require('./schema/suppliers');

module.exports = {
    add: function(data){
        return dbsave(supplierSchema, data);
    }
}