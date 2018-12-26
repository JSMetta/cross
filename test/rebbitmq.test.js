var proxyquire = require('proxyquire');

describe('RabbitMq', function () {
    const mqConnStr = 'amqp://qladapfm:CjtgA21O-1Ux-L108UCR70TcJ4GDpRVh@spider.rmq.cloudamqp.com/qladapfm';
    // const mqConnStr = 'amqp://jsm:jsm@192.168.5.166'
    let stubs, err;
    beforeEach(function () {
        stubs = {};
        err = new Error('any error message');
    })

    describe('RabbitMessageCenter', () => {
        const mc = require('../finelets/mq/RabbitMessageCenter')
        let config;

        it('publish a single message', () => {
            const msg = {
                foo: 'any data of message'
            }
            let aConsumer = sinon.stub()
            aConsumer.withArgs(msg).resolves()

            config = {
                connect: mqConnStr,
                exchanges: {
                    foo: {
                        queues: {
                            qa: {
                                topic: 't1',
                                consumer: aConsumer
                            }
                        }
                    }
                }
            }
            return mc.start(config)
                .then(() => {
                    let publish = mc.getPublish('foo')
                    return publish('t1', msg)
                })
                .then(() => {
                    expect(aConsumer.callCount).eqls(1)
                })
        })
    })
})