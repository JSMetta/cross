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

	describe('upload purchases from CVS data file', function () {
		beforeEach(function () {});

		it('ok', function () {
			const stream = require('stream'),
				util = require('util'),
				chance = require('chance').Chance();

			function RandomStream(options) {
				stream.Readable.call(this, options);
			}
			util.inherits(RandomStream, stream.Readable);

			RandomStream.prototype._read = function (size) {
				var chunk = chance.string(); 
				console.log('Pushing chunk of size:' + chunk.length);
				this.push(chunk, 'utf8'); 
				if (chance.bool({
						likelihood: 5
					})) {
					this.push(null);
				}
			}

			var rs = new RandomStream();
			rs.on('readable', function () {
				var chunk;
				while ((chunk = randomStream.read()) !== null) {
					console.log("Chunk received: " + chunk.toString());
					chunk.should.eql('aaaa');
				}
			});
		})
	});

	describe('数据库', function () {
		beforeEach(function (done) {
			return clearDB(done);
		});
	});
});