const logger = require('@finelets/hyper-rest/app/Logger'),
    employee = require('./biz/bas/Employee'),
    PO = require('./biz/pur/Purchases'),
    INV = require('./biz/bas/Parts'),
    processLogger = require('./biz').Process,
    picGridFs = require('./biz/PicGridFs')

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
                        return employee.updatePic(id, pic)
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
                        return picGridFs.remove(pic)
                            .then(() => {
                                return true
                            })
                            .catch(e => {
                                return true
                            })
                    }
                },
                PoInInv_Inv: {
                    topic: 'poInInv',
                    consumer: (doc) => {
                        return PO.poInInv(doc.parent, doc.data.qty)
                            .then(() => {
                                logger.debug('Inventory qty is updated by InInv !!!')
                                return true
                            })
                    }
                },
                OutInv_Inv: {
                    topic: 'outInv',
                    consumer: (doc) => {
                        const qty = doc.qty * -1
                        return INV.updateInvQty(doc.part, qty)
                            .then(() => {
                                logger.debug('Inventory qty is updated by outInv !!!')
                                return true
                            })
                    }
                },
                ExecSerialPortInstruction: {
                    topic: 'execSerialPortInstruction',
                    consumer: (msg) => {
                        return processLogger.log(msg)
                            .then((doc) => {
                                return !!doc
                            })
                    }
                }
            }
        }
    }
}