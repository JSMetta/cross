var proxyquire = require('proxyquire'),
    amqp = require('amqplib'),
    logger = require('@finelets/hyper-rest/app/Logger');

describe('RabbitMq', function () {
    let stubs, err;
    beforeEach(function () {
        stubs = {};
        err = new Error('any error message');
    })

    describe('MessageCenter', () => {
        const mqConnStr = 'amqp://qladapfm:CjtgA21O-1Ux-L108UCR70TcJ4GDpRVh@spider.rmq.cloudamqp.com/qladapfm';
        // const mqConnStr = 'amqp://jsm:jsm@192.168.5.166'
        let msgCenterFactory;

        beforeEach(()=>{
            msgCenterFactory = require('../finelets/mq/rabbit/MessageCenter')
        })

        it('无法连接MQ', () => {
            const connStr = 'any connect string'
            let amqpConnect = sinon.stub()
            stubs['amqplib'] = {
                connect: amqpConnect
            }
            msgCenterFactory = proxyquire('../finelets/mq/rabbit/MessageCenter', stubs)

            amqpConnect.withArgs(connStr).rejects(err)
            return msgCenterFactory.start('any connect string')
                .then(() => {
                    should.fail;
                })
                .catch((e) => {
                    e.should.eql(err);
                });
        })

        it('可重复启动', () => {
            const connStr = 'any connect string'
            let amqpConnect = sinon.stub()
            stubs['amqplib'] = {
                connect: amqpConnect
            }
            msgCenterFactory = proxyquire('../finelets/mq/rabbit/MessageCenter', stubs)

            let conn = {
                conn: 'connect to MQ'
            }
            amqpConnect.withArgs(connStr).resolves(conn)
            return msgCenterFactory.start(connStr)
                .then(() => {
                    return msgCenterFactory.start(connStr)
                })
                .then(() => {
                    amqpConnect.callCount.should.eql(1)
                })
        })

        it('未启动则无法获得实例', () => {
            let amqpConnect = sinon.stub()
            stubs['amqplib'] = {
                connect: amqpConnect
            }
            msgCenterFactory = proxyquire('../finelets/mq/rabbit/MessageCenter', stubs)

            amqpConnect.withArgs(undefined).rejects(err)
            return msgCenterFactory.getInstance('foo')
                .then(() => {
                    should.fail;
                })
                .catch((e) => {
                    e.should.eql(err);
                });
        })

        it('未曾指定缺省实例', () => {
            const connStr = 'any connect string'
            let amqpConnect = sinon.stub()
            stubs['amqplib'] = {
                connect: amqpConnect
            }
            msgCenterFactory = proxyquire('../finelets/mq/rabbit/MessageCenter', stubs)

            let conn = {
                conn: 'connect to MQ'
            }
            amqpConnect.withArgs(connStr).resolves(conn)
            return msgCenterFactory.start(connStr)
                .then(() => {
                    return msgCenterFactory.getInstance()
                })
                .then(() => {
                    should.fail
                })
                .catch((e) => {
                    e.should.eql('Default instance is not defined')
                })
        })

        describe('可以创建MessageCenter', () => {
            const name = 'cross';
            let exchange;

            beforeEach(() => {
                return msgCenterFactory.start(mqConnStr)
                    .then(() => {
                        return msgCenterFactory.getInstance(name)
                    })
                    .then((ex) => {
                        exchange = ex
                    })
            });

            it('一个消费者监听一种消息', () => {
                const consumerName = 'consumerA';
                const topic = 'foo';
                const msg = {
                    foo: 'any data of message'
                };
                let aConsumer = sinon.stub();
                aConsumer.withArgs(msg).resolves();
                return exchange.subscribe(consumerName, topic, aConsumer)
                    .then(() => {
                        return exchange.publish(topic, msg);
                    })
                    .then(() => {
                        expect(aConsumer.callCount).eqls(1)
                    });
            });
        });
    });
});