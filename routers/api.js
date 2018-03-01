var express = require('express')
var router = express.Router()
var User = require('../models/User')

//定义统一返回格式
var reponseData;
router.use((req,res,next)=>{
	reponseData = {
		code:0,
		msg:''
	}
	next();
})

//注册
router.post('/user/register',(req,res,next)=>{
	var username = req.body.username;
	var password = req.body.password;
	var repassword = req.body.repassword;
	var reg = /^[^<>"'$\|?~*&@(){}]*$/;
	if(username == ''){
        reponseData = {code: 1,msg: '用户名不能为空'}
        res.json(reponseData);
        return;
    }
    if(!reg.test(username)){
        reponseData = {code: 1,msg: '用户名不能含有特殊字符'}
        res.json(reponseData);
        return;
    }
    if(password == ''){
        reponseData = {code: 2,msg: '密码不能为空'}
        res.json(reponseData);
        return;
    }
    if(!reg.test(password)){
        reponseData = {code: 2,msg: '密码不能含有特殊字符'}
        res.json(reponseData);
        return;
    }
    if(repassword != password){
        reponseData = {code: 3,msg: '两次输入的密码不一致'}
        res.json(reponseData);
        return;
    }
    
    User.findOne({username}).then((userInfo)=>{
    	console.log( '=数据库查询用户是否注册返回信息='+JSON.stringify( reponseData )+'==' );
    	if(userInfo){
    		reponseData = {
    			code: 4,
    			msg: '该用户已经被注册'
    		};
    		res.json(reponseData)
    		return
    	}else{
    		var user = new User({username,password});
    		return user.save();
    	}
    }).then((newUserInfo)=>{
    	if(newUserInfo){
    		reponseData = {
   				code:0,
   				msg:'注册成功'
   			}
    		reponseData.userInfo = {
    			_id:newUserInfo._id,
    			username:newUserInfo.username
    		}
    		req.cookies.set('userInfo',JSON.stringify({
    			_id:newUserInfo._id,
    			username:newUserInfo.username
    		}));
    		res.json(reponseData);
    	}
    	console.log('用户注册保存成功'+newUserInfo)
    }).catch(()=>{})
})

//登录
router.post('/user/login',(req,res)=>{
	var username = req.body.username;
	var password = req.body.password;
	var reg = /^[^<>"'$\|?~*&@(){}]*$/;
	if(username == ''){
        reponseData = {code: 1,msg: '用户名不能为空'}
        res.json(reponseData);
        return;
    }
    if(!reg.test(username)){
        reponseData = {code: 1,msg: '用户名不能含有特殊字符'}
        res.json(reponseData);
        return;
    }
    if(password == ''){
        reponseData = {code: 2,msg: '密码不能为空'}
        res.json(reponseData);
        return;
    }
    if(!reg.test(password)){
        reponseData = {code: 2,msg: '密码不能含有特殊字符'}
        res.json(reponseData);
        return;
    }
   
    User.findOne({username,password}).then((userInfo)=>{
    	console.log( '=数据库查询用户登录返回信息='+userInfo+'==' );
   		if(userInfo){
   			reponseData = {
   				code:0,
   				msg:'登录成功'
   			}
   			reponseData.userInfo = {
   				_id:userInfo._id,
   				username:userInfo.username
   			}
   			req.cookies.set('userInfo',JSON.stringify({
   				_id:userInfo._id,
   				username:userInfo.username
   			}));
   			res.json(reponseData);
   			return
   		}else{
   			reponseData = {
   				code:3,
   				msg:'用户名或密码不正确'
   			}
   			res.json(reponseData)
   			return
   		}
   })
})

//退出登录
router.post('/user/loginOut',(req,res,next)=>{
	req.cookies.set('userInfo',null);
	res.json(reponseData)
})





module.exports = router
