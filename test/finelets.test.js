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

	describe('TaskExecutionStates', () => {
		const createFsm = require('../finelets/fsm/TaskExecutionStates')
		const id = 1234,
			eventPayload = {
				eventPayload: 'eventPayload'
			}
		let fsm, statesGraph, context;

		beforeEach(() => {
			context = sinon.stub({
				getState: () => {},
				updateState: () => {}
			})
			statesGraph = {
				context: context,
				transitions: [{
					when: 'foo',
					from: 0,
					to: 1
				}]
			}
			fsm = createFsm(statesGraph)
		})

		it('未指定状态迁移图', () => {
			expect(() => {
				createFsm()
			}).throws('States transition graph is not defined')

		})

		it('状态迁移图中未实现context上下文接口', () => {
			expect(() => {
				createFsm({})
			}).throws('context interface is not defined in states transition graph')
		})

		it('状态迁移图中未实现context.getState接口', () => {
			expect(() => {
				createFsm({
					context: {}
				})
			}).throws('context.getState interface is not defined in states transition graph')
		})

		it('未读到当前状态', () => {
			context.getState.withArgs(id).rejects(err)
			return fsm.on('invalid', eventPayload, id)
				.then(() => {
					should.fail('should not come here')
				})
				.catch((e) => {
					expect(e).eqls(err)
				})
		})

		it('当前状态下收到无效消息', () => {
			context.getState.withArgs(id).resolves(0)
			return fsm.on('invalid', eventPayload, id)
				.then((state) => {
					expect(state).eqls(0)
				})
		})

		it('当前状态下发生迁移时状态更新失败', () => {
			context.getState.withArgs(id).resolves(0)
			context.updateState.withArgs(1, eventPayload, id).rejects(err)
			return fsm.on('foo', eventPayload, id)
				.then(() => {
					should.fail('should not come here')
				})
				.catch((e) => {
					expect(e).eqls(err)
				})
		})

		it('当前状态下发生迁移', () => {
			context.getState.withArgs(id).resolves(0)
			context.updateState.withArgs(1, eventPayload, id).resolves()
			return fsm.on('foo', eventPayload, id)
				.then((state) => {
					expect(state).eqls(1)
				})
		})

		it('当前状态下发生迁移时执行新状态的入口动作失败，则迁移失败', () => {
			let action = sinon.stub()
			statesGraph = {
				context: context,
				transitions: [{
					when: 'foo',
					from: 0,
					to: {
						state: 1,
						entry: action
					}
				}]
			}
			fsm = createFsm(statesGraph)
			context.getState.withArgs(id).resolves(0)
			action.withArgs(eventPayload, id).rejects(err)
			return fsm.on('foo', eventPayload, id)
				.then(() => {
					should.fail('should not come here')
				})
				.catch((e) => {
					expect(e).eqls(err)
				})
		})

		it('当前状态下发生迁移时执行当前状态的出口动作失败，则迁移失败', () => {
			let action = sinon.stub()
			statesGraph = {
				context: context,
				transitions: [{
					when: 'foo',
					from: {
						state: 0,
						exit: action
					},
					to: 1
				}]
			}
			fsm = createFsm(statesGraph)
			context.getState.withArgs(id).resolves(0)
			action.withArgs(eventPayload, id).rejects(err)
			return fsm.on('foo', eventPayload, id)
				.then(() => {
					should.fail('should not come here')
				})
				.catch((e) => {
					expect(e).eqls(err)
				})
		})

		it('当前状态下发生迁移时可执行出口和入口动作', () => {
			let action = sinon.stub()
			statesGraph = {
				context: context,
				transitions: [{
					when: 'foo',
					from: {
						state: 0,
						exit: action
					},
					to: {
						state: 1,
						entry: action
					}
				}]
			}
			fsm = createFsm(statesGraph)
			context.getState.withArgs(id).resolves(0)
			action.withArgs(eventPayload, id).resolves()
			return fsm.on('foo', eventPayload, id)
				.then((state) => {
					expect(state).eqls(1)
				})
		})

		it('守护异常', () => {
			let action = sinon.stub()
			statesGraph = {
				context: context,
				transitions: [{
					when: 'foo',
					from: 0,
					guard: action,
					to: 1
				}]
			}
			fsm = createFsm(statesGraph)
			context.getState.withArgs(id).resolves(0)
			action.withArgs(eventPayload, id).rejects(err)
			return fsm.on('foo', eventPayload, id)
				.then(() => {
					should.fail('should not come here')
				})
				.catch((e) => {
					expect(e).eqls(err)
				})
		})

		it('未通过守护', () => {
			let action = sinon.stub()
			statesGraph = {
				context: context,
				transitions: [{
					when: 'foo',
					from: 0,
					guard: action,
					to: 1
				}]
			}
			fsm = createFsm(statesGraph)
			context.getState.withArgs(id).resolves(0)
			action.withArgs(eventPayload, id).resolves(false)
			return fsm.on('foo', eventPayload, id)
				.then((state) => {
					expect(state).eqls(0)
				})
		})

		it('通过守护', () => {
			let action = sinon.stub()
			statesGraph = {
				context: context,
				transitions: [{
					when: 'foo',
					from: 0,
					guard: action,
					to: 1
				}]
			}
			fsm = createFsm(statesGraph)
			context.getState.withArgs(id).resolves(0)
			action.withArgs(eventPayload, id).resolves(true)
			return fsm.on('foo', eventPayload, id)
				.then((state) => {
					expect(state).eqls(1)
				})
		})
	})
})