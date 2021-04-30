const dbSave = require('./dbSave'),
	{ expect } = require('chai');

describe('Cross', function () {
	var stubs, err;
	beforeEach(function () {
		stubs = {};
		err = new Error('any error message');
	});

	describe('Server', () => {
		describe('biz - 业务模块', () => {
			const ID_NOT_EXIST = '5ce79b99da3537277c3f3b66'
			let schema, testTarget, toCreate;
			let id, __v;

			beforeEach(function (done) {
				__v = 0
				return clearDB(done);
			});

			describe('bas - 基础资料', () => {
				beforeEach(() => {})

				describe('Parts - 料品', () => {
					const type = 1,
						code = 'foocode',
						brand = 'brand',
						unit = 'mm',
						tags = 'tags',
						qty = 200,
						img = 'img url',
						name = 'foo',
						spec = 'foo spec';
					let part

					beforeEach(() => {
						toCreate = { name,  brand, spec }
						schema = require('../db/schema/bas/Part')
						testTarget = require('../server/biz/bas/Parts')
					})

					describe('搜索', () => {
						it('搜索字段包括code,name,brand,spec,tags', () => {
							let objs = []
							objs.push(dbSave(schema, {code: 'fee', name: '001'}))
							objs.push(dbSave(schema, {code: 'foo', name: '002'}))
							objs.push(dbSave(schema, {name: 'foo'}))
							objs.push(dbSave(schema, {brand: 'foo', name: '003'}))
							objs.push(dbSave(schema, {tags: 'foo', name: '004'}))
							objs.push(dbSave(schema, {spec: 'foo', name: '005'}))
							return Promise.all(objs)
								.then(() => {
									return testTarget.search({}, 'oo')
								})
								.then(data => {
									expect(data.length).eqls(5)
								})
						})
					})

					describe('创建', () => {
						it('名称/品牌/规格必须唯一', () => {
							return dbSave(schema, toCreate)
								.then(() => {
									return testTarget.create(toCreate)
								})
								.should.be.rejectedWith()
						})
		
						it('创建料品', () => {
							return testTarget.create({})
								.then(doc => {
									return schema.findById(doc.id)
								})
								.then(doc => {
									doc = doc.toJSON()
									expect(doc).exist
								})
								.catch(e => {
									throw e
								})
						})
	
						it('正确创建', () => {
							return testTarget.create({type, code, brand, unit, tags, name, spec})
								.then(doc => {
									expect(doc).eql({
										id: doc.id,
										type, code, brand, unit, tags, name, spec,
										modifiedDate: doc.modifiedDate
										})
									return schema.findById(doc.id)
								})
								.then(doc => {
									doc = doc.toJSON()
									expect(doc).eql({
										id: doc.id,
										type, code, brand, unit, tags, name, spec,
										__v: 0,
										createdAt: doc.createdAt,
										modifiedDate: doc.modifiedDate
									})
								})
						})
					})

					describe('读取', () => {
						beforeEach(() => {
							return dbSave(schema, {type, code, brand, unit, tags, name, spec, qty, img})
								.then(doc => {
									part = doc
								})
						})
	
						it('正确读取', () => {
							return testTarget.findById(part.id)
								.then(doc => {
									expect(doc).eql({
										id: part.id,
										type, code, brand, unit, tags, name, spec, qty, img,
										__v: part.__v,
										createdAt: part.createdAt,
										modifiedDate: part.modifiedDate
									})
								})
						})
					})

					describe('更新', () => {
						it('除img, qty字段，其余所有字段均可更新', () => {				
							return dbSave(schema, {})
								.then(doc => {
									part = doc
									const {id, __v} = doc
									return testTarget.update({id, __v, type, code, brand, unit, tags, name, spec, qty, img})
								})
								.then(() => {
									return schema.findById(part.id)
								})
								.then((doc) => {
									doc = doc.toJSON()
									expect(doc.modifiedDate).not.eql(part.modifiedDate)
									expect(doc).eql({
										id: part.id, 
										type, code, brand, unit, tags, name, spec, 
										__v: 1,
										createdAt: part.createdAt,
										modifiedDate: doc.modifiedDate
									})
								})
						})
					})

					describe("更新料品库存量", () => {
						const invQty = -100

						it('指定料品不存在', () => {
							return testTarget.updateInvQty(ID_NOT_EXIST, invQty)
								.should.be.rejectedWith()
						})

						it('库存量开账', () => {
							return dbSave(schema, toCreate)
								.then(data => {
									id = data.id
									return testTarget.updateInvQty(id, invQty)
								})
								.then(() => {
									return schema.findById(id)
								})
								.then((data) => {
									expect(data.qty).eql(invQty)
									expect(data.__v).eql(1)
								})
						})

						it('持续更新库存量', () => {
							return dbSave(schema, {
									...toCreate,
									qty
								})
								.then(data => {
									id = data.id
									expect(data.qty).eql(qty)
									return testTarget.updateInvQty(id, invQty)
								})
								.then(() => {
									return schema.findById(id)
								})
								.then((data) => {
									expect(data.qty).eql(invQty + qty)
									expect(data.__v).eql(1)
								})
						})
					})

				})

				describe('Suppliers - 供应商', () => {
					const name = 'foo',
						type = 2,
						code = 'code',
						address = 'addr',
						account = 'acc',
						link = 'link',
						tags = 'tags'

					beforeEach(() => {
						toCreate = {
							name
						};
						schema = require('../db/schema/bas/Supplier');
						testTarget = require('../server/biz/bas/Suppliers');
					});

					describe('搜索', () => {
						it('搜索字段包括code,name,address,tags', () => {
							let objs = []
							objs.push(dbSave(schema, {code: 'fee', name: '001'}))
							objs.push(dbSave(schema, {code: 'foo', name: '002'}))
							objs.push(dbSave(schema, {code: 'fuu', name: 'foo'}))
							objs.push(dbSave(schema, {address: 'foo', code: 'fff', name: '003'}))
							objs.push(dbSave(schema, {tags: 'foo', code: 'eee', name: '004'}))
							return Promise.all(objs)
								.then(() => {
									return testTarget.search({}, 'oo')
								})
								.then(data => {
									expect(data.length).eqls(4)
								})
								.catch(e => {
									throw e
								})
						})
					})

					describe('创建', () => {
						it('名称必须唯一', () => {
							return dbSave(schema, toCreate)
								.then(() => {
									return testTarget.create(toCreate)
								})
								.should.be.rejectedWith()
						})

						it('编号必须唯一', () => {
							return dbSave(schema, {code})
								.then(() => {
									return testTarget.create({code})
								})
								.should.be.rejectedWith()
						})
		
						it('创建供应商', () => {
							return testTarget.create({})
								.then(doc => {
									return schema.findById(doc.id)
								})
								.then(doc => {
									doc = doc.toJSON()
									expect(doc).exist
								})
								.catch(e => {
									throw e
								})
						})
	
						it('正确创建, contacts暂时不用', () => {
							return testTarget.create({name, type, code, address, account, link, tags})
								.then(doc => {
									expect(doc).eql({
										id: doc.id,
										name, type, code, address, account, link, tags,
										modifiedDate: doc.modifiedDate
										})
									return schema.findById(doc.id, {contacts: 0})
								})
								.then(doc => {
									doc = doc.toJSON()
									expect(doc).eql({
										id: doc.id,
										name, type, code, address, account, link, tags,
										__v: 0,
										createdAt: doc.createdAt,
										modifiedDate: doc.modifiedDate
									})
								})
						})
					})
				})

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
									expect(doc.pic).not.exist;
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

			describe('Purchase', () => {
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

				let transaction

				beforeEach(() => {
					toCreate = {code,  part,  supplier,  qty,  amount,  price,  refNo, remark, applier}
					schema = require('../db/schema/pur/Purchase');
					testTarget = require('../server/biz/pur/Purchases');
				});

				describe('创建', () => {
					it('part必须存在', () => {
						return testTarget.create({qty, amount})
							.should.be.rejectedWith()
					})

					it('qty必须存在', () => {
						return testTarget.create({part, amount})
							.should.be.rejectedWith()
					})

					it('amount必须存在', () => {
						return testTarget.create({part, qty})
							.should.be.rejectedWith()
					})

					it('创建时状态只能是Draft', () => {
						return testTarget.create({ part,  qty,  amount,  state: 'Open'})
							.should.be.rejectedWith('the state of a new purchase must be Draft')
					})

					it('缺省创建', () => {
						return testTarget.create({part,  qty,  amount})
							.then(doc => {
								expect(doc).eql({id: doc.id, part,  qty,  amount,
									 state: 'Draft', modifiedDate: doc.modifiedDate})
								return schema.findById(doc.id, {transactions: 0})
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc).eql({
									id: doc.id,
									part,  qty,  amount, 
									state: 'Draft',
									__v: 0,
									createdAt: doc.createdAt,
									modifiedDate: doc.modifiedDate
								})
							})
							.catch(e => {
								throw e
							})
					})

					it('正确创建', () => {
						return testTarget.create(toCreate)
							.then(doc => {
								expect(doc).eql({
									id: doc.id,
									code,  part,  supplier,  qty,  amount,  price,  refNo, remark, applier,
									state: 'Draft',
									modifiedDate: doc.modifiedDate
									})
								return schema.findById(doc.id, {transactions: 0})
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc).eql({
									id: doc.id,
									code,  part,  supplier,  qty,  amount,  price,  refNo, remark, applier,
									state: 'Draft',
									__v: 0,
									createdAt: doc.createdAt,
									modifiedDate: doc.modifiedDate
								})
							})
					})
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
									part,
									qty,
									amount,
									left,
									state: 'Review',
									applier,
									appDate,
									reviewer,
									reviewDate,
									creator,
									createDate
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
									refNo,
									remark
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
								expect(data).undefined
							})
					})

					it('not exist', () => {
						return testTarget.commit(ID_NOT_EXIST, {
								__v,
								actor: applier
							})
							.then((data) => {
								expect(data).undefined
							})
					})

					it('版本不一致', () => {
						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
								__v = doc.__v + 1
								return testTarget.commit(id, {
									__v,
									actor: applier
								});
							})
							.then((data) => {
								expect(data).undefined
							})
					})

					it('状态必须处于Draft或Unapproved', () => {
						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
								return schema.findById(id)
							})
							.then((doc) => {
								doc.state = 'Open'
								return doc.save()
							})
							.then((doc) => {
								id = doc.id
								__v = doc.__v
								return testTarget.commit(id, {
									__v,
									actor: applier
								});
							})
							.then((data) => {
								expect(data).undefined
							})
					})

					it('可缺省申请日期', () => {
						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
								__v = doc.__v
								return testTarget.commit(id, {
									__v,
									actor: applier
								});
							})
							.then(doc => {
								transaction = doc
								expect(transaction.type).eql('commit')
								expect(transaction.actor).eql(applier)
								expect(transaction.date).exist
								return schema.findById(id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.__v).eql(__v + 1)
								expect(doc.state).eql('Review')
								expect(doc.applier).eql(applier)
								expect(doc.appDate).eql(transaction.date)
							})
					})

					it('指定申请日期', () => {
						appDate = new Date()
						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
								__v = doc.__v
								return testTarget.commit(id, {
									__v,
									actor: applier,
									date: appDate
								});
							})
							.then(doc => {
								transaction = doc
								expect(transaction.type).eql('commit')
								expect(transaction.actor).eql(applier)
								expect(transaction.date).eql(appDate.toJSON())
								return schema.findById(id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.__v).eql(__v + 1)
								expect(doc.state).eql('Review')
								expect(doc.applier).eql(applier)
								expect(doc.appDate).eql(transaction.date)
							})
					})
				})

				describe('review', () => {
					const type = 'review'
					const reviewer = applier;

					beforeEach(() => {
						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
								return schema.findById(id)
							})
							.then((doc) => {
								doc.state = 'Review'
								return doc.save()
							})
							.then((doc) => {
								expect(doc.state).eql('Review')
								id = doc.id
								__v = doc.__v
							})
					})

					it('not exist', () => {
						return testTarget.review(ID_NOT_EXIST, {
								__v,
								actor: reviewer
							})
							.then((data) => {
								expect(data).undefined
							})
					})

					it('版本不一致', () => {
						__v = __v + 1
						return testTarget.review(id, {
								__v,
								actor: reviewer
							})
							.then((data) => {
								expect(data).undefined
							})
					})

					it('必须处于Review状态', () => {
						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
								__v = doc.__v
								return testTarget.review(id, {
									__v,
									actor: reviewer
								});
							})
							.then((data) => {
								expect(data).undefined
							})
					})

					it('必须指定审批人', () => {
						return testTarget.review(id, {
								__v
							})
							.then((data) => {
								expect(data).undefined
							})
					})

					it('可缺省审批日期', () => {
						return testTarget.review(id, {
								__v,
								actor: reviewer
							})
							.then(doc => {
								transaction = doc
								expect(transaction.parent).eql(id)
								expect(transaction.type).eql('review')
								expect(transaction.data).eql({
									pass: false
								})
								expect(transaction.actor).eql(reviewer)
								expect(transaction.date).exist
								return schema.findById(id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.__v).eql(__v + 1)
								expect(doc.state).eql('Unapproved')
								expect(doc.reviewer).eql(reviewer)
								expect(doc.reviewDate).eql(transaction.date)
							})
					})

					it('指定审批日期', () => {
						const reviewDate = new Date()
						return testTarget.review(id, {
								__v,
								actor: reviewer,
								date: reviewDate
							})
							.then(doc => {
								transaction = doc
								expect(transaction.parent).eql(id)
								expect(transaction.type).eql('review')
								expect(transaction.data).eql({
									pass: false
								})
								expect(transaction.actor).eql(reviewer)
								expect(transaction.date).eql(reviewDate.toJSON())
								return schema.findById(id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.__v).eql(__v + 1)
								expect(doc.state).eql('Unapproved')
								expect(doc.reviewer).eql(reviewer)
								expect(doc.reviewDate).eql(transaction.date)
							})
					})

					it('审批通过', () => {
						const reviewDate = new Date()
						return testTarget.review(id, {
								__v,
								actor: reviewer,
								date: reviewDate,
								pass: true,
								remark
							})
							.then(doc => {
								transaction = doc
								expect(transaction.parent).eql(id)
								expect(transaction.type).eql('review')
								expect(transaction.data).eql({
									pass: true
								})
								expect(transaction.actor).eql(reviewer)
								expect(transaction.date).eql(reviewDate.toJSON())
								expect(transaction.remark).eql(remark)
								return schema.findById(id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.__v).eql(__v + 1)
								expect(doc.state).eql('Open')
								expect(doc.reviewer).eql(reviewer)
								expect(doc.reviewDate).eql(transaction.date)
							})
					})
				})

				describe('消费采购入库消息', () => {
					const invQty = 34

					it('由id指定的采购单不存在', () => {
						return testTarget.poInInv(ID_NOT_EXIST, invQty)
							.should.be.rejectedWith()
					});

					it('更新料品库存量成功，更新采购单在单量', () => {
						return dbSave(schema, toCreate)
							.then(doc => {
								id = doc.id
								return testTarget.poInInv(id, invQty)
							})
							.then(() => {
								return schema.findById(id)
							})
							.then((doc) => {
								expect(doc.left).eql(qty - invQty)
							})
					});
				})

				describe('PO Transactions - 采购单交易', () => {
					const type = 'review',
						 	data = {podata: 'podata'},
							actor = applier,
							date = new Date()

					beforeEach(() => {
						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
							})
					})

					it('正确读取采购单交易', () => {
						let po
						return schema.findById(id)
							.then(doc => {
								doc.transactions.push({type, data, actor, date, remark})
								return doc.save()
							})
							.then(doc => {
								doc = doc.toJSON()
								po = doc
								return testTarget.findTransactionById(doc.transactions[0].id)
							})
							.then(doc => {
								expect(doc).eql({
									po: po.id,
									id: po.transactions[0].id,
									date: date.toJSON(),
									type, data, actor, remark
								})
							})
					})

					describe('列出指定PO的所有交易', () => {
						beforeEach(() => {
							return schema.findById(id)
								.then(doc => {
									doc.transactions.push({type, data, actor, date, remark})
									doc.transactions.push({type, data, actor, date, remark})
									return doc.save()
								})
						})
	
						it('指定PO不存在', () => {
							return testTarget.listTransactions(ID_NOT_EXIST)
								.then((docs) => {
									expect(docs.length).eql(0)
								})
						})

						it('正确列出', () => {
							return testTarget.listTransactions(id)
								.then(docs => {
									expect(docs.length).eql(2)
									expect(docs[0]).eql({
										id: docs[0].id,
										date: date.toJSON(),
										type, data, actor, remark
									})
								})
						})
					})
				})
			})

			describe('InInvs - 到货入库', () => {
				const type = 'inv',
					invDate = new Date(),
					invQty = 34,
					refNo = 'ref001',
					loc = 'the loc',
					part = '5c349d1a6cf8de3cd4a5bc2c',
					qty = 100,
					amount = 2345.56,
					applier = '6c349d1a6cf8de3cd4a5bccc',
					remark = 'remark'

				let inv, publishSpy

				beforeEach(() => {
					publishSpy = sinon.spy()
					schema = require('../db/schema/pur/Purchase')
					testTarget = require('../server/biz/inv/POInInvs')(publishSpy)
					toCreate = {part, qty, amount}
					inv = {
						qty: invQty,
						refNo,
						loc
					}
					return dbSave(schema, toCreate)
						.then((doc) => {
							id = doc.id
							return schema.findById(id)
						})
						.then((doc) => {
							doc.state = 'Open'
							return doc.save()
						})
						.then((doc) => {
							expect(doc.state).eql('Open')
							__v = doc.__v
						})
				})

				it('由id指定的采购单必须存在', () => {
					return testTarget(ID_NOT_EXIST, {
							__v,
							actor: applier,
							date: invDate,
							data: inv
						})
						.should.be.rejectedWith()
				});

				it('版本不一致', () => {
					__v = __v + 1
					return testTarget(id, {
							__v,
							actor: applier,
							date: invDate,
							data: inv
						})
						.should.be.rejectedWith()
				});

				it('必须处于Open状态', () => {
					return dbSave(schema, toCreate)
						.then((doc) => {
							id = doc.id
							__v = doc.__v
							return testTarget(id, {
								__v,
								actor: applier,
								date: invDate,
								data: inv
							});
						})
						.should.be.rejectedWith()
				});

				it('未指定入库交易者', () => {
					return testTarget(id, {
							__v,
							date: invDate,
							data: inv
						})
						.should.be.rejectedWith()
				});

				it('必须给出入库数量, 且不能为0', () => {
					inv.qty = 0
					return testTarget(id, {
							__v,
							actor: applier,
							date: invDate,
							data: inv
						})
						.should.be.rejectedWith()
				});

				it('必须给出入库数量, 且不能为字符串0', () => {
					inv.qty = '0'
					return testTarget(id, {
							__v,
							actor: applier,
							date: invDate,
							data: inv
						})
						.should.be.rejectedWith()
				});

				it('指定入库交易日期', () => {
					return testTarget(id, {
							__v,
							actor: applier,
							date: invDate,
							data: inv,
							remark
						})
						.then(doc => {
							expect(publishSpy).calledWith(doc).calledOnce
							expect(doc.po).eql(id)
							expect(doc.part).eql(part)
							expect(doc.type).eql(type)
							expect(doc.data).eql(inv)
							expect(doc.actor).eql(applier)
							expect(doc.remark).eql(remark)
							expect(doc.date).eql(invDate.toJSON())
							return schema.findById(id)
						})
						.then(doc => {
							doc = doc.toJSON()
							expect(doc.__v).eql(__v + 1)
							expect(doc.state).eql('Open')
							expect(doc.left).undefined
						})
				});

				it('可缺省入库交易日期', () => {
					return testTarget(id, {
							__v,
							actor: applier,
							data: inv,
							remark
						})
						.then(doc => {
							expect(publishSpy).calledWith(doc).calledOnce
							expect(doc.po).eql(id)
							expect(doc.part).eql(part)
							expect(doc.type).eql(type)
							expect(doc.data).eql(inv)
							expect(doc.actor).eql(applier)
							expect(doc.remark).eql(remark)
							expect(doc.date).exist
							return schema.findById(id)
						})
						.then(doc => {
							doc = doc.toJSON()
							expect(doc.__v).eql(__v + 1)
							expect(doc.state).eql('Open')
							expect(doc.left).undefined
						})
				})
			})

			describe('Withdraw - 领料', () => {
				const code = '12345',
					part = '5c349d1a6cf8de3cd4a5bc2c',
					qty = '200',
					actor = '6c349d1addd8de3cd4a5bc2c',
					date = new Date(),
					remark = 'sth remark'
				let publishSpy;

				beforeEach(() => {
					publishSpy = sinon.spy()
					toCreate = {
						code,
						part,
						qty,
						actor,
						date,
						remark
					}
					schema = require('../db/schema/inv/Withdraw');
					testTarget = require('../server/biz/inv/Withdraws')(publishSpy);
				});

				it('必须给出单号', () => {
					delete toCreate.code
					return testTarget.create(toCreate)
						.should.be.rejectedWith()
				})

				it('单号不可重复', () => {
					return dbSave(schema, toCreate)
						.then(() => {
							return testTarget.create(toCreate)
						})
						.should.be.rejectedWith()
				})

				it('必须指定料品', () => {
					delete toCreate.part
					return testTarget.create(toCreate)
						.should.be.rejectedWith()
				})

				it('必须给领用数量', () => {
					delete toCreate.qty
					return testTarget.create(toCreate)
						.should.be.rejectedWith()
				})

				it('领用数量必须为数字，且不为0', () => {
					toCreate.qty = '0'
					return testTarget.create(toCreate)
						.should.be.rejectedWith()
				})

				it('必须指定领用人', () => {
					delete toCreate.actor
					return testTarget.create(toCreate)
						.should.be.rejectedWith()
				})

				it('必须指定领用日期', () => {
					delete toCreate.date
					return testTarget.create(toCreate)
						.should.be.rejectedWith()
				})

				it('成功', () => {
					return testTarget.create(toCreate)
						.then((doc) => {
							expect(publishSpy).calledWith(doc).calledOnce
							expect(doc.qty).eql(qty * 1)
						})
				})
			})

			describe('Rockstar程序管理', () => {
				const name = 'foo',
					desc = 'desc',
					code = 'code',
					prog = 'prog',
					tags = 'tags'
				
				describe('更新Rockstar程序', () => {
					it('更新成功', () => {
						schema = require('../db/schema/Program')
						testTarget = require('../server/biz/rockstar/Program')
						let updated

						return dbSave(schema, {name, prog: 'foo prog', tags})
							.then(data => {
								id = data.id
								return testTarget.update({id, name: 'fee', desc, code, prog, tags: ''})
							})
							.then((data) => {
								updated = data
								return schema.findById(id)
							})
							.then((data) => {
								data = data.toJSON()
								expect(data).eql(updated)
								expect(data.tags).undefined
							})
						
					})
				})
			
				
			})

			describe('Process - Rockstar处理过程', () => {
				const prog = 'any rockstar program text',
					name = 'foo program';
				let progId, publishSpy;

				beforeEach(() => {
					publishSpy = sinon.spy()
					schema = require('../db/schema/Program');
					testTarget = require('../server/biz/rockstar/Process')(publishSpy);
					return dbSave(schema, {name, prog})
						.then(data => {
							progId = data.id
						})
				});

				describe('runProcess - 运行Rockstar程序', () => {
					it('指定程序不存在', () => {
						return testTarget.runProcess(ID_NOT_EXIST)
							.should.be.rejectedWith()
					})

					it('正确运行', () => {
						return testTarget.runProcess(progId)
							.then((data) => {
								expect(data).eql({id: data.id, prog: progId})
								expect(publishSpy).calledWith({procId: data.id, prog}).calledOnce
								return schema.findById(data.prog)
							})
							.then((data) => {
								const proc = data.processes[0].toJSON()
								expect(proc).eql({
									id: proc.id,
									date: proc.date,
									logs: [],
									state: 'open'
								})
							})
					})
				})

				describe('process - Rockstar程序处理', () => {
					const date1 = new Date('1995-12-19'),
						date2 = new Date('1995-12-18')
					let procId

					beforeEach(() => {
						return schema.findById(progId)
							.then(doc => {
								doc.processes.push({date: date1})
								doc.processes.push({date: date2})
								return doc.save()
							})
							.then(doc => {
								procId = doc.processes[0].toJSON().id
							})
					});

					describe('列出指定Rockstar程序的所有处理过程', () => {
						it('指定程序不存在', () => {
							return testTarget.listProcessesByProgram(ID_NOT_EXIST)
								.then(docs => {
									expect(docs).eql([])
								})
						})

						it('正确列出', () => {
							return testTarget.listProcessesByProgram(progId)
								.then(docs => {
									expect(docs.length).eql(2)
									expect(docs[0].date).eql(date2.toJSON())
									expect(docs[1].date).eql(date1.toJSON())
								})
						})
					})

					describe('加载指定Rockstar程序处理过程', () => {
						it('指定过程不存在', () => {
							return testTarget.findProcessById(ID_NOT_EXIST)
								.then(data => {
									expect(data).undefined
								})
						})

						it('正确', () => {
							return testTarget.findProcessById(procId)
								.then(data => {
									expect(data).eql({
										id: procId,
										prog: progId,
										date: date1.toJSON(),
										logs: [],
										state: 'open'
									})
								})
						})
					})
					

					describe('记录运行日志', () => {
						const start = new Date(),
							log = 'any log'
						it('指定处理不存在', () => {
							return testTarget.log({procId: ID_NOT_EXIST, start, log})
								.then((data) => {
									expect(data).undefined
								})
						})
	
						it('记录运行中日志', () => {
							return testTarget.log({procId, start, log})
								.then((data) => {
									data = data.toJSON()
									expect(data.id).eql(progId)
									const proc = data.processes[0]
									expect(proc.id).eql(procId)
									expect(proc.state).eql('running')
									expect(proc.logs).eql([{id: proc.logs[0].id, start: start.toJSON(), message: log}])
								})
						})
	
						it('记录运行日志中止', () => {
							return testTarget.log({procId, start})
								.then((data) => {
									data = data.toJSON()
									expect(data.id).eql(progId)
									const proc = data.processes[0]
									expect(proc.id).eql(procId)
									expect(proc.state).eql('over')
									expect(proc.logs).eql([{id: proc.logs[0].id, start: start.toJSON(), message: 'Over !'}])
								})
						})
					})
				})
			})
		});
	});
});