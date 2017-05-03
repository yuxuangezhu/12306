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

var submit = {
    //  3预提交 
    submitOrderRequest: function(msg, cb) {
        var path = 'https://kyfw.12306.cn/otn/leftTicket/submitOrderRequest';
        request.post({
            url: path,
            rejectUnauthorized: false, // 忽略安全警告
            form: {
                'secretStr': decodeURIComponent(msg.secretStr), //从查票中获得data.secretStr
                'train_date': msg.start_time, //订票日期
                'back_train_date': msg.end_time, //返程日期
                'tour_flag': 'dc',
                'purpose_codes': 'ADULT',
                'query_from_station_name': msg.start, //出发站
                'query_to_station_name': msg.end, //目的站
                'undefined': '' //空字符串
            }
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                console.log(data)
                if (data.status) {
                    cb()
                }
            }
        })
    },
    // 4获取参数 
    initDc: function(cb) {
        var path = 'https://kyfw.12306.cn/otn/confirmPassenger/initDc';
        request.post({
            url: path,
            rejectUnauthorized: false, // 忽略安全警告
            form: {
                '_json_att': '' //空字符串
            }
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var token = body.match(/globalRepeatSubmitToken\s?=\s?'([^']*)'/)[1];
                var parm = JSON.parse(body.match(/ticketInfoForPassengerForm\s?=\s?({'[^;]*'});/)[1].replace(/'/g, '"'));
                parm.token = token;
                cb(parm)
            }
        })
    },
    //  5检测是否可以确认提交
    checkOrderInfo: function(parm, cb) {
        var path = 'https://kyfw.12306.cn/otn/confirmPassenger/checkOrderInfo';
        request.post({
            url: path,
            rejectUnauthorized: false, // 忽略安全警告
            form: {
                'cancel_flag': '2',
                'bed_level_order_num': '000000000000000000000000000000',
                'passengerTicketStr': parm.ticketStr,
                'oldPassengerStr': parm.passengerStr,
                'tour_flag': parm.tour_flag,
                'randCode': '',
                '_json_att': '',
                'REPEAT_SUBMIT_TOKEN': parm.token
            }
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                console.log(data)
                if (data.status) {
                    cb();
                }
            }
        })
    },
    //  6查询剩余车票
    getQueueCount: function(train_info, cb) {
        var path = 'https: //kyfw.12306.cn/otn/confirmPassenger/getQueueCount';
        request.post({
            url: path,
            rejectUnauthorized: false, // 忽略安全警告
            form: {
                'train_date': new Date(start_time),
                'train_no': '26000K772612',
                'stationTrainCode': 'K7727',
                'seatType': '3',
                'fromStationTelecode': 'BXP',
                'toStationTelecode': 'TJP',
                'leftTicket': '2h7qSNHXlHRH8TpNTvpJWg02TACk1rmt2F38OT%2BsFywmCBvj',
                'purpose_codes': '00',
                'train_location': 'P2',
                '_json_att': '',
                'REPEAT_SUBMIT_TOKEN': '767671cc61bd5e54276ffe3895e179b0'
            }
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                console.log(data)
                if (data.status) {
                    cb();
                }
            }
        })
    },

    //  7提交 
    confirmSingleForQueue: function(parm, cb) {
        var path = 'https://kyfw.12306.cn/otn/confirmPassenger/confirmSingleForQueue';
        request.post({
            url: path,
            rejectUnauthorized: false, // 忽略安全警告
            form: {
                'passengerTicketStr': parm.ticketStr,
                'oldPassengerStr': parm.passengerStr,
                'randCode': '',
                'purpose_codes': parm.purpose_codes,
                'key_check_isChange': parm.key_check_isChange,
                'leftTicketStr': parm.leftTicketStr,
                'train_location': parm.train_location,
                'choose_seats': '',
                'seatDetailType': '000', // 铺位 000随机，003上铺，020中铺，100下铺(待验证) 
                'roomType': '00',
                'dwAll': 'N',
                '_json_att': '',
                'REPEAT_SUBMIT_TOKEN': parm.token
            }
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                console.log(data)
                if (data.status) {
                    cb(data);
                }
            }
        })
    },

    //  8提交结果 
    queryOrderWaitTime: function(cb) {
        var path = 'https://kyfw.12306.cn/otn/confirmPassenger/queryOrderWaitTime';
        request({
            url: path,
            rejectUnauthorized: false, // 忽略安全警告
            form: {
                'random': Math.random(),
                'tourFlag': 'dc',
                'REPEAT_SUBMIT_TOKEN': ''
            }
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                console.log(data)
                if (data.status) {
                    cb(data);
                }
            }
        })
    },

    //  9查询订单  
    queryMyOrderNoComplete: function(cb) {
        var path = 'https://kyfw.12306.cn/otn/queryOrder/queryMyOrderNoComplete';
        request.post({
            url: path,
            rejectUnauthorized: false, // 忽略安全警告
            form: {
                '_json_att': '', //空字符串
            }
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                console.log(data)
                if (data.status) {
                    cb(data);
                }
            }
        })
    }

}


module.exports = submit