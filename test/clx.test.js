var proxyquire = require('proxyquire'),
	dbSave = require('@finelets/hyper-rest/db/mongoDb/SaveObjectToDb');

describe('Cross - clx', function () {
	var stubs, err
	before(function () {
		mongoose.Promise = global.Promise
	})

	beforeEach(function () {
		stubs = {}
		err = new Error('any error message')
	})

	describe('CSVStream', function () {
		const csvStream = require('../finelets/streams/CSVStream'),
		row = {
			data: 'any data of row'
		};
		var parseRow, saveRow, stream;

		beforeEach(function (done) {
			parseRow = sinon.stub();
			saveRow = sinon.stub();
			stream = csvStream(saveRow, parseRow);
			return clearDB(done);
		})

		it('数据格式错', function (done) {
			parseRow.withArgs('foo').throws(err);
			stream.on('error', function (e) {
				e.message.should.eql('Row 0 data format error');
				done();
			});

			stream.write('foo\r\n');
			stream.end();
		});

		it('可忽略的数据行', function (done) {
			parseRow.withArgs('foo').returns(null);
			stream.on('finish', function () {
				saveRow.callCount.should.eql(0);
				done();
			});

			stream.write('foo\r\n');
			stream.end();
		});

		it('保存失败', function (done) {
			parseRow.withArgs('foo').returns(row);
			saveRow.withArgs(row).rejects(err);
			stream.on('error', function (e) {
				e.should.eql(err);
				saveRow.callCount.should.eql(1);
				done();	
			});

			stream.write('foo\r\n');
			stream.end();
		});

		it('单一流块 - single chunk', function (done) {
			parseRow.withArgs('foo').returns(row);
			saveRow.withArgs(row).resolves();

			stream.on('finish', function () {
				saveRow.callCount.should.eql(1);
				done();
			});

			stream.write('foo\r\n');
			stream.end(); 			
		});

		it('多流块 - multiple chunk', function (done) {
			parseRow.withArgs('foo').returns(row);
			saveRow.withArgs(row).resolves();

			stream.on('finish', function () {
				saveRow.callCount.should.eql(3);
				done();
			});

			stream.write('foo\r\nfoo\r\n');
			stream.write('foo\r\n');
			stream.end();
		});
		
		it('Row seperated by multiple chunk', function (done) {
			parseRow.withArgs('foo,fee,fuu').returns(row);
			saveRow.withArgs(row).resolves();

			stream.on('finish', function () {
				saveRow.callCount.should.eql(1);
				done();
			});

			stream.write('foo,');
			stream.write('fee,');
			stream.write('fuu\r\n');
			stream.end();
		});
	})

	describe('数据库', function () {
		beforeEach(function (done) {
			return clearDB(done)
		})

		it('add supplier', function () {})
	})
})