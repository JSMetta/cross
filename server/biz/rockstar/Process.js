const schema = require('../../../db/schema/Process'),
	createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity'),
	__ = require('underscore'),
	progSchema = require('../../../db/schema/Program'),
	_ = require('lodash'),
	logger = require('@finelets/hyper-rest/app/Logger')

let __mqPublish

const config = {
	schema
}

const addIn = {
	runProcess: (progId) => {
		let row
		return progSchema.findById(progId)
			.then(doc => {
				if(!doc) {
					const msg = `The program ${progId} not found`
					logger.error(msg)
					return Promise.reject(msg)
				}
				row = doc.processes.push({date: new Date(), state: 'open'})
				return doc.save()
			})
			.then(doc => {
				doc = doc.toJSON()
				const proc = doc.processes[row - 1]
				__mqPublish({procId: proc.id, prog: doc.prog})
				return {id: proc.id, prog: progId}
			})
	},

	log: ({procId, start, log}) => {
		return progSchema.findOne({
			processes: {
				$elemMatch: {
					_id: procId
				}
			}
		})
		.then(doc => {
			if(!doc) {
				logger.error(`The process ${procId} not found`)
				return
			}
			const proc = doc.processes.id(procId)
			if(!log) {
				proc.logs.push({start, message: 'Over !'})
				proc.state = 'over'
			} else {
				if(proc.logs.length < 1) proc.state = 'running'
				// logger.debug('push to log: ' + JSON.stringify({start, message: log}))
				proc.logs.push({start, message: log})
			}
			return doc.save()
		})
	},

	findProcessById: (procId) => {
		return progSchema.findOne({
			processes: {
				$elemMatch: {
					_id: procId
				}
			}
		})
		.then(doc => {
			if(!doc) return
			const proc = doc.processes.id(procId).toJSON()
			return {...proc, prog: doc.id.toString()}
		})
	},

	listProcessesByProgram: (progId) => {
		return progSchema.findById(progId)
			.then(doc => {
				let docs = []
                if(doc) {
                    doc = doc.toJSON()
                    docs = _.sortBy(doc.processes, 'date')
                }
                return docs
			})
	}
}

const entity = createEntity(config, addIn)

const progProcess = (mqPublish) => {
	__mqPublish = mqPublish
	return entity
}
module.exports = progProcess