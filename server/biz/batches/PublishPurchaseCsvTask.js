const cross = require('../../CrossMessageCenter')

module.exports = () => {
    return cross()
        .then((mc) => {
            return (data) => {
                return mc.publish('batch.purchasesCsv', data)
            }
        })
}