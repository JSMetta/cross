var proxyquire = require('proxyquire'),
    amqp = require('amqplib'),
    logger = require('@finelets/hyper-rest/app/Logger');

describe('RabbitMq', function () {
    const mqConnStr = 'amqp://qladapfm:CjtgA21O-1Ux-L108UCR70TcJ4GDpRVh@spider.rmq.cloudamqp.com/qladapfm';
    // const mqConnStr = 'amqp://jsm:jsm@192.168.5.166'
    const msgCenterFactory = require('../finelets/mq/rabbit/MessageCenter');
    let stubs, err;
    beforeEach(function () {
        stubs = {};
        err = new Error('any error message');
    })

    it('name argment is not defined', () => {
        return msgCenterFactory()
            .then(() => {
                should.fail;
            })
            .catch((e) => {
                e.should.eql('Message center name is not defined');
            });
    })

    describe('MessageCenter', () => {
        const name = 'cross';
        let center;
    
        describe('可以创建MessageCenter', () => {
            beforeEach(() => {
                return msgCenterFactory(name, mqConnStr).then((mc) => {
                    center = mc;
                });
            });
    
            afterEach(() => {
                return center.stop();
            });
    
            it('一个消费者监听一种消息', () => {
                const consumerName = 'consumerA';
                const msgType = 'foo';
                const msg = {
                    foo: 'any data of message'
                };
                let aConsumer = sinon.stub();
                aConsumer.withArgs(msg).resolves();
                return center
                    .addConsumer(consumerName, msgType, aConsumer)
                    .then(() => {
                        return center.publish(msgType, msg);
                    })
                    .then(() => {
                        expect(aConsumer).calledWith(msg).calledOnce;
                    });
            });
        });
    });
});

