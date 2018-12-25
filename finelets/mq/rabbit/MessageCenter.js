const amqp = require('amqplib'),
    Promise = require('bluebird'),
    logger = require('@finelets/hyper-rest/app/Logger');

let __connStr, __conn, __defaultEx;
let __instances = {}

const __connectMq = () => {
    if (__conn) return Promise.resolve()
    return amqp.connect(__connStr)
        .then((conn) => {
            __conn = conn
            return
        })
}

const __getInstanceFromMap = (name) => {
    let obj = __instances[name]
    if (!obj) {
        obj = new TopicExchanges(name, __conn)
        __instances[name] = obj
    }
    return obj
}

const __getInstance = (name) => {
    return __connectMq()
        .then(() => {
            name = name || __defaultEx
            if (!name) return Promise.reject('Default instance is not defined')
            return __getInstanceFromMap(name)
        })
}

class TopicExchanges {
    constructor(name, conn) {
        this.__ex = name
        this.__conn = conn
    }

    subscribe(consumerName, msgType, consumer) {
        let channel, queue
        let ex = this.__ex
        return this.__conn.createChannel()
            .then((ch) => {
                channel = ch
                return ch.assertExchange(ex, 'topic', {
                    durable: false
                })
            })
            .then(() => {
                return channel.assertQueue(consumerName, {
                    durable: false
                })
            })
            .then((q) => {
                queue = q.queue
                return channel.bindQueue(queue, ex, msgType)
            })
            .then(() => {
                return channel.consume(queue, (msg) => {
                    let payload = JSON.parse(msg.content.toString())
                    return consumer(payload)
                        .then(() => {
                            return channel.ack(msg)
                        })
                        .catch(() => {
                            logger.debug('the consumer has rejected message')
                        })
                })
            })
    }

    publish(type, msg) {
        const payload = Buffer.from(JSON.stringify(msg))
        let channel
        let ex = this.__ex
        return this.__conn.createConfirmChannel()
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

module.exports = {
    start: (connStr, name) => {
        __connStr = connStr
        if (name) {
            return __getInstance(name)
                .then(() => {
                    __defaultEx = name
                })
        }
        return __connectMq().then(() => {})
    },
    getInstance: __getInstance
}