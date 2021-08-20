$(function () {

    //$(window).scroll(function() {    
    //    var scroll = $(window).scrollTop();
    //
    //    if (scroll >= 360) {
    //		$(".nav-icon").hide();
    //       
    //    } else {
    //        $(".nav-icon").show();
    //    }
    //});
    /* set minmax filter */
    if ($.fn.dataTable !== undefined) {
        $.fn.dataTable.ext.search.push(
            function (settings, data, dataIndex) {
                var index = 0;
                var dtmin_3 = parseFloat($('#dtmin_3').val());
                var dtmax_3 = parseFloat($('#dtmax_3').val());
                var dtmin_4 = parseFloat($('#dtmin_4').val());
                var dtmax_4 = parseFloat($('#dtmax_4').val());
                var dtmin_5 = parseFloat($('#dtmin_5').val());
                var dtmax_5 = parseFloat($('#dtmax_5').val());
                var col3 = parseFloat(data[3]) || 0; // use data for the age column
                var col4 = parseFloat(data[4]) || 0;
                var col5 = parseFloat(data[5]) || 0;
                if (isNaN(dtmin_3) &&
                    isNaN(dtmax_3) &&
                    isNaN(dtmin_4) &&
                    isNaN(dtmax_4) &&
                    isNaN(dtmin_5) &&
                    isNaN(dtmax_5)) {
                    return true;
                } else if (col3 <= dtmin_3 || col3 >= dtmax_3) {
                    index = index + 1;
                } else if (col4 <= dtmin_4 || col4 >= dtmax_4) {
                    index = index + 1;
                } else if (col5 <= dtmin_5 || col5 >= dtmax_5) {
                    index = index + 1;
                }
                if (index > 0) {
                    return false;
                } else {
                    return true;
                }
            }
        );
        /*set check box check the layers*/
        $.fn.dataTable.ext.search.push(
            function (settings, data, dataIndex) {
                var network = data[1].trim();

                if ($('#check_' + network).length == 0) { return true; }
                if ($('#check_' + network).prop('checked')) {
                    return true;
                } else {
                    return false;
                }

            }
        );
    }
});
function langChange() {
    //var langList=[];
    // language list zh:繁體中文, en: english
    //
    //set defaults
    this.Lang = 'zh';
    this.dict = '';
    this.defineSeries = [];
    this.btnid = 'change-lang-btn';
    this.langList = ['zh', 'en'];

    this.addSeries = function (obj) {
        for (var i in obj) {
            this.defineSeries[i] = obj[i];
        }
    }
    this.setLanguage = function (lang) {
        //console.log("0."+this.Lang);
        //console.log('cookie 0 ='+document.cookie);
        if (lang === undefined && this._getCookieVal("lang") !== null) {
            //console.log("undefined lang/cookie lang="+this._getCookieVal("lang"));			
            this.Lang = this._getCookieVal("lang");
            //console.log('here');


            //console.log(this.Lang);
        } else if (this._getCookieVal("lang") === null || this._getCookieVal("lang") === undefined) {
            this.Lang = "zh";
        } else {
            this.Lang = lang;
        }
        //console.log(this.Lang);
        this._setCookie("lang=" + this.Lang + "; SameSite=Strict; path=/;");

        this._loadDict();

        this.changlang_include();

        if ($.validator !== undefined) {
            this.setJqueryValidate();
        }
        this.setchangbtn();


    }
    this.setchangbtn = function () {

        if ($('#' + this.btnid).length != 0) {
            var showlang = '';
            for (var i in this.langList) {
                if (this.Lang != this.langList[i]) {
                    showlang = this.langList[i];
                    break;
                }
            }
            if (showlang != '') {
                var showword = '';
                if (showlang == 'zh') {
                    showword = '中文';
                } else if (showlang == 'en') {
                    showword = 'English';
                }

                var html = '<a class="p-2 text-dark" id="' + this.btnid + '" style="font-size:1em;" href="javascript:language.setLanguage(\'' + showlang + '\');">' + showword + '</a>';
                console.log('word= ', showword, ' html=', html);
                $('#' + this.btnid).replaceWith(html);
            }

        }
    }
    this.getLanguage = function () {
        return this.Lang;
    }
    this._getCookieVal = function (name) {
        //console.log('cookie='+document.cookie);
        var items = document.cookie.split(";");

        for (var i in items) {
            var cookie = $.trim(items[i]);
            var eqIdx = cookie.indexOf("=");
            var key = cookie.substring(0, eqIdx);
            if (name == $.trim(key)) {

                if ($.trim(cookie.substring(eqIdx + 1)) !== undefined && $.trim(cookie.substring(eqIdx + 1)) != 'undefined') {
                    return $.trim(cookie.substring(eqIdx + 1));
                }


            }
        }
        return null;
    }
    function _translate(dict) {
        this.dict = dict;
        //dict=this._loadDict();
        //console.log(111,this.dict);
        $("[lang]").each(function () {
            switch (this.tagName.toLowerCase()) {
                case "input":
                    $(this).val(__tr($(this).attr("lang")));
                    break;
                default:
                    $(this).text(__tr($(this).attr("lang")));
            }
        });
        $("[lang_placeholder]").each(function () {
            $(this).attr("placeholder", __tr($(this).attr("lang_placeholder")));
        });
    }
    this._loadDict = function () {
        //var lang = (this._getCookieVal("lang") || "zh");
        if (this.Lang !== undefined && this.Lang != "") {
            var lang = this.Lang;
        } else {
            var lang = "zh";
        }

        //var url = "./js/lang/json/zh.php?callback=?";
        var dict;
        var url = "./js/lang/json/" + lang + ".json";
        //console.log(url);


        $.ajax({
            type: "GET",
            //data: options,
            async: false,
            dataType: "json",
            url: url,
            success: function (msg) {
                console.log('rt=', msg);
                dict = msg;

                _translate(dict);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(XMLHttpRequest, textStatus, errorThrown);

            }
        });

    }
    this.changlang_include = function () {
        if (this.Lang !== undefined && this.Lang != "") {
            var lang = this.Lang;
        } else {
            var lang = "zh";
        }
        defineSeries = this.defineSeries;



        //console.log(defineSeries);
		/*$('.lang-change').each(function(){
			
		});*/
        $('.lang-change').html(function () {
            var sr = $(this).attr('series').split('.');
            var ele = $(this).attr('element');


            if (sr === undefined || ele === undefined) {
                return null;
            } else {
                if (sr.length == 1) {

                    TextObject = defineSeries[sr[0]];
                } else if (sr.length == 2) {
                    TextObject = defineSeries[sr[0]][sr[1]];
                }
                //console.log('lang ele=',TextObject[ele][lang]);
                if (TextObject[ele][lang] === undefined) {
                    return null;
                } else {
                    return TextObject[ele][lang];
                }


            }


        });

    }
    this.setJqueryValidate = function () {
        var lang = (this.Lang || "zh");
        if (this.Lang !== undefined && this.Lang !== null) {
            var lang = this.Lang;
        } else {
            var lang = "zh";
        }

        if (lang == 'zh') {
            local_url = "./jquery-validation/localization/messages_zh_TW.js";
            import(local_url);
        }
        //console.log("lang="+lang+" url = "+local_url);
        //console.log(local_url);
    }
    this._setCookie = function (cookie) {
        //console.log("cookie will be:"+cookie);
        document.cookie = cookie;
        //console.log(document.cookie)
    }
    __tr = function (src) {
        //console.log(this.dict,src);
        return (this.dict[src] || src);
        //console.log(dict,src);
    }

    this.registerWords = function () {
        $("[lang]").each(function () {
            switch (this.tagName.toLowerCase()) {

                //switch (this.attr("lang")) {
                case "input":
                    $(this).attr("lang", $(this).val());

                    break;
                default:
                    $(this).attr("lang", $(this).text());

            }
        });
    }

}


function initMap_leaflet(mapid, options) {
    const map_source = "https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZmFuY3kxMDExIiwiYSI6ImNpenJ0d2I1cDAwZ20yd3BnNDN1Y3pmejIifQ.tEHvhvW79LDbjWMa4Raz4w";
    //map = L.map('map').setView([24.5, 121], 8);
    const map = L.map(mapid, {
        center: [23.5, 121],
        //maxBounds:[[20.885,119.03],[26.315,123.01]],
        //maxZoom: 15,
        minZoom: 7,
        zoom: 2,
        trackResize: true,
        //preferCanvas: true ,
        worldCopyJump: true,
        inertia: false
    }).locate();
    const Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'/*,
		noWrap: true*/
    }).addTo(map);
    const basemap = L.tileLayer(map_source, {
        maxZoom: 15,

        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +

            'Imagery  <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.streets'
    });
    const Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 15
    });
    L.control.layers({
        'Street Map (EN)': Esri_WorldStreetMap,
        'Street Map': basemap,
        //'Terrain':Stamen_TerrainBackground,
        'Esri WorldImagery': Esri_WorldImagery
    }
    ).addTo(map);
    console.log('intmap=', map);
    return map;

}
function emptyfunciton() { }
function ajaxGetData(inputurl, options) {

    var url = inputurl;
    var method = 'POST';
    var inputdata;
    var dataType = 'json';

    if (options !== undefined) {
        if (options.data !== undefined) {
            inputdata = options.data;
        }

    }

    var outdata;
    $.ajax({
        url: url,
        data: inputdata,
        method: 'POST',
        dataType: 'json',
        async: false,
        success: function (rtdata) {
            //console.log('??'+rtdata);
            outdata = rtdata;
        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, textStatus, errorThrown);
        }

    });
    return outdata;
}
function setFontSize(level) {
    var sizeArray = ['1em', '1.25em', '1.5em'];
    $('.container').css('font-size', sizeArray[level]);
}
function isFloat(val) {
    var floatRegex = /^-?\d+(?:[.,]\d*?)?$/;
    if (!floatRegex.test(val))
        return false;

    val = parseFloat(val);
    if (isNaN(val))
        return false;
    return true;
}


function toolbox(id) {
    this.id = id;
    var toolsObject = [
        {
            'id': 'tool-lock',
            'event': function () {
                var thistool = $('#' + this.id);
                thistool.children().children('input').change(function () {
                    if ($(this).prop('checked')) {
                        $('#map').css('z-index', '-500');
                    } else {
                        $('#map').css('z-index', '0');
                    }
                });
            }
        }, {
            'id': 'tool-hide',
            'event': function () {
                var thistool = $('#' + this.id);
                thistool.children().children('input').change(function () {
                    if ($(this).prop('checked')) {
                        $('#map').css('height', '250');
                    } else {
                        $('#map').css('height', '650');
                    }
                    map.invalidateSize();
                    detectmap();
                });


            }
        }, {
            'id': 'tool-min',
            'event': function () {
                var thistool = $('#' + this.id);
                thistool.children().children('input').change(function () {
                    if ($(this).prop('checked')) {
                        $('#map').hide();
                    } else {
                        $('#map').show();
                    }
                });
            }
        }
    ];

    //console.log(toolsObject);

    this.install = function () {
        //console.log(this.id);

        for (var i in toolsObject) {
            if (toolsObject[i].id === undefined) { return false; }
            console.log(toolsObject[i]);
            //$("#"+toolsObject[i].id).children().append("<text></text>");
            //$("#"+toolsObject[i].id).children().children('text').html(toolsObject[i].offContent);
            $("#" + toolsObject[i].id).children().children('text#tool-off').show();

            $("#" + toolsObject[i].id).children().children('input').change(function () {
                console.log('show=', $(this).prop('checked'));
                $(this).parent().children('.tool-content').hide();
                if ($(this).prop('checked')) {
                    console.log('on', 11);

                    $(this).parent().children('#tool-on').show();

                } else {
                    console.log('off');

                    $(this).parent().children('#tool-off').show();
                }
            });
            if (toolsObject[i].event !== undefined) {
                toolsObject[i].event();
            }

        }
    }

    $(this.id + ' > .tool-btn').change(function () {
        console.log($(this).prop('checked'));
        console.log($(this).parent())
    });
    this.addbtn = function (obj) {
        toolsObject.push(obj);
        console.log(toolsObject);
    }

    this.install();
}

function split(val) {
    return val.split(/,\s*/);
}
function extractLast(term) {
    return split(term).pop();
}
function empty() { }
function getDate(element) {
    var date;
    try {
        date = $.datepicker.parseDate(dateFormat, element.value);
    } catch (error) {
        date = null;
    }

    return date;
}
function ShowAlert(options) {
    if (language.getLanguage() == 'en') {
        var success_msg = "Success";
        var error_msg = "Failed, please try again later";
        var skip_btn = "OK";
        var check_btn = "Check error message";
    } else {
        var success_msg = "成功";
        var error_msg = "失敗, 請確認欄位正確性後再試一次";
        var skip_btn = "確定";
        var check_btn = "查看錯誤訊息";
    }
    var success_page = "./index.php";
    var failed_page = "./index.php";
    if (options.rtdata !== undefined) {
        var rtdata = options.rtdata;
    } else {
        var rtdata = [];
    }
    if (options.success_page !== undefined) {
        success_page = options.success_page;
    }
    if (options.failed_page !== undefined) {
        failed_page = options.failed_page;
    }

    if (rtdata['status'] == 1) {
        Swal.fire({
            icon: 'success',
            title: success_msg
        }).then((result) => {
            window.location.href = success_page;
        });
    } else {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-secondary',
                cancelButton: 'btn btn-primary'
            },
            buttonsStyling: false
        });

        swalWithBootstrapButtons.fire({
            title: error_msg,
            icon: 'error',
            showCancelButton: true,
            confirmButtonText: check_btn,
            cancelButtonText: skip_btn,
            reverseButtons: true
        }).then((result) => {
            if (result.value) {
                swalWithBootstrapButtons.fire(
                    'error code',
                    rtdata['error_code'],
                    'warning'
                ).then((result) => {
                    if (failed_page != 'none') {
                        window.location.href = failed_page;
                    }

                });
                if (failed_page != 'none') {
                    setTimeout(function () { window.location.href = failed_page; }, 5000);
                }
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                if (failed_page != 'none') {
                    window.location.href = failed_page;
                }
            }
        });
    }


}
function checkinv(stdate, eddate, interval) {
    var sttime = new Date(stdate);
    var edtime = new Date(stdate);
    sttime = sttime.getTime();
    edtime = edtime.getTime();
    var diff = Math.round((edtime - sttime) / (1000 * 60 * 60 * 24));
    if (diff > interval) {
        return false;
    } else {
        return true;
    }
}