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
			const ID_NOT_EXIST = '5ce79b99da3537277c3f3b66'
			let schema, testTarget, toCreate;
			let id, __v;

			beforeEach(function (done) {
				__v = 0
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
							expect({
								name: doc.name,
								spec: doc.spec
							}).eqls(data)
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
				let dbSaveStub;
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
							.createNotExist({})
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
								return testTarget.createNotExist(toCreate);
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
								code: '01',
								name: '弹簧垫片螺母'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								code: '02',
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
								code: '03',
								name: 'fee2',
								spec: 'spec2'
							}))
							return Promise.all(saveParts)
								.then(() => {
									return testTarget.search({
										type: 1
									}, '垫片')
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
								code: '01',
								name: 'fEe',
								spec: '齿轮油'
							}))
							return Promise.all(saveParts)
								.then(() => {
									return testTarget.search({
										type: 1
									}, 'Fee')
								})
								.then(data => {
									expect(data.length).eqls(1)
								})
						})

						it('可以使用通配符‘.’匹配一个字', () => {
							let saveParts = []
							saveParts.push(dbSave(schema, {
								type: 1,
								code: '01',
								name: '弹簧垫片螺母'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								code: '02',
								name: '弹螺母垫片螺'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								code: '03',
								name: 'fEe',
								spec: '齿轮油'
							}))
							return Promise.all(saveParts)
								.then(() => {
									return testTarget.search({
										type: 1
									}, '弹.垫')
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
									return testTarget.search({
										type: 1
									}, '弹*垫')
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

					describe('update', () => {
						beforeEach(() => {
							testTarget = require('../server/biz/bas/Parts');
						})

						it('成功', () => {
							let version
							return dbSave(schema, toCreate)
								.then((doc) => {
									version = doc.__v
									return testTarget.update({
										id: doc.id,
										__v: version,
										type: 1,
										code: '23456',
										name: 'foo1',
										spec: 'spec',
										unit: 'm',
										img: 'img'
									});
								})
								.then((doc) => {
									expect(doc.__v > version).true
								});
						});
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
							.createNotExist({})
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
								return testTarget.createNotExist(toCreate);
							})
							.then((doc) => {
								doc = {
									...doc,
									modifiedDate: existed.modifiedDate
								}
								expect(doc).eqls(existed); // 仅仅只有modifiedDate值发了变化
							});
					});

					it('搜索字段包括name, code', () => {
						let saves = []
						saves.push(dbSave(schema, {
							type: 1,
							name: '弹簧垫片螺母'
						}))
						saves.push(dbSave(schema, {
							type: 1,
							name: 'fee'
						}))
						saves.push(dbSave(schema, {
							type: 1,
							code: '弹簧垫片螺母',
							name: 'fee1'
						}))
						saves.push(dbSave(schema, {
							type: 1,
							name: 'fee2'
						}))
						return Promise.all(saves)
							.then(() => {
								return testTarget.search({
									type: 1
								}, '垫片')
							})
							.then(data => {
								expect(data.length).eqls(2)
							})
					})

				});

				describe('Employee - 员工', () => {
					const userId = 'foo',
						name = 'foo name',
						password = '999',
						email = 'email',
						pic = 'pic',
						isAdmin = true,
						roles = 'roles'

					beforeEach(() => {
						schema = require('../db/schema/bas/Employee');
						testTarget = require('../server/biz/bas/Employee');
					});

					describe('create', () => {
						beforeEach(() => {
							toCreate = {
								name
							};
						});

						it('name is required', () => {
							return testTarget
								.create({})
								.then(() => {
									should.fail();
								})
								.catch((e) => {
									expect(e.name).eqls('ValidationError');
								});
						});

						it('name should be unique', () => {
							return dbSave(schema, toCreate)
								.then(() => {
									return testTarget.create(toCreate);
								})
								.then(() => {
									should.fail();
								})
								.catch((e) => {
									expect(e.name).eqls('MongoError');
								});
						});

						it('userId should be unique', () => {
							return dbSave(schema, toCreate)
								.then(() => {
									return testTarget.create({
										name: 'anotherName'
									});
								})
								.then(() => {
									should.fail();
								})
								.catch((e) => {
									expect(e.name).eqls('MongoError');
								});
						});

						it('成功创建', () => {
							return testTarget
								.create(toCreate)
								.then((doc) => {
									expect(doc.name).eql(name)
								})
						});
					})


					describe('Auth', () => {
						const userId = 'foo',
							name = 'foo name',
							password = '999',
							email = 'email',
							pic = 'pic',
							isAdmin = true,
							roles = 'roles'
						let id, employee

						beforeEach(() => {
							employee = {
								inUse: true,
								userId,
								password,
								name,
								isAdmin,
								roles,
								email,
								pic,
							}
						})

						it('非授权用户', () => {
							employee.inUse = false
							return dbSave(schema, employee)
								.then((doc) => {
									id = doc.id
									return testTarget.authenticate(userId, password)
								})
								.then(doc => {
									expect(doc).undefined
								})
						})

						it('用户账号不符', () => {
							return dbSave(schema, employee)
								.then((doc) => {
									id = doc.id
									return testTarget.authenticate('fee', password)
								})
								.then(doc => {
									expect(doc).undefined
								})
						})

						it('密码不符', () => {
							return dbSave(schema, employee)
								.then((doc) => {
									id = doc.id
									return testTarget.authenticate(userId, 'aa')
								})
								.then(doc => {
									expect(doc).undefined
								})
						})

						it('使用userId和password认证', () => {
							return dbSave(schema, employee)
								.then((doc) => {
									id = doc.id
									return testTarget.authenticate(userId, password)
								})
								.then(doc => {
									expect(doc).eql({
										id,
										userId,
										name,
										email,
										pic,
										isAdmin,
										roles
									})
								})
						})
					})

					describe('update', () => {
						it('成功', () => {
							return dbSave(schema, {
									name
								})
								.then((doc) => {
									id = doc.id
									__v = doc.__v
									return testTarget.update({
										id,
										__v,
										userId,
										name: 'foo1',
										email,
										pic
									});
								})
								.then((doc) => {
									expect(doc.userId).eqls(userId);
									expect(doc.name).eqls('foo1');
									expect(doc.email).eqls(email);
									expect(doc.pic).eqls(pic);
									expect(doc.__v > __v).true
								});
						});

						it('不可直接更新的字段', () => {
							return dbSave(schema, {
									name
								})
								.then((doc) => {
									id = doc.id
									__v = doc.__v
									return testTarget.update({
										id,
										__v,
										name,
										password,
										inUse: true,
										isAdmin,
										roles
									});
								})
								.then((doc) => {
									expect(doc.password).undefined;
									expect(doc.inUse).undefined;
									expect(doc.isAdmin).undefined;
									expect(doc.roles).undefined;
									expect(doc.__v > __v).true
								})

						})
					})

					describe('授权', () => {
						it('id type error', () => {
							return testTarget.authorize('notexist', {
									__v
								})
								.then((data) => {
									expect(data).false
								})
						});

						it('not exist', () => {
							return testTarget.authorize(ID_NOT_EXIST, {
									__v
								})
								.then((data) => {
									expect(!data).true
								})
						});

						it('版本不一致', () => {
							return dbSave(schema, {
									name
								})
								.then((doc) => {
									id = doc.id
									__v = doc.__v + 1
									return testTarget.authorize(id, {
										__v
									});
								})
								.then((data) => {
									expect(!data).true
								})
						});

						it('授权为系统管理员', () => {
							return dbSave(schema, {
									name
								})
								.then((doc) => {
									id = doc.id
									__v = doc.__v
									return testTarget.authorize(id, {
										__v,
										isAdmin: true
									});
								})
								.then((doc) => {
									expect(doc.inUse).true
									expect(doc.isAdmin).true
									expect(doc.roles).undefined
									expect(doc.__v).eql(__v + 1)
								})
						});

						it('授权为角色用户', () => {
							return dbSave(schema, {
									name
								})
								.then((doc) => {
									id = doc.id
									__v = doc.__v
									return testTarget.authorize(id, {
										__v,
										roles
									});
								})
								.then((doc) => {
									expect(doc.inUse).true
									expect(doc.isAdmin).undefined
									expect(doc.roles).eql(roles)
									expect(doc.__v).eql(__v + 1)
								})
						});

						it('收回授权', () => {
							return dbSave(schema, {
									name,
									inUse: true,
									isAdmin: true,
									roles
								})
								.then((doc) => {
									id = doc.id
									__v = doc.__v
									return testTarget.authorize(id, {
										__v
									});
								})
								.then((doc) => {
									expect(doc.inUse).undefined
									expect(doc.isAdmin).undefined
									expect(doc.roles).undefined
									expect(doc.__v).eql(__v + 1)
								})
						});

					})

					describe('修改密码', () => {
						it('not exist', () => {
							return testTarget.updatePassword(ID_NOT_EXIST, {
									oldPassword: '123',
									password: 'new 1234'
								})
								.then((data) => {
									expect(data).false
								})
						})

						it('旧密码不匹配', () => {
							return dbSave(schema, {
									name,
									password
								})
								.then((doc) => {
									id = doc.id
									__v = doc.__v
									return testTarget.updatePassword(id, {
										oldPassword: '123',
										password: 'new 1234'
									})
								})
								.then((data) => {
									expect(data).false
									return schema.findById(id)
								})
								.then((doc) => {
									expect(doc.password).eql(password);
									expect(doc.__v).eql(__v);
								})

						})

						it('成功', () => {
							return dbSave(schema, {
									name,
									password
								})
								.then((doc) => {
									id = doc.id
									__v = doc.__v
									return testTarget.updatePassword(id, {
										oldPassword: password,
										password: 'new 1234'
									})
								})
								.then((data) => {
									expect(data).true
									return schema.findById(id)
								})
								.then((doc) => {
									expect(doc.password).eql('new 1234');
									expect(doc.__v).eql(__v);
								})

						})

					})
				});
			});

			describe('pur - 采购', () => {
				let dbSaveStub;
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
					describe('Source Purchase', () => {
						beforeEach(() => {
							testTarget = proxyquire('../server/biz/pur/Purchases', stubs);
						})
	
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
	
						it('按料品搜索采购单', () => {
							return dbSave(schema, poData)
								.then((doc) => {
									existed = doc;
									return testTarget.search({
										part: partId
									}, '')
								})
								.then((docs) => {
									expect(docs.length).eqls(1);
								});
						})
	
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
									})
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
					})

					describe('Purchase entity', () => {
						const code = 'test-po-001',
							part = '5c349d1a6cf8de3cd4a5bc2c',
							supplier = '5c349d1a6cf8de3cd4a5bc3c',
							qty = 100,
							amount = 2345.56,
							price = 23,
							refNo = 'ref-po-001',
							state = 'Draft',
							remark = 'remark',
							applier = '6c349d1a6cf8de3cd4a5bccc'

						beforeEach(() => {
							toCreate = {part, qty, amount}
							testTarget = require('../server/biz/pur/Purchases');
						});

						describe('create', () => {
							beforeEach(() => {
								toCreate = {code, part, supplier, qty, price, amount, refNo, applier, remark}
							});
	
							it('part is required', () => {
								return testTarget.create({qty, amount})
									.then(() => {
										should.fail();
									})
									.catch((e) => {
										expect(e.name).eqls('ValidationError');
									}); 
							});

							it('qty is required', () => {
								return testTarget.create({part, amount})
									.then(() => {
										should.fail();
									})
									.catch((e) => {
										expect(e.name).eqls('ValidationError');
									}); 
							});		
	
							it('amount is required', () => {
								return testTarget.create({part, qty})
									.then(() => {
										should.fail();
									})
									.catch((e) => {
										expect(e.name).eqls('ValidationError');
									}); 
							});	
							

							it('创建时状态只能是Draft', () => {
								toCreate = {part, qty, amount, state: 'Opened' }
								return testTarget
									.create(toCreate)
									.then(() => {
										should.fail();
									})
									.catch((e) => {
										expect(e.message).eql('the state of a new purchase must be Draft')
									}); 
							});

							it('成功创建', () => {
								return testTarget
									.create(toCreate)
									.then((doc) => {
										expect(doc.code).eql(code)
										expect(doc.part).eql(part)
										expect(doc.supplier).eql(supplier)
										expect(doc.qty).eql(qty)
										expect(doc.price).eql(price)
										expect(doc.amount).eql(amount)
										expect(doc.state).eql('Draft')
										expect(doc.refNo).eql(refNo)
										expect(doc.remark).eql(remark)
										expect(doc.createdAt).exist
										expect(doc.modifiedDate).exist
										expect(doc.__v).eql(0)
									})
							});
						})

						describe('update', () => {
							it('不可直接更新的字段', () => {
								const left = amount,
								appDate = new Date(),
								reviewer = applier,
								reviewDate = appDate, 
								creator = applier,
								createDate = appDate

								return dbSave(schema, toCreate)
									.then((doc) => {
										id = doc.id
										__v = doc.__v
										return testTarget.update({
											id,
											__v,
											part, qty, amount,
											left, state: 'Review', 
											applier, appDate, reviewer, reviewDate, creator, createDate
										});
									})
									.then((doc) => {
										expect(doc.part).eql(part)
										expect(doc.qty).eql(qty)
										expect(doc.amount).eql(amount)
										expect(doc.state).eql('Draft')
										expect(doc.__v).eql(1)
									})
	
							})

							it('成功', () => {
								return dbSave(schema, toCreate)
									.then((doc) => {
										id = doc.id
										__v = doc.__v
										return testTarget.update({
											id,
											__v,
											code,
											part: applier,
											supplier, 
											qty: qty + 1,
											price,
											amount: amount + 1,
											refNo, remark
										});
									})
									.then((doc) => {
										expect(doc.code).eql(code)
										expect(doc.part).eql(applier)
										expect(doc.supplier).eql(supplier)
										expect(doc.qty).eql(qty + 1)
										expect(doc.price).eql(price)
										expect(doc.amount).eql(amount + 1) 
										expect(doc.state).eql('Draft')
										expect(doc.refNo).eql(refNo)
										expect(doc.remark).eql(remark)
										expect(doc.__v).eql(1)
									})
							});
						})

						describe('commit', () => {
							it('id type error', () => {
								return testTarget.commit('notexist', {
										__v, applier
									})
									.then((data) => {
										expect(data).false
									})
							});
	
							it('not exist', () => {
								return testTarget.commit(ID_NOT_EXIST, {
										__v, applier
									})
									.then((data) => {
										expect(data).false
									})
							});
	
							it('版本不一致', () => {
								return dbSave(schema, toCreate)
									.then((doc) => {
										id = doc.id
										__v = doc.__v + 1
										return testTarget.commit(id, {
											__v, applier
										});
									})
									.then((data) => {
										expect(data).false
									})
							});

							it('无申请人', () => {
								return dbSave(schema, toCreate)
									.then((doc) => {
										id = doc.id
										__v = doc.__v
										return testTarget.commit(id, {
											__v
										});
									})
									.then((data) => {
										expect(data).false
									})
							});

							it('可缺省申请日期', () => {
								return dbSave(schema, toCreate)
									.then((doc) => {
										id = doc.id
										__v = doc.__v
										return testTarget.commit(id, {
											__v, applier
										});
									})
									.then((data) => {
										expect(data).true
										return schema.findById(id)
									})
									.then(doc=> {
										doc = doc.toJSON()
										expect(doc.__v).eql(__v + 1)
										expect(doc.state).eql('Reviewing')
										expect(doc.applier).eql(applier)
										expect(doc.appDate).exist
										expect(doc.events[0]).eql({})
									})
							});

							it('指定申请日期', () => {
								appDate = new Date()
								return dbSave(schema, toCreate)
									.then((doc) => {
										id = doc.id
										__v = doc.__v
										return testTarget.commit(id, {
											__v, applier, appDate
										});
									})
									.then((data) => {
										expect(data).true
										return schema.findById(id)
									})
									.then(doc=> {
										doc = doc.toJSON()
										expect(doc.__v).eql(__v + 1)
										expect(doc.state).eql('Reviewing')
										expect(doc.applier).eql(applier)
										expect(doc.appDate).eql(appDate.toJSON())
									})
							});
						})
						
						describe('review', () => {
							const reviewer = applier;
		
							it('id type error', () => {
								return testTarget.review('notexist', {
										__v, reviewer
									})
									.then((data) => {
										expect(data).false
									})
							});
	
							it('not exist', () => {
								return testTarget.review(ID_NOT_EXIST, {
										__v, reviewer
									})
									.then((data) => {
										expect(data).false
									})
							});
	
							it('版本不一致', () => {
								return dbSave(schema, toCreate)
									.then((doc) => {
										id = doc.id
										__v = doc.__v + 1
										return testTarget.review(id, {
											__v, reviewer
										});
									})
									.then((data) => {
										expect(data).false
									})
							});

							it('必须指定审批人', () => {
								return dbSave(schema, toCreate)
									.then((doc) => {
										id = doc.id
										__v = doc.__v
										return testTarget.review(id, {
											__v
										});
									})
									.then((data) => {
										expect(data).false
									})
							});
		
							it('可缺省审批日期', () => {
								return dbSave(schema, toCreate)
									.then((doc) => {
										id = doc.id
										__v = doc.__v
										return testTarget.review(id, {
											__v, reviewer
										});
									})
									.then((data) => {
										expect(data).true
										return schema.findById(id)
									})
									.then(doc=> {
										doc = doc.toJSON()
										expect(doc.__v).eql(__v + 1)
										expect(doc.state).eql('Unapproval')
										expect(doc.reviewer).eql(reviewer)
										expect(doc.reviewDate).exist
									})
							});

							it('指定审批日期', () => {
								const reviewDate = new Date() 
								return dbSave(schema, toCreate)
									.then((doc) => {
										id = doc.id
										__v = doc.__v
										return testTarget.review(id, {
											__v, reviewer, reviewDate
										});
									})
									.then((data) => {
										expect(data).true
										return schema.findById(id)
									})
									.then(doc=> {
										doc = doc.toJSON()
										expect(doc.__v).eql(__v + 1)
										expect(doc.state).eql('Unapproval')
										expect(doc.reviewer).eql(reviewer)
										expect(doc.reviewDate).eql(reviewDate.toJSON())
									})
							});

							it('审批通过', () => {
								const reviewDate = new Date() 
								return dbSave(schema, toCreate)
									.then((doc) => {
										id = doc.id
										__v = doc.__v
										return testTarget.review(id, {
											__v, reviewer, reviewDate, pass: true
										});
									})
									.then((data) => {
										expect(data).true
										return schema.findById(id)
									})
									.then(doc=> {
										doc = doc.toJSON()
										expect(doc.__v).eql(__v + 1)
										expect(doc.state).eql('Opened')
										expect(doc.reviewer).eql(reviewer)
										expect(doc.reviewDate).eql(reviewDate.toJSON())
									})
							});
						});
					})
				})
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
		});
	});
});