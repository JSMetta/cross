module.exports = {
    connect: process.env.MQ,
    exchanges: {
        cross: {
            isDefault: true,
            publishes: [
                'importPurTransTaskCreated'
            ],
            queues: {
            }
        }
    }
}