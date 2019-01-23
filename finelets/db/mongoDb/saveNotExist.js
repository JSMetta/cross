const logger = require('@finelets/hyper-rest/app/Logger'),
    __ = require('underscore');

module.exports = (schema, uniqueFields, data) => {
    let condi = __.map(uniqueFields, fld => {
        let exp = {}
        if (data[fld]) {
            exp[fld] = data[fld]
        } else {
            exp[fld] = {
                $exists: false
            }
        }
        return exp
    })
    const query = {
        $and: condi
    }
    return schema.findOneAndUpdate(query, data, {
            upsert: true
        })
        .then(() => {
            return schema.findOne(query)
        })
        .then(doc => {
            return doc.toJSON()
        })
}

/* module.exports = (schema, query, data) => {
    return schema.find(query)
        .then((docs) => {
            if(docs.length === 0){
                return schema.findOneAndUpdate(query, data, {upsert: true})
            }
            else if(docs.length > 1) {
                logger.error('Duplcate error !!!!!!!!!!!!!!!!!')
                return Promise.reject('Deplicated')
            }
            else {
                return docs[0]
            }
        })
        .then(doc => {
            return doc ? doc.toJSON() : doc
        })
} */