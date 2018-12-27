var proxyquire = require('proxyquire'),
	logger = require('@finelets/hyper-rest/app/Logger'),
	dbSave = require('@finelets/hyper-rest/db/mongoDb/SaveObjectToDb');

describe('Cross', function () {
	var stubs, err;
	before(function () {
	});

	beforeEach(function () {
		stubs = {};
		err = new Error('any error message');
	});

	describe('CrossMessageCenter', () => {
		before(() => {
			process.env.MQ = 'amqp://qladapfm:CjtgA21O-1Ux-L108UCR70TcJ4GDpRVh@spider.rmq.cloudamqp.com/qladapfm';
		})
		it('发布导入采购交易任务', () => {
			const task = {
				task: 'any task data'
			}
			let execTask = sinon.stub()
			execTask.withArgs(task).resolves()

			stubs['./biz/batches/ImportPurchaseTransactions'] = execTask
			let mc = proxyquire('../server/CrossMessageCenter', stubs)

			return mc.start()
				.then(() => {
					return mc.importPurchaseTransactions(task)
				})
				.then(() => {
					expect(execTask.callCount).eqls(1)
				})
		})
	})

	describe('Batch Tasks', () => {
		describe('Import Purchases CSV', () => {
			describe('PurchaseCsvParser', () => {
				it('parse', () => {
					const line = 'xulei00001,物料,"JSM-A1实验用格子布",abcd,米,150,8800,8800,绍兴惟楚纺织品有限公司,厂商,' +
						'JSMCONV20181109A,开票中,80,徐存辉,2018/11/9,徐存辉,2018/11/9,徐存辉,2018/11/9,2018/12/12,' +
						'测试组,2018/12/12,100,测试组, h234,remark'
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

			it('PurchasesCSVStream', () => {
				const parser = {
						parser: 'parser'
					},
					saver = {
						publish: 'publish'
					};

				stubs['./PurchaseCsvParser'] = parser
				stubs['../../CrossMessageCenter'] = saver

				let createStrame = sinon.stub()
				stubs['../../../finelets/streams/CSVStream'] = createStrame
				const purCsvStream = {
					stream: 'csvstream'
				}
				createStrame.withArgs(saver, parser).returns(purCsvStream)

				let createPurchasesCSVStream = proxyquire('../server/biz/batches/PurchasesCSVStream', stubs)
				createPurchasesCSVStream().should.eql(purCsvStream)

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