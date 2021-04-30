const schema = require('../../../db/schema/Program'),
	stringToJavascript = require('@finelets/hyper-rest/utils/StringToJavascript'),
	createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity'),
	_ = require('lodash')

const config = {
	schema,
	sort: 'updateAt',
	listable: {prog: 0, __v: 0, processes: 0},
	updatables: ['name', 'desc', 'code', 'prog', 'tags'],
	searchables: ['name', 'desc', 'code', 'tags']
}

const addIn = {
	update: (data) => {
        return schema.findById(data.id)
            .then(doc => {
                if (doc) {
					_.each(config.updatables, fld => {
						if (_.isString(data[fld]) && data[fld].length === 0) doc[fld] = undefined
                        else doc[fld] = data[fld]
                    })
                    return doc.save()
                        .then(doc => {
                            return doc.toJSON()
                        })
                }
            })
	},

	loadProgram: (id) => {
		return schema.findById(id)
			.then(doc => {
				doc = doc.toJSON()
				const prog = stringToJavascript(doc.prog)
				delete doc.prog
				return {...prog, ...doc}
			})
	}
}

const entity = createEntity(config, addIn)

module.exports = entity