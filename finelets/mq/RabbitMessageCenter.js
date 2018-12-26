const amqp = require('amqplib'),
    Promise = require('bluebird'),
    __ = require('underscore'),
    logger = require('@finelets/hyper-rest/app/Logger');

let __conn;
let __publishes = {}

class __Publish {
    constructor(name) {
        this.__ex = name
    }

    publish(type, msg) {
        const payload = Buffer.from(JSON.stringify(msg))
        let channel
        let ex = this.__ex
        return __conn.createConfirmChannel()
            .then((ch) => {
                channel = ch
                return ch.assertExchange(ex, 'topic', {
                    durable: false
                })
            })
            .then(function () {
                channel.publish(ex, type, payload, {}, (err, ok) => {
                    if (err !== null)
                        return Promise.reject(err)
                    else
                        return ok
                });
            });
    }
}

const __createQueue = (ch, ex, name, config) => {
    let queue
    return ch.assertQueue(name, {
            durable: false
        })
        .then((q) => {
            queue = q.queue
            return ch.bindQueue(queue, ex, config.topic)
        })
        .then(() => {
            return ch.consume(queue, (msg) => {
                let payload = JSON.parse(msg.content.toString())
                return config.consumer(payload)
                    .then(() => {
                        return ch.ack(msg)
                    })
                    .catch(() => {
                        logger.debug('the consumer has rejected message')
                    })
            })
        })
}

const __createExchange = (ch, name, config) => {
    let queues = []
    return ch.assertExchange(name, 'topic', {
            durable: false
        })
        .then(() => {
            __.each(config.queues, (element, key) => {
                queues.push(__createQueue(ch, name, key, element))
            })
            return Promise.all(queues)
        })
        .then(() => {
            __publishes[name] = new __Publish(name)
        })
}

const rabbitMessageCenter = {
    connect: (connStr) => {
        return amqp.connect(connStr)
            .then((conn) => {
                return __conn = conn
            })
    },

    createExchanges: (config) => {
        let exchanges = []
        return __conn.createChannel()
            .then((ch) => {
                __.each(config, (element, key) => {
                    exchanges.push(__createExchange(ch, key, element))
                })
                return Promise.all(exchanges)
            })
    },

    getPublish: (name) => {
        return (type, msg) => {
            return __publishes[name].publish(type, msg)
        }
    }
}
module.exports = rabbitMessageCenter


/* describe('CrossMessageCenter', () => {
    it('发布导入采购交易任务', () => {
        const topic = 'importPurchaseTransactions'
        const task = {task: 'any task data'}
        let execTask = sinon.stub()
        execTask.withArgs(task).resolves()

        stubs['./biz/batches/ImportPurchaseTransactions'] = execTask
        const publish = proxyquire('../server/CrossMessageCenter', stubs)
        
        return publish(topic, task)
        .then(()=>{
            expect(execTask.callCount).eqls(1)
        })
    })
}) */