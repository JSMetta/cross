require('dotenv').config();
const connectDb = require('@finelets/hyper-rest/db/mongoDb/ConnectMongoDb'),
	appBuilder = require('@finelets/hyper-rest/express/AppBuilder').begin(__dirname),
	logger = require('@finelets/hyper-rest/app/Logger'),
	cors = require('cors'),
	upload = require('multer')({
		dest: 'uploads/'
	});

const path = require('path'),
	restDir = path.join(__dirname, './server/rests'),
	resourceDescriptors = require('@finelets/hyper-rest/rests/DirectoryResourceDescriptorsLoader')(restDir),
	resourceRegistry = require('@finelets/hyper-rest/rests/ResourceRegistry'),
	graph = require('./server/StateGraph'),
	transitionsGraph = require('@finelets/hyper-rest/rests/BaseTransitionGraph')(graph, resourceRegistry);

resourceRegistry.setTransitionGraph(transitionsGraph);

/* var app = appBuilder.getApp();
app.use(cors()) */

appBuilder
	.setWebRoot('/cross/root', './client')
	.setFavicon('client/imgs/favicon.jpg')
	.setResources(resourceRegistry, resourceDescriptors.loadAll())
	.end();

/* app.post("/cross/purchases/csv", upload.single('purchases.csv'), function(req, res) {
	logger.debug('begin to upload')
	var data = req.file
	logger.info(JSON.stringify(data))
	res.send(data)
}) */

connectDb(function () {
	logger.info('connect mongodb success .......');
	var server = appBuilder.run(function () {
		const addr = server.address();
		logger.info('the server is running and listening at ' + addr.port);
	});
});