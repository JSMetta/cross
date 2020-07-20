const logger = require('@finelets/hyper-rest/app/Logger'),
    {Employee, Purchases, Parts, Process, PicGridFs} = require('./biz')

module.exports = {
    connect: process.env.MQ,
    exchanges: {
        textrade: {
            isDefault: true,
            publishes: [
                'employeePicChanged',
                'removePic',
                'poInInv',
                'outInv',
                'execSerialPortInstruction'
            ],
            queues: {
                EmployeePicChanged: {
                    topic: 'employeePicChanged',
                    consumer: ({
                        id,
                        pic
                    }) => {
                        logger.debug(`handle message employeePicChanged: {id: ${id}, pic: ${pic}}`)
                        return Employee.updatePic(id, pic)
                            .then(() => {
                                return true
                            })
                            .catch(e => {
                                return true
                            })
                    }
                },
                RemovePic: {
                    topic: 'removePic',
                    consumer: (pic) => {
                        logger.debug(`handle message removePic: ${pic}`)
                        return PicGridFs.remove(pic)
                            .then(() => {
                                return true
                            })
                            .catch(e => {
                                return true
                            })
                    }
                },
                PoInInv_UpdatePoLeft: {
                    topic: 'poInInv',
                    consumer: (doc) => {
                        return Purchases.poInInv(doc.po, doc.data.qty)
                            .then(() => {
                                logger.debug('PO left qty is updated by poInInv !!!')
                                return true
                            })
                    }
                },
                OutInv_UpdatePartInvQty: {
                    topic: 'outInv',
                    consumer: (doc) => {
                        return Parts.updateInvQty(doc.part, doc.qty * -1) 
                            .then(() => {
                                logger.debug('Part inventory qty is updated by outInv !!!')
                                return true
                            })
                    }
                },
                PoInInv_UpdatePartInvQty: {
                    topic: 'poInInv',
                    consumer: (doc) => {
                        return Parts.updateInvQty(doc.part, doc.data.qty)
                            .then(() => {
                                logger.debug('Part inventory qty is updated by poInInv !!!')
                                return true
                            })
                    }
                },
                ExecSerialPortInstruction: {
                    topic: 'execSerialPortInstruction',
                    consumer: (msg) => {
                        logger.debug(`execSerialPortInstruction message: ${JSON.stringify(msg, null, 2)}`)
                        return Process.log(msg)
                            .then((doc) => {
                                return !!doc
                            })
                    }
                }
            }
        }
    }
}