const createExtractor = require('../../../finelets/common/ExtractBasedRule'),
rules = require('./PartValidateRules');

module.exports = () => {
    const fields = ["partType", "partName", "spec", "unit"]
    return createExtractor(fields, rules)
}