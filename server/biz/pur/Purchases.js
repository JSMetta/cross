const schema = require('../../../db/schema/pur/Purchase'),
	createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity'),
	_ = require('lodash')

const config = {
	schema,
	projection: {transactions: 0},
	listable: {transactions: 0, __v: 0},
	updatables: ['code', 'part', 'qty', 'price', 'amount', 'supplier', 'refNo', 'remark'],
	searchables: ['code', 'refNo', 'remark']
}

const commit = (id, {__v, actor, date}) => {
	let row
	if (!actor) return Promise.resolve()
	return schema.findById(id)
		.then(doc => {
			if(doc && doc.__v === __v && (doc.state === 'Draft' || doc.state === 'Unapproved')) {
				const appDate = date || new Date()
				doc.state = 'Review'
				doc.applier = actor
				doc.appDate = appDate
				row = doc.transactions.push({type: 'commit', actor, date: appDate})
				return doc.save()
			}
		})
		.then(data => {
			if(data) {
				data = data.toJSON()
				return {po: data.id, ...data.transactions[row - 1]}
			} 
		})
}

const review = (id, {__v, actor, date, pass, remark}) => {
	if (!actor) return Promise.resolve()
	let  row
	return schema.findById(id)
		.then(doc => {
			if(doc && doc.__v === __v && doc.state === 'Review') {
				const reviewDate = date || new Date()
				doc.state = pass ? 'Open' : 'Unapproved'
				doc.reviewer = actor
				doc.reviewDate = reviewDate
				row = doc.transactions.push({type: 'review', data:{pass: pass ? true : false}, actor, date: reviewDate, remark})
				return doc.save()
			}
		})
		.then(data => {
			if(data) {
				data = data.toJSON()
				return {parent: data.id, ...data.transactions[row - 1]}
			} 
		})
}

const addIn = {
	listTransactions: (id) => {
		return schema.findById(id)
			.then(doc => {
				if(!doc) return []
				doc = doc.toJSON()
				return doc.transactions
			})
	},

	findTransactionById: (id) => {
		return schema.findOne({
			transactions: {
				$elemMatch: {
					_id: id
				}
			}
		})
		.then(doc => {
			const transaction = doc.transactions.id(id).toJSON()
			return {po: doc.id.toString(), ...transaction}
		})
	},

	commit, review,

	poInInv: (id, qty) => {
		return schema.findById(id)
			.then((po) => {
				if (!po) return Promise.reject()
				if (!po.left) {
					po.left = po.qty;
				}
				po.left -= qty;
				return po.save()
			})
	},

	periodPurchases: () => {
		const query = [{
				$lookup: {
					from: 'parts',
					localField: 'part',
					foreignField: '_id',
					as: 'partDoc'
				}
			},
			{
				$facet: {
					byType: [{
							$group: {
								_id: '$partDoc.type',
								qty: {
									$sum: '$qty'
								},
								amount: {
									$sum: '$amount'
								}
							}
						},
						{
							$sort: {
								amount: -1
							}
						}
					],
					byPart: [{
							$group: {
								_id: {
									part: '$partDoc'
								},
								qty: {
									$sum: '$qty'
								},
								amount: {
									$sum: '$amount'
								}
							}
						},
						{
							$sort: {
								amount: -1
							}
						}
					],
					byPo: [{
						$sort: {
							amount: -1
						}
					}],
					total: [{
						$group: {
							_id: undefined,
							amount: {
								$sum: '$amount'
							}
						}
					}]
				}
			}
		];

		return schema.aggregate(query).then((doc) => {
			let result = {
				total: 0
			}
			if (doc[0].total.length === 1) {
				let data = doc[0]
				result.types = []
				let byType = data.byType;
				let byPart = data.byPart;
				let byPo = data.byPo;

				_.each(byPo, po => {
					let type = po.partDoc[0].type
					let part = po.partDoc[0]
					let typeDoc = _.find(result.types, t => {
						return t.type === type
					})
					if (!typeDoc) {
						let byTypeElement = _.find(byType, t => {
							let id
							if (t._id.length > 0) id = t._id[0]
							return id === type
						})
						typeDoc = {
							type: type,
							parts: [],
							total: byTypeElement.amount
						}
						result.types.push(typeDoc)
					}

					let partDoc = _.find(typeDoc.parts, p => {
						return p.part._id.equals(part._id)
					})
					if (!partDoc) {
						let byPartElement = _.find(byPart, p => {
							return p._id.part[0]._id.equals(part._id)
						})
						partDoc = {
							part: part,
							pos: [],
							total: byPartElement.amount
						}
						typeDoc.parts.push(partDoc)
					}
					delete po.__v
					delete po.partDoc
					partDoc.pos.push(po)
				})

				result.total = data.total[0].amount
				_.each(result.types, t => {
					_.each(t.parts, p => {
						p.pos = _.sortBy(p.pos, po => {
							return po.amount * 1
						})
					})
					t.parts = _.sortBy(t.parts, pp => {
						return pp.total * -1
					})
				})
				result.types = _.sortBy(result.types, tt => {
					return tt.total * -1
				})
			}

			return result;
		});
	}
};

module.exports = createEntity(config, addIn);
