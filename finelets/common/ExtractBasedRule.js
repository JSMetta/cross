const validator = require('rulebased-validator');
let __fields, __rules

const __extract = (obj) => {
    let result = {}
    __fields.forEach((f) => {
        if (obj[f] || obj[f] === false) {
            result[f] = obj[f]
        }
    })
    return result
}

const extractBasedRule = (obj) => {
    let data = __extract(obj)
    let result = validator.validate(data, __rules);
    if (result === true) return data
    throw result
}

module.exports = (fields, rules) => {
    __fields = fields
    __rules = rules
    return extractBasedRule
}