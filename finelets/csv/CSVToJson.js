const __ = require('underscore')
const defaultType = require('./JsonValueTypes').Default

class CsvToJson {
    constructor() {
        this.__columns = []
    }

    addColumn(name, type=defaultType) {
        this.__columns.push({
            name: name,
            type: type
        })
        return this
    }

    parse(csv) {
        if (this.__columns.length === 0) throw 'no column is defined'
        let vals = csv.split(',')
        if (vals.length !== this.__columns.length) return null
        let cols = []
        for (let i = 0; i < vals.length; i++) {
            let colval = this.__columns[i].type(vals[i])
            if (colval === null) return null;
            if(colval !== undefined) cols.push([this.__columns[i].name, colval])
        }

        return __.object(cols)
    }
}

module.exports = () => new CsvToJson()