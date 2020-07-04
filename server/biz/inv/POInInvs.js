const schema = require('../../../db/schema/pur/Purchase')

const createInInvs = (mqPublish) => {
    return (id, {__v, actor, date, data, remark}) => {
        if (!actor) return Promise.reject()
        if (!data || !data.qty) return Promise.reject()
        data.qty = data.qty * 1
        let row
        return schema.findById(id)
            .then(doc => {
                if(!doc || doc.__v !== __v || doc.state !== 'Open' || !data.qty) return Promise.reject()
                
                const invDate = date || new Date()
                row = doc.transactions.push({type: 'inv', data, actor, date: invDate, remark})
                return doc.save()
            })
            .then(data => {
                if(data) {
                    data = data.toJSON()
                    const trans = {po: data.id, part: data.part, ...data.transactions[row - 1]}
                    mqPublish(trans)
                    return trans
                } 
            })
    }
}

module.exports = createInInvs