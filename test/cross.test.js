var proxyquire = require('proxyquire'),
	logger = require('@finelets/hyper-rest/app/Logger'),
	dbSave = require('@finelets/hyper-rest/db/mongoDb/SaveObjectToDb');

describe('Cross', function () {
	var stubs, err;
	before(function () {});

	beforeEach(function () {
		stubs = {};
		err = new Error('any error message');
	});


	describe('Server', () => {
		describe('CrossMessageCenter', () => {
			it('publish', () => {
				const config = require('../server/CrossMessageCenterConfig')
				const msg = {
					msg: 'msg data'
				}
				let mqStart = sinon.stub()
				let mqPublish = sinon.spy()
				stubs['../finelets/mq/RabbitMessageCenter.js'] = {
					start: mqStart,
					publish: mqPublish
				}
				mqStart.withArgs(config).resolves()
				let crossMC = proxyquire('../server/CrossMessageCenter.js', stubs)

				return crossMC.start()
					.then(() => {
						mqStart.callCount.should.eql(1)
						crossMC.importPurchaseTransactions(msg)
						crossMC.importPurTransTaskCreated(msg)
						mqPublish.calledWith('cross', 'importPurchaseTransactions', msg).calledOnce
						mqPublish.calledWith('cross', 'importPurTransTaskCreated', msg).calledOnce
					})


			})
		})

		describe('biz - 业务模块', () => {

			describe('BizDataExtractors', () => {
				const bizDataExtractors = require('../server/biz/BizDataExtractors')

				describe('ImportPurTransTask', () => {
					const extractor = bizDataExtractors.importPurTransTask
					it('required fields', () => {
						const fields = ['transNo', 'partName', 'qty', 'amount', 'supplier']
						try {
							extractor({})
						} catch (e) {
							for (let i = 0; i < fields.length; i++) {
								expect(e[i].fieldName).eqls(fields[i])
							}
						}
						should.fail
					})
				})

			})

			describe('bas - 基础资料', () => {
				describe('料品', () => {})
			})

			describe('pur - 采购', () => {
				describe('采购申请单', () => {})
			})

			describe('batches - 批处理作业', () => {
				describe('Import Purchases CSV', () => {
					describe('PurchaseCsvParser', () => {
						it('parse', () => {
							const line = 'xulei00001,物料,"JSM-A1实验用格子布",abcd,米,150,8800,8800,绍兴惟楚纺织品有限公司,厂商,' +
								'JSMCONV20181109A,开票中,80,徐存辉,2018/11/9,徐存辉,2018/11/9,徐存辉,2018/11/9,2018/12/12,' +
								'测试组,2018/12/12,100,测试组, h234,remark,'
							const expected = {
								transNo: 'xulei00001',
								partType: '物料',
								partName: 'JSM-A1实验用格子布',
								spec: 'abcd',
								unit: '米',
								qty: 150,
								price: 8800,
								amount: 8800,
								supplier: '绍兴惟楚纺织品有限公司',
								supply: '厂商',
								refNo: 'JSMCONV20181109A',
								supplyLink: '开票中',
								purPeriod: 80,
								applier: '徐存辉',
								appDate: new Date('2018/11/9').toJSON(),
								reviewer: '徐存辉',
								reviewDate: new Date('2018/11/9').toJSON(),
								purchaser: '徐存辉',
								purDate: new Date('2018/11/9').toJSON(),
								invDate: new Date('2018/12/12').toJSON(),
								user: '测试组',
								useDate: new Date('2018/12/12').toJSON(),
								useQty: 100,
								project: '测试组',
								invLoc: ' h234',
								remark: 'remark'
							}
							const parser = require('../server/biz/batches/PurchaseCsvParser')
							let val = parser(line)
							expect(val.transNo).eqls(expected.transNo)
							expect(val.partType).eqls(expected.partType)
							expect(val.partName).eqls(expected.partName)
							expect(val.spec).eqls(expected.spec)
							expect(val.unit).eqls(expected.unit)
							expect(val.qty).eqls(expected.qty)
							expect(val.price).eqls(expected.price)
							expect(val.amount).eqls(expected.amount)
							expect(val.supplier).eqls(expected.supplier)
							expect(val.supply).eqls(expected.supply)
							expect(val.refNo).eqls(expected.refNo)
							expect(val.supplyLink).eqls(expected.supplyLink)
							expect(val.supplyLink).eqls(expected.supplyLink)
							expect(val.purPeriod).eqls(expected.purPeriod)
							expect(val.applier).eqls(expected.applier)
							expect(val.appDate).eqls(expected.appDate)
							expect(val.reviewDate).eqls(expected.reviewDate)
							expect(val.purDate).eqls(expected.purDate)
							expect(val.invDate).eqls(expected.invDate)
							expect(val.useDate).eqls(expected.useDate)
							expect(val.reviewer).eqls(expected.reviewer)
							expect(val.purchaser).eqls(expected.purchaser)
							expect(val.user).eqls(expected.user)
							expect(val.useQty).eqls(expected.useQty)
							expect(val.project).eqls(expected.project)
							expect(val.invLoc).eqls(expected.invLoc)
							expect(val.remark).eqls(expected.remark)
						})
					})

					describe('ImportPurchaseTransactions', () => {
						const doc = {
							doc: 'data of imported'
						}
						let importPurchase, extract, createTask;
						beforeEach(() => {
							extract = sinon.stub()
							stubs['../BizDataExtractors'] = {
								importPurTransTask: extract
							}
							createTask = sinon.stub()
							stubs['./ImportPurTransTask'] = {
								create: createTask
							}
							importPurchase = proxyquire('../server/biz/batches/ImportPurchaseTransactions', stubs)
						})

						it('抽取并校验数据失败, 数无法处理, 废弃', () => {
							extract.withArgs(doc).throws(err)

							return importPurchase(doc)
								.then(() => {
									should.fail('failed test')
								})
								.catch((reason) => {
									expect(reason).eqls(err)
								})
						})

						it('创建采购交易导入任务失败, 返回false, 消息将重排', () => {
							extract.withArgs(doc).returns(doc)
							createTask.withArgs(doc).rejects(err)

							return importPurchase(doc)
								.then((ok) => {
									expect(createTask.callCount).eqls(1)
									expect(ok).false
								})
						})

						it('采购交易导入任务确立', () => {
							extract.withArgs(doc).returns(doc)
							createTask.withArgs(doc).resolves()

							return importPurchase(doc)
								.then((ok) => {
									expect(createTask.callCount).eqls(1)
									expect(ok).true
								})
						})
					})

					describe('ImportPurTransTask', () => {
						const taskSchema = {
							schema: 'data of schema'
						}
						const doc = {
							doc: 'any data of doc'
						}
						let dbSave, task, publishCreateImportPurTramsTask

						beforeEach(() => {
							stubs['../../../db/schema/PurTransTask'] = taskSchema
							dbSave = sinon.stub()
							stubs['../../../finelets/db/mongoDb/SaveDoc'] = dbSave

							publishCreateImportPurTramsTask = sinon.spy()
							stubs['../../CrossMessageCenter'] = {
								importPurTransTaskCreated: publishCreateImportPurTramsTask
							}

							task = proxyquire('../server/biz/batches/ImportPurTransTask', stubs)
						})

						it('新增失败', () => {
							dbSave.withArgs(taskSchema, doc).rejects(err)
							return task.create(doc)
								.then(() => {
									should.fail
								})
								.catch((e) => {
									expect(e).eqls(err)
								})
						})

						it('新增成功', () => {
							dbSave.withArgs(taskSchema, doc).resolves(doc)
							return task.create(doc)
								.then(() => {
									expect(publishCreateImportPurTramsTask).calledWith(doc).calledOnce
								})
						})
					})
				})
			})
		})
	})

	describe('数据库', function () {
		beforeEach(function (done) {
			return clearDB(done);
		});

		it('add supplier', function () {
			var suppliers = require('../db/suppliers');
			return suppliers.add({
					name: 'foo',
					addr: 'foo address'
				})
				.then(function () {
					var schema = require('../db/schema/suppliers');
					return schema.find({})
				})
				.then(function (data) {
					data.length.should.eql(1);
					data[0].name.should.eql('foo');
				})
		});
	});
});