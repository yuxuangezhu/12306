var trainNo = ['K52', 'K1912'],
    people = [''],
    trainDate = '2017-01-25',
    seatType = '3',
    train_type = ['G', 'C', 'D', 'g', 'c', 'd'],
    fromStation = '北京',
    toStation = '';
$('body').html('').append('<iframe id="iframe" style="width:100%; height:500px;" src="https://kyfw.12306.cn/otn/leftTicket/init"></iframe>')
$('body').append('<script id="socketIo" src="https://cdn.socket.io/socket.io-1.4.5.js"></script>')

setTimeout(socket_go, 2000)

function socket_go() {
    try {
        socket = io('http://localhost');
        socket.on('client', function(data) {
            console.log(data);
            submit(data)
        });
        emit('addTicket', {
            trainNo: trainNo,
            trainDate: trainDate,
            seatType: seatType,
            fromStation: fromStation,
            toStation: toStation
        })

    } catch (e) {
        setTimeout(socket_go, 2000)
    }
}

function emit(type, data) {
    socket.emit('event', {
        data: {
            type,
            data
        }
    })
}

function submit(str) {
    var child = document.getElementById('iframe').contentWindow;
    child.checkG1234(str.secretStr, str.strat_time, train_no, from_station_telecode, to_station_telecode)
    check_initDc(str)
}

function check_initDc(data) {
    if (!$('iframe').contents().find('#normal_passenger_id')) {
        setTimeout(function() {
            check_initDc(data)
        }, 2000)
    } else {
        select(data, people)
    }
}

function select(data, arr) {
    var peo = $('iframe').contents().find('#normal_passenger_id li');
    for (var i = 0; i < peo.length; i++) {
        var name = $(peo[i]).find('label').text();
        if (arr.indexOf(name) != -1) {
            $(peo[i]).find('label').click();
        }
    }
    if (train_type.indexOf(queryLeftNewDTO.station_train_code[0]) == -1) {

    } else {
        $('iframe').contents().find('#seatType_1 [value="' + seatType + '"]').attr('selected')
    }
    $('iframe').contents().find('#submitOrder_id').click();
    if ($('iframe').contents().find('.yzm').css('display') == 'none' && $('iframe').contents().find('#sy_ticket_num_id strong').text() > 0) {
        $('iframe').contents().find('#qr_submit_id').click()
    }
}

function checkUser(cb) {
    $.ajax({
        url: 'https://kyfw.12306.cn/otn/login/checkUser',
        method: 'POST',
        data: {
            '_json_att': '' //空字符串
        },
        success: function(data) {
            console.log(data)
            if (!data.data.flag) {
                goTologin()
            } else {
                setTimeout(checkUser, 30000)
            }
        },
        error: function(e) {
            console.log(e);
        }
    })
}

function goTologin() {
    $('body').append('<iframe class="imgCode" src="https://kyfw.12306.cn/otn/login/init" style="display: none;"></iframe>')
    var user = 'yuxuangezhu';
    var key = '';
    $('body').append('<div class="tip imgCode" style="position: fixed;top: 330px;left: 20px;"></div>');

    changeImg();

    function changeImg() {
        $('.tip').html('<img src="https://kyfw.12306.cn/otn/passcodeNew/getPassCodeNew?module=login&rand=sjrand&' + Math.random() + '" class="codeImg">');
        $('.codeImg').on('load', function() {
                setTimeout(go, 500)
            })
            // setTimeout(go, 1000)
    }

    function go() {
        var arr = prompt("请输入验证码:");
        var code = getCode(arr.split(''));
        checkRandCode(code, function(data) {
            if (data.data.msg == 'TRUE') {
                login(code);
            } else {
                changeImg();
            }
        })
    }

    function login(code) {
        $.ajax({
            url: 'https://kyfw.12306.cn/otn/login/loginAysnSuggest',
            method: 'POST',
            data: {
                'loginUserDTO.user_name': user,
                'userDTO.password': key,
                'randCode': code
            },
            success: function(data) {
                console.log(data)
                if (data.data.loginCheck == 'Y') {
                    $('.imgCode').remove();
                }
            },
            error: function(e) {
                console.log(e);
            }
        })
    }

    function checkRandCode(code, cb) {
        $.ajax({
            url: 'https://kyfw.12306.cn/otn/passcodeNew/checkRandCodeAnsyn',
            method: 'POST',
            data: {
                'rand': 'sjrand',
                'randCode': code
            },
            success: function(data) {
                console.log(data)
                cb(data);
            },
            error: function(e) {
                alert(e)
                console.log(e);
            }
        })
    }

    function getCode(arr) {
        var code = '';
        arr.forEach(function(v, i) {
            var random = parseInt(50 * Math.random());
            switch (v) {
                case '1':
                    code = code + (5 + random) + ',' + (30 + random) + ','
                    break;
                case '2':
                    code = code + (75 + random) + ',' + (30 + random) + ','
                    break;
                case '3':
                    code = code + (145 + random) + ',' + (30 + random) + ','
                    break;
                case '4':
                    code = code + (215 + random) + ',' + (30 + random) + ','
                    break;
                case '5':
                    code = code + (5 + random) + ',' + (100 + random) + ','
                    break;
                case '6':
                    code = code + (75 + random) + ',' + (100 + random) + ','
                    break;
                case '7':
                    code = code + (145 + random) + ',' + (100 + random) + ','
                    break;
                case '8':
                    code = code + (215 + random) + ',' + (100 + random) + ','
                    break;
                default:
                    console.log('no code')
            }
        })
        return code
    }
}