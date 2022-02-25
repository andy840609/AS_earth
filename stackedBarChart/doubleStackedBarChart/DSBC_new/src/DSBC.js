function DSBC() {

    var selector = 'body';
    var data = [];
    var dataString = {};

    chart.selector = (value) => {
        selector = value;
        return chart;
    };
    chart.data = (value) => {
        console.log(value);
        let copyObj = JSON.parse(JSON.stringify(value));//不影響原資料
        let dataType = typeof (copyObj);
        console.log(dataType);
        var readTextFile = (file) => {
            var tmpData;

            var rawFile = new XMLHttpRequest();
            rawFile.open("GET", file, false);
            rawFile.onreadystatechange = function () {
                if (rawFile.readyState === 4) {
                    if (rawFile.status === 200 || rawFile.status == 0) {
                        var rows = rawFile.responseText.split("\n");
                        // console.debug(rows);
                        let tmp = [], columns;
                        rows.forEach((row, index) => {
                            if (row != '') {
                                var col = row.trim().split(',');
                                // console.debug(col);
                                if (index == 0) {
                                    let arr = [];
                                    col.forEach(c => arr.push(c));
                                    columns = arr;
                                }
                                else {
                                    let obj = {};
                                    col.forEach((c, index) => obj[columns[index]] = c);
                                    tmp.push(obj);
                                }
                            }

                        })
                        var startStr = '/';
                        var startIndex = file.lastIndexOf(startStr) + startStr.length;
                        var fileName = file.substring(startIndex);

                        var leftAxis;
                        // console.debug(fileName.indexOf('time') != -1);
                        if (fileName.indexOf('time') != -1)
                            leftAxis = "次數";
                        else if (fileName.indexOf('size') != -1)
                            leftAxis = "下載量";
                        else
                            leftAxis = fileName;

                        tmpData = {
                            data: tmp,
                            columns: columns,
                            legend: '資料庫',
                            title: 'title',
                            leftAxis: leftAxis,
                        };

                    }
                }
            }
            rawFile.send(null);
            // console.debug(tmpData);
            return tmpData;
        };
        var sortData = (data, sortByKey) => {
            // console.debug(data, sortByKey);

            // ＝＝＝＝深拷貝物件（返回各自不同的物件）
            let sortedData = JSON.parse(JSON.stringify(data));
            //=============排序
            sortedData.sort((a, b) => b[sortByKey] - a[sortByKey]);

            for (i in sortedData)
                console.debug(sortedData[i].name);
            console.debug("=============");

            return sortedData;
        };

        //判斷第一個元素是字串路徑要讀檔,還是物件資料
        if (dataType == 'string') {
            let paths = value;
            //=========sorting and push to data
            paths.forEach(path => {
                let tmp = readTextFile(path);
                let sortedData = sortData(tmp);
                data.push(sortedData);
            });
        }
        else if (dataType == 'object') {
            data = copyObj;
        }
        else {
            console.debug("unknow dataType");
        };

        return chart;
    };
    chart.string = (value) => {
        dataString = value;
        return chart;
    };
    function chart() {
        const chartContainerJQ = $(selector);
        const chartContainerD3 = d3.select(selector);

        const width = 800;
        const height = 600;
        const margin = ({ top: 80, right: 50, bottom: 40, left: 50 });

        const defaultSizeUnit = 'GB';
        const dataKeys = Object.getOwnPropertyNames(data);//series key
        var subjects, categories;
        var colorPalette = {};

        // console.debug(getKeyName('size'));
        const getKeyName = (key) => {
            let keyName, keyUnit = '';
            switch (key) {
                case 'subject':
                    keyName = dataString.subject ? dataString.subject : 'subject';
                    break;
                case 'category':
                    keyName = dataString.category ? dataString.category : 'category';
                    break;
                case 'count':
                    keyName = '下載次數';
                    keyUnit = '次';
                    break;
                case 'file_size':
                    keyName = '下載量';
                    keyUnit = defaultSizeUnit;
                    break;
                case 'group':
                    keyName = '單日一次';
                    keyUnit = '次';
                    break;
                default:
                    keyName = key;
                    break;
            }
            return { name: keyName, unit: keyUnit };
        };
        const getColor = (key, dataCount = 0) => {
            // console.debug(key, dataCount);
            let color, gradientColor;
            function getGradientColor(hex, level) {
                // console.debug(hex, level);
                let maxLevel = categories.length - 1;

                var gradient = (color, level) => {
                    let val = 30;
                    if (color + maxLevel * val > 240) {
                        val = (d3.max([color, 240]) - color) / maxLevel;
                        // console.debug(val);
                    }

                    let tmp = color + level * val;
                    color = tmp > 255 ? 255 : tmp;
                    return color;
                };

                let red = parseInt("0x" + hex.slice(1, 3)),
                    green = parseInt("0x" + hex.slice(3, 5)),
                    blue = parseInt("0x" + hex.slice(5, 7));

                red = gradient(red, level);
                green = gradient(green, level);
                blue = gradient(blue, level);

                let rgb = "rgb(" + red + "," + green + "," + blue + ")";
                return rgb;
            }

            color = colorPalette[key];
            //===if color not in colorPalette, get a random color and put in
            if (!color) {
                var randomColor = () => {
                    let hex = Math.floor(Math.random() * 255).toString(16);
                    if (hex.length < 2)
                        hex = '0' + hex;
                    return hex;
                }
                color = '#';
                for (let i = 0; i < 3; i++)
                    color += randomColor();
                colorPalette[key] = color;
            };
            gradientColor = getGradientColor(color, dataCount);
            return gradientColor;
        };
        const convert_download_unit = (value, unitBefore, unitAfter = undefined) => {
            let newValue, newUnit;
            const unit1 = ['b', 'B'];
            const unit2 = ['', 'K', 'M', 'G', 'T'];


            var getUnit = (unit) => {
                let unit1, unit2;

                if (unit.length > 1) {
                    unit1 = unit[1];
                    unit2 = unit[0];
                }
                else if (unit.length == 1) {
                    unit1 = unit;
                    unit2 = '';
                }

                return {
                    unit1: unit1,
                    unit2: unit2,
                }
            }
            var getRatio = (unitA, unitB, unitArr, powerBase) => {
                let ratio;
                let A_index = unitArr.indexOf(unitA);
                let B_index = unitArr.indexOf(unitB);

                if (A_index != -1 && B_index != -1) {
                    let power = A_index - B_index;
                    ratio = Math.pow(powerBase, power);
                }
                else {
                    ratio = 1;
                }
                return ratio;
            }

            let unitBefore_obj = getUnit(unitBefore);

            if (unitAfter) {//unitBefore 單位轉換到 unitAfter
                let unitAfter_obj = getUnit(unitAfter);
                let ratio1 = getRatio(unitBefore_obj.unit1, unitAfter_obj.unit1, unit1, 8);
                let ratio2 = getRatio(unitBefore_obj.unit2, unitAfter_obj.unit2, unit2, 1024);
                // console.debug(unitBefore_obj, unitAfter_obj);
                // console.debug(ratio1, ratio2);
                newValue = value * ratio1 * ratio2;
                newUnit = unitAfter;
            }
            else {//unitBefore 單位轉換到 value>=1或單位已是最小(b)為止 ,並給newUnit

                let unit1_index = unit1.indexOf(unitBefore_obj.unit1);
                let unit2_index = unit2.indexOf(unitBefore_obj.unit2);
                newValue = value;
                // let newUnit1 = unitBefore_unit1, newUnit2 = unitBefore_unit2;

                while (newValue < 1 && (unit1_index != 0 || unit2_index != 0)) {
                    //先轉unit2,不夠才轉unit1
                    if (unit2_index > 0) {
                        unit2_index -= 1;
                        newValue *= 1024;
                    } else {
                        unit1_index -= 1;
                        newValue *= 8;
                    }

                }
                newUnit = unit2[unit2_index] + unit1[unit1_index];

            }

            return {
                value: newValue,
                unit: newUnit,
            };
        };

        var init = () => {
            var initNode = () => {
                chartContainerJQ.append(`
                <form id="form-header">
                    <div class="form-group">
                        <div class="row">
    
                            <!-- ... chart type ... -->                
                            <div class="form-group col-lg-3 col-md-4 col-sm-6 d-flex flex-row align-items-start">
                                <label class="col-form-label col-5" >ChartType</label>
                                <div class="btn-group btn-group-toggle col-8" data-toggle="buttons">
    
                                    <label class="btn btn-secondary active">
                                        <input type="radio" name ="chartType" value="1" checked> 1
                                    </label>
                                    <label class="btn btn-secondary">
                                        <input type="radio" name ="chartType" value="2"> 2
                                    </label>
                       
                                </div>
                            </div>   
        
                        </div>
                    </div>       
                </form>
                `);
                //============================
                chartContainerJQ.find('input[name ="chartType"]')
                    .on('click', () => printChart());

            };
            var initData = () => {
                const convertData = () => {
                    let split_and_convert = (string, convertedUnit) => {
                        let sizeArr = string.split(' ');
                        let size = parseFloat(sizeArr[0]);
                        let unit = sizeArr[1];
                        return convert_download_unit(size, unit, convertedUnit).value;
                    };
                    dataKeys.forEach(key => {
                        let obj = data[key];
                        let DBKeys = Object.getOwnPropertyNames(obj).filter(key => key != 'columns' && key != 'total');
                        obj.columns = DBKeys;
                        // console.debug(DBKeys);

                        DBKeys.forEach(DBkey => {
                            // console.debug((obj[DBkey]));
                            if (typeof (obj[DBkey]) == 'object') {
                                let yearKeys = Object.getOwnPropertyNames(obj[DBkey]).filter(key => key != 'columns');
                                obj[DBkey].columns = yearKeys;

                                if (key == 'file_size') //==file_size
                                {
                                    yearKeys.forEach(yearKey => {
                                        // console.debug(obj[DBkey][yearKey]);
                                        if (typeof (obj[DBkey][yearKey]) == 'string')
                                            obj[DBkey][yearKey] = split_and_convert(obj[DBkey][yearKey], defaultSizeUnit);
                                    });
                                };
                            };

                        });

                    });
                    data.columns = dataKeys.filter(key => {
                        // console.debug(data[key].total);
                        let boolean = true;
                        if (data[key].hasOwnProperty('total'))
                            if (data[key].total == 0)
                                boolean = false;
                        return boolean;
                    });
                    // console.debug(data);
                };
                const getDataKey = () => {
                    //TSMIP放第一, CWBSN第二
                    let sortDataKeys = (array) => {
                        array.sort(function (a, b) {
                            if (a < b)
                                return -1;
                            if (a == 'TSMIP' || a == 'CWBSN')
                                return -1;
                            return 0;
                        });

                    };
                    //===取出所有主要的key(ex:每個DB)並去重複
                    subjects = Array.from(new Set([].concat(...dataKeys.map(key => [].concat(...data[key].columns)))));
                    //===取出所有最下層key(ex:每個DB的年份)並去重複
                    categories = Array.from(new Set([].concat(...dataKeys.map(key => [].concat(...data[key].columns.map(k => data[key][k].columns))))));
                    sortDataKeys(subjects);
                    sortDataKeys(categories);
                };
                convertData();
                getDataKey();

            };
            var initColor = () => {
                let requestColors = () => {
                    let tmp;
                    $.ajax({
                        url: '../src/php/getNetworkList.php',
                        dataType: 'json',
                        async: false,
                        success: function (rtdata) {
                            let obj = {};
                            rtdata.forEach(d => obj[d.network_code] = d.color);
                            tmp = obj;
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            // console.log("can't get color on database");
                            tmp = {
                                CWBSN: "#2ca9e1",
                                GNSS: "#df7163",
                                GW: "#f8b500",
                                MAGNET: "#005243",
                                TSMIP: "#7a4171",
                                categories: '#808080',
                            };
                        },
                    });
                    Object.assign(colorPalette, tmp);
                };
                const seriesColor = ["#750000", "#003D79"];
                dataKeys.forEach((key, i) => colorPalette[key] = seriesColor[i]);
                requestColors();
            };
            initNode();
            initData();
            initColor();

            console.debug(data);
            console.debug(subjects, categories);
            console.debug(colorPalette);
            //==========test=====
            // $('body').on("mouseover", function (e) {
            //     console.debug(e.target.nodeName);
            // })
            //===================
        };
        var printChart = () => {
            chartContainerJQ.find('#form-chart').remove();
            var getChartMenu = () => {
                // console.log(d.data);
                var div = document.createElement("div");
                div.setAttribute("id", "chart" + i);
                div.setAttribute("class", "chart col-md-12 col-sm-12");
                div.setAttribute("style", "position:relative");

                var nav = document.createElement('nav');
                nav.setAttribute("id", "nav" + i);
                nav.setAttribute("class", "toggle-menu");
                nav.setAttribute("style", "position:absolute");
                nav.style.right = "0";

                var a = document.createElement('a');
                a.setAttribute("class", "toggle-nav");
                a.setAttribute("href", "#");
                a.innerHTML = "&#9776;";
                nav.append(a);

                var ul = document.createElement("ul");
                ul.classList.add("active");
                nav.append(ul);

                var chartDropDown = ['bigimg', 'svg', 'png', 'jpg'];
                chartDropDown.forEach(option => {
                    var li = document.createElement("li");
                    var item = document.createElement("a");
                    item.href = "javascript:void(0)";

                    if (option != chartDropDown[0])
                        item.innerHTML = "下載圖表爲" + option;
                    else
                        item.innerHTML = "檢視圖片";

                    item.addEventListener("click", (e, a) => {
                        let svgArr = [];
                        let svg = chartContainerJQ.find("#" + $(e.target).parents('.chart')[0].id).children('svg')[0];
                        // console.debug(svg);
                        svgArr.push(svg);
                        downloadSvg(svgArr, 'title', option);
                    });

                    li.append(item);
                    ul.append(li);
                });
                // console.debug(chartContainerJQ.find());
                chartContainerJQ.find('#charts').append(div);
                chartContainerJQ.find('#chart' + i).append(nav);
            };
            var MenuEvents = () => {
                var charts = document.getElementById('charts');
                var stopPropagation = (e) => {
                    e.stopPropagation();
                }

                //start or stop DOM event capturing
                function chartEventControl(control) {
                    if (control == 'stop') {
                        // console.debug('add');
                        charts.addEventListener('mousemove', stopPropagation, true);
                        charts.addEventListener('mouseenter', stopPropagation, true);
                    }
                    else {
                        // console.debug('remove');
                        charts.removeEventListener('mousemove', stopPropagation, true);
                        charts.removeEventListener('mouseenter', stopPropagation, true);
                    }
                }

                $('.toggle-nav').off('click');
                $('.toggle-nav').click(function (e) {
                    // console.debug(e.target === this);//e.target===this

                    $(this).toggleClass('active');
                    $(this).next().toggleClass('active');
                    e.preventDefault();

                    //選單打開後阻止事件Capture到SVG(選單打開後svg反應mousemove,mouseenter圖片會有問題)
                    if ($(this).hasClass('active'))
                        chartEventControl('stop');
                    else
                        chartEventControl('start');


                });
                // console.debug($(".toggle-nav"));
                $('body').off('click');
                $('body').click(function (e) {
                    $(".toggle-nav").each((i, d) => {
                        // console.debug(e.target == d);
                        // console.debug(e.target);
                        if (e.target != d && $(d).hasClass('active')) {
                            $(d).toggleClass('active');
                            $(d).next().toggleClass('active');

                            setTimeout(() => chartEventControl('start'), 100);
                        }
                    });
                });
            };
            var downloadSvg = (svgArr, fileName, option) => {

                function getSvgUrl(svgNode) {
                    var svgData = (new XMLSerializer()).serializeToString(svgNode);
                    var svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                    var svgUrl = URL.createObjectURL(svgBlob);
                    return svgUrl;
                }
                function getCanvas(resize) {
                    // =============== canvas init
                    let canvas = document.createElement('canvas');
                    let context = canvas.getContext('2d');

                    var svgWidth = svgArr[0].viewBox.baseVal.width;
                    var svgHeight = svgArr[0].viewBox.baseVal.height * svgArr.length;
                    var canvasWidth, canvasHeight;
                    //檢視時縮放,下載時放大
                    if (resize) {
                        // var windowW = $(window).width();//获取当前窗口宽度 
                        // var windowH = $(window).height();//获取当前窗口高度 

                        var windowW = window.innerWidth;//获取当前窗口宽度 
                        var windowH = window.innerHeight;//获取当前窗口高度 

                        // console.debug("window = ");
                        // console.debug(windowW, windowH);
                        // console.debug(svgW, svgH);
                        var width, height;
                        var scale = 0.9;//缩放尺寸
                        height = windowH * scale;
                        width = height / svgHeight * svgWidth;
                        // console.debug("before scale = ");
                        // console.debug(width, height);
                        while (width > windowW * scale) {//如宽度扔大于窗口宽度 
                            height = height * scale;//再对宽度进行缩放
                            width = width * scale;
                        }
                        // console.debug("scaled = ");
                        // console.debug(width, height);
                        canvasWidth = width;
                        canvasHeight = height;
                    }
                    else {
                        var scale = 1.5;
                        canvasWidth = svgWidth * scale;
                        canvasHeight = svgHeight * scale;
                    }

                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;
                    //====bgcolor
                    context.fillStyle = "white";
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    return [canvas, context];

                }
                function download(href, name) {
                    var downloadLink = document.createElement("a");
                    downloadLink.href = href;
                    downloadLink.download = name;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }
                function show(width, height) {
                    // $('#bigimg').attr("src", img);//设置#bigimg元素的src属性 
                    // $('#outerdiv').fadeIn("fast");//淡入显示#outerdiv及.pimg 
                    // $('#outerdiv').off('click');
                    // $('#outerdiv').click(function () {//再次点击淡出消失弹出层 
                    //     $(this).fadeOut("fast");
                    // });
                    let outerdiv = $('#outerdiv');

                    outerdiv.fadeIn("fast");//淡入显示#outerdiv及.pimg 
                    outerdiv.off('click');
                    outerdiv.click(function (e) {//再次点击淡出消失弹出层 
                        if (e.target.id != 'outerdiv') return;
                        $(this).fadeOut("fast");
                        $(originParent).children('svg').remove();
                        originSvg.removeAttribute('width');
                        originSvg.removeAttribute('height');
                        originParent.append(originSvg);
                    });

                    let originSvg = svgArr[0];
                    let originParent = originSvg.parentNode;
                    let cloneSvg = originSvg.cloneNode(true);
                    originSvg.setAttribute('width', width);
                    originSvg.setAttribute('height', height);
                    document.querySelector('#innerdiv').append(originSvg);
                    originParent.append(cloneSvg);

                }

                if (option == 'svg') {
                    //==============merge svg
                    var newSvg = document.createElement('svg');


                    svgArr.forEach(svg => {
                        var svgjQobj = $(svg);
                        svgjQobj.clone().appendTo(newSvg);
                    });
                    // console.debug(newSvg);
                    var svgUrl = getSvgUrl(newSvg);
                    download(svgUrl, fileName + '.' + option);
                }
                else {
                    //==============each svg draw to canvas
                    var CanvasObjArr = getCanvas(option == 'bigimg');
                    // console.debug(CanvasObjArr);
                    var canvas = CanvasObjArr[0];
                    var context = CanvasObjArr[1];
                    var imageWidth = canvas.width;
                    var imageHeight = canvas.height / svgArr.length;


                    svgArr.forEach((svg, index) => {
                        var svgNode = svg;
                        var svgUrl = getSvgUrl(svgNode);
                        var image = new Image();
                        image.src = svgUrl;
                        image.onload = () => {
                            context.drawImage(image, 0, index * imageHeight, imageWidth, imageHeight);

                            //done drawing and output
                            if (index == svgArr.length - 1) {
                                var imgUrl;
                                if (option == 'bigimg') {
                                    // imgUrl = canvas.toDataURL();// default png
                                    // show(imgUrl);
                                    // let canvas = getCanvas(true)[0];
                                    // // console.debug(canvas);
                                    show(imageWidth, imageHeight);
                                }
                                else {
                                    imgUrl = canvas.toDataURL('image/' + option);
                                    download(imgUrl, fileName + '.' + option);
                                }
                            }
                        }
                    });
                }

            };

            var i = 1;
            let chartType = document.querySelector('input[name ="chartType"]:checked').value,
                chartNode = chartType == 1 ? doubleChart() : singleChart();
            getChartMenu();
            chartContainerJQ.find('#chart' + i).append(chartNode);
            MenuEvents();

            // console.debug(data);
        };

        function doubleChart() {
            ~function init() {
                chartContainerJQ.append(`
                <form id="form-chart">
                <div class="form-group" id="chartsOptions" style="display: inline;">
                <div class="row">
    
                    <!-- ... leftAxis ... -->    
                    <div class="form-group col-lg-3 col-md-3 col-sm-6 d-flex flex-row align-items-start">
                        <label for="leftAxisOptionButton" class="col-form-label col-5" >LeftAxis</label>
                        <div class="btn-group btn-group-toggle col-7" role="group">
                            <button id="leftAxisOptionButton" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                count
                            </button>
                            <div class="dropdown-menu" id="leftAxisMenu" aria-labelledby="leftAxisOptionButton">
                                <div class="form-group col-12 d-flex flex-row flex-wrap align-items-start justify-content-between" id="leftAxisDropDownMenu" >
                                
    
                                <label class="font-weight-bold" for="">Metric</label>                    
                                <div class="col-12 d-flex flex-row">

                                    <div class="form-check col-4 d-flex align-items-start" style="text-align: center;">
                                        <input class="form-check-input col-3" type="checkbox" id="leftAxis_count" name="leftAxisMetric" value="count" checked>
                                        <label class="" for="leftAxis_count">count</label>
                                    </div>
                                    <div class="form-check col-4 d-flex align-items-start" style="text-align: center;">
                                        <input class="form-check-input col-3" type="checkbox" id="leftAxis_group" name="leftAxisMetric" value="group">
                                        <label for="leftAxis_group">group</label>
                                    </div>
                                    <div class="form-check col-4 d-flex align-items-start" style="text-align: center;">
                                        <input class="form-check-input col-3" type="checkbox" id="leftAxis_fileSize" name="leftAxisMetric" value="file_size">
                                        <label for="leftAxis_fileSize">file_size</label>
                                    </div>
                                    
                                </div>
    
                                <label class="font-weight-bold" for="">Scale</label>
                                <div class="col-12 d-flex flex-row">
                                    <div class="col-4 form-check d-flex align-items-start" style="text-align: center;">
                                        <input class="form-check-input col-3" type="checkbox" id="leftAxis_log" name="rightAxisScale" value="log">
                                        <label class="" for="leftAxis_log">logrithmic</label>
                                    </div>
                                </div>                          
                                
    
                                </div>
                            </div>
                        </div>
                    </div>  
                    
                    <!-- ... rightAxis ... -->    
                    <div class="form-group col-lg-3 col-md-3 col-sm-6 d-flex flex-row align-items-start">
                        <label for="rightAxisOptionButton" class="col-form-label col-5" >RightAxis</label>
                        <div class="btn-group btn-group-toggle col-7" role="group">
                            <button id="rightAxisOptionButton" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                file_size
                            </button>
                            <div class="dropdown-menu" id="rightAxisMenu" aria-labelledby="rightAxisOptionButton">
                                <div class="form-group col-12 d-flex flex-row flex-wrap align-items-start justify-content-between" id="rightAxisDropDownMenu" >
    
                                <label class="font-weight-bold" for="">Metric</label>                    
                                <div class="col-12 d-flex flex-row">
                                    <div class="form-check col-4 d-flex align-items-start" style="text-align: center;">
                                        <input class="form-check-input col-3" type="checkbox" id="rightAxis_count" name="rightAxisMetric" value="count">
                                        <label class="" for="rightAxis_count">count</label>
                                    </div>
                                    <div class="form-check col-4 d-flex align-items-start" style="text-align: center;">
                                        <input class="form-check-input col-3" type="checkbox" id="rightAxis_group" name="rightAxisMetric" value="group">
                                        <label for="rightAxis_group">group</label>
                                    </div>
                                    <div class="form-check col-4 d-flex align-items-start" style="text-align: center;">
                                        <input class="form-check-input col-3" type="checkbox" id="rightAxis_fileSize" name="rightAxisMetric" value="file_size" checked>
                                        <label for="rightAxis_fileSize">file_size</label>
                                    </div>
                                </div>
    
                                <label class="font-weight-bold" for="">Scale</label>
                                <div class="col-12 d-flex flex-row">
                                    <div class="col-4 form-check d-flex align-items-start" style="text-align: center;">
                                        <input class="form-check-input col-3" type="checkbox" id="rightAxis_log" name="rightAxisScale" value="log">
                                        <label class="" for="rightAxis_log">logrithmic</label>
                                    </div>
                                </div>                          
    
    
                                </div>
                            </div>
                        </div>
                    </div>  
                
                    <!-- ... display selector ... -->    
                    <div class="form-group col-lg-3 col-md-3 col-sm-6 d-flex flex-row align-items-start">
                        <label for="displaySelectButton" class="col-form-label col-5" >Display</label>
                        <div class="btn-group btn-group-toggle col-7" role="group">
                            <button id="displaySelectButton" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                select
                            </button>
                            <div class="dropdown-menu" id="displayMenu" aria-labelledby="displaySelectButton">
                                <div id="displayDropDownMenu" >
                                
                                </div>
                            </div>
                        </div>
                    </div>  
    
                    <!-- ... show info ... -->    
                    <div class="form-group col-lg-3 col-md-3 col-sm-6 d-flex flex-row align-items-start">
                        <label for="showInfoButton" class="col-form-label col-5" >Show</label>
                        <div class="btn-group btn-group-toggle col-7" role="group">
                            <button id="showInfoButton" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                select
                            </button>
                            <div class="dropdown-menu" id="showInfoMenu" aria-labelledby="showInfoButton">
                                <div  id="showInfoDropDownMenu">
    
                                    <div class="form-check col-12">
                                        <input class="form-check-input  col-3" type="checkbox" id="showLegend" name="show" value="1" checked>
                                        <label class="form-check-label  col-12" for="showLegend">legend</label>
                                    </div>
    
    
                                </div>
                            </div>
                        </div>
                    </div>  

                    <!-- ...change chart   ...-->
                    <div class="form-group col-md-6  d-flex flex-row align-items-start">
                        <label for="changeChart" class="col-form-label col-4" >chart</label>
                        <div class="btn-group btn-group-toggle col-8" data-toggle="buttons">
                            <label class="btn btn-secondary">
                                <input type="radio" name ="changeChart" value="vertical" checked> chart1
                            </label>
                            <label class="btn btn-secondary active">
                                <input type="radio" name ="changeChart" value="horizontal"> chart2
                            </label>
                        </div>
                    </div>   
    
   
                </div>
    
                
                <div class="form-group"  id="chartMain">
    
                    <div class="form-group" id="charts"></div>        
                     
                    <div id="outerdiv"
                        style="position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);z-index:10;width:100%;height:100%;display:none;">
                        <div id="innerdiv" style=" background-color: rgb(255, 255, 255);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"></div>                      
                    </div>
    
                    <div id='loading'>
                        <div class="spinner-border"role="status">
                            <span class="sr-only" >Loading...</span>
                        </div>
                        Loading...
                    </div>
                </div>
                
                </form>
    
               
                `);
                //================dropdown-menu內元素被點擊不關閉menu
                let All_dropdownMenu = $('.dropdown-menu');
                All_dropdownMenu.on("click.bs.dropdown", e => e.stopPropagation());

            }();
            const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);
            const legendGroup = svg.append("g").attr('class', 'legendGroup');
            const focusGroup = svg.append("g").attr("class", "focusGroup");
            const subjectAxis = svg.append("g").attr("class", "subjectAxis");
            const leftAxis = svg.append("g").attr("class", "leftAxis");
            const rightAxis = svg.append("g").attr("class", "rightAxis");


            var newDataObj;
            var subjectScale, leftScale, rightScale;

            function updateChart(trans = false) {
                const transDuration = trans ? 500 : 0;

                function init() {
                    svg.append('g')
                        .attr("class", "title")
                        .attr("transform", `translate(${margin.left + (width - margin.left - margin.right) / 2}, ${margin.top / 2})`)
                        .append('text')
                        .attr("fill", "currentcolor")
                        .attr("color", "black")
                        .attr("font-family", "sans-serif")
                        .attr("font-size", 20)
                        .attr("font-weight", 900)
                        .attr("text-anchor", "middle")
                        .attr("alignment-baseline", "middle")
                        .text(data.title);

                    //===Axis
                    subjectAxis
                        .append('text')
                        .attr("class", "axisName")
                        .attr("fill", "black")
                        .attr("font-weight", "bold")
                        .attr("font-size", 12)
                        .text(getKeyName('subject').name);

                    leftAxis
                        .attr("color", getColor(dataKeys[0]))
                        .append('text')
                        .attr("class", "axisName")
                        .attr("fill", "currentcolor")
                        .attr("font-weight", "bold")
                        .attr("font-size", 12)
                        .style("text-anchor", "middle")
                        .attr("alignment-baseline", "text-before-edge");

                    rightAxis
                        .attr("color", getColor(dataKeys[1]))
                        .append('text')
                        .attr("class", "axisName")
                        .attr("fill", "currentcolor")
                        .attr("font-weight", "bold")
                        .attr("font-size", 12)
                        .style("text-anchor", "middle")
                        .attr("alignment-baseline", "text-before-edge");


                    //===single categories dont need legend
                    // console.debug(dataKeys.length);
                    if (categories.length >= 2) {
                        var rect_interval = 1;
                        var rect_width = 50;
                        var rect_height = 10;

                        var legend = legendGroup.append("g")
                            .attr("class", "legend")
                            .attr("transform", `translate(${width - margin.right - categories.length * (rect_width + rect_interval)}, ${margin.top * 0.6})`);

                        legend
                            .selectAll("g")
                            .data(categories)
                            .join("g")
                            .attr("transform", (d, i) => `translate(${i * (rect_width + rect_interval)}, 0)`)
                            .call(g => {
                                g.append("rect")
                                    .attr("width", rect_width)
                                    .attr("height", rect_height)
                                    .attr("fill", (d, i) => getColor('categories', i));

                                g.append("text")
                                    // .attr("y", rect_width)
                                    .attr("x", rect_width / 2)
                                    .attr("y", rect_height)
                                    .attr("fill", "currentcolor")
                                    .attr("color", "black")
                                    .attr("font-family", "sans-serif")
                                    .attr("font-size", 13)
                                    .attr("font-weight", 600)
                                    .attr("text-anchor", "middle")
                                    .attr("alignment-baseline", "before-edge")
                                    .text(d => d)
                            });

                        legend
                            .append("text")
                            .attr("font-size", 13)
                            .attr("font-weight", 900)
                            .attr("text-anchor", "start")
                            .attr("alignment-baseline", "after-edge")
                            .text(getKeyName('category').name);

                    };
                };
                function render() {
                    console.debug(newDataObj);
                    var newData = newDataObj.newData;
                    var leftAxisOption = newDataObj.leftAxisOption;
                    var rightAxisOption = newDataObj.rightAxisOption;
                    var displayArr = newDataObj.displayArr;
                    var barOption = newDataObj.barOption;

                    var subjectRange, leftRange, rightRange;

                    if (barOption.orientation) {
                        subjectRange = [margin.left, width - margin.right];
                        leftRange = [height - margin.bottom, margin.top];
                        rightRange = [height - margin.bottom, margin.top];
                    }
                    else {
                        let chartWidth = width - margin.right - margin.left;
                        let seriesAxisWidth = (chartWidth - barOption.interval) * 0.5;
                        subjectRange = [height - margin.bottom, margin.top];
                        leftRange = [margin.left + seriesAxisWidth, margin.left];
                        rightRange = [leftRange[0] + barOption.interval, width - margin.right];
                    };

                    subjectScale = d3.scaleBand()
                        .domain(subjects)
                        .range(subjectRange)
                        .padding(0.1);

                    leftScale = d3[leftAxisOption.logScale ? 'scaleLog' : 'scaleLinear']()
                        .domain([+leftAxisOption.logScale, d3.max(newData[0], d => d3.max(d, d => d[1]))])
                        .range(leftRange);
                    if (leftAxisOption.logScale) leftScale.nice();

                    rightScale = d3[rightAxisOption.logScale ? 'scaleLog' : 'scaleLinear']()
                        .domain([+rightAxisOption.logScale, d3.max(newData[1], d => d3.max(d, d => d[1]))])
                        .range(rightRange);
                    if (rightAxisOption.logScale) rightScale.nice();

                    // console.debug(leftScale.domain())
                    // console.debug(leftScale.range())

                    var updateAxis = () => {
                        function formatPower(x) {
                            const e = Math.log10(x);
                            if (e !== Math.floor(e)) return; // Ignore non-exact power of ten.
                            return `10${(e + "").replace(/./g, c => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c] || "⁻")}`;
                        };

                        var removeAxis = g => g.selectAll(":not(.axisName)").remove();
                        var makeSubjectAxis = g => {
                            let axisPos, translate, refreshing;
                            if (barOption.orientation) {
                                axisPos = 'axisBottom';
                                translate = [0, height - margin.bottom];
                                refreshing = g => {
                                    g.selectAll('line').attr('x2', 0).attr('opacity', 1);
                                    g.selectAll(".tick text").attr('dy', '0.71em');
                                    g.selectAll('.domain').attr("transform", null);
                                    g.select('.axisName')
                                        .attr("transform", `translate(${[margin.left + (width - margin.left - margin.right) / 2, margin.bottom * 0.8]})`);
                                };

                            }
                            else {
                                axisPos = 'axisLeft';
                                translate = [width * 0.5, 0];
                                refreshing = g => {
                                    g.selectAll("line").attr('opacity', 0);

                                    // let domain = g.selectAll(".domain").clone(true);
                                    // console.debug(domain)
                                    // tooltipGroup.node().append(totalTooltip.node());

                                    let domain_d = g.select('.domain').attr('d');
                                    g.selectAll('.domain')
                                        .data(newData)
                                        .join('path')
                                        .attr('class', 'domain')
                                        .attr('stroke', 'currentColor')
                                        .attr('d', domain_d)
                                        .attr("transform", (d, i) => `translate(${barOption.interval * 0.5 * (i * 2 - 1)},0)`)

                                    g.selectAll(".tick text").attr('x', 0).attr('y', 0).attr('dy', '0.32em');
                                    g.select('.axisName').attr("transform", `translate(0,${height - margin.bottom * 0.2})`)
                                }
                            }
                            g.attr("transform", `translate(${translate})`)
                                // .call(removeAxis)
                                .call(d3[axisPos](subjectScale).tickSizeOuter(0))
                                .call(refreshing)
                                .call(g => g.selectAll('.tick')
                                    .attr('font-size', 11)
                                    .attr("font-weight", 500)
                                );
                        }
                        var makeSeriesAxis = (g, isRight) => {

                            let seriesScale = isRight ? rightScale : leftScale;
                            let axisPos, translate, refreshing;
                            let sign = { 0: -1, 1: 1 }[+isRight];
                            let seriesName = getKeyName(newData.metric[+isRight]);
                            let axisText = seriesName.name + '(' + seriesName.unit + ')';


                            if (barOption.orientation) {
                                axisPos = { 0: 'axisLeft', 1: 'axisRight' }[+isRight];
                                translate = { 0: [margin.left, 0], 1: [width - margin.right, 0] }[+isRight];
                                refreshing = g => {
                                    g.select('.axisName')
                                        .attr("transform", `rotate(${90 * sign}) translate(${[height / 2 * sign, -margin.left * 0.9]})`)
                                        .text(axisText);
                                };
                            }
                            else {
                                axisPos = 'axisBottom';
                                translate = [0, height - margin.bottom];
                                refreshing = g => {
                                    let axisOrigin = seriesScale.range()[0];//0的位置
                                    let axisTextArrow = { 0: '← ', 1: ' →' }[+isRight];

                                    g.selectAll('.tick').style("text-anchor", "middle");
                                    g.select('.axisName')
                                        .attr("transform", `translate(${[axisOrigin + 2 * barOption.interval * sign, margin.bottom * 0.5]})`)
                                        .text(axisText)
                                        .append('tspan')
                                        .attr("x", sign * barOption.interval * 1.5)
                                        .attr("dy", 2)
                                        .attr("alignment-baseline", "middle")
                                        .attr("font-size", 60)
                                        .text(axisTextArrow);
                                    // console.debug(g.node())
                                };
                            };

                            g
                                .attr("transform", `translate(${translate})`)
                                .call(removeAxis)
                                .transition().duration(transDuration)
                                .call(g => {
                                    let axisFun = d3[axisPos](seriesScale).tickSizeOuter(0);
                                    (isRight ? rightAxisOption : leftAxisOption).logScale ?
                                        axisFun.ticks(Math.log10(seriesScale.domain()[1] / seriesScale.domain()[0]) + 1, formatPower) :
                                        axisFun.ticks(width / 80);
                                    axisFun(g);

                                });

                            g.call(refreshing);//有呼叫補間動畫會不能append所以另外call一次
                        };
                        subjectAxis.call(makeSubjectAxis);
                        leftAxis.call(g => makeSeriesAxis(g, true));
                        rightAxis.call(g => makeSeriesAxis(g, false));
                    };

                    var updateFocus = () => {
                        function getDasharrayStr(barWidth, barHeight) {
                            let showLength = barWidth + barHeight - 1.5;
                            let hideLength = barWidth + 3;

                            let dashLength = 10;
                            let gapLength = 1;

                            //***quotient=dashes and gaps count 
                            //***remainder=
                            let quotient = parseInt(showLength / (dashLength + gapLength));
                            let remainder = showLength % (dashLength + gapLength);

                            let dashStr = '';
                            for (let i = 0; i < quotient; i++)
                                dashStr += dashLength + ',' + gapLength + ',';

                            // let endWithGap = (quotient % 2 == 0);
                            dashStr += remainder + ',' + hideLength;
                            return dashStr;
                        };
                        focusGroup
                            .selectAll("g.seriesGroup")
                            .data(newData.metric)
                            .join("g")
                            .attr("class", "seriesGroup")
                            .attr("id", (d, i) => "seriesGroup" + (i + 1))
                            // .attr("groupIndex", 0)
                            .call(barGroup_collection =>
                                barGroup_collection.each(function (dataKey, i) {
                                    // console.debug(dataKey, i)
                                    let seriesGroup = d3.select(this);
                                    let seriesData = newData[i];
                                    let seriesScale = i ? rightScale : leftScale;
                                    let seriesOption = i ? rightAxisOption : leftAxisOption;

                                    seriesGroup
                                        .selectAll("g")
                                        .data(seriesData)
                                        .join("g")
                                        .selectAll("rect")
                                        .data(d => d)
                                        .join("rect")
                                        .attr("class", "bar")
                                        //for index of barCollection
                                        .property("value", (d, index) => i * subjects.length * categories.length + categories.indexOf(d.key) * subjects.length + index)
                                        .attr("fill", d => getColor(dataKeys[i], categories.indexOf(d.key)))
                                        .attr("stroke", "#D3D3D3")
                                        .attr("stroke-width", 3)
                                        .attr('stroke-opacity', 0)
                                        .call(rect_collection =>
                                            rect_collection.each(function (d) {
                                                // console.debug(d)
                                                let rect = d3.select(this);
                                                let y1 = d[0], y2 = d[1];
                                                if (seriesOption.logScale) {
                                                    y1 = (y1 == 0 ? seriesScale.domain()[0] : y1);
                                                    y2 = (y2 == 0 ? seriesScale.domain()[0] : y2);
                                                    // console.debug(y1, y2);
                                                };


                                                if (barOption.orientation) {
                                                    let barWidth = subjectScale.bandwidth() / 2 > barOption.maxWidth ? barOption.maxWidth : subjectScale.bandwidth() / 2;
                                                    let transX = i ? subjectScale.bandwidth() / 2 + barOption.interval : subjectScale.bandwidth() / 2 - barWidth - barOption.interval;


                                                    rect
                                                        .transition().duration(transDuration)
                                                        .attr("transform", `translate(${transX}, 0)`)
                                                        .attr("x", d => subjectScale(d.data))
                                                        .attr("y", d => seriesScale(y2))
                                                        .attr("height", d => seriesScale(y1) - seriesScale(y2))
                                                        .attr("width", barWidth)
                                                }
                                                else {
                                                    let barWidth = subjectScale.bandwidth() > barOption.maxWidth ? barOption.maxWidth : subjectScale.bandwidth();
                                                    let transY = (subjectScale.bandwidth() - barWidth) * 0.5;
                                                    rect
                                                        .transition().duration(transDuration)
                                                        .attr("transform", `translate(0, ${transY})`)
                                                        .attr("x", d => seriesScale(d[i ? 0 : 1]))
                                                        .attr("y", d => subjectScale(d.data))
                                                        .attr("height", barWidth)
                                                        .attr("width", d => Math.abs(seriesScale(d[0]) - seriesScale(d[1])))

                                                };

                                            })
                                        );
                                })
                            );

                    };
                    // var updateTooltips = () => {

                    // };
                    updateAxis();
                    updateFocus();
                    // updateTooltips();
                };
                if (!newDataObj) {
                    newDataObj = getNewData({
                        leftAxisOption: {
                            metric: chartContainerD3.select('input[name=leftAxisMetric]:checked').property("value"),
                            logScale: false,
                        },
                        rightAxisOption: {
                            metric: chartContainerD3.select('input[name=rightAxisMetric]:checked').property("value"),
                            logScale: false,
                        },
                        displayArr: d3.range(subjects.length),
                        showArr: chartContainerD3.selectAll('input[name=show]:checked').nodes().map(node => parseInt(node.value)),
                    });
                    init();
                };
                render();

            };
            function getNewData(chartOption) {
                let leftAxisOption = chartOption.hasOwnProperty('leftAxisOption') ? chartOption.leftAxisOption : newDataObj.leftAxisOption,
                    rightAxisOption = chartOption.hasOwnProperty('rightAxisOption') ? chartOption.rightAxisOption : newDataObj.rightAxisOption,
                    displayArr = chartOption.hasOwnProperty('displayArr') ? chartOption.displayArr : newDataObj.displayArr,
                    showArr = chartOption.hasOwnProperty('showArr') ? chartOption.showArr : newDataObj.showArr,
                    orientation = chartOption.hasOwnProperty('orientation') ? chartOption.orientation : newDataObj ? newDataObj.barOption.orientation : 1;

                var getSeries = (key) => {
                    //===count or size....
                    const seriesData = data[key];
                    // console.debug(data, key);
                    const series = d3.stack()
                        .keys(categories)
                        .value((subject, category) => seriesData[subject] ? (seriesData[subject][category] || 0) : 0)//沒有值當0(bar heigth=0)
                        (subjects).map(d => { return d.forEach(v => v.key = d.key), d });
                    // console.debug(series1);
                    return series;
                };

                let metric = [leftAxisOption.metric, rightAxisOption.metric];
                let newData = metric.map(key => getSeries(key));
                newData.metric = metric;

                return {
                    newData: newData ? newData : newDataObj.newData,
                    leftAxisOption: leftAxisOption,
                    rightAxisOption: rightAxisOption,
                    displayArr: displayArr,
                    showArr: showArr,
                    barOption: {
                        orientation: orientation,
                        maxWidth: orientation ? 500 : 60,
                        interval: orientation ? 1 : 50,
                    },
                };
            };
            updateChart();

            function events(svg) {
                var newData = newDataObj.newData;
                var leftAxisOption = newDataObj.leftAxisOption;
                var rightAxisOption = newDataObj.rightAxisOption;
                var displayArr = newDataObj.displayArr;
                var barOption = newDataObj.barOption;

                const tooltipGroup = svg.append("g").attr('class', 'tooltipGroup');
                const barCollection = svg.selectAll('.bar');
                const barNodes = barCollection.nodes();
                const subjectTickCollection = svg.select('.subjectAxis').selectAll('.tick');

                var tooltipEvent = () => {
                    const tooltip_width = 100;
                    const tooltip_height = margin.bottom * 2;

                    const tooltip = tooltipGroup
                        .append("g")
                        .attr('id', 'tooltip')
                        .attr('display', 'none')
                        .attr("opacity", .9)
                        .call(tooltip => {
                            // console.debug(tooltip)

                            tooltip.append('rect')
                                .attr("fill", "currentcolor")
                                .attr('width', tooltip_width)
                                .attr('height', tooltip_height)
                                .attr('stroke', '#000000')
                                .attr('stroke-opacity', 0)
                                .attr('fill', '#D3D3D3');

                            tooltip.append('polygon')
                                .attr("fill", "currentcolor")
                                .attr('stroke', '#D3D3D3')
                                .attr('stroke-opacity', 1)
                                .attr('fill', '#D3D3D3');

                            tooltip.append('text')
                                .attr('class', 'tooltipSubject')
                                .attr('x', tooltip_width / 2)
                                .attr('y', tooltip_height / 3)
                                .attr('text-anchor', 'middle')
                                // .attr("font-family", "DFKai-sb")
                                .attr("font-size", 18)
                                .attr('opacity', 1);
                        })

                    function makeTotalTooltip(subjectIndex, seriesIndex) {
                        let totalTooltipID = 'totalTooltip-' + subjects[subjectIndex] + '-' + dataKeys[seriesIndex];
                        let totalTooltip_exist = (svg.select('#' + totalTooltipID).node() != null);
                        // console.debug(totalTooltip_exist);
                        //=== if totalTooltip exist then do nothing
                        if (!totalTooltip_exist) {
                            let barValue = seriesIndex * subjects.length * categories.length + subjectIndex + (categories.length - 1) * subjects.length;
                            // console.debug(barNodes);
                            let topRect = barNodes[barValue];
                            // console.debug(barValue);
                            let rectMaxData = topRect.__data__[1];
                            // console.debug(topRect.__data__  );
                            let total = Number.isInteger(rectMaxData) ? rectMaxData : rectMaxData.toFixed(3);
                            let unit = getKeyName(dataKeys[seriesIndex]).unit;

                            let totalTooltip = tooltip.clone(true);
                            tooltipGroup.node().append(totalTooltip.node());

                            let x = topRect.x.baseVal.value;
                            let y = topRect.y.baseVal.value;
                            let width = topRect.width.baseVal.value;
                            let transform = topRect.transform.baseVal[0].matrix;


                            let rect_width = 100;
                            let rect_height = 65;
                            let trans_x = x + transform.e + width * 0.5 - rect_width * 0.5;
                            let trans_y = y + transform.f - rect_height - rect_width * 0.1;
                            // console.debug(x, y, width, transformArr);

                            totalTooltip.call(totalTooltip => {

                                totalTooltip.select('rect')
                                    .attr("width", rect_width)
                                    .attr("height", rect_height);

                                totalTooltip.select('polygon')
                                    .attr("points", `${rect_width * 0.4}, ${rect_height} ${rect_width * 0.6}, ${rect_height} ${rect_width * 0.5}, ${rect_height + rect_width * 0.1} `)

                                // console.debug(totalTooltipID);
                                totalTooltip
                                    .attr('id', totalTooltipID)
                                    .attr("transform", `translate(${trans_x}, ${trans_y})`)
                                    .attr('display', 'inline');

                                totalTooltip.select('text')
                                    .text('Total:')
                                    .append('tspan')
                                    .attr('x', function () { return this.parentNode.getAttribute('x') })
                                    .attr("dy", "1em")
                                    .attr("font-weight", 900)
                                    .attr("font-size", 25)
                                    .text(total)
                                    .append('tspan')
                                    .attr("font-weight", "normal")
                                    .attr("font-size", 14)
                                    .text(" " + unit);
                            })

                        }
                    };
                    function barEvent(bar) {
                        var tooltipMove = (bar) => {

                            let barData = bar.__data__;
                            let catagoryKey = barData.key;
                            let subjectKey = barData.data;
                            let seriesKey = bar.parentNode.parentNode.__data__;
                            let seriesIndex = dataKeys.indexOf(seriesKey);
                            // console.debug(data[seriesKey][subjectKey][catagoryKey]);
                            // console.debug((!seriesIndex - seriesIndex));
                            // console.debug(dataUnit);
                            let bar_x = parseInt(bar.getAttribute('x'));
                            let bar_y = parseInt(bar.getAttribute('y'));
                            let barWidth = parseInt(bar.getAttribute('width'));
                            let barHeight = parseInt(bar.getAttribute('height'));

                            // let trans_x = bar_x + subjectScale.bandwidth() / 2 + seriesIndex * barWidth + (seriesIndex - !seriesIndex) * barOption.interval + tooltip_width * 0.1;
                            // let trans_y = bar_y + (barHeight - tooltip_height) / 2;
                            let trans_x =
                                newDataObj.barOption.orientation ?
                                    bar_x + subjectScale.bandwidth() / 2 + seriesIndex * barWidth + (seriesIndex - !seriesIndex) * barOption.interval + tooltip_width * 0.1 :
                                    bar_x + barWidth + tooltip_width * 0.1;
                            let trans_y = bar_y + (barHeight - tooltip_height) / 2;


                            //tooltip超出圖表邊界要移動
                            var checkOverEdge = () => {
                                let polygonPoints;
                                if (trans_x + tooltip_width * 1.1 > width) {
                                    trans_x -= barWidth + tooltip_width * 1.2;
                                    polygonPoints = `${tooltip_width}, ${tooltip_height * 0.4} ${tooltip_width}, ${tooltip_height * 0.6} ${tooltip_width + tooltip_width * 0.1}, ${tooltip_height / 2} `;
                                }
                                else
                                    polygonPoints = `0, ${tooltip_height * 0.4} 0, ${tooltip_height * 0.6} ${-tooltip_width * 0.1}, ${tooltip_height / 2} `;
                                tooltip.select('polygon').attr("points", polygonPoints);
                            };
                            checkOverEdge();

                            tooltip
                                .attr("transform", `translate(${trans_x}, ${trans_y})`)
                                .attr('display', 'inline');

                            let dataValue = data[seriesKey][subjectKey][catagoryKey];
                            let dataUnit = getKeyName(seriesKey).unit;
                            if (seriesKey == 'file_size') {
                                let convertedData = convert_download_unit(dataValue, dataUnit);
                                dataValue = convertedData.value;
                                dataUnit = convertedData.unit;
                            }

                            tooltip.select('text')
                                .text(subjectKey)
                                .append('tspan')
                                .attr('x', function () { return this.parentNode.getAttribute('x') })
                                .attr("dy", "1em")
                                .attr("font-size", 20)
                                .text(catagoryKey + " " + getKeyName('category').name)
                                .append('tspan')
                                .attr('x', function () { return this.parentNode.getAttribute('x') })
                                .attr("dy", "1em")
                                .attr("font-weight", 900)
                                .attr("font-size", 25)
                                .text(dataValue)
                                .append('tspan')
                                .attr("font-weight", "normal")
                                .attr("font-size", 14)
                                .text(" " + dataUnit);

                            tooltip.raise();//new tooltip always on top

                        };
                        var barHighLight = (bar, dir) => {
                            // console.debug()
                            // console.debug(bar.classList)
                            const fadeOut = 0.4;
                            const highLight = 1;


                            let seriesGroup = d3.select(bar.parentNode.parentNode);
                            switch (dir) {
                                //===0:out 1:over
                                case 0:
                                    var beenClicked = false;
                                    seriesGroup.selectAll('.bar')
                                        .attr("fill-opacity", function () {
                                            if (this.classList.contains("clicked")) {
                                                beenClicked = true;
                                                return highLight;
                                            }
                                            else {
                                                d3.select(this).attr("stroke-opacity", 0);
                                                return fadeOut;
                                            }
                                        });

                                    if (!beenClicked)
                                        seriesGroup.selectAll('.bar')
                                            .attr("fill-opacity", 1);
                                    break;

                                case 1:
                                    seriesGroup.selectAll('.bar')
                                        .attr("fill-opacity", function () {
                                            var isTarget = (this == bar);
                                            var beenClicked = this.classList.contains("clicked");
                                            // // console.debug(this.classList.contains("clicked"));
                                            // console.debug(isTarget, beenClicked)
                                            // console.debug(bar)
                                            if (!(isTarget || beenClicked))
                                                return fadeOut;
                                            else
                                                d3.select(bar).attr('stroke-opacity', 1);
                                        });
                                    break;
                            }
                        };
                        var checkAllBarClicked = (barValue) => {

                            let seriesIndex = parseInt(barValue / (subjects.length * categories.length));
                            let subjectIndex = barValue % subjects.length;
                            // console.debug(seriesIndex, subjectIndex);
                            let sameBarValueArr = categories.map((d, i) => i * subjects.length + subjectIndex + seriesIndex * subjects.length * categories.length)
                            // console.debug(sameBarValueArr);

                            //==check allBarBeenClicked in same bar
                            let allBarBeenClicked = true;
                            for (let i = 0; i < sameBarValueArr.length; i++) {
                                let data = barNodes[sameBarValueArr[i]].__data__;

                                // console.debug(data[1] - data[0] == 0);
                                let clicked =
                                    barNodes[sameBarValueArr[i]].classList.contains('clicked') ||
                                    data[1] - data[0] == 0;//無資料的bar點不到所以當作點了

                                if (!clicked) {
                                    allBarBeenClicked = false;
                                    break;
                                }
                                // console.debug(clicked);
                            }

                            return { clicked: allBarBeenClicked, subjectIndex: subjectIndex, seriesIndex: seriesIndex };
                        };


                        bar
                            .on('mouseover', function (e) {
                                // console.log('mouseover');
                                tooltipMove(this);
                                barHighLight(this, 1);
                            })
                            .on('mouseout', function (e) {
                                // console.log('mouseout');
                                // console.debug(this.classList.contains("clicked"))

                                if (!this.classList.contains("clicked")) {
                                    barHighLight(this, 0);
                                    tooltip
                                        .attr("display", 'none');
                                }
                            })
                            .on('click', function (e) {
                                // console.log('click');
                                var bar = d3.select(this);
                                var clicked = bar.classed('clicked');
                                // console.debug(clicked);
                                // pieMove(thisPie, !clicked);
                                bar.classed('clicked', !clicked);
                                let barValue = this.value;
                                let allBarStatus = checkAllBarClicked(barValue);
                                // console.debug(allBarStatus);


                                if (!clicked) {
                                    let tooltip_colne = tooltip.clone(true);
                                    tooltip_colne.attr('id', 'tooltip' + barValue);
                                    // tooltipGroup.node().append(tooltip_colne.node());
                                }
                                else
                                    tooltipGroup.select("#tooltip" + barValue).remove();

                                // total tooltip
                                let subjectIndex = allBarStatus.subjectIndex;
                                let seriesIndex = allBarStatus.seriesIndex;
                                if (allBarStatus.clicked)
                                    makeTotalTooltip(subjectIndex, seriesIndex);
                                else {
                                    let totalTooltipID = 'totalTooltip-' + subjects[subjectIndex] + '-' + dataKeys[seriesIndex];
                                    tooltipGroup.select('#' + totalTooltipID).remove();
                                }

                            })
                    };
                    function subjectClickEvent(tickCollection) {
                        // console.debug(tickCollection);

                        tickCollection
                            .on('click', function (e) {
                                // console.debug(this);
                                let tick = d3.select(this);
                                let clicked = tick.classed('clicked');
                                tick.classed('clicked', !clicked);

                                let subjectIndex = subjects.indexOf(tick.data()[0]);

                                if (!clicked)
                                    dataKeys.forEach((series, seriesIndex) => makeTotalTooltip(subjectIndex, seriesIndex))
                                else
                                    dataKeys.forEach((series, seriesIndex) => {
                                        let totalTooltipID = 'totalTooltip-' + subjects[subjectIndex] + '-' + dataKeys[seriesIndex];
                                        tooltipGroup.select('#' + totalTooltipID).remove();
                                    })


                            })
                            .on('mouseenter', function (e) {
                                // console.debug("mouseenter");
                                let tick = d3.select(this);

                                tick.select('text')
                                    .attr('font-size', 11)
                                    .transition().duration(100)
                                    .attr("fill", getColor(tick.data()[0]))
                                    .attr("font-size", 15)
                                    .attr("font-weight", 900)
                                    .attr("cursor", 'pointer');
                                // .attr('pointer-events', 'fill');

                            })
                            .on('mouseleave', function (e) {
                                // console.debug("mouseleave");
                                let tick = d3.select(this);
                                tick.select('text')
                                    .transition().duration(100)
                                    .attr("fill", "black")
                                    .attr('font-size', 11)
                                    .attr("font-weight", 500);
                            });
                    }


                    // each bar call barEvent
                    barCollection.call(barEvent);

                    // tick click Event
                    subjectTickCollection.call(subjectClickEvent);

                    //close all tooltip
                    svg.call(svg => svg.on('click', function (e) {
                        if (e.target === svg.node()) {
                            tooltipGroup.selectAll('g')
                                .filter(function (d) { return this.id !== 'tooltip' })//不刪範本的
                                .remove();
                            subjectTickCollection.classed('clicked', false);
                            barCollection
                                .classed('clicked', false)
                                .attr('fill-opacity', 1)
                                .attr('stroke-opacity', 0);
                            tooltip
                                .attr("display", 'none');
                        }
                    }));
                };
                var chartOptionEvent = () => {

                    //=====leftAxis option
                    let leftAxisMetric = chartContainerD3.selectAll('input[name ="leftAxisMetric"]');
                    let leftAxisMetricText = chartContainerD3.select('#leftAxisOptionButton');
                    let leftAxisLog = chartContainerD3.select('#leftAxis_log');
                    // console.debug(leftAxisLog);

                    leftAxisMetric
                        .on('change', e => {
                            let value = e.target.value;
                            let checked = e.target.checked;
                            //＝＝＝單選,其他勾拿掉
                            leftAxisMetric.nodes().filter(chkbox => chkbox !== e.target).forEach(chkbox => chkbox.checked = false);

                            //＝＝＝被點擊的勾不能拿掉
                            if (!checked) {
                                e.target.checked = true;
                                return;
                            };

                            //===改變按鈕text
                            leftAxisMetricText.text(value);

                            //===更新圖表
                            leftAxisOption.metric = value;

                            newDataObj = getNewData({ leftAxisOption: leftAxisOption });
                            updateChart();

                        });

                    leftAxisLog
                        .on('change', e => {
                            leftAxisOption.logScale = e.target.checked;
                            newDataObj = getNewData({ leftAxisOption: leftAxisOption });
                            updateChart();
                        });

                    //=====rightAxis option
                    let rightAxisMetric = chartContainerD3.selectAll('input[name ="rightAxisMetric"]');
                    let rightAxisMetricText = chartContainerD3.select('#rightAxisOptionButton');
                    let rightAxisLog = chartContainerD3.select('#rightAxis_log');
                    // console.debug(rightAxisLog);

                    rightAxisMetric
                        .on('change', e => {
                            let value = e.target.value;
                            let checked = e.target.checked;
                            //＝＝＝單選,其他勾拿掉
                            rightAxisMetric.nodes().filter(chkbox => chkbox !== e.target).forEach(chkbox => chkbox.checked = false);

                            //＝＝＝被點擊的勾不能拿掉
                            if (!checked) {
                                e.target.checked = true;
                                return;
                            };

                            //===改變按鈕text
                            rightAxisMetricText.text(value);

                            //===更新圖表
                            rightAxisOption.metric = value;

                            newDataObj = getNewData({ rightAxisOption: rightAxisOption });
                            updateChart();

                        });

                    rightAxisLog
                        .on('change', e => {
                            // console.debug(rightAxisOption);
                            rightAxisOption.logScale = e.target.checked;
                            newDataObj = getNewData({ rightAxisOption: rightAxisOption });
                            updateChart();
                        });



                    //=====change 
                    // console.debug(chartContainerD3.select('input[name ="changeChart"]'))
                    chartContainerD3.selectAll('input[name ="changeChart"]')
                        .on('click', e => {
                            // console.debug('change')
                            //===for reset tooltip after chart change
                            let barBeenClicked = barNodes.filter(bar => bar.classList.contains('clicked') ? true : false);
                            let tickBeenClicked = subjectTickCollection.nodes().filter(bar => bar.classList.contains('clicked') ? true : false);
                            //===for reset tooltip after chart change
                            let changeChart = e.target.value;
                            // console.debug(changeChart);
                            newDataObj.chartType = changeChart;
                            let transDuration = updateChart(changeChart, true);
                            //=== reset tooltip
                            // tooltipGroup.selectAll("g[id^='totalTooltip']").remove();
                            tickBeenClicked.forEach(tick => d3.select(tick).dispatch("click"));//remove totalTooltip
                            d3.timeout(() => {
                                barBeenClicked.forEach((bar) => {
                                    tooltipGroup.select("#tooltip" + bar.value).remove();
                                    d3.select(bar)
                                        .dispatch("mouseover")
                                        .dispatch("click");
                                });
                                tickBeenClicked.forEach(tick => d3.select(tick).dispatch("click"));//make totalTooltip
                            }, transDuration);

                        });
                    //=====shows
                    chartContainerD3.select('#showLegend').on('change', e =>
                        svg.selectAll('.legend').attr("display", e.target.checked ? 'inline' : 'none'));
                };
                function legendEvent() {

                    var raiseAndDrag = (d3_selection) => {
                        let x_fixed = 0, y_fixed = 0;
                        let legend_dragBehavior = d3.drag()
                            .on('start', function (e) {
                                // console.log('drag start');
                                let matrix = this.transform.baseVal[0].matrix;
                                x_fixed = e.x - matrix.e;
                                y_fixed = e.y - matrix.f;
                            })
                            .on('drag end', function (e) {
                                // console.log('drag');
                                let translateX = e.x - x_fixed;
                                let translateY = e.y - y_fixed;

                                let targetSVGRect = this.getBBox();
                                let targetWidth = targetSVGRect.width;
                                let targetHeight = targetSVGRect.height;
                                let targetFix = this.classList.contains('overview') ? 20 : 0;//overview要算上toolbar高

                                // console.debug(targetSVGRect);
                                let range_margin = 5;
                                let xRange = [0 + range_margin, width - targetWidth - range_margin];
                                let yRange = [targetFix + range_margin, height - targetHeight + targetFix - range_margin];
                                //不能拉出svg範圍

                                if (translateX < xRange[0])
                                    translateX = xRange[0];
                                else if (translateX > xRange[1])
                                    translateX = xRange[1];
                                // console.debug(width)
                                if (translateY < yRange[0])
                                    translateY = yRange[0];
                                else if (translateY > yRange[1])
                                    translateY = yRange[1];

                                d3.select(this).attr("transform", `translate(${translateX}, ${translateY})`);
                            })

                        d3_selection
                            .attr("cursor", 'grab')
                            .call(g => g.raise())//把選中元素拉到最上層(比zoom的選取框優先)
                            .call(g => g.selectAll('.legend').call(legend_dragBehavior));

                    };
                    svg.select('.legendGroup').call(raiseAndDrag);

                };
                chartOptionEvent();
                legendEvent();
                tooltipEvent();
            };

            svg.call(events);

            return svg.node();
        };
        function singleChart() {

        };

        if (!(chartContainerJQ.find('#form-header').length >= 1)) {
            init();
            console.log('init header & data for once');
        };
        printChart();
    };
    return chart;

};
