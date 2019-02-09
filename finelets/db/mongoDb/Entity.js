const __ = require('underscore')

class Entity {
    constructor(config) {
        this.__config = config
    }

    update(data) {
        let __config = this.__config
        return __config.schema.findById(data.id)
            .then(doc => {
                if (doc && doc.modifiedDate.toJSON() === data.modifiedDate) {
                    __.each(__config.updatable, fld => {
                        if(__.isString(data[fld]) && data[fld].length === 0) doc[fld] = undefined
                        else doc[fld] = data[fld]
                    })
                    if(__config.setValues) __config.setValues(doc, data)
                    return doc.save()
                        .then(doc => {
                            return doc.toJSON()
                        })
                }
            })
    }
    
    ifUnmodifiedSince(id, version) {
        return this.__config.schema.findById(id)
        .then(doc => {
            if (doc) {
                doc = doc.toJSON()
                return doc.modifiedDate === version
            }
            return false
        })
    }    
}

function __create(config) {
    return new Entity(config)
}

module.exports = __create