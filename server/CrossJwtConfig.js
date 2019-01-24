const {authenticate, getUser} = require('./biz/bas/Employee')
const adminId = 'cbbdhbcc'
const admin = {id: adminId, name: '开发者'}
const baseUrl = '/cross/api'
const loginUrl = '/cross/auth/login'
const prodConfig = {
    authenticate, getUser, baseUrl,loginUrl
}
const devConfig = {
    authenticate: (username, password) => {
        let user = (username === 'admin' && password === '9') ? admin : null
        return Promise.resolve(user)
    },
    getUser: (id) => {
        let user = id === adminId ? admin : null
        return Promise.resolve(user)
    },
    baseUrl,loginUrl
}
const create = () => {
    return process.env.RUNNING_MODE ? devConfig : prodConfig
}

module.exports = create() 