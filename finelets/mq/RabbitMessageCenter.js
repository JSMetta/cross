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
                return channel.publish(ex, type, payload, {}, (err, ok) => {
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
                    .then((ok) => {
                        return ok ? ch.ack(msg) : ch.nack(msg)
                    })
                    .catch((err) => {
                        logger.error('the consumer has rejected message:\r\n' + JSON.stringify(payload) + 
                        '\r\nError:' + JSON.stringify(err))
                        return ch.nack(msg, false, false)
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
    start: (config) => {
        return amqp.connect(config.connect)
            .then((conn) => {
                __conn = conn
                return __conn.createChannel()
            })
            .then((ch) => {
                let exchanges = []
                __.each(config.exchanges, (element, key) => {
                    exchanges.push(__createExchange(ch, key, element))
                })
                return Promise.all(exchanges)
            })
    },
    
    publish: (name, type, msg) => {
        return __publishes[name].publish(type, msg)
    }
}
module.exports = rabbitMessageCenter