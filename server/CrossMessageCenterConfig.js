const toCreatePurchase = (doc)=>{return Promise.resolve(true)}

module.exports = {
    connect: process.env.MQ,
    exchanges: {
        cross: {
            isDefault: true,
            publishes: [
                'importPurTransTaskCreated'
            ],
            queues: {
                CreatePurchase: {
                    topic: 'importPurTransTaskCreated',
                    consumer: toCreatePurchase
                },
            }
        }
    }
}