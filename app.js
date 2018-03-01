/*
 应用程序的启动（入口）文件
 * */

//加载express模块
var express = require('express');

//加载模板处理模块
var swig = require('swig');


/*
 * 启动数据库 cmd 指令：
* $ cd C:\Program Files\MongoDB\Server\3.4\bin
* $ mongod --dbpath=E:\mycode\nodejs\glob\db --port=27018
*/
var bodyParser = require('body-parser')

var User =  require('./models/User')

//创建app应用=>Nodejs Http.createServer();
var app = express();

//cookies
var Cookies = require('cookies');

//加载数据库模块
var mongoose = require('mongoose')


//设置静态文件托管
//当用户访问的url以/public开始，那么直接返回对应__dirname + '/public'下的文件
app.use('/public', express.static(__dirname + '/public'));

//配置应用模板
//定义当前应用所使用的模板引擎
//第一个参数：模板引擎的名称，同时也是模板文件的后缀，第二个参数表示用于解析处理模板内容的方法
app.engine('html', swig.renderFile);

//设置模板文件存放的目录，第一个参数必须是views，第二个参数是目录
app.set('views', './views')

//注册所使用的模板引擎，第一个参数必须是view engine，第二个参数和app.engine这个方法中定义的模板引擎的名称（第一个参数）是一致的
app.set('view engine', 'html');

//开发过程中，需要取消模板缓存
swig.setDefaults({
	cache: false
});

app.use(bodyParser.urlencoded({extended:true}))

//设置Cookies
app.use((req,res,next)=>{
	req.cookies = new Cookies(req,res);
	req.userInfo = {};
	if(req.cookies.get('userInfo')){
		try{
			req.userInfo = JSON.parse(req.cookies.get('userInfo'));
			User.findById(req.userInfo._id).then((userInfo)=>{
				req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
				next();
			})
		}catch(err){
			next();
		}
	}else{
		next();
	}
})



/*首页
 * req  request对象
 * res  response对象
 * next  函数
 * */

/*
 * 根据不同的功能划分模块
 * */

app.use('/admin', require('./routers/admin'))
app.use('/api', require('./routers/api'))
app.use('/', require('./routers/main'))

mongoose.connect('mongodb://localhost:27018/blog', function(err) {
	if(err) {
		console.log('数据库连接失败')
	} else {
		console.log('数据库连接成功')
		//监听http请求
		app.listen(8088);
	}
});

//用户发送http请求 -> url -> 解析路由 -> 找到匹配的规则 -> 执行指定的绑定函数，返回对应内容至用户

//   /public -> 静态 -> 直接读取指定目录下的文件,返回给用户

//   -> 动态 -> 处理业务逻辑,加载模板,解析模板, -> 返回数据给用户