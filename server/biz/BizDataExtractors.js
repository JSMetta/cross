const createExtractors = require('../../finelets/common/CreateDataExtractors'),

    config = {
        importPurTransTask: {
            fields: ['transNo', 'partType', 'partName',
                'spec', 'unit', 'qty', 'price', 'amount', 'supplier', 'supply', 'refNo',
                'supplyLink', 'purPeriod', 'applier', 'appDate', 'reviewer', 'reviewDate',
                'purDate', 'purchaser', 'invDate', 'user', 'useDate', 'useQty', 'project',
                'invLoc', 'remark'
            ],
            rules: {
                transNo: {
                    required: true
                },
                partName: {
                    required: true
                },
                qty: {
                    required: true
                },
                amount: {
                    required: true
                },
                supplier: {
                    required: true
                }
            }
        },
        partFromPurTransTask: {
            fields: ["partType", "partName", "spec", "unit"],
            rules: {}
        },
        purApplyFromPurTransTask: {
            fields: ["partType", "partName", "spec", "unit", "qty", "price", "amount",
                "supplier", "supply", "supplyLink",
                "purPeriod", "applier", "appDate"
            ],
            rules: {}
        },
    }

module.exports = createExtractors(config)