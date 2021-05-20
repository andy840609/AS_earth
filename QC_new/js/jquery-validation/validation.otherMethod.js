$.validator.addMethod("EngNum", function (value, element) {
    //console.log('Eng=',value);
    return this.optional(element) || /^[\w]+$/.test(value);

}, 'Only number and english characters');
$.validator.addMethod("phone", function (value, element) {
    //console.log('Eng=',value);
    return this.optional(element) || /^[0123456789+]+$/.test(value);

}, 'Only number');
$.validator.addMethod("Emailcheck", function (value, element) {
    //console.log('email=',value);
    function checkemail(email) {
        var url = "./php/checkEmailRepeat.php";
        $.ajax({
            type: 'POST',
            data: {
                'Email': email
            },
            url: url,
            async: false,
            success: function (data) {
                //console.log("email check return:"+data+"\n");
                if (data == 1) {
                    checkstr = true;
                } else {
                    checkstr = false;
                }
            }
        });
        return checkstr;
    }
    return checkemail(value);

}, 'This mail is duplicated.');
$.validator.addMethod("Emailcheckfalse", function (value, element) {
    //console.log('email=',value);
    function checkemail(email) {
        var url = "./php/checkEmailRepeat.php";
        $.ajax({
            type: 'POST',
            data: {
                'Email': email
            },
            url: url,
            async: false,
            success: function (data) {
                console.log("email check false return:" + data + "\n");
                if (data == 1) {
                    checkstr = false;
                } else {
                    checkstr = true;
                }
            }
        });
        return checkstr;
    }
    return checkemail(value);

}, 'This mail not found.');
$.validator.addMethod("nowEmail", function (value, element) {
    //console.log('email=',value);
    function checkemail(email) {
        var url = "./php/checkCurrentAccount.php";
        $.ajax({
            type: 'POST',
            data: {
                'Email': email
            },
            url: url,
            async: false,
            success: function (data) {

                if (data == 1) {
                    checkstr = true;
                } else {
                    checkstr = false;
                }
            }
        });
        return checkstr;
    }
    return checkemail(value);

}, 'This mail is not consistent with login account.');
$.validator.addMethod("checkCode", function (value, element) {

    function checkcode(code) {

        var url = "./php/checkcode.php";
        $.ajax({
            type: 'POST',
            data: {
                'code': code
            },
            url: url,
            async: false,
            success: function (data) {
                if (data == 0) {
                    checkstr = false;
                } else if (data == 1) {
                    checkstr = true;
                }
            }
        });
        return checkstr;
    }
    console.log('code=', value);
    return checkcode(value);
}, 'Not correct!');
$.validator.addMethod("notEqual", function (value, element, param) {
    return this.optional(element) || value != $(param).val();
}, "This has to be different");
$.validator.addMethod("validDate", function (value, element) {
    // console.log('valdate', value);
    return this.optional(element) || moment(value, "YYYY-MM-DD", true).isValid();
}, "Please enter a valid date in the format YYYY-MM-DD");
$.validator.addMethod("validTime", function (value, element) {
    return this.optional(element) || moment(value, "HH:mm:ss", true).isValid();
}, "Please enter a valid date in the format HH:mm:ss");
$.validator.addMethod("validDatetime", function (value, element) {
    return this.optional(element) || moment(value, "YYYY-MM-DDTHH:mm:ss", true).isValid();
}, "Please enter a valid date in the format YYYY-MM-DDTHH:mm:ss");
$.validator.addMethod("checkStationStr", function (value, element) {
    function checkStationStr(str) {
        var url = "./php/checkStationStr.php";
        var nw = $('#network').val();
        var strrt = ajaxGetData(url, { data: { str: str, nw: nw } });
        if (strrt.status == 1) {
            return true;
        } else if (str == "all") {
            return true;
        } else {
            return false;
        }
        console.log(strrt);
    }
    return checkStationStr(value);
    console.log('station string=', value);
    //return checkcode(value);
}, 'Please enter a right station code and sperate each by ,');
$.validator.addMethod("checkStation", function (value, element) {
    function checkStationStr(str) {
        var url = "./php/checkStationStr.php";
        var nw = $('#network').val();
        var strrt = ajaxGetData(url, { data: { str: str, nw: nw, one: 1 } });
        if (strrt.status == 1) {
            return true;
        } else {
            return false;
        }
        console.log(strrt);
    }
    return checkStationStr(value);
    console.log('station string=', value);
    //return checkcode(value);
}, 'Please enter a right station code.');

