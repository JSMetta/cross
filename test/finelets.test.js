var proxyquire = require('proxyquire');

describe('Finelets', function () {
	var stubs, err
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

		beforeEach(function () {
			parseRow = sinon.stub();
			saveRow = sinon.stub();
			stream = csvStream(saveRow, parseRow);
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

	describe('JsonValueType', () => {
		const types = require('../finelets/csv/JsonValueTypes')
		it('各种类型', () => {
			expect(types.Default('foo')).eqls('foo')
			expect(types.Default('"foo"')).eqls('foo')
			expect(types.Default('')).undefined
			expect(types.Number(' 123.45 ')).eqls(123.45)
			expect(types.Number('123px')).eqls(null)
			expect(types.Number('')).eqls(undefined)
			expect(types.Date('')).eqls(undefined)
			expect(types.Date('abc')).eqls(null)
			expect(types.Date('2018/9/22')).eqls(new Date(2018, 8, 22).toJSON())
			expect(types.Date('2018-9-22')).eqls(new Date(2018, 8, 22).toJSON())
			expect(types.Bool('')).eqls(undefined)
			expect(types.Bool('abc')).eqls(null)
			expect(types.Bool(' TrUe ')).true
			expect(types.Bool('false')).false
		})
	})

	describe('CSVToJson', () => {
		let csvToJson

		beforeEach(() => {
			csvToJson = require('../finelets/csv/CSVToJson')()
		})

		it('未定义任何字段', () => {
			expect(() => {
				csvToJson.parse('abc')
			}).throws('no column is defined')
		})

		it('未以逗号结尾', () => {
			csvToJson.addColumn('foo')
			expect(csvToJson.parse('abc')).null
		})

		it('数据格式和字段个数不一致', () => {
			csvToJson.addColumn('foo')
			expect(csvToJson.parse('abc,123,')).null
		})

		it('字段无法解析', () => {
			let type = sinon.stub()
			type.withArgs('abc').returns(null)
			csvToJson.addColumn('foo', type)
			expect(csvToJson.parse('abc,')).null
		})

		it('正确解析', () => {
			let type = sinon.stub()
			type.withArgs('abc').returns(123)
			type.withArgs('def').returns(456)
			csvToJson
				.addColumn('foo', type)
				.addColumn('fee', type)
			expect(csvToJson.parse('abc,def,')).eqls({
				foo: 123,
				fee: 456
			})
		})

		it('缺省字段类型于./JsonValueTypes.Default定义', () => {
			let defaultType = sinon.stub()
			stubs['./JsonValueTypes'] = {
				Default: defaultType
			}
			defaultType.withArgs('abc').returns('234')
			csvToJson = proxyquire('../finelets/csv/CSVToJson.js', stubs)()

			csvToJson.addColumn('foo')
			expect(csvToJson.parse('abc,')).eqls({
				foo: '234'
			})
		})

		it('空字段值', () => {
			let type = sinon.stub()
			type.withArgs('abc').returns(123)
			type.withArgs('def').returns(undefined)
			csvToJson.addColumn('foo', type)
			csvToJson.addColumn('fee', type)
			expect(csvToJson.parse('abc,def,')).eqls({
				foo: 123
			})
		})
	})

	describe('ExtractBasedRule', () => {
		const fields = ['fee', 'fuu']
		const rules = {
			rule: 'define rules according npm rulebased-validator'
		}
		const validate = sinon.stub()
		const result = {
			fee: "fee",
			fuu: "fuu"
		}
		const obj = Object.assign({
			foo: 'foo'
		}, result)

		let extract;

		beforeEach(() => {
			stubs['rulebased-validator'] = {
				validate: validate
			}
			extract = proxyquire('../finelets/common/ExtractBasedRule', stubs)(fields, rules)
		})
		it('未通过数据校验', () => {
			validate.withArgs(result, rules).returns(err)

			try {
				extract(obj)
			} catch (e) {
				expect(e).eqls(err)
			}
			should.fail
		})

		it('正确抽取数据', () => {
			validate.withArgs(result, rules).returns(true)

			expect(extract(obj)).eql(result)

		})

		it('CreateDataExtractors', () => {
			const fooFields = ['fooField']
			const fooRules = {fooRule: 'fooRule'}
			const fooExtractor = {foo: 'foo'}
			const feeFields = ['feeField']
			const feeRules = {feeRule: 'feeRule'}
			const feeExtractor = {fee: 'fee'}
			const createExtractor = sinon.stub()
			stubs['./ExtractBasedRule'] = createExtractor

			const config = {
				foo: {
					fields: fooFields,
					rules: fooRules
				},
				fee: {
					fields: feeFields,
					rules: feeRules
				},
			}

			createExtractor.withArgs(fooFields, fooRules).returns(fooExtractor)
			createExtractor.withArgs(feeFields, feeRules).returns(feeExtractor)
			const createDataExtractors = proxyquire('../finelets/common/CreateDataExtractors', stubs)
			let extractors = createDataExtractors(config)

			expect(extractors.foo).eqls(fooExtractor)
			expect(extractors.fee).eqls(feeExtractor)
		})
	})
})