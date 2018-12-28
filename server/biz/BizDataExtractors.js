const createExtractors = require('../../finelets/common/CreateDataExtractors'),

config = {
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