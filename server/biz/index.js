const createProcessEntity = require('./Process'),
    Employee = require('./bas/Employee'),
    Program = require('./Program'),
    PicGridFs = require('@finelets/hyper-rest/db/mongoDb/GridFs')({
        bucketName: 'pic'
    }),
    mqPublish = require('@finelets/hyper-rest/mq')

module.exports = {
    Process: createProcessEntity((msg) => {
        const publish = mqPublish['runProgram']
        publish(msg)
    }),
    Employee, Program, PicGridFs
}