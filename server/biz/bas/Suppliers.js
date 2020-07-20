const schema = require('../../../db/schema/bas/Supplier'),
    createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity')

const config = {
    schema,
    projection: {contacts: 0},
    updatables:['type', 'code', 'name', 'address', 'account', 'link', 'tags'],
    searchables: ['name', 'tags', 'code', 'address']
}

const addin = {}

module.exports = createEntity(config, addin)