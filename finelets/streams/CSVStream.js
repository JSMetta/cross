const stream = require('stream'),
    Promise = require('bluebird'),
    util = require('util');
var __save, __parseRow;

function CSVStream() {
    stream.Writable.call(this);
    this.tailPiece = '';
}
util.inherits(CSVStream, stream.Writable);

CSVStream.prototype._write = function (chunk, encoding, callback) {
    var str = this.tailPiece + chunk.toString();
    var rows = str.split('\r\n');
    this.tailPiece = rows[rows.length - 1];
    var records = [];
    for (i = 0; i < rows.length - 1; i++) {
        try {
            var json = __parseRow(rows[i]);
            if (json) {
                records.push(__save(json));
            }
        } catch (err){
            return callback(new Error('Row ' + i + ' data format error'));
        }
    }

    return Promise.all(records)
        .then(function () {
            callback();
        })
        .catch(function (err) {
            callback(err);
        })
}

module.exports = function (save, parseRow) {
    __save = save;
    __parseRow = parseRow;
    return new CSVStream();
}