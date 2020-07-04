const createProcessEntity = require('./rockstar/Process'),
    mqPublish = require('@finelets/hyper-rest/mq'),
    Employee = require('./bas/Employee'),
    Parts = require('./bas/Parts'),
    Suppliers = require('./bas/Suppliers'),
    createPOInInvs = require('./inv/POInInvs'),
    createWithdraws = require('./inv/Withdraws'),
    Purchases = require('./pur/Purchases'),
    Program = require('./rockstar/Program'),
    PicGridFs = require('@finelets/hyper-rest/db/mongoDb/GridFs')({bucketName: 'pic'})

module.exports = {
    Process: createProcessEntity((msg) => {
        const publish = mqPublish['runProgram']
        publish(msg)
    }),
    POTransactions: {
        inv: createPOInInvs((msg) => {
            const publish = mqPublish['poInInv']
            publish(msg)
        }),
        commit: Purchases.commit,
        review: Purchases.review
    },
    Withdraws: createWithdraws((msg) => {
        const publish = mqPublish['outInv']
        publish(msg)
    }),
    Employee, Program, PicGridFs, Parts, Suppliers, Purchases
}