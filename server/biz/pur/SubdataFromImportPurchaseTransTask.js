    const createExtractor = require('../../../finelets/common/ExtractBasedRule'),
        rules = require('./PurApplyValidateRules');

    module.exports = () => {
        const fields = ["partType", "partName", "spec", "unit", "qty", "price", "amount",
            "supplier", "supply", "supplyLink",
            "purPeriod", "applier", "appDate"
        ]
        return createExtractor(fields, rules)
    }