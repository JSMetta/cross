const amqp = require('amqplib'),
    Promise = require('bluebird'),
    logger = require('@finelets/hyper-rest/app/Logger');
const MSG_NAME_NOT_DEFINED = 'Message center name is not defined'

let __name, __conn;

const connectMq = (connStr) => {
    return amqp.connect(connStr)
        .then((conn) => {
            __conn = conn
            return __conn.createChannel()

        })
        .then((ch) => {
            return ch.assertExchange(__name, 'topic', {
                    durable: false
                })
        })
        .then(() => {
            return messageCenter
        })
}

const messageCenter = {
    addConsumer: (consumerName, msgType, consumer) => {
        let channel, queue
        return __conn.createChannel()
            .then((ch) => {
                channel = ch
                return ch.assertQueue(consumerName, {
                    durable: false
                })
            })
            .then((q) => {
                queue = q.queue
                return channel.bindQueue(queue, __name, msgType)
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
    },
    publish: (type, msg) => {
        const payload = Buffer.from(JSON.stringify(msg))
        return __conn.createConfirmChannel()
            .then(function (ch) {
                ch.publish(__name, type, payload, {}, (err, ok) => {
                    if (err !== null)
                        return Promise.reject(err)
                    else
                        return ok
                });
            });
    },
    stop: () => {
        return __conn.close()
    }
}

module.exports = (name, connStr) => {
    if (!name) return Promise.reject(MSG_NAME_NOT_DEFINED)
    __name = name
    return connectMq(connStr)
}