var proxyquire = require('proxyquire'),
	logger = require('@finelets/hyper-rest/app/Logger'),
	dbSave = require('../finelets/db/mongoDb/dbSave');

describe('Cross', function () {
	var stubs, err;
	beforeEach(function () {
		stubs = {};
		err = new Error('any error message');
	});

	describe('Server', () => {
		describe('CrossMessageCenter', () => {
			it('publish', () => {
				const config = require('../server/CrossMessageCenterConfig');
				const msg = {
					msg: 'msg data'
				};
				let mqStart = sinon.stub();
				let mqPublish = sinon.spy();
				stubs['../finelets/mq/RabbitMessageCenter.js'] = {
					start: mqStart,
					publish: mqPublish
				};
				mqStart.withArgs(config).resolves();
				let crossMC = proxyquire('../server/CrossMessageCenter.js', stubs);

				return crossMC.start(config).then(() => {
					mqStart.callCount.should.eql(1);
					crossMC.importPurTransTaskCreated(msg);
					mqPublish.calledWith('cross', 'importPurTransTaskCreated', msg).calledOnce;
				});
			});
		});

		describe('biz - 业务模块', () => {
			beforeEach(function (done) {
				return clearDB(done);
			});

			describe('SaveNotExist', () => {
				const schema = require('../db/schema/bas/Part')
				const save = require('../finelets/db/mongoDb/saveNotExist')
				let data
				const uniqueFields = ['name', 'spec']
				let id, __v

				beforeEach(() => {
					data = {
						name: '料品'
					}
				})

				it('use findOneAndUpdate', () => {
					return save(schema, uniqueFields, data)
						.then(doc => {
							expect(doc.name).eqls(data.name)
							return schema.count()
						})
						.then(count => {
							expect(count).eqls(1)
						})
				})

				it('已存在一类似记录', () => {
					return dbSave(schema, {
							spec: 'spec',
							...data
						})
						.then(() => {
							return save(schema, uniqueFields, data)
						})
						.then(doc => {
							expect(doc.name).eqls(data.name)
							expect(doc.spec).undefined
							return schema.find()
						})
						.then(docs => {
							expect(docs.length).eqls(2)
						})
				})

				it('已存在', () => {
					return dbSave(schema, {
							spec: 'spec',
							...data
						})
						.then(() => {
							data = {
								spec: 'spec',
								...data
							}
							return save(schema, uniqueFields, data)
						})
						.then(doc => {
							expect({name: doc.name, spec: doc.spec}).eqls(data)
							return schema.find().lean()
						})
						.then(docs => {
							expect(docs.length).eqls(1)
						})
				})

				it('如果并行执行，则会出现Diplicated错', () => {
					let saves = []
					const wrap = () => {
						return save(schema, uniqueFields, data)
							.then((doc) => {
								return doc
							})
							.catch(e => {
								++times
							})
					}
					for (let i = 0; i < 2; i++) {
						saves.push(wrap())
					}
					return dbSave(schema, data)
						.then(() => {
							return Promise.all(saves)
						})
						.then(() => {
							should.fail('Failed if we come here!')
						})
						.catch(e => {
							expect(e.code).eqls(11000)
						})
				})
			})

			describe('BizDataExtractors', () => {
				const bizDataExtractors = require('../server/biz/BizDataExtractors');

				describe('ImportPurTransTask', () => {
					const extractor = bizDataExtractors.importPurTransTask;
					it('required fields', () => {
						const fields = ['transNo', 'partName', 'qty', 'amount', 'supplier'];
						try {
							extractor({});
						} catch (e) {
							for (let i = 0; i < fields.length; i++) {
								expect(e[i].fieldName).eqls(fields[i]);
							}
						}
						should.fail;
					});
				});
			});

			describe('bas - 基础资料', () => {
				let schema, dbSaveStub, testTarget;
				let toCreate;
				beforeEach(() => {
					dbSaveStub = sinon.stub();
					stubs['../../../finelets/db/mongoDb/dbSave'] = dbSaveStub;
				});

				describe('Parts - 料品', () => {
					const name = 'foo';
					const spec = 'foo spec';

					beforeEach(() => {
						toCreate = {
							name: name,
							spec: spec
						};
						schema = require('../db/schema/bas/Part');
						testTarget = proxyquire('../server/biz/bas/Parts', stubs);
					});

					it('name is required', () => {
						return testTarget
							.create({})
							.then(() => {
								should.fail('failed if we come here');
							})
							.catch((e) => {
								expect(e).eqls('part name is required');
							});
					});

					it('name and spec should be unique', () => {
						let existed;
						return dbSave(schema, toCreate)
							.then((doc) => {
								existed = doc;
								return testTarget.create(toCreate);
							})
							.then(() => {
								return schema.find()
								
							})
							.then(docs => {
								expect(docs.length).eqls(1);
								let doc = docs[0].toJSON()
								expect(existed.createAt).eqls(doc.createAt)
								expect(existed.modifiedDate).not.eqls(doc.modifiedDate)
							})
					});

					it('findById', () => {
						return dbSave(schema, {
								name: 'foo'
							})
							.then((doc) => {
								return testTarget.findById(doc.id);
							})
							.then((doc) => {
								expect(doc.name).eqls('foo');
							});
					});

					it('findById - 未找到', () => {
						return testTarget.findById('5c349d1a6cf8de3cd4a5bc2c').then((doc) => {
							expect(doc).not.exist;
						});
					});

					describe('搜索料品', () => {
						it('搜索字段包括name, code, spec', () => {
							let saveParts = []
							saveParts.push(dbSave(schema, {
								type: 1,
								name: '弹簧垫片螺母'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								name: 'fee',
								spec: '弹簧垫片螺母'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								code: '弹簧垫片螺母',
								name: 'fee1',
								spec: 'spec1'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								name: 'fee2',
								spec: 'spec2'
							}))
							return Promise.all(saveParts)
								.then(() => {
									return testTarget.search({type: 1}, '垫片')
								})
								.then(data => {
									expect(data.length).eqls(3)
								})
						})

						it('不区分大小写', () => {
							let saveParts = []
							saveParts.push(dbSave(schema, {
								type: 1,
								name: '弹簧垫片螺母'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								name: 'fEe',
								spec: '齿轮油'
							}))
							return Promise.all(saveParts)
								.then(() => {
									return testTarget.search({type: 1}, 'Fee')
								})
								.then(data => {
									expect(data.length).eqls(1)
								})
						})

						it('可以使用通配符‘.’匹配一个字', () => {
							let saveParts = []
							saveParts.push(dbSave(schema, {
								type: 1,
								name: '弹簧垫片螺母'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								name: '弹螺母垫片螺'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								name: 'fEe',
								spec: '齿轮油'
							}))
							return Promise.all(saveParts)
								.then(() => {
									return testTarget.search({type: 1}, '弹.垫')
								})
								.then(data => {
									expect(data.length).eqls(1)
								})
						})

						it('可以使用通配符‘*’', () => {
							let saveParts = []
							saveParts.push(dbSave(schema, {
								type: 1,
								name: '弹簧垫片螺母'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								name: '弹螺母垫片螺'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								name: 'fEe',
								spec: '齿轮油'
							}))
							return Promise.all(saveParts)
								.then(() => {
									return testTarget.search({type: 1}, '弹*垫')
								})
								.then(data => {
									expect(data.length).eqls(2)
								})
						})

						it('无条件', () => {
							let saveParts = []
							saveParts.push(dbSave(schema, {
								type: 1,
								name: '弹簧垫片螺母'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								name: '弹螺母垫片螺'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								name: 'fEe',
								spec: '齿轮油'
							}))
							return Promise.all(saveParts)
								.then(() => {
									return testTarget.search({}, '.')
								})
								.then(data => {
									expect(data.length).eqls(3)
								})
						})
					})
				});

				describe('Suppliers - 供应商', () => {
					const name = 'foo';

					beforeEach(() => {
						toCreate = {
							name: name
						};
						schema = require('../db/schema/bas/Supplier');
						testTarget = proxyquire('../server/biz/bas/Suppliers', stubs);
					});

					it('name is required', () => {
						return testTarget
							.create({})
							.then(() => {
								should.fail('failed if we come here');
							})
							.catch((e) => {
								expect(e).eqls('supplier name is required');
							});
					});

					it('name should be unique', () => {
						let existed;
						return dbSave(schema, toCreate)
							.then((doc) => {
								existed = doc;
								return testTarget.create(toCreate);
							})
							.then((doc) => {
								doc = {...doc, modifiedDate: existed.modifiedDate}
								expect(doc).eqls(existed); // 仅仅只有modifiedDate值发了变化
							});
					});
				});

				describe('Employee - 员工', () => {
					const name = 'foo';
					beforeEach(() => {
						toCreate = {
							name: name
						};
						schema = require('../db/schema/bas/Employee');
						testTarget = proxyquire('../server/biz/bas/Employee', stubs);
					});

					it('dbSave will create doc using schema default', ()=>{
						return dbSave(schema, {name: 'foo'})
						.then(doc => {
							expect(doc.modifiedDate).exist
						})
					})

					it('saveNotExist will create doc using schema default', ()=>{
						const saveNotExist = require('../finelets/db/mongoDb/saveNotExist')
						let id, modifiedDate
						return saveNotExist(schema, ['name'], {name: 'foofoo111111'})
						.then(doc => {
							expect(doc.modifiedDate).exist
							id = doc.id
							modifiedDate = doc.modifiedDate
							return schema.find()
						})
						.then(docs => {
							doc = docs[0].toJSON()
							expect(doc.modifiedDate).eqls(modifiedDate)
						})
					})

					it('name is required', () => {
						return testTarget
							.create({})
							.then(() => {
								should.fail('failed if we come here');
							})
							.catch((e) => {
								expect(e).eqls('employee name is required');
							});
					});

					it('name should be unique', () => {
						let existed;
						return dbSave(schema, toCreate)
							.then((doc) => {
								existed = doc;
								return testTarget.create(toCreate);
							})
							.then((doc) => {
								doc = {...doc, modifiedDate: existed.modifiedDate}
								expect(doc).eqls(existed);
							});
					});
					describe('Auth', () => {
						it('使用name认证', () => {
							let user
							return dbSave(schema, toCreate)
								.then((doc) => {
									user = doc
									delete user.__v
									return testTarget.authenticate('foo')
								})
								.then(doc => {
									expect(doc).exist
								})
						})

						it('使用userId和password认证', () => {
							let user
							return dbSave(schema, {
									userId: 'foo',
									password: '9',
									name: 'foo name'
								})
								.then((doc) => {
									user = {
										id: doc.id,
										name: doc.name
									}
									return testTarget.authenticate('foo', '9')
								})
								.then(doc => {
									expect(doc).exist
								})
						})

						it('获得用户信息', () => {
							let id
							toCreate = {
								name: 'foo',
								pic: 'pic'
							}
							return dbSave(schema, toCreate)
								.then((doc) => {
									id = doc.id
									return testTarget.getUser(id)
								})
								.then(doc => {
									expect(doc.id).eqls(id)
								})
						})

					})

					describe('ifUnmodifiedSince', () => {
						it('版本不一致', () => {
							return dbSave(schema, toCreate)
								.then((doc) => {
									return testTarget.ifUnmodifiedSince(doc.id, new Date())
								})
								.then((result) => {
									expect(result).false;
								});
						});

						it('版本一致', () => {
							return dbSave(schema, toCreate)
								.then((doc) => {
									return testTarget.ifUnmodifiedSince(doc.id, new Date(doc.modifiedDate).toJSON())
								})
								.then((result) => {
									expect(result).true;
								});
						});
					})

					describe('update', ()=>{
						it('版本不一致', () => {
							return dbSave(schema, toCreate)
								.then((doc) => {
									return testTarget.update({id: doc.id, name: 'foo1', modifiedDate: new Date()});
								})
								.then((doc) => {
									expect(doc).not.exist;
								});
						});

						it('成功', () => {
							let modifiedDate
							return dbSave(schema, toCreate)
								.then((doc) => {
									modifiedDate = doc.modifiedDate
									return testTarget.update(
										{
											id: doc.id,
											modifiedDate: modifiedDate,
											userId: '1234',
											name: 'foo1',
											email: 'email'
										});
								})
								.then((doc) => {
									expect(doc.userId).eqls('1234');
									expect(doc.name).eqls('foo1');
									expect(doc.password).eqls('9');   // 缺省密码为'9'
									expect(doc.email).eqls('email');
									expect(doc.modifiedDate > modifiedDate).true
								});
						});
					})
				});
			});

			describe('pur - 采购', () => {
				let schema, dbSaveStub, testTarget;
				let poData, partStub;

				const partId = '5c349d1a6cf8de3cd4a5bc2c';
				const source = 'any source';

				beforeEach(() => {
					poData = {
						part: partId,
						qty: 100,
						amount: 5000,
						source: source
					};

					partStub = sinon.stub({
						findById: () => {}
					});
					stubs['../bas/Parts'] = partStub;

					dbSaveStub = sinon.stub();
					stubs['../../../finelets/db/mongoDb/dbSave'] = dbSaveStub;
					schema = require('../db/schema/pur/Purchase');
				});

				describe('Purchases - 采购单', () => {
					beforeEach(() => {
						testTarget = proxyquire('../server/biz/pur/Purchases', stubs);
					});

					it('source duplicated', () => {
						let existed;
						return dbSave(schema, poData)
							.then((doc) => {
								existed = doc;
								return testTarget.createBySource(poData);
							})
							.then((doc) => {
								expect(doc).eqls(existed);
							});
					});

					it('create', () => {
						const created = {
							data: 'created data'
						};

						dbSaveStub.withArgs(schema, poData).resolves(created);
						return testTarget.createBySource(poData).then((data) => {
							expect(data).eqls(created);
						});
					});

					it('getPart', () => {
						const partExpected = {
							part: 'part expected'
						};
						const ObjectId = require('mongoose').mongo.ObjectId;
						let partObjId = new ObjectId(partId);
						partStub.findById.withArgs(partObjId).resolves(partExpected);
						return dbSave(schema, {
								part: partObjId,
								qty: 100,
								amount: 20000
							})
							.then((doc) => {
								return testTarget.getPart(doc.id);
							})
							.then((doc) => {
								expect(doc).eqls(partExpected);
							});
					});

					describe('采购入库抵扣采购单', () => {
						it('成功', () => {
							const poQty = 400,
								qty = 120;
							let purId;
							return dbSave(schema, {
									part: partId,
									qty: poQty,
									amount: 20000
								})
								.then((data) => {
									purId = data.id;
									return testTarget.inInv({
										po: purId,
										qty: qty
									});
								})
								.then((result) => {
									expect(result).true;
									return schema.findById(purId);
								})
								.then((doc) => {
									expect(doc.left).eqls(280);
								});
						});
					});

					describe('查询期间料品采购金额及其明细', () => {
						it('无任何记录', () => {
							return testTarget.periodPurchases().then((data) => {
								expect(data).eqls({
									total: 0
								});
							});
						});

						it('总体', () => {
							const partSchema = require('../db/schema/bas/Part');
							const part1 = '5c349d1a6cf8de3cd4a5bc2c';
							const part2 = '5c349d1a6cf8de3cd4a5bc3c';
							const part3 = '5c349d1a6cf8de3cd4a5bc4c';
							const part4 = '5c349d1a6cf8de3cd4a5bc5c';
							const day1 = new Date(2018, 9, 10);
							const parts = [{
									_id: part1,
									type: 1,
									name: 'foo',
									spec: 'foo spec'
								},
								{
									_id: part2,
									type: 1,
									name: 'fee',
									spec: 'fee spec'
								},
								{
									_id: part3,
									type: 2,
									name: 'fuu'
								},
								{
									_id: part4,
									name: 'fuuu'
								}
							];
							let pos = [{
									part: part1,
									qty: 100,
									amount: 1000,
									createDate: day1
								},
								{
									part: part1,
									qty: 200,
									amount: 2000,
									createDate: day1
								},
								{
									part: part2,
									qty: 300,
									amount: 3000,
									createDate: day1
								},
								{
									part: part3,
									qty: 400,
									amount: 4000,
									createDate: day1
								},
								{
									part: part4,
									qty: 500,
									amount: 5000,
									createDate: day1
								}
							];

							let tasks = [];
							parts.forEach((part) => {
								tasks.push(dbSave(partSchema, part));
							});
							pos.forEach((po) => {
								tasks.push(dbSave(schema, po));
							});

							return Promise.all(tasks)
								.then(() => {
									return testTarget.periodPurchases();
								})
								.then((data) => {
									expect(data.total).eqls(15000)
								});
						});
					});
				});

				describe('Reviews', () => {
					const reviewer = '5c349d1a6cf8de3cd4a5bc3c';
					const reviewDate = new Date();
					beforeEach(() => {
						testTarget = proxyquire('../server/biz/pur/Reviews', stubs);
					});

					it('reviewer is required', () => {
						return testTarget
							.create({})
							.then(() => {
								should.fail('Failed');
							})
							.catch((err) => {
								expect(err).eqls('reviewer is required');
							});
					});

					it('po not found', () => {
						return testTarget
							.create({
								po: '5c349d1a6cf8de3cd4a5bc3c',
								reviewer: '5a349d1a6cf8de3cd4a5bc4c'
							})
							.then(() => {
								should.fail('Failed');
							})
							.catch((err) => {
								expect(err).eqls('po[5c349d1a6cf8de3cd4a5bc3c] not found');
							});
					});

					it('成功', () => {
						let purId;
						return dbSave(schema, poData)
							.then((doc) => {
								purId = doc.id;
								return testTarget.create({
									po: purId,
									reviewer: reviewer,
									reviewDate: reviewDate
								});
							})
							.then((doc) => {
								expect(doc.id).eqls(purId);
								expect(doc.reviewer.toString()).eqls(reviewer);
								expect(doc.reviewDate).eqls(reviewDate.toJSON());
							});
					});

					it('无审批日期', () => {
						let purId;
						return dbSave(schema, poData)
							.then((doc) => {
								purId = doc.id;
								return testTarget.create({
									po: purId,
									reviewer: reviewer
								});
							})
							.then((doc) => {
								expect(doc.id).eqls(purId);
								expect(doc.reviewer.toString()).eqls(reviewer);
								expect(doc.reviewDate).exist;
							});
					});
				});
			});

			describe('Inv - 库存', () => {
				let schema, dbSaveStub, testTarget;
				let transData;
				const transNo = 'no.000234';
				const aDate = new Date();

				beforeEach(() => {});

				describe('InInvs - 采购入库单', () => {
					const purId = '5c349d1a6cf8de3cd4a5bc2c';
					let msgSender;
					beforeEach(() => {
						msgSender = sinon.spy();
						stubs['../../CrossMessageCenter'] = {
							poInInv: msgSender
						};
						dbSaveStub = sinon.stub();
						stubs['../../../finelets/db/mongoDb/dbSave'] = dbSaveStub;
						transData = {
							po: purId,
							qty: 100,
							date: aDate,
							loc: 'loc',
							source: transNo
						};
						schema = require('../db/schema/inv/InInv');

						testTarget = proxyquire('../server/biz/inv/InInvs', stubs);
					});

					it('source duplicated', () => {
						return dbSave(schema, transData)
							.then(() => {
								return testTarget.create(transData);
							})
							.then(() => {
								should.fail('Failed');
							})
							.catch((e) => {
								expect(e).eqls('InInv: Source ' + transNo + ' is duplicated');
							});
					});

					it('create', () => {
						const created = {
							data: 'created data'
						};

						dbSaveStub.withArgs(schema, transData).resolves(created);
						return testTarget.create(transData).then((data) => {
							expect(data).eqls(created);
							expect(msgSender.withArgs(data)).calledOnce;
						});
					});
				});

				describe('OutInvs - 出库单', () => {
					const partId = '5c349d1a6cf8de3cd4a5bc2c';
					let msgSender;
					beforeEach(() => {
						msgSender = sinon.spy();
						stubs['../../CrossMessageCenter'] = {
							outInv: msgSender
						};
						dbSaveStub = sinon.stub();
						stubs['../../../finelets/db/mongoDb/dbSave'] = dbSaveStub;
						transData = {
							part: partId,
							qty: 200,
							user: '5c349d1addd8de3cd4a5bc2c',
							date: aDate,
							project: 'project',
							source: transNo
						};
						schema = require('../db/schema/inv/OutInv');
						testTarget = proxyquire('../server/biz/inv/OutInvs', stubs);
					});

					it('source duplicated', () => {
						return dbSave(schema, transData)
							.then(() => {
								return testTarget.create(transData);
							})
							.then(() => {
								should.fail('Failed');
							})
							.catch((e) => {
								expect(e).eqls('OutInv: Source ' + transNo + ' is duplicated');
							});
					});

					it('create', () => {
						const created = {
							data: 'created data'
						};

						dbSaveStub.withArgs(schema, transData).resolves(created);
						return testTarget.create(transData).then((data) => {
							expect(data).eqls(created);
							expect(msgSender.withArgs(data)).calledOnce;
						});
					});
				});

				describe('Invs - 库存', () => {
					const invSchema = require('../db/schema/inv/Inv');
					const partId = '5c349d1a6cf8de3cd4a5bc2c';
					let invs, po;

					beforeEach(() => {
						po = sinon.stub({
							getPart: () => {}
						});
						stubs['../pur/Purchases'] = po;
						invs = proxyquire('../server/biz/inv/Invs', stubs);
					});
					describe('处理入库单', () => {
						const poId = '123455';
						const initQty = 150;
						const qty = 210;
						const doc = {
							po: poId,
							qty: qty
						};

						beforeEach(() => {
							po.getPart.withArgs(poId).resolves({
								id: partId
							});
						});
						it('首次库存开账', () => {
							return invs
								.inInv(doc)
								.then((result) => {
									expect(result).true;
									return invSchema.findOne({
										part: partId
									});
								})
								.then((data) => {
									expect(data.qty).eqls(qty);
								});
						});

						it('更新库存', () => {
							return dbSave(invSchema, {
									part: partId,
									qty: initQty
								})
								.then(() => {
									return invs.inInv(doc);
								})
								.then((result) => {
									expect(result).true;
									return invSchema.findOne({
										part: partId
									});
								})
								.then((data) => {
									expect(data.qty).eqls(qty + initQty);
								});
						});
					});
				});

				describe('Loc - 库位', () => {
					describe('Loc - 入库单更新库位', () => {
						const partId = '5c349d1a6cf8de3cd4a5bc2c';
						const purId = '12345';
						const qty = 230;
						const loc = 'foo';
						const date = new Date();
						let inInvDoc;
						const locSchema = require('../db/schema/inv/Loc');
						let LOC, po;

						beforeEach(() => {
							inInvDoc = {
								po: purId,
								qty: qty,
								loc: loc,
								date: date
							};
							po = sinon.stub({
								getPart: () => {}
							});
							stubs['../pur/Purchases'] = po;
							po.getPart.withArgs(purId).resolves({
								id: partId
							});
							LOC = proxyquire('../server/biz/inv/Locs', stubs);
						});

						it('首次入库', () => {
							return LOC.inInv(inInvDoc)
								.then((result) => {
									expect(result).true;
									return locSchema.find({
										loc: loc,
										part: partId,
										date: date
									});
								})
								.then((docs) => {
									expect(docs.length).eqls(1);
									let doc = docs[0].toJSON();
									expect(doc.qty).eqls(qty);
								});
						});

						it('使用缺省库位和缺省日期', () => {
							delete inInvDoc.loc;
							delete inInvDoc.date;
							return LOC.inInv(inInvDoc)
								.then((result) => {
									expect(result).true;
									return locSchema.find({
										loc: '@@@CROSS@@@',
										part: partId
									});
								})
								.then((docs) => {
									expect(docs.length).eqls(1);
									let doc = docs[0].toJSON();
									expect(doc.qty).eqls(qty);
									expect(doc.date).exist;
								});
						});
					});

					describe('Loc - 查询库位状态', () => {
						const locSchema = require('../db/schema/inv/Loc'),
							partSchema = require('../db/schema/bas/Part'),
							LOC = require('../server/biz/inv/Locs');

						it('无任何记录', () => {
							return LOC.listLocState()
								.then((result) => {
									expect(result).eqls({
										items: []
									});
								})
						});

						it('库位料品存量表', () => {
							const part1 = '5c349d1a6cf8de3cd4a5bc2c',
								part2 = '5c349d1a6cf8de3cd4a5bc3c',
								part3 = '5c349d1a6cf8de3cd4a5bc4c';
							const parts = [{
									_id: part1,
									name: 'foo',
									spec: 'foo spec'
								},
								{
									_id: part2,
									name: 'fee'
								},
								{
									_id: part3,
									name: 'fuu'
								}
							];
							let dbParts;
							let addParts = []
							parts.forEach(p => {
								addParts.push(dbSave(partSchema, p))
							})

							return Promise.all(addParts)
								.then(data => {
									dbParts = data
									expect(dbParts.length).eqls(3)
									return dbSave(locSchema, {
										loc: '002',
										part: part1,
										qty: 100
									})
								})
								.then(() => {
									return dbSave(locSchema, {
										loc: '002',
										part: part2,
										qty: 200
									})
								})
								.then(() => {
									return dbSave(locSchema, {
										loc: '001',
										part: part1,
										qty: 100
									})
								})
								.then(() => {
									return dbSave(locSchema, {
										loc: '001',
										part: part1,
										qty: 100
									})
								})
								.then(() => {
									return LOC.listLocState()
								})
								.then((result) => {
									let items = result.items
									expect(items.length).eqls(3);
									expect(items).eqls([{
											loc: '001',
											part: {
												id: part1,
												name: 'foo',
												spec: 'foo spec'
											},
											qty: 200
										},
										{
											loc: '002',
											part: {
												id: part1,
												name: 'foo',
												spec: 'foo spec'
											},
											qty: 100
										},
										{
											loc: '002',
											part: {
												id: part2,
												name: 'fee'
											},
											qty: 200
										}
									])
								})
						});
					});
				})


			});

			describe('batches - 批处理作业', () => {
				describe('Import Purchases CSV', () => {
					it('PurchaseCsvParser', () => {
						const line =
							'xulei00001,料品,"JSM-A1实验用格子布",abcd,米,150,8800,8800,绍兴惟楚纺织品有限公司,厂家,' +
							'JSMCONV20181109A,开票中,80,徐存辉,2018/11/9,徐存辉,2018/11/9,徐存辉,2018/12/12,' +
							'测试组,2018/12/12,100,测试组, h234,remark';
						const expected = {
							transNo: 'xulei00001',
							partType: '料品',
							partName: 'JSM-A1实验用格子布',
							spec: 'abcd',
							unit: '米',
							qty: 150,
							price: 8800,
							amount: 8800,
							supplier: '绍兴惟楚纺织品有限公司',
							supply: '厂家',
							refNo: 'JSMCONV20181109A',
							supplyLink: '开票中',
							purPeriod: 80,
							applier: '徐存辉',
							appDate: new Date('2018/11/9').toJSON(),
							reviewer: '徐存辉',
							reviewDate: new Date('2018/11/9').toJSON(),
							purchaser: '徐存辉',
							invDate: new Date('2018/12/12').toJSON(),
							user: '测试组',
							useDate: new Date('2018/12/12').toJSON(),
							useQty: 100,
							project: '测试组',
							invLoc: ' h234',
							remark: 'remark'
						};
						const parser = require('../server/biz/batches/PurchaseCsvParser');
						let val = parser(line);
						expect(val.transNo).eqls(expected.transNo);
						expect(val.partType).eqls(expected.partType);
						expect(val.partName).eqls(expected.partName);
						expect(val.spec).eqls(expected.spec);
						expect(val.unit).eqls(expected.unit);
						expect(val.qty).eqls(expected.qty);
						expect(val.price).eqls(expected.price);
						expect(val.amount).eqls(expected.amount);
						expect(val.supplier).eqls(expected.supplier);
						expect(val.supply).eqls(expected.supply);
						expect(val.refNo).eqls(expected.refNo);
						expect(val.supplyLink).eqls(expected.supplyLink);
						expect(val.supplyLink).eqls(expected.supplyLink);
						expect(val.purPeriod).eqls(expected.purPeriod);
						expect(val.applier).eqls(expected.applier);
						expect(val.appDate).eqls(expected.appDate);
						expect(val.reviewDate).eqls(expected.reviewDate);
						expect(val.purDate).eqls(expected.purDate);
						expect(val.invDate).eqls(expected.invDate);
						expect(val.useDate).eqls(expected.useDate);
						expect(val.reviewer).eqls(expected.reviewer);
						expect(val.purchaser).eqls(expected.purchaser);
						expect(val.user).eqls(expected.user);
						expect(val.useQty).eqls(expected.useQty);
						expect(val.project).eqls(expected.project);
						expect(val.invLoc).eqls(expected.invLoc);
						expect(val.remark).eqls(expected.remark);
					});

					describe('ImportPurTransTask', () => {
						let findOneStub, schema;
						const doc = {
							transNo: 'foo',
							doc: 'any data of doc'
						};
						const taskDoc = {
							transNo: 'foo',
							task: doc
						};
						let extract, dbSave, task, publishImportPurTransTaskCreated;

						beforeEach(() => {
							findOneStub = sinon.stub();
							schema = {
								findOne: findOneStub
							};
							stubs['../../../db/schema/PurTransTask'] = schema;

							extract = sinon.stub();
							stubs['../BizDataExtractors'] = {
								importPurTransTask: extract
							};

							dbSave = sinon.stub();
							stubs['@finelets/hyper-rest/db/mongoDb/SaveObjectToDb'] = dbSave;

							publishImportPurTransTaskCreated = sinon.spy();
							stubs['../../CrossMessageCenter'] = {
								importPurTransTaskCreated: publishImportPurTransTaskCreated
							};

							task = proxyquire('../server/biz/batches/ImportPurTransTask', stubs);
						});

						it('抽取并校验数据失败', () => {
							extract.withArgs(doc).throws(err);
							return task
								.create(doc)
								.then(() => {
									should.fail;
								})
								.catch((e) => {
									expect(e).eqls(err);
								});
						});

						it('忽略已存在的交易', () => {
							extract.withArgs(doc).returns(doc);
							findOneStub
								.withArgs({
									transNo: 'foo'
								})
								.resolves(taskDoc);
							return task.create(doc).then(() => {
								expect(dbSave.callCount).eqls(0);
							});
						});

						it('新增失败', () => {
							extract.withArgs(doc).returns(doc);
							findOneStub
								.withArgs({
									transNo: 'foo'
								})
								.resolves(null);
							dbSave.withArgs(schema, taskDoc).rejects(err);
							return task
								.create(doc)
								.then(() => {
									should.fail;
								})
								.catch((e) => {
									expect(e).eqls(err);
								});
						});

						it('新增成功', () => {
							extract.withArgs(doc).returns(doc);
							findOneStub
								.withArgs({
									transNo: 'foo'
								})
								.resolves(null);
							dbSave.withArgs(schema, taskDoc).resolves(doc);
							return task.create(doc).then((data) => {
								expect(data).eqls(doc);
								expect(publishImportPurTransTaskCreated).calledWith(doc).calledOnce;
							});
						});

						describe('更新任务状态', () => {
							const dbSave = require('../finelets/db/mongoDb/dbSave');
							const schema = require('../db/schema/PurTransTask');
							const task = require('../server/biz/batches/ImportPurTransTask');
							it('成功', () => {
								const id = '5c349d1a6cf8de3cd4a5bc2c';
								return dbSave(schema, {
										transNo: '000123'
									})
									.then((doc) => {
										return task.updateState(doc.id, {
											purchase: id,
											review: id,
											inInv: id,
											outInv: id
										});
									})
									.then((doc) => {
										expect(doc.po.toString()).eqls(id);
										expect(doc.review.toString()).eqls(id);
										expect(doc.inInv.toString()).eqls(id);
										expect(doc.outInv.toString()).eqls(id);
									});
							});
						});
					});

					describe('ExecutePurTransTask', () => {
						const purId = 12345;

						const expectedResult = (result, id, errors) => {
							expect(result.id).eqls(id);
							expect(result.errors).eqls(errors);
						};

						let taskExec, PO, basParts, basSuppliers, basEmployee;

						beforeEach(() => {
							PO = sinon.stub({
								createBySource: () => {}
							});
							stubs['../pur/Purchases'] = PO;

							purReviews = sinon.stub({
								create: () => {}
							});
							stubs['../pur/Reviews'] = purReviews;

							inInvs = sinon.stub({
								create: () => {}
							});
							stubs['../inv/InInvs'] = inInvs;

							outInvs = sinon.stub({
								create: () => {}
							});
							stubs['../inv/OutInvs'] = outInvs;

							purTransTask = sinon.stub({
								updateState: () => {}
							});
							stubs['./ImportPurTransTask'] = purTransTask;

							basParts = sinon.stub({
								create: () => {}
							});
							stubs['../bas/Parts'] = basParts;

							basSuppliers = sinon.stub({
								create: () => {}
							});
							stubs['../bas/Suppliers'] = basSuppliers;

							basEmployee = sinon.stub({
								create: () => {}
							});
							stubs['../bas/Employee'] = basEmployee;
							taskExec = proxyquire('../server/biz/batches/ExecutePurTransTask', stubs)();
						});

						describe('pubBas', () => {
							const basId = 1234;
							const basDoc = {
								id: basId,
								data: 'any other data'
							};

							describe('pubPart', () => {
								const taskData = {
									partType: '料品',
									partName: 'JSM-A1实验用格子布',
									spec: 'abcd',
									unit: '米'
								};

								it('料品类型错', () => {
									return taskExec
										.pubPart({
											partType: 'invalid',
											partName: 'foo'
										})
										.then((result) => {
											expectedResult(result, undefined, ['invalid part type value: invalid']);
										});
								});

								it('无料品名称', () => {
									return taskExec.pubPart({}).then((result) => {
										expectedResult(result, undefined, ['Part name is required']);
									});
								});

								it('创建失败', () => {
									basParts.create
										.withArgs({
											name: taskData.partName
										})
										.rejects(err);
									return taskExec
										.pubPart({
											partName: taskData.partName
										})
										.then((result) => {
											expectedResult(result, undefined, [err]);
										});
								});

								it('创建', () => {
									basParts.create
										.withArgs({
											type: 1,
											name: taskData.partName,
											spec: taskData.spec,
											unit: taskData.unit
										})
										.resolves(basDoc);
									return taskExec.pubPart(taskData).then((result) => {
										expectedResult(result, basId, []);
									});
								});
							});

							describe('pubSupplier', () => {
								const taskData = {
									supplier: '绍兴惟楚纺织品有限公司',
									supply: '厂家'
								};

								it('厂商类型错', () => {
									return taskExec
										.pubSupplier({
											supply: 'invalid',
											supplier: 'foo'
										})
										.then((result) => {
											expectedResult(result, undefined, ['supply value is invalid: invalid']);
										});
								});

								it('无供应商信息', () => {
									return taskExec.pubSupplier({}).then((result) => {
										expectedResult(result, undefined, []);
									});
								});

								it('创建失败', () => {
									basSuppliers.create
										.withArgs({
											name: 'foo'
										})
										.rejects(err);
									return taskExec
										.pubSupplier({
											supplier: 'foo'
										})
										.then((result) => {
											expectedResult(result, undefined, [err]);
										});
								});

								it('创建', () => {
									basSuppliers.create
										.withArgs({
											type: 1,
											name: taskData.supplier
										})
										.resolves(basDoc);
									return taskExec.pubSupplier(taskData).then((result) => {
										expectedResult(result, basId, []);
									});
								});
							});

							describe('pubEmployee', () => {
								it('无员工信息', () => {
									return taskExec.pubEmployee().then((result) => {
										expectedResult(result, undefined, []);
									});
								});

								it('创建失败', () => {
									basEmployee.create
										.withArgs({
											name: 'foo'
										})
										.rejects(err);
									return taskExec.pubEmployee('foo').then((result) => {
										expectedResult(result, undefined, [err]);
									});
								});

								it('创建', () => {
									basEmployee.create
										.withArgs({
											name: 'foo'
										})
										.resolves(basDoc);
									return taskExec.pubEmployee('foo').then((result) => {
										expectedResult(result, basId, []);
									});
								});
							});
						});

						describe('pubPurchase', () => {
							const partId = 123,
								supplierId = 234,
								applierId = 345,
								purchaserId = 456;

							const taskData = {
								transNo: 'xulei00006',
								qty: 150,
								price: 8800,
								amount: 8800,
								refNo: 'JSMCONV20181109A',
								supplyLink: '开票中',
								purPeriod: 80,
								applier: 'foo',
								appDate: '2018-11-08T16:00:00.000Z',
								purchaser: 'fuu',
								purDate: '2018-11-08T16:00:00.000Z',
								remark: 'remark'
							};

							const poDoc = {
								id: purId,
								data: 'other po data'
							};
							beforeEach(() => {
								taskExec.pubSupplier = sinon.stub();
								taskExec.pubEmployee = sinon.stub();
							});

							it('成功处理', () => {
								taskExec.pubSupplier.withArgs(taskData).resolves({
									id: supplierId
								});
								taskExec.pubEmployee.withArgs(taskData.applier).resolves({
									id: applierId
								});
								taskExec.pubEmployee.withArgs(taskData.purchaser).resolves({
									id: purchaserId
								});
								PO.createBySource
									.withArgs({
										part: partId,
										supplier: supplierId,
										qty: 150,
										price: 8800,
										amount: 8800,
										refNo: 'JSMCONV20181109A',
										supplyLink: '开票中',
										purPeriod: 80,
										applier: applierId,
										appDate: '2018-11-08T16:00:00.000Z',
										creator: purchaserId,
										createDate: '2018-11-08T16:00:00.000Z',
										remark: 'remark',
										source: 'xulei00006'
									})
									.resolves(poDoc);
								return taskExec.pubPurchase(partId, taskData).then((result) => {
									expect(result).eqls(purId);
								});
							});
						});

						describe('pubReview', () => {
							const reviewerId = 3456;

							beforeEach(() => {
								taskExec.pubEmployee = sinon.stub();
							});

							it('无审批信息', () => {
								return taskExec
									.pubReview(purId, {})
									.then(() => {
										should.fail('Failed when we come here');
									})
									.catch((e) => {
										expect(e).eqls('reviewer is not found');
									});
							});

							it('审批失败', () => {
								taskExec.pubEmployee.withArgs('foo').resolves({
									id: reviewerId
								});
								purReviews.create
									.withArgs({
										po: purId,
										reviewer: reviewerId
									})
									.rejects(err);
								return taskExec
									.pubReview(purId, {
										reviewer: 'foo'
									})
									.then(() => {
										should.fail('Failed when we come here');
									})
									.catch((e) => {
										expect(e).eqls(err);
									});
							});

							it('审批成功', () => {
								const reviewDate = new Date().toJSON();
								const reviewId = 789;
								taskExec.pubEmployee.withArgs('foo').resolves({
									id: reviewerId
								});
								purReviews.create
									.withArgs({
										po: purId,
										reviewer: reviewerId,
										reviewDate: reviewDate
									})
									.resolves({
										id: reviewId
									});
								return taskExec
									.pubReview(purId, {
										reviewer: 'foo',
										reviewDate: reviewDate
									})
									.then((result) => {
										expect(result).eqls(reviewId);
									});
							});
						});

						describe('pubInInv', () => {
							const inInvId = 3456,
								transNo = '0001',
								qty = 100,
								invDate = new Date().toJSON(),
								loc = 'foo loc';

							it('无入库信息', () => {
								return taskExec
									.pubInInv(purId, {
										qty: qty,
										invLoc: loc,
										transNo: transNo
									})
									.then(() => {
										should.fail('Failed when we come here');
									})
									.catch((e) => {
										expect(e).eqls('inInv is not found');
									});
							});

							it('入库失败', () => {
								inInvs.create
									.withArgs({
										po: purId,
										qty: qty,
										date: invDate,
										loc: loc,
										source: transNo
									})
									.rejects(err);
								return taskExec
									.pubInInv(purId, {
										qty: qty,
										invDate: invDate,
										invLoc: loc,
										transNo: transNo
									})
									.then(() => {
										should.fail('Failed when we come here');
									})
									.catch((e) => {
										expect(e).eqls(err);
									});
							});

							it('入库成功', () => {
								inInvs.create
									.withArgs({
										po: purId,
										qty: qty,
										date: invDate,
										loc: loc,
										source: transNo
									})
									.resolves({
										id: inInvId
									});
								return taskExec
									.pubInInv(purId, {
										qty: qty,
										invDate: invDate,
										invLoc: loc,
										transNo: transNo
									})
									.then((result) => {
										expect(result).eqls(inInvId);
									});
							});
						});

						describe('pubOutInv', () => {
							const outInvId = 3456,
								transNo = '0001',
								partId = 45678,
								user = 'foo',
								date = new Date('2018/12/12').toJSON(),
								qty = 100,
								project = 'foo project';

							it('无出库信息', () => {
								return taskExec
									.pubOutInv(partId, {
										user: user,
										useDate: date,
										project: project,
										transNo: transNo
									})
									.then(() => {
										should.fail('Failed when we come here');
									})
									.catch((e) => {
										expect(e).eqls('outInv is not found');
									});
							});

							it('出库失败', () => {
								outInvs.create
									.withArgs({
										part: partId,
										qty: qty,
										source: transNo
									})
									.rejects(err);
								return taskExec
									.pubOutInv(partId, {
										useQty: qty,
										transNo: transNo
									})
									.then(() => {
										should.fail('Failed when we come here');
									})
									.catch((e) => {
										expect(e).eqls(err);
									});
							});

							it('出库成功', () => {
								taskExec.pubEmployee = sinon.stub();
								taskExec.pubEmployee.withArgs(user).resolves({
									id: user
								});
								outInvs.create
									.withArgs({
										part: partId,
										qty: qty,
										user: user,
										date: date,
										project: project,
										source: transNo
									})
									.resolves({
										id: outInvId
									});
								return taskExec
									.pubOutInv(partId, {
										useQty: qty,
										user: user,
										useDate: date,
										project: project,
										transNo: transNo
									})
									.then((result) => {
										expect(result).eqls(outInvId);
										expect(taskExec.pubEmployee.callCount).eqls(1);
									});
							});
						});

						describe('exec', () => {
							const taskId = 555;
							const taskData = {
								data: 'any task data'
							};
							const taskDoc = {
								id: taskId,
								task: taskData
							};
							const partId = 888,
								reviewId = 1234,
								inInvId = 2345,
								outInvId = 3456;

							beforeEach(() => {
								taskExec.pubPart = sinon.stub();
								taskExec.pubPurchase = sinon.stub();
								taskExec.pubReview = sinon.stub();
								taskExec.pubInInv = sinon.stub();
								taskExec.pubOutInv = sinon.stub();
							});

							it('无料品信息', () => {
								taskExec.pubPart.withArgs(taskData).resolves({});
								return taskExec.exec(taskDoc).then(() => {
									expect(purTransTask.updateState.callCount).eqls(0);
								});
							});

							it('发布采购单失败', () => {
								taskExec.pubPart.withArgs(taskData).resolves({
									id: partId
								});
								taskExec.pubPurchase.withArgs(partId, taskData).rejects();
								return taskExec.exec(taskDoc).then(() => {
									expect(purTransTask.updateState.callCount).eqls(0);
								});
							});

							it('采购单审批失败, 则无法入库和出库', () => {
								taskExec.pubPart.withArgs(taskData).resolves({
									id: partId
								});
								taskExec.pubPurchase.withArgs(partId, taskData).resolves(purId);
								taskExec.pubReview.withArgs(purId, taskData).rejects();
								purTransTask.updateState
									.withArgs(taskId, {
										purchase: purId
									})
									.resolves();
								return taskExec.exec(taskDoc).then(() => {
									expect(purTransTask.updateState.callCount).eqls(1);
								});
							});

							it('发布入库单失败', () => {
								taskExec.pubPart.withArgs(taskData).resolves({
									id: partId
								});
								taskExec.pubPurchase.withArgs(partId, taskData).resolves(purId);
								taskExec.pubReview.withArgs(purId, taskData).resolves(reviewId);
								taskExec.pubInInv.withArgs(purId, taskData).rejects();
								purTransTask.updateState
									.withArgs(taskId, {
										purchase: purId,
										review: reviewId
									})
									.resolves();
								return taskExec.exec(taskDoc).then(() => {
									expect(purTransTask.updateState.callCount).eqls(1);
								});
							});

							it('发布出库单失败', () => {
								taskExec.pubPart.withArgs(taskData).resolves({
									id: partId
								});
								taskExec.pubPurchase.withArgs(partId, taskData).resolves(purId);
								taskExec.pubReview.withArgs(purId, taskData).resolves(reviewId);
								taskExec.pubInInv.withArgs(purId, taskData).resolves(inInvId);
								taskExec.pubOutInv.withArgs(partId, taskData).rejects();
								purTransTask.updateState
									.withArgs(taskId, {
										purchase: purId,
										review: reviewId,
										inInv: inInvId
									})
									.resolves();
								return taskExec.exec(taskDoc).then(() => {
									expect(purTransTask.updateState.callCount).eqls(1);
								});
							});

							it('成功处理', () => {
								taskExec.pubPart.withArgs(taskData).resolves({
									id: partId
								});
								taskExec.pubPurchase.withArgs(partId, taskData).resolves(purId);
								taskExec.pubReview.withArgs(purId, taskData).resolves(reviewId);
								taskExec.pubInInv.withArgs(purId, taskData).resolves(inInvId);
								taskExec.pubOutInv.withArgs(partId, taskData).resolves(outInvId);
								purTransTask.updateState
									.withArgs(taskId, {
										purchase: purId,
										review: reviewId,
										inInv: inInvId,
										outInv: outInvId
									})
									.resolves();
								return taskExec.exec(taskDoc).then(() => {
									expect(purTransTask.updateState.callCount).eqls(1);
								});
							});
						});
					});
				});
			});
		});
	});
});