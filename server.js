require('dotenv').config(),
	redis = require('redis');

const path = require('path'),
	connectDb = require('@finelets/hyper-rest/db/mongoDb/ConnectMongoDb'),
	appBuilder = require('@finelets/hyper-rest/express/AppBuilder').begin(__dirname),
	logger = require('@finelets/hyper-rest/app/Logger');

var app = appBuilder.getApp();
var client = redis.createClient(
	process.env.REDIS_PORT_6379_TCP_PORT,
	process.env.REDIS_PORT_6379_TCP_ADDR
);
//var client = redis.createClient('6379', 'redis');
app.get('/', function (req, res, next) {
	client.incr('counter', function (err, counter) {
		if (err) return next(err);
		res.send('This page has been viewed ' + counter + ' times!');
	});
});

appBuilder
	.setWebRoot('/root', './client')
	.setFavicon('client/imgs/favicon.jpg')
	.end();

connectDb(function () {
	logger.info('connect mongodb success .......');
	var server = appBuilder.run(function () {
		const addr = server.address();
		logger.info('the server is running and listening at ' + addr.port);
	});
});