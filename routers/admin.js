var express = require('express')
var router = express.Router()

var User = require('../models/User')
var Category = require('../models/Category')

router.use(function(req, res, next) {
	if(!req.userInfo.isAdmin) {
		res.send('只有管理员才可以进入后台管理')
		return;
	}
	next()
})

//后台首页
router.get('/', function(req, res, next) {
	res.render('admin/index', {
		userInfo: req.userInfo
	})
})

//用户管理
router.get('/user', (req, res) => {

	/*从数据库中读取所有的用户数据
	 *
	 * limit(Number):限制获取的数据条数
	 * 
	 * skip(2):忽略数据的条数
	 * 
	 * 每页显示2条
	 * 第一页：1-2  skip:0 -> (当前页-1)*limit
	 * 第二页：3-4  skip:2
	 * */

	var page = Number(req.query.page) || 1;
	var limit = 10;
	var pages = 0;
	User.count().then((count) => {

		//计算总页数
		pages = Math.ceil(count / limit);
		//取值不能超过pages
		page = Math.min(page, pages);
		//取值不能小于1
		page = Math.max(page, 1);

		var skip = (page - 1) * limit;

		User.find().limit(limit).skip(skip).then((users) => {
			res.render('admin/user_index', {
				userInfo: req.userInfo,
				users: users,
				count: count,
				pages: pages,
				limit: limit,
				page: page
			})
		});
	})

})

//分类首页
router.get('/category', (req, res) => {

	var page = Number(req.query.page) || 1;
	var limit = 10;
	var pages = 0;
	Category.count().then((count) => {

		//计算总页数
		pages = Math.ceil(count / limit);
		//取值不能超过pages
		page = Math.min(page, pages);
		//取值不能小于1
		page = Math.max(page, 1);

		var skip = (page - 1) * limit;

		Category.find().limit(limit).skip(skip).then((categories) => {
			res.render('admin/category_index', {
				userInfo: req.userInfo,
				categories: categories,
				count: count,
				pages: pages,
				limit: limit,
				page: page
			})
		});
	})
})

//分类的添加
router.get('/category/add', (req, res) => {
	res.render('admin/category_add', {
		userInfo: req.userInfo
	})
})

//分类的保存
router.post('/category/add', (req, res) => {
	var name = req.body.name || '';
	if(name == '') {
		res.render('admin/error', {
			userInfo: req.userInfo,
			msg: '名称不能为空',
			url: ''
		})
		return;
	}

	//数据库中是否已经存在同名分类名称
	Category.findOne({
		name: name
	}).then((rs) => {
		if(rs) {
			//数据库中已经存在该分类
			res.render('admin/error', {
				userInfo: req.userInfo,
				msg: '分类已经存在'
			})
			return Promise.reject()
		} else {
			return new Category({
				name: name
			}).save()
		}
	}).then((newCategory) => {
		res.render('admin/success', {
			userInfo: req.userInfo,
			msg: '分类保存成功',
			url: '/admin/category'
		})
	})
})

//分类的修改
router.get('/category/edit', (req, res) => {
	//获取要修改的分类的信息，并且用表单的形式展现出来
	var id = req.query.id || '';
	//获取要修改的分类信息
	Category.findOne({
		_id: id
	}).then((category) => {
		if(!category) {
			res.render('admin/error', {
				userInfo: req.userInfo,
				msg: '分类信息不存在'
			})
			return Promise.reject();
		} else {
			res.render('admin/category_edit', {
				userInfo: req.userInfo,
				category: category
			})
		}
	})
})

//分类的修改保存
router.post('/category/edit', (req, res) => {
	//获取要修改的分类的信息，并且用表单的形式展现出来
	var id = req.query.id || '';
	//获取post提交过来的名称
	var name = req.body.name;

	//获取要修改的分类信息
	Category.findOne({
		_id: id
	}).then((category) => {
		if(!category) {
			res.render('admin/error', {
				userInfo: req.userInfo,
				msg: '分类信息不存在'
			})
			return Promise.reject();
		} else {
			//当用户没有做任何的修改提交时
			if(name == category.name) {
				res.render('admin/success', {
					userInfo: req.userInfo,
					msg: '并未做任何修改',
					url: '/admin/category'
				})
				return Promise.reject();
			} else {
				//要修改的分类名称是否已经在数据库中存在
				return Category.findOne({
					_id: {
						$ne: id
					},
					name: name
				})
			}
		}
	}).then((sameCategory) => {
		if(sameCategory) {
			res.render('admin/error', {
				userInfo: req.userInfo,
				msg: '数据库中已经存在同名分类'
			})
			return Promise.reject();
		} else {
			return Category.update({
				_id: id
			}, {
				name: name
			})
		}
	}).then(() => {
		res.render('admin/error', {
			userInfo: req.userInfo,
			msg: '修改成功',
			url: '/admin/category'
		})
	})
})

//分类的删除
router.get('/category/delete',(req,res)=>{
	var id = req.query.id || '';
	Category.remove({
		_id:id
	}).then(()=>{
		res.render('admin/success',{
			userInfo:req.userInfo,
			msg:'删除成功',
			url:'/admin/category'
		})
	})
})

module.exports = router