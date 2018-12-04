var proxyquire = require('proxyquire'),
	dbSave = require('@finelets/hyper-rest/db/mongoDb/SaveObjectToDb');

describe('Cross - ZWJ', function () {
	var stubs, err;
	before(function () {
		//mongoose.Promise = global.Promise;
	});

	beforeEach(function () {
		stubs = {};
		err = new Error('any error message');
	});

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

	describe('aaaaa', function () {
		beforeEach(function () {
			//return clearDB(done);
		});

		it('test1', function () {
			var toTest = function () {
				return 4;
			}
			toTest().should.eql(4);
		});

		it('test2', function () {
			var toTest = function () {
				return 3;
			}
			toTest().should.eql(3);
		})
	});
});