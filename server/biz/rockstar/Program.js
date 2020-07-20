const schema = require('../../../db/schema/Program'),
	stringToJavascript = require('@finelets/hyper-rest/utils/StringToJavascript'),
	createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity'),
	__ = require('underscore')

const config = {
	schema,
	listable: {prog: 0, __v: 0},
	updatables: ['name', 'desc', 'code', 'prog', 'tags'],
	searchables: ['name', 'desc', 'tags']
}

const addIn = {
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