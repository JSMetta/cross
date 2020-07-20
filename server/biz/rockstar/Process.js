const schema = require('../../../db/schema/Process'),
	createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity'),
	__ = require('underscore'),
	logger = require('@finelets/hyper-rest/app/Logger')

let __mqPublish

const config = {
	schema
}

const addIn = {
	runProcess: (progId, prog) => {
		return entity.create({prog: progId})
			.then(doc => {
				__mqPublish({procId: doc.id, prog})
				return __.pick(doc, 'id', 'prog')
			})
	},

	log: ({procId, start, log}) => {
		let row
		return schema.findById(procId)
			.then(doc => {
				if(!doc) return
				if(!log) {
					doc.state = 'over'
				} else {
					if(doc.logs.length < 1) doc.state = 'running'
					// logger.debug('push to log: ' + JSON.stringify({start, message: log}))
					row = doc.logs.push({start, message: log})
				}
				return doc.save()
			})
	}
}

const entity = createEntity(config, addIn)

const progProcess = (mqPublish) => {
	__mqPublish = mqPublish
	return entity
}
module.exports = progProcess