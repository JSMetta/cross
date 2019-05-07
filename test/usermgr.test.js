var dbSave = require('@finelets/hyper-rest/db/mongoDb/SaveObjectToDb');

describe('权限管理', function () {
	const Schema = require('../db/schema/bas/Employee'),
	id = '1223445666',
	userId = 'foo',
	name = 'foo name',
	password = 'wwwpsd',
	email = 'foo@qq.com'

	describe('用户', () => {
		const entity = require('../server/biz/bas/Employee')

		beforeEach((done) => {
			return clearDB(done);
		})
		
		it('注册用户', () => {
			const user = {
				userId,
				name,
				password,
				email
			}
			return entity.create(user)
				.then(() => {
					return Schema.findOne({userId})
				})
				.then((doc) => {
					expect(user).eql({userId: doc.userId, name: doc.name, password: doc.password, email: doc.email})
				})
		})
	})

	describe('CrossJwtConfig', () => {
		const createAuthConfig = require('../server/CrossJwtConfig'),
		DEFAULT_ADMIN_ID = '$$$$cross$$admin'
		let dbAuth

		beforeEach(() => {
			dbAuth = sinon.stub({
				authenticate:()=>{},
				getUser:()=>{},
				haveAdmin:()=>{}
			})
		})

		describe('authenticate', () => {
			const DEFAULT_ADMIN = {id:DEFAULT_ADMIN_ID, name: '系统管理员'}
			let authenticate

			beforeEach(() => {
				authenticate = createAuthConfig(dbAuth).authenticate
			})
			it('未获认证', () => {
				dbAuth.authenticate.withArgs(userId, password).resolves()
				return authenticate(userId, password)
				.then((user) => {
					expect(user).undefined
				})
			})
	
			it('缺省系统管理员', () => {
				authenticate = createAuthConfig({}).authenticate
				return authenticate('@admin@', '$9999$')
					.then((user) => {
						expect(user).eql(DEFAULT_ADMIN)
					})
			})
			
			it('系统当前不存在系统管理员时，则认证缺省系统管理员', () => {
				dbAuth.haveAdmin.resolves(0)
				return authenticate('@admin@', '$9999$')
				.then((user) => {
					expect(user).eql(DEFAULT_ADMIN)
				})
			})
	
			it('存在系统管理员时，则拒绝缺省系统管理员', () => {
				dbAuth.haveAdmin.resolves(1)
				return authenticate('@admin@', '$9999$')
				.then((user) => {
					expect(user).undefined
				})
			})
	
			it('普通用户', () => {
				dbAuth.authenticate.withArgs(userId, password).resolves({id})
				return authenticate(userId, password)
					.then((user) => {
						expect(user.id).eql(id)
					})
			})
		})

		describe('用户信息', () => {
			const DEFAULT_ADMIN_INFO = {
				name: '系统管理员'
			}
			let getUser

			beforeEach(() => {
				getUser = createAuthConfig(dbAuth).getUser
			})
	
			it('缺省系统管理员', () => {
				return getUser(DEFAULT_ADMIN_ID)
				.then((user) => {
					expect(user).eql(DEFAULT_ADMIN_INFO)
				})
			})
	
			it('普通用户', () => {
				const userInfo = {userInfo: 'any data of userinfo'}
				dbAuth.getUser.withArgs(id).resolves(userInfo)
				return getUser(id)
					.then((user) => {
						expect(user).eql(userInfo)
					})
			})
		})
		
	})
})