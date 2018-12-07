//"use strict";

// require('dotenv').config();
var connectDb = require('@finelets/hyper-rest/db/mongoDb/ConnectMongoDb'),
	appBuilder = require('@finelets/hyper-rest/express/AppBuilder').begin(__dirname),
	logger = require('@finelets/hyper-rest/app/Logger'),
	redis = require('redis');

var app = appBuilder.getApp();

appBuilder
	.setWebRoot('/root', './client')
	.setFavicon('client/imgs/favicon.jpg')
	.end();

//logger.info(process.env.REDIS_PORT_6379_TCP_ADDR + ':' + process.env.REDIS_PORT_6379_TCP_PORT);

// APPROACH 1: Using environment variables created by Docker
// var client = redis.createClient(
//      process.env.REDIS_PORT_6379_TCP_PORT,
//      process.env.REDIS_PORT_6379_TCP_ADDR
// )

// APPROACH 2: Using host entries created by Docker in /etc/hosts (RECOMMENDED)
//var client = redis.createClient('6379', 'redis')

app.get('/', function (req, res, next) {
	var pjson = require('./package.json');
	res.send('hello cross users ' + pjson.version);
})

app.get('/redis', function (req, res, next) {
	client.incr('counter', function (err, counter) {
		if (err) return next(err)
		res.send('This page has been viewed ' + counter + ' times!')
	})
	//res.send('This page has been viewed ' + counter + ' times!')
})

/* http.createServer(app).listen(process.env.PORT || 8080, function () {
  console.log('Listening on port ' + (process.env.PORT || 8080))
}) */


//connectDb(function () {
	logger.info('connect mongodb success .......');
	var server = appBuilder.run(function () {
		const addr = server.address();
		logger.info('the server is running and listening at ' + addr.port);
	});
//});