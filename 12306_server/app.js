var express = require('express');
var app = express();
var request = require('request');
var login = require('./func/login');
var submit = require('./func/submit');
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

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

//var Router = express.Router();
var tool = express.Router();
var common = {
    getLoginCookie: function(cb) {
        request({
            url: 'https://kyfw.12306.cn/otn/login/init',
            rejectUnauthorized: false, // 忽略安全警告
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var cookies = response.headers['set-cookie']
                cb({
                    status: true,
                    msg: 'ok'
                })
            }
        })
    },
    getImg: function(res) {
        var url = 'https://kyfw.12306.cn/otn/passcodeNew/getPassCodeNew?module=login&rand=sjrand&' + Math.random();
        request({
            url: url,
            rejectUnauthorized: false
        }).pipe(res);
    },
    getPassengerDTOs: function(cb) {
        var path = 'https://kyfw.12306.cn/otn/confirmPassenger/getPassengerDTOs';
        request.post({
            url: path,
            rejectUnauthorized: false, // 忽略安全警告
            form: {
                '_json_att': '',
                // 'REPEAT_SUBMIT_TOKEN': parm.token
            }
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var msg = JSON.parse(body);
                cb(msg)
            }
        })

    },
    //  1查票
    queryTicket: function(parm, cb) {
        //url: 'https://kyfw.12306.cn/otn/leftTicket/queryA?leftTicketDTO.train_date=' + start_time + '&leftTicketDTO.from_station=' + start_code + '&leftTicketDTO.to_station=' + end_code + '&purpose_codes=ADULT',
        request({
            url: 'https://tool.itbugs.cn/js/api/getTicket?train_date=' + parm.start_time + '&from_station=' + parm.start_code + '&to_station=' + parm.end_code + '&purpose_codes=ADULT',
            rejectUnauthorized: false, // 忽略安全警告
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                console.log(data)
                if (data.status) {
                    var msg = [];
                    data.data.forEach(function(v, i) {
                        if (train_code.indexOf(v.queryLeftNewDTO.station_train_code) != -1 && !!v.secretStr) {
                            var num = v.queryLeftNewDTO;
                            if (num.ze_num != '无' || num.yw_num != '无' || num.yz_num != '无' || num.ze_num != '--' || num.yw_num != '--' || num.yz_num != '--') {
                                msg.push(v)
                            }
                        }
                    })
                    cb(msg)
                } else {
                    console.log(data.messages)
                    console.log('error: 5s replay');
                    setTimeout(goToQuery, 5000)
                }
            }
        })
    },
    //  2查询登陆 
    checkUser: function(cb) {
        var path = 'https://kyfw.12306.cn/otn/login/checkUser';
        request.post({
            url: path,
            rejectUnauthorized: false, // 忽略安全警告
            form: {
                '_json_att': ''
            }
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var msg = JSON.parse(body);

                cb(msg)
            }
        })
    },
    // 提交
    goToSubmit: function(msg) {
        submit.submitOrderRequest(msg, function() {

        })
    }
}
tool.get('/api/getImgCode', function(req, res) {
    common.getImg(res)
})

tool.get('/api/goLogin', function(req, res) {
    common.getLoginCookie(function(data) {
        res.send(data)
    })
})
tool.post('/api/checkCode', function(req, res) {
    var code = req.body.code;
    login.goLogin(code, function(msg) {
        if (msg.status && msg.data.result == 1) {
            login.login(req.body, function(data) {
                if (data.status && data.data.loginCheck == 'Y') {
                    //res.send(msg)
                    common.getPassengerDTOs(function(msg) {
                        if (msg.status) {
                            msg.cookie = data.cookie;
                            res.send(msg)
                        } else {
                            res.send(msg)
                        }
                    })
                } else {
                    res.send(msg)
                }
            });
        } else {
            res.send(msg)
        }
    })
})

// 车票查询
tool.get('/api/getTicket', function(req, res) {
    evildns.add('kyfw.12306.cn', '101.227.102.198');
    try {
        var train_date = req.query.train_date;
        var from_station = req.query.from_station;
        var to_station = req.query.to_station;
        var purpose_codes = req.query.purpose_codes;
        var url = 'leftTicket/query';
        getQuery(url);

        function getQuery(url) {
            var options = {
                url: 'https://kyfw.12306.cn/otn/' + url + '?leftTicketDTO.train_date=' + train_date + '&leftTicketDTO.from_station=' + from_station + '&leftTicketDTO.to_station=' + to_station + '&purpose_codes=' + purpose_codes,
                rejectUnauthorized: false
            };
            request(options, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    try {
                        body = JSON.parse(body);
                        if (body.status) {
                            res.send(body);
                        } else if (body.c_url) {
                            getQuery(body.c_url)
                        } else {
                            getQuery(url)
                        }
                    } catch (e) {
                        getQuery(url)
                    }
                } else {
                    res.send([error, response, body]);
                }
            })
        }
    } catch (e) {
        res.send(['www', e]);
    }
})

app.use('/js', tool);
console.log('Service has been started！');
module.exports = app;