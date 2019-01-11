const schema = require('../../../db/schema/pur/Purchase'),
	part = require('../bas/Parts'),
	__ = require('underscore'),
	logger = require('@finelets/hyper-rest/app/Logger'),
	dbSave = require('../../../finelets/db/mongoDb/dbSave');
const func = {
	createBySource: (data) => {
		return schema
			.findOne({
				source: data.source
			})
			.then((doc) => {
				if (doc) return doc.toJSON();
				return dbSave(schema, data);
			});
	},

	inInv: (doc) => {
		return schema
			.findById(doc.po)
			.then((data) => {
				if (data.left === undefined) {
					data.left = data.qty;
				}
				data.left -= doc.qty;
				if (data.left < 0) data.left = 0;
				return data.save();
			})
			.then(() => {
				logger.debug('Purchase qty is updated by InInv !');
				return true;
			});
	},

	getPart: (purId) => {
		return schema.findById(purId).then((data) => {
			return part.findById(data.part);
		});
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
			// {"$match": {"state": "payed"}},
			{
				$project: {
					part: 1,
					partDoc: 1,
					qty: 1,
					amount: 1
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
							$group: {
								_id: {
									_id: "$_id",
									part: "$partDoc",
									qty: "$qty",
									amount: "$amount"
								}
							}
						},
						{
							$sort: {
								amount: -1
							}
						}
					],
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

				__.each(byPo, po => {
					let type = po._id.part[0].type
					let part = po._id.part[0]
					let typeDoc = __.find(result.types, t => {
						return t.type === type
					})
					if (!typeDoc) {
						let byTypeElement = __.find(byType, t => {
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

					let partDoc = __.find(typeDoc.parts, p => {
						return p.part.id.equals(part._id)
					})
					if (!partDoc) {
						let partVal = {
							id: part._id,
							name: part.name
						}
						if (part.spec) partVal.spec = part.spec

						let byPartElement = __.find(byPart, p => {
							return p._id.part[0]._id.equals(part._id)
						})
						partDoc = {
							part: partVal,
							pos: [],
							total: byPartElement.amount
						}
						typeDoc.parts.push(partDoc)
					}
					val = {
						id: po._id._id,
						qty: po._id.qty,
						amount: po._id.amount
					}
					partDoc.pos.push(val)
				})

				result.total = data.total[0].amount
				__.each(result.types, t => {
					__.each(t.parts, p => {
						p.pos = __.sortBy(p.pos, po => {
							return po.amount * 1
						})
					})
					t.parts = __.sortBy(t.parts, pp => {
						return pp.total * -1
					})
				})
				result.types = __.sortBy(result.types, tt => {
					return tt.total * -1
				})
			}
			
			return result;
		});
	}
};

module.exports = func;