var proxyquire = require('proxyquire'),
	dbSave = require('@finelets/hyper-rest/db/mongoDb/SaveObjectToDb');

describe('All', function () {
	var stubs, err;
	before(function () {
		mongoose.Promise = global.Promise;
	});

	beforeEach(function () {
		stubs = {};
		err = new Error('any error message');
	});

	describe('数据库', function () {
		beforeEach(function (done) {
			return clearDB(done);
		});
	});
});