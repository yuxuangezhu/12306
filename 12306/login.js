(function goTologin() {
    $('body').append('<iframe src="https://kyfw.12306.cn/otn/login/init" style="display: none;"></iframe>')
    var user = '';
    var key = '';
    $('body').append('<div class="tip" style="position: fixed;top: 330px;left: 20px;"></div>');

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
                    window.location.href = window.location.href;
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
})()