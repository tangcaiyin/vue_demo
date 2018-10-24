// httpserver 静态服务器文件
var express = require('express');
var config = require('./config/index.js');
// port 定义在 /config/index.js 里，
var port = process.env.PORT || config.build.port;

// 定义路由
var app = express();
var router = express.Router();
router.get('/', function(req, res, next) {
	req.url = 'index.html'
	next();
});
app.use(router);

// 定义数据请求接口及各页面路由
var appData = require('./data.json')
var seller = appData.seller
var goods = appData.goods
var ratings = appData.ratings
// 通过路由请求数据
var apiRoutes = express.Router()

apiRoutes.get('/seller', function(req, res) {
	res.json({
	  // 此处因模拟本地数据，errno为0时才能获取数据，实际开发中需要根据情况获取
		errno: 0,
		data: seller
	});
});
apiRoutes.get('/goods', function(req, res) {
	res.json({
		errno: 0,
		data: goods
	});
});
apiRoutes.get('/ratings', function(req, res) {
	res.json({
		errno: 0,
		data: ratings
	});
});
app.use('/api', apiRoutes);

// 指向打包后生成的dist里的文件
app.use(express.static('./dist'));

module.exports = app.listen(port,function(err) {
	if (err) {
		console.log(err);
		return
	}
	console.log("Listening at http://localhost:" + port + '\n')
});
