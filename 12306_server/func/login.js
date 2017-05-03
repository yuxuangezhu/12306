var express = require('express');
var app = express();
var request = require('request');
var evildns = require('evil-dns');
var path = require('path');
var request = request.defaults({
    jar: true
});
var bodyParser = require('body-parser');
var headerBase = [{
        type: '*',
        value: ''
    }, {
        type: '/js/*',
        value: 'application/json;charset=utf-8'
    }, {
        type: '/css/*',
        value: 'text/css;charset=utf-8'
    }]
    //设置跨域限制
headerBase.forEach(function(v, i) {
    app.all(v.type, function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        res.header("X-Powered-By", ' 3.2.2');
        if (v.value) {
            res.header("Content-Type", v.value);
        }
        next();
    });
})

var goLogin = {
    goLogin: function(code, cb) {
        var _this = this;
        console.log(123)
        var path = 'https://kyfw.12306.cn/otn/passcodeNew/checkRandCodeAnsyn';
        request.post({
            url: path,
            rejectUnauthorized: false, // 忽略安全警告
            form: {
                'rand': 'sjrand',
                'randCode': code
            }
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var msg = JSON.parse(body);
                console.log(body)
                cb(msg)
            }
        })
    },
    login: function(parm, cb) {
        var _this = this;
        console.log(1, parm)
        try {
            var path = 'https://kyfw.12306.cn/otn/login/loginAysnSuggest';
            request.post({
                url: path,
                rejectUnauthorized: false, // 忽略安全警告
                form: {
                    'loginUserDTO.user_name': parm.user,
                    'userDTO.password': parm.pass,
                    'randCode': parm.code
                }
            }, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var msg = JSON.parse(body);
                    msg.cookie = response.headers['set-cookie'];
                    console.log(response.headers)
                    cb(msg)
                }
            })
        } catch (e) {
            cb({
                status: false,
                msg: 'catch error'
            })
        }
    }
}


module.exports = goLogin