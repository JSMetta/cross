require('dotenv').config();
const connectDb = require('@finelets/hyper-rest/db/mongoDb/ConnectMongoDb'),
	appBuilder = require('@finelets/hyper-rest/express/AppBuilder').begin(__dirname),
	logger = require('@finelets/hyper-rest/app/Logger'),
	crossMessageCenter = require('./server/CrossMessageCenter'),
	mcConfig = require('./server/CrossMessageCenterConfig'),
	cors = require('cors'),
	path = require('path'),
	restDir = path.join(__dirname, './server/rests'),
	graph = require('./server/StateGraph'),
	rests = require('@finelets/hyper-rest/rests')(restDir, graph);

var app = appBuilder.getApp();
app.use(cors())

app.post('/cross/login', function (req, res) {
	logger.debug('client login !');
	res.json({name: 'foo'});
});

appBuilder
	.setWebRoot('/cross/root', './client')
	.setFavicon('client/imgs/favicon.jpg')
	.setResources(...rests)
	.end();

connectDb(function () {
	logger.info('connect mongodb success .......');
	return crossMessageCenter.start(mcConfig)
		.then(() => {
			var server = appBuilder.run(function () {
				const addr = server.address();
				logger.info('the server is running and listening at ' + addr.port);
			});
		})
});