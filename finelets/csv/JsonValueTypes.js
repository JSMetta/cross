const general = (convert, strVal) => {
    if(strVal.length === 0) return undefined
    let val = convert(strVal)
    return isNaN(val) ? null : val
}

module.exports = {
    Default: (strVal) => {
        return strVal.length ? strVal : undefined
    },
    Number: (strVal) => general(Number, strVal),

    Date: (strVal) => {
        return general((strVal)=>new Date(strVal), strVal)
    },
    Bool: (strVal) => {
        if(strVal.length === 0) return undefined
        strVal = strVal.toLowerCase().trim()
        return strVal === 'true' ? true : (strVal === 'false') ? false : null
    }
}