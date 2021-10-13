function requestRate() {

    var selector = 'body';
    var dataPath;
    var typeNamePath;
    var data;
    var typeName;
    var typesOfException = [];

    // var test;
    chart.selector = (vaule) => {
        selector = vaule;
        return chart;
    };
    chart.dataPath = (vaule) => {
        dataPath = vaule;
        return chart;
    };
    chart.typeNamePath = (vaule) => {
        typeNamePath = vaule;
        return chart;
    };
    chart.dataObj = (vaule) => {
        // console.log(vaule);
        // test = vaule;
        let column = ["id", "file_size", "datetime", "finish_process_time", "tmp_server_time", "complete_time"];
        data = vaule.map(d => {
            let obj = {};
            column.forEach((key, i) => obj[key] = i > 1 ? new Date(d[key] + "Z").getTime() : d[key]);
            return obj;
        });
        // data = vaule.map(d => {
        //     // let obj = {};
        //     let obj = d;
        //     column.forEach((key, i) => obj[key] = i > 1 ? new Date(d[key] + "Z").getTime() : d[key]);
        //     return obj;
        // });
        data.column = column;
        console.log(data);
        return chart;
    };
    chart.typeNameObj = (vaule) => {
        typeName = vaule.map(v => {
            v.id = !isNaN(v.id) ? parseInt(v.id) : v.id;
            return v;
        });
        // let column = ["id", "chinese_description"];
        let column = Object.keys(typeName[0]);
        typeName.column = column;
        console.log(typeName);
        return chart;
    };
    chart.typesOfException = (vaule) => {
        typesOfException = vaule.map(v => !isNaN(v) ? parseInt(v) : v);
        console.log('typesOfException=' + typesOfException);
        return chart;
    };
    function chart() {

        const chartContainerJQ = $(selector);
        const chartContainerD3 = d3.select(selector);

        const width = 800;
        const height = 600;
        const margin = ({ top: 80, right: 50, bottom: 40, left: 60 });

        const dataKeys = data.column;
        const typeNameKeys = typeName.column;
        const rateDataKeys = ['processing_speed', 'internal_transmission_rate', 'external_transmission_rate', 'global_reaction_rate'];
        const originUnit = 'KB';
        var rateData;
        const getString = (value) => {
            let string = '';
            switch (value) {
                case 'processing_speed':
                    string = '處理速率';
                    break;
                case 'internal_transmission_rate':
                    string = '內部傳輸速率';
                    break;
                case 'external_transmission_rate':
                    string = '外部傳輸速率';
                    break;
                case 'global_reaction_rate':
                    string = '總反應速率';
                    break;
                case 'date':
                    string = 'Date';
                    break;
                case 'fileSize':
                    string = 'File size ( KB )';
                    break;
                //==tooltip
                case 'datetime':
                    string = '訂單時間';
                    break;
                case 'file_size':
                    string = '檔案大小';
                    break;
                default:
                    string = value;
                    break;
            };
            return string;
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
        const makeShape = (d3Selection, shapeIndex, centre, rateData = null, color = null) => {
            // console.debug(shapeIndex, dataIndex);
            // console.debug(rateData);
            const circle_r = 3;
            const rect_width = 5;
            const triangle_corner = 3, triangle_r = 3.5;
            const star_corner = 5, star_r1 = 4, star_r2 = 2;
            // const fillColor = dots.attr('stroke');


            const fillColor = 'white', fillOpacity = 0;
            const strokeWidth = 1.5, strokeOpacity = 1;

            const polygonPoints = (cx, cy, r, n, invert = false) => {
                let alpha = 2 * Math.PI / n;
                let a = Math.PI / 2 + (invert ? alpha : alpha / 2);
                let points = [];
                for (let i = 0; i < n; i++) {
                    // console.debug(a);
                    let x = cx + r * Math.cos(a);
                    let y = cy + r * Math.sin(a);
                    points.push([x, y]);
                    a += alpha;
                }
                return points;
            };

            let shape = { 0: 'circle', 1: 'rect', 2: 'polygon', 3: 'polygon' }[shapeIndex];
            // let shape = { 0: 'circle', 1: 'path', 2: 'polygon', 3: 'polygon' }[shapeIndex];
            let display_class = rateDataKeys[shapeIndex];
            let shapeSelection = rateData ?//==沒有rateData的是legend上或是display menu的範例圖形
                d3Selection.selectAll("." + display_class)
                    .data([rateData])
                    .join(shape)
                    .attr("class", display_class) :
                d3Selection
                    .append(shape)
                    .attr("stroke", color ? color : 'grey');

            switch (shapeIndex) {
                case 0:
                    // console.debug('circle');
                    shapeSelection
                        .attr("stroke-width", strokeWidth)
                        .attr("fill", fillColor)
                        .attr("cx", centre.x)
                        .attr("cy", centre.y)
                        .attr("r", circle_r)
                        .attr("fill-opacity", fillOpacity)
                        .attr("stroke-opacity", strokeOpacity);
                    break;
                case 1:
                    // console.debug('rect');
                    shapeSelection
                        .attr("stroke-width", strokeWidth)
                        .attr("fill", fillColor)
                        .attr("x", centre.x - rect_width * 0.5)
                        .attr("y", centre.y - rect_width * 0.5)
                        .attr("width", rect_width)
                        .attr("height", rect_width)
                        .attr("fill-opacity", fillOpacity)
                        .attr("stroke-opacity", strokeOpacity);

                    // shapeSelection
                    //     .attr("transform", `translate(${centre.x}, ${centre.y})`)
                    //     .attr("stroke-width", strokeWidth)
                    //     .attr("fill", 'none')
                    //     .attr("stroke-opacity", strokeOpacity)
                    //     .attr("d", "m 4 0 A 1 1 0 0 0 -4 0 A 1 1 0 0 1 -2 0 A 1 1 0 0 1 -0.137 -0.547 V 4.574 Q -0.594 5.214 -1.112 4.574 Q -1.387 4.452 -1.234 4.757 Q -0.594 5.58 0.137 4.696 V -0.547 A 1 1 0 0 1 2 0 A 1 1 0 0 1 4 0");

                    break;
                case 2:
                    // console.debug('triangle');
                    let triangle_points = polygonPoints(centre.x, centre.y, triangle_r, triangle_corner, false);
                    shapeSelection
                        .attr("stroke-width", strokeWidth)
                        .attr("fill", fillColor)
                        .attr("points", triangle_points.join(','))
                        .attr("fill-opacity", fillOpacity)
                        .attr("stroke-opacity", strokeOpacity);
                    break;
                case 3:
                    // console.debug('star');
                    let star_r1_points = polygonPoints(centre.x, centre.y, star_r1, star_corner, false);
                    let star_r2_points = polygonPoints(centre.x, centre.y, star_r2, star_corner, true);
                    shapeSelection
                        .attr("stroke-width", strokeWidth)
                        .attr("fill", fillColor)
                        .attr("points", d3.range(star_corner).map(i =>
                            star_r1_points[i].join(',') + ' ' + star_r2_points[i].join(',')
                        ))
                        .attr("fill-opacity", fillOpacity)
                        .attr("stroke-opacity", strokeOpacity);

                    // var star_centre = [100, 100];
                    // //弧度 = 角度 × π / 180
                    // var star_radian = d3.range(star_corner).map(i => (360 * i / star_corner) * Math.PI / 180);
                    // var star_r1_points = star_radian.map(rad => [star_centre[0] + star_r1 * Math.cos(rad), star_centre[1] + star_r1 * Math.sin(rad)]);
                    // var star_r2_points = star_radian.map(rad => [star_centre[0] + star_r2 * Math.cos(rad), star_centre[1] + star_r2 * Math.sin(rad)]);
                    // // console.debug(star_radian)    

                    break;
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
                                        <input type="radio" name ="chartType" value="1" > 1
                                    </label>
                                    <label class="btn btn-secondary">
                                        <input type="radio" name ="chartType" value="2" checked> 2
                                    </label>
                                    <label class="btn btn-secondary">
                                        <input type="radio" name ="chartType" value="3"> 3
                                    </label>
    
                                </div>
                            </div>   
        
                        </div>
                    </div>       
                </form>
    
               
                `);
                //============================
                chartContainerJQ.find('input[name ="chartType"]')
                    .on('click', function (e) {
                        // console.debug($(e.target).siblings().filter('.dropdown-menu'));
                        printChart();
                        // $(e.target).siblings().filter('.dropdown-menu').addClass('show');
                    });
            };
            var initData = () => {

                {      //刪掉不需要的type ＆ 算rateData
                    // const typesOfException = [6, 7];
                    // console.debug(typesOfException);
                    data = data.filter(d => !typesOfException.includes(d[dataKeys[0]]));
                    typeName = typeName.filter(tn => !typesOfException.includes(tn[typeNameKeys[0]]));
                    rateData = function () {
                        let rateData;
                        let getRate = (fileSize, date1, date2) => {
                            let time_interval = date2 - date1;
                            let rate = time_interval > 0 ? parseFloat((fileSize / (time_interval / 1000)).toFixed(2)) : undefined;
                            return rate;
                        };
                        rateData = data.map(d => {
                            let fileSize = d[dataKeys[1]];
                            let t1 = d[dataKeys[2]], t2 = d[dataKeys[3]], t3 = d[dataKeys[4]], t4 = d[dataKeys[5]];

                            let obj = {};
                            obj[rateDataKeys[0]] = getRate(fileSize, t1, t2);
                            obj[rateDataKeys[1]] = getRate(fileSize, t2, t3);
                            obj[rateDataKeys[2]] = getRate(fileSize, t3, t4);
                            obj[rateDataKeys[3]] = getRate(fileSize, t1, t4);
                            return obj;
                        })
                        return rateData;
                    }();
                    console.log(rateData);
                    // ==比較rateData速率與原始資料異同
                    // {
                    //     // console.debug(rateData);
                    //     // console.debug(data);
                    //     let testKeys = ['v1', 'v2', 'v3', 'v_final']
                    //     let diff = [];
                    //     rateData.forEach((d, i) => {
                    //         let tmp = [];
                    //         let diffFlag = false;
                    //         rateDataKeys.forEach((key, ki) => {
                    //             // if (!d[key] === data[i][testKeys[ki]] || data[i][testKeys[ki]] == null) {
                    //             if (!(d[key] == data[i][testKeys[ki]])) {
                    //                 // console.debug('diff')
                    //                 if (!(d[key] == undefined && (data[i][testKeys[ki]] == 0 || data[i][testKeys[ki]] == -1))) {
                    //                     diffFlag = true;
                    //                     tmp.push(testKeys[ki] + ":" + data[i][testKeys[ki]] + " <-> " + d[key]);
                    //                 }
                    //             }
                    //             // if (data[i][testKeys[ki]] === null)
                    //             //     console.debug(i, d[key], data[i][testKeys[ki]])
                    //         });
                    //         if (diffFlag)
                    //             diff.push({
                    //                 index: i,
                    //                 diff: tmp,
                    //             })
                    //     });
                    //     console.debug(diff);
                    // }

                    // console.debug(undefined === 0);
                    // console.debug(data);
                    // console.debug(dataKeys, rateDataKeys);
                }

            };
            initNode();
            initData();

        };
        var printChart = () => {
            chartContainerJQ.find('#form-chart').remove();
            // chartContainerJQ.find('.tooltip').remove();
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
                        svgArr.push(svg);
                        let fileName = 'AAA';
                        downloadSvg(svgArr, fileName, option);
                    });

                    li.append(item);
                    ul.append(li);
                });
                document.querySelector('#charts').append(div);
                document.querySelector('#chart' + i).append(nav);
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

                chartContainerJQ.find('.toggle-nav').off('click');
                chartContainerJQ.find('.toggle-nav').click(function (e) {
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
                // console.debug(chartContainerJQ.find(".toggle-nav"));
                $('body').off('click');
                $('body').click(function (e) {
                    chartContainerJQ.find(".toggle-nav").each((i, d) => {
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
                        var windowW = window.innerWidth;//获取当前窗口宽度 
                        var windowH = window.innerHeight;//获取当前窗口高度 

                        var width, height;
                        var scale = 0.9;//缩放尺寸
                        height = windowH * scale;
                        width = height / svgHeight * svgWidth;
                        while (width > windowW * scale) {//如宽度扔大于窗口宽度 
                            height = height * scale;//再对宽度进行缩放
                            width = width * scale;
                        }
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


                    svgArr.forEach(queryStr => {
                        var svgjQobj = $(queryStr);
                        svgjQobj.clone().appendTo(newSvg);
                    });
                    // console.debug(newSvg);
                    var svgUrl = getSvgUrl(newSvg);
                    download(svgUrl, fileName + '.' + option);
                }
                else {
                    //==============each svg draw to canvas
                    var CanvasObjArr = getCanvas(option == 'bigimg');

                    var canvas = CanvasObjArr[0];
                    var context = CanvasObjArr[1];
                    var imageWidth = canvas.width;
                    var imageHeight = canvas.height / svgArr.length;


                    svgArr.forEach((queryStr, index) => {
                        var svgNode = $(queryStr)[0];
                        var svgUrl = getSvgUrl(svgNode);
                        var image = new Image();
                        image.src = svgUrl;
                        image.onload = () => {
                            context.drawImage(image, 0, index * imageHeight, imageWidth, imageHeight);

                            //done drawing and output
                            if (index == svgArr.length - 1) {
                                var imgUrl;
                                if (option == 'bigimg') {
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


            let chartType = document.querySelector('input[name ="chartType"]:checked').value;
            // console.debug(chartType);

            var i = 1;
            let chartNode = chartType == 1 ? RQRchart() : chartType == 2 ? barChart() : rateChart();
            // console.debug(chartNode);
            getChartMenu();
            chartContainerJQ.find('#chart' + i).append(chartNode);
            MenuEvents();
        };
        var getFileData = () => {
            data = [], typeName = [];

            //===get floder name(catalog) to make option
            var readTextFile = (file, dataType = 'string') => {
                var tmpData = [];
                var rawFile = new XMLHttpRequest();
                rawFile.open("GET", file, false);
                rawFile.onreadystatechange = function () {
                    if (rawFile.readyState === 4) {
                        if (rawFile.status === 200 || rawFile.status == 0) {
                            var rows = rawFile.responseText.split("\n");
                            // console.debug(rows);
                            var fileDataKey;
                            var getParseData = (data, index) => {
                                let parseData;
                                switch (dataType) {
                                    case 'request_log':
                                        parseData = index > 1 ?
                                            new Date(data.replaceAll('\"', '')).getTime() :
                                            parseInt(data.replaceAll('\"', ''));
                                        break;
                                    case 'scriptList':
                                        parseData = index == 0 ?
                                            parseInt(data.replaceAll('\"', '')) :
                                            data.replaceAll('\"', '');
                                        break;
                                    default:
                                        parseData = data;
                                        break;
                                }
                                return parseData;
                            }
                            rows.forEach((row, i) => {
                                if (row != '') {
                                    var col = row.trim().split(',');
                                    if (i == 0)
                                        fileDataKey = col.map(c => c.replaceAll('\"', ''));
                                    else {
                                        let obj = {};
                                        col.forEach((c, index) => obj[fileDataKey[index]] = getParseData(c, index));
                                        tmpData.push(obj);
                                    }
                                }

                            })

                        }
                    }
                }
                rawFile.send(null);
                return tmpData;
            }
            //===之後加
            var readJsonFile = (file) => {

            };
            var getFileType = (path) => path.substring(path.lastIndexOf('.') + 1);

            dataPath.forEach(path => {
                let fileType = getFileType(path);
                let dataArr = fileType == 'json' ? readJsonFile(path, 'request_log') : readTextFile(path, 'request_log');
                data = data.concat(dataArr);
            })
            data.column = Object.keys(data[0]);
            typeName = readTextFile(typeNamePath, 'scriptList');
            typeName.column = Object.keys(typeName[0]);
            console.log("data=");
            console.log(data);
            console.log("typeName=");
            console.log(typeName);
        };


        //===3 types of chart
        function RQRchart() {
            // console.debug(data);
            // console.debug(rateData);
            ~function init() {
                chartContainerJQ.append(`
                <form id="form-chart">
                <div class="form-group" id="chartsOptions" style="display: inline;">
                <div class="row">
    
                    <!-- ... xAxis ... -->    
                    <div class="form-group col-lg-3 col-md-3 col-sm-6 d-flex flex-row align-items-start">
                        <label for="xAxisOptionButton" class="col-form-label col-5" >Xaxis</label>
                        <div class="btn-group btn-group-toggle col-7" role="group">
                            <button id="xAxisOptionButton" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                date
                            </button>
                            <div class="dropdown-menu" id="xAxisMenu" aria-labelledby="xAxisOptionButton">
                                <div class="form-group col-12 d-flex flex-row flex-wrap align-items-start justify-content-between" id="xAxisDropDownMenu" >
                                
    
                                <label class="font-weight-bold" for="">Metric</label>                    
                                <div class="col-12 d-flex flex-row">
                                    <div class="form-check col-6 d-flex align-items-start" style="text-align: center;">
                                        <input class="form-check-input col-3" type="checkbox" id="xAxis_date" name="xAxisMetric" value="date" checked>
                                        <label class="" for="xAxis_date">date</label>
                                    </div>
                                    <div class="form-check col-6 d-flex align-items-start" style="text-align: center;">
                                        <input class="form-check-input col-3" type="checkbox" id="xAxis_fileSize" name="xAxisMetric" value="fileSize">
                                        <label for="xAxis_fileSize">fileSize</label>
                                    </div>
                                </div>
    
                                <label class="font-weight-bold" for="">Scale</label>
                                <div class="col-12 d-flex flex-row">
                                    <div class="col-6 form-check d-flex align-items-start" style="text-align: center;">
                                        <input class="form-check-input col-3" type="checkbox" id="xAxis_log" name="xAxisScale" value="log" disabled>
                                        <label class="" for="xAxis_log">logrithmic</label>
                                    </div>
                                </div>
    
                                </div>
                            </div>
                        </div>
                    </div>  
                    
                    <!-- ... yAxis ... -->    
                    <div class="form-group col-lg-3 col-md-3 col-sm-6 d-flex flex-row align-items-start">
                        <label for="yAxisOptionButton" class="col-form-label col-5" >Yaxis</label>
                        <div class="btn-group btn-group-toggle col-7" role="group">
                            <button id="yAxisOptionButton" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                MB/s
                            </button>
                            <div class="dropdown-menu" id="yAxisMenu" aria-labelledby="yAxisOptionButton">
                                <div class="form-group col-12 d-flex flex-row flex-wrap align-items-start justify-content-between" id="yAxisDropDownMenu" >
    
                                <label class="font-weight-bold" for="">Metric</label>                    
                                <div class="col-12 d-flex flex-row">
                                    <div class="form-check col-4 d-flex align-items-start" style="text-align: center;">
                                        <input class="form-check-input col-3" type="checkbox" id="yAxis_KB" name="yAxisMetric" value="KB">
                                        <label class="" for="yAxis_KB">KB/s</label>
                                    </div>
                                    <div class="form-check col-4 d-flex align-items-start" style="text-align: center;">
                                        <input class="form-check-input col-3" type="checkbox" id="yAxis_MB" name="yAxisMetric" value="MB" checked>
                                        <label for="yAxis_MB">MB/s</label>
                                    </div>
                                    <div class="form-check col-4 d-flex align-items-start" style="text-align: center;">
                                        <input class="form-check-input col-3" type="checkbox" id="yAxis_GB" name="yAxisMetric" value="GB">
                                        <label for="yAxis_GB">GB/s</label>
                                    </div>
                                </div>
    
                                <label class="font-weight-bold" for="">Scale</label>
                                <div class="col-12 d-flex flex-row">
                                    <div class="col-4 form-check d-flex align-items-start" style="text-align: center;">
                                        <input class="form-check-input col-3" type="checkbox" id="yAxis_log" name="yAxisScale" value="log">
                                        <label class="" for="yAxis_log">logrithmic</label>
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
                                    <div class="form-check col-12 ">
                                        <input class="form-check-input  col-3" type="checkbox" id="showPath" name="show" value="0" checked>
                                        <label class="form-check-label  col-12" for="showPath">order path</label>
                                    </div>
    
                                    <div class="form-check col-12">
                                        <input class="form-check-input  col-3" type="checkbox" id="showLegend" name="show" value="0" checked>
                                        <label class="form-check-label  col-12" for="showLegend">legend</label>
                                    </div>
    
    
                                </div>
                            </div>
                        </div>
                    </div>  
    
                    <!-- ... rate unit ... -->    
                    <!--
                    <div class="form-group col-lg-3 col-md-3 col-sm-6 d-flex flex-row align-items-start">
                        <label for="rateUnit" class="col-form-label col-4" >Rate unit</label>
                        <div class="form-group col-8">
                            <select class="form-control" id="rateUnit">
                                <option value="KB">KB/s</option>
                                <option value="MB">MB/s</option>
                                <option value="GB">GB/s</option>
                            </select>
                        </div>
                    </div>  
                    -->
    
    
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

                let All_dropdownMenu = chartContainerJQ.find('.dropdown-menu');

                All_dropdownMenu.on("click.bs.dropdown", function (e) {
                    e.stopPropagation();
                });


            }();

            var colorPalette = {};
            const getColor = (type) => {
                const allColor = ["red", "purple", "blue", "green", "steelblue", "orange", "pink", "brown", "goldenrod",
                    "olive", "teal", "aqua", "slategray", "greenyellow", "mediumspringgreen"];
                let color;
                // type = parseInt(type);
                color = colorPalette[type];

                if (!color) {
                    let index = type % allColor.length;
                    color = allColor[index];

                    index = 0;
                    while (Object.values(colorPalette).includes(color)) {
                        if (index == allColor.length - 1) {
                            color = 'black';
                            break;
                        }
                        color = allColor[index++];
                        // console.debug(index);
                    }
                    colorPalette[type] = color;
                }

                return color;
            };

            const svg = d3.create("svg")
                .attr("viewBox", [0, 0, width, height]);
            const xAxis = svg.append("g").attr("class", "xAxis");
            const yAxis = svg.append("g").attr("class", "yAxis");
            const focusGroup = svg.append("g").attr('class', 'focus');
            const legendGroup = svg.append("g").attr('class', 'legendGroup');

            var x, y;
            var newDataObj;
            var display_timming_index = d3.range(rateDataKeys.length);



            function updateChart(trans = false) {

                function init() {

                    //==title
                    let title = 'GDMS系統負載監測';

                    svg
                        .append("g")
                        .attr("class", "title")
                        .append('text')
                        .attr("fill", "currentColor")
                        // .attr("align", "center")
                        .attr("text-anchor", "middle")
                        .attr("alignment-baseline", "text-after-edge")
                        .attr("font-weight", "bold")
                        .attr("font-size", "15")
                        .attr("x", width / 2)
                        .attr("y", margin.top / 2)
                        .text(title);


                    xAxis
                        .append('text')
                        .attr("class", "axis_name")
                        .attr("fill", "black")
                        .attr("font-weight", "bold")
                        .attr("font-size", "12")
                        .attr('x', width / 2)
                        .attr("y", margin.bottom - 10);


                    yAxis
                        .append('text')
                        .attr("class", "axis_name")
                        .attr("fill", "black")
                        .attr("font-weight", "bold")
                        .attr("font-size", "12")
                        .style("text-anchor", "middle")
                        .attr("alignment-baseline", "text-before-edge")
                        .attr("transform", "rotate(-90)")
                        .attr('x', -(height - margin.top - margin.bottom) / 2 - margin.top)
                        .attr("y", -margin.left + 2);

                    //==legendGroup
                    {
                        let typeLegend_rect_interval = 1;
                        let typeLegend_rect_width = 50;
                        let typeLegend_rect_height = 10;

                        legendGroup.append("g")
                            .attr("class", "legend")
                            .attr("id", "typeLegend")
                            .call(g => g.append("text")
                                .attr("font-size", 10)
                                .attr("font-weight", 900)
                                .attr("text-anchor", "start")
                                .attr("alignment-baseline", "after-edge")
                                .attr("y", -2)
                                .text('type'))
                            .attr("transform", `translate(${width - margin.right - typeName.length * (typeLegend_rect_width + typeLegend_rect_interval)}, ${margin.top * 0.7})`)
                            .selectAll("g")
                            .data(typeName)
                            .join("g")
                            .attr("transform", (d, i) => `translate(${i * (typeLegend_rect_width + typeLegend_rect_interval)}, 0)`)
                            .call(g => {
                                g.append("rect")
                                    .attr("width", typeLegend_rect_width)
                                    .attr("height", typeLegend_rect_height)
                                    .attr("fill", d => getColor(d[typeNameKeys[0]]));

                                g.append("text")
                                    // .attr("x", typeLegend_rect_width / 2)
                                    // .attr("y", typeLegend_rect_height + 2)
                                    .attr("transform", `translate(${typeLegend_rect_width / 2}, ${typeLegend_rect_height + 2})`)
                                    .attr("fill", "currentcolor")
                                    .attr("color", "black")
                                    .attr("font-family", "sans-serif")
                                    .attr("font-size", 8)
                                    .attr("font-weight", 600)
                                    .attr("text-anchor", "middle")
                                    .attr("alignment-baseline", "before-edge")
                                    .attr("position", "relative")
                                    .call(text_collection => text_collection.each(function (d) {
                                        // console.debug(this);
                                        let text = d3.select(this);
                                        let string = d[typeNameKeys[1]];

                                        if (string.includes('('))
                                            text
                                                .text(string.substring(0, string.indexOf('(')))
                                                .append('tspan')
                                                .attr("x", 0)
                                                .attr("y", "2.5em")
                                                .text(string.substring(string.indexOf('(')));
                                        else if (string.length > 5)
                                            text.text(string.substring(0, 4))
                                                .append('tspan')
                                                .attr("x", 0)
                                                .attr("y", "2.5em")
                                                .text(string.substring(4));
                                        else
                                            text.text(string);

                                    }))
                            });


                        let shapeLegend_eachShape_width = 120;
                        let shapeLegend_eachShape_height = 30;
                        let shapeLegend_rect_interval = shapeLegend_eachShape_height * 0.5;

                        legendGroup.append("g")
                            .attr("class", "legend")
                            .attr("id", "shapeLegend")
                            .call(g => g.append("rect")
                                .attr("width", shapeLegend_eachShape_width)
                                .attr("height", shapeLegend_eachShape_height * rateDataKeys.length)
                                .attr("fill", "#D3D3D3")
                                .attr("opacity", .5)
                                .attr("stroke-width", "1")
                                .attr("stroke", "black")
                                .attr("stroke-opacity", .8)
                            )
                            .attr("transform", `translate(${width - margin.right - shapeLegend_eachShape_width}, ${margin.top * 1.1})`)
                            .selectAll("g")
                            .data(rateDataKeys)
                            .join("g")
                            .attr("transform", (d, i) => `translate(0, ${i * shapeLegend_eachShape_height})`)
                            .call(g_collection =>
                                g_collection.each(function (d, i) {
                                    // console.debug(this);
                                    let g = d3.select(this);
                                    makeShape(g, i, { x: shapeLegend_rect_interval, y: shapeLegend_rect_interval });
                                    g.append("text")
                                        .attr("x", shapeLegend_eachShape_width * 0.3)
                                        .attr("y", shapeLegend_rect_interval)
                                        .attr("fill", "currentcolor")
                                        .attr("color", "black")
                                        .attr("font-family", "sans-serif")
                                        .attr("font-size", 12)
                                        .attr("font-weight", 600)
                                        .attr("alignment-baseline", "central")
                                        .text(getString(d))
                                })

                            );
                    }

                    //===displayDrop
                    chartContainerD3.select('#displayDropDownMenu')
                        .selectAll('div')
                        .data(rateDataKeys)
                        .join('div')
                        .attr('class', 'form-check col-12 d-flex flex-nowrap')
                        .style("padding-left", '35px')
                        .style("position", 'static')
                        .call(menu => {
                            // console.debug(div.nodes());
                            menu.each(function (d, i) {
                                // console.debug(d);
                                let div = d3.select(this);
                                div
                                    .append('input')
                                    .attr('class', 'form-check-input')
                                    .attr('type', 'checkbox')
                                    .attr('id', 'display_' + i)
                                    .attr('name', 'display')
                                    .attr('value', i)
                                    .property('checked', true);
                                div
                                    .append('label')
                                    .attr('class', 'form-check-label')
                                    .attr('for', 'display_' + i)
                                    .style("white-space", "nowrap")
                                    .text(getString(d));

                                let svg_width = 20;
                                div.append('svg')
                                    .attr("viewBox", [0, 0, svg_width, svg_width])
                                    .style("position", 'relative')
                                    // .style("left", '20px')
                                    .attr("width", svg_width)
                                    .attr("height", svg_width)
                                    .call(displaySvg => makeShape(displaySvg, i, { x: svg_width * 0.5, y: svg_width * 0.5 }));

                            });
                        });

                };
                function render() {

                    var newData = newDataObj.newData;
                    var newRateData = newDataObj.newRateData;
                    var xAxisOption = newDataObj.xAxisOption;
                    var yAxisOption = newDataObj.yAxisOption;
                    var xAxis_domain = newDataObj.xAxis_domain;
                    // console.debug(xAxis_domain);

                    var display_DataKeys = dataKeys.slice(2).filter((key, i) => display_timming_index.includes(i));
                    var display_rateDataKeys = rateDataKeys.filter((key, i) => display_timming_index.includes(i));
                    // console.debug(display_rateDataKeys);
                    // console.debug(dataKeys[1]);

                    var getNiceDomain = (domain, addRate = 0.1) => {
                        let min = domain[0];
                        let max = domain[1];

                        let addRange = Math.abs(max - min) * addRate;
                        max += addRange;
                        min -= addRange;

                        return [min, max];
                    };

                    var xAxisDomain = xAxis_domain ?
                        xAxis_domain : xAxisOption.metric == 'date' ?
                            d3.extent([].concat(...newData.map(d => d3.extent([display_DataKeys[0], display_DataKeys[display_DataKeys.length - 1]], key => d[key])))) :
                            d3.extent([].concat(...newData.map(d => d[dataKeys[1]])));//  key=file_size

                    var yAxisDomain =
                        display_rateDataKeys.length == 0 ?
                            d3.extent([].concat(...newRateData.map(rd => d3.extent(rateDataKeys, key => rd[key])))) :
                            d3.extent([].concat(...newRateData.map(rd => d3.extent(display_rateDataKeys, key => rd[key]))));

                    // console.debug(xAxisDomain);

                    x = d3[{ date: 'scaleUtc', fileSize: xAxisOption.logScale ? 'scaleLog' : 'scaleLinear' }[xAxisOption.metric]]()
                        .domain(xAxisDomain)
                        .range([margin.left, width - margin.right]);
                    if (xAxisOption.logScale && !xAxis_domain) x.nice();

                    // console.debug(yAxisDomain);
                    y = d3[yAxisOption.logScale ? 'scaleLog' : 'scaleLinear']()
                        .domain(getNiceDomain(yAxisDomain.map(d => convert_download_unit(d, originUnit, yAxisOption.metric).value), yAxisOption.logScale ? 0 : 0.01))
                        .range([height - margin.bottom, margin.top]);
                    if (yAxisOption.logScale) y.nice();

                    // console.debug(x.domain());

                    var refreshText = () => {
                        xAxis
                            .select('.axis_name')
                            .text(getString(xAxisOption.metric));


                        yAxis
                            .select('.axis_name')
                            .text(`Rate ( ${yAxisOption.metric} / s )`);


                    };
                    var updateAxis = () => {
                        function formatPower(x) {
                            const e = Math.log10(x);
                            if (e !== Math.floor(e)) return; // Ignore non-exact power of ten.
                            return `10${(e + "").replace(/./g, c => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c] || "⁻")}`;
                        };

                        var makeXAxis = g => g
                            .attr("transform", `translate(0,${height - margin.bottom})`)
                            .call(g => {
                                let axisFun = d3.axisBottom(x).tickSizeOuter(0);
                                xAxisOption.metric == 'date' ?
                                    axisFun.ticks(width / 80) :
                                    xAxisOption.logScale ?
                                        axisFun.ticks(Math.log10(x.domain()[1] / x.domain()[0]) + 1, formatPower) :
                                        axisFun.ticks(width / 80);
                                axisFun(g);
                            });

                        var makeYAxis = g => g
                            .attr("transform", `translate(${margin.left},0)`)
                            .call(g => {
                                let axisFun = d3.axisLeft(y);
                                yAxisOption.logScale ?
                                    axisFun.ticks(Math.log10(y.domain()[1] / y.domain()[0]) + 1, formatPower) :
                                    axisFun.ticks(height / 30);
                                axisFun(g);
                            })
                            .call(g =>
                                g.selectAll("g.yAxis g.tick line")
                                    .attr("x2", d => width - margin.left - margin.right)
                                    .attr("stroke-opacity", 0.2)
                            );

                        xAxis.call(makeXAxis);
                        yAxis.call(makeYAxis);
                    };
                    var updateFocus = () => {
                        var makeDots = focusGroup => focusGroup
                            // .style("mix-blend-mode", "hard-light")
                            .selectAll("g")
                            .data(newData)
                            .join("g")
                            .attr("id", (d, i) => 'group_' + i)
                            .attr("class", "dots")
                            .attr("stroke", d => getColor(d[dataKeys[0]]))
                            .call(() =>
                                focusGroup.selectAll(".dots").each(function (d, i) {
                                    // console.debug([d]);
                                    let dots = d3.select(this);

                                    let rateArr = display_rateDataKeys.map(key =>
                                        convert_download_unit(newRateData[i][key], originUnit, yAxisOption.metric).value);
                                    let xdataArr = {
                                        date: display_DataKeys.map(key => d[key]),
                                        fileSize: rateArr.map(() => d[dataKeys[1]]),
                                    }[xAxisOption.metric];


                                    let line = d3.line()
                                        .defined((d, i) => !isNaN(rateArr[i]))
                                        .x(d => x(d))
                                        .y((d, i) => y(rateArr[i]));

                                    dots
                                        .selectAll(".orderPath")
                                        .data([d])
                                        .join("path")
                                        .attr("class", "orderPath")
                                        .attr("stroke-width", 1.2)
                                        .attr("fill", 'none')
                                        .attr("stroke-opacity", 1)
                                        .attr("d", line(xdataArr));

                                    display_timming_index.forEach((shapeIndex, dataIndex) => {
                                        // console.debug(shapeIndex, dataIndex)
                                        // console.debug(rateArr)

                                        //有rateData就更新圖形
                                        if (!isNaN(rateArr[dataIndex])) {
                                            let centre = { x: x(xdataArr[dataIndex]), y: y(rateArr[dataIndex]) };
                                            makeShape(dots, shapeIndex, centre, rateArr[dataIndex]);
                                        }
                                        //否則刪除（不然會遺留之前group裡的圖形）
                                        else
                                            dots.select("." + rateDataKeys[shapeIndex]).remove();

                                    });


                                }));

                        focusGroup.call(makeDots);
                    };

                    refreshText();
                    updateAxis();
                    updateFocus();

                };

                if (!newDataObj) {
                    newDataObj = getNewData
                        (
                            {
                                metric: chartContainerD3.selectAll('input[name=xAxisMetric]:checked').property("value"),
                                logScale: false,
                            },
                            {
                                metric: chartContainerD3.selectAll('input[name=yAxisMetric]:checked').property("value"),
                                logScale: false,
                            }
                        );
                    init();
                };
                render();



            };
            function getNewData(xAxisOption = null, yAxisOption = null, xAxis_domain = null) {
                let newData, newRateData;

                xAxisOption = xAxisOption ? xAxisOption : newDataObj.xAxisOption;
                yAxisOption = yAxisOption ? yAxisOption : newDataObj.yAxisOption;

                // console.debug(xAxis_domain);

                var update_newData_and_newRateData = () => {

                    if (xAxis_domain) {
                        let dataKeys_idx = newDataObj.xAxisOption.metric == 'date' ? 2 : 1;
                        newRateData = [];//==挑到的資料索引值用來挑rate陣列的資料(沒有排序不能直接i1 i2切割)
                        newData = newDataObj.newData.filter((d, i) => {
                            let data = d[dataKeys[dataKeys_idx]];
                            if (data >= xAxis_domain[0] && data <= xAxis_domain[1]) {
                                newRateData.push(newDataObj.newRateData[i]);
                                return true;
                            };
                        });


                    }
                    else {
                        newData = data;
                        newRateData = rateData;
                    };
                };
                update_newData_and_newRateData();

                let tmpObj = {
                    newData: newData,
                    newRateData: newRateData,
                    xAxis_domain: xAxis_domain,
                    xAxisOption: xAxisOption,
                    yAxisOption: yAxisOption,
                };
                console.debug(tmpObj);
                return tmpObj;

            };
            updateChart();


            function events(svg) {
                // console.debug(newDataObj);

                var xAxis_domain = null,
                    xAxisOption = newDataObj.xAxisOption,
                    yAxisOption = newDataObj.yAxisOption;

                function chartEvent() {
                    const defs = svg.append("defs");
                    //===遮罩
                    defs
                        .append("clipPath")
                        .attr("id", "clip")
                        .append("rect")
                        .attr("id", "chartRenderRange")
                        .attr('x', margin.left)
                        .attr('y', margin.top)
                        .attr('width', width - margin.right - margin.left)
                        .attr('height', height - margin.top - margin.bottom)
                        .attr('fill', 'none')
                        .attr('pointer-events', 'all');

                    //===製造hover時陰影
                    defs
                        .append("filter")
                        .attr("id", "pathShadow")
                        .attr("x", "-0.5")
                        .attr("y", "-0.5")
                        .attr("width", "300%")
                        .attr("height", "300%")
                        .call(filter => {
                            filter
                                .append("feOffset")
                                .attr("result", "offOut")
                                .attr("in", "SourceAlpha")
                                .attr("dx", "1")
                                .attr("dy", "1");

                            filter
                                .append("feGaussianBlur")
                                .attr("result", "blurOut")
                                .attr("in", "offOut")
                                .attr("stdDeviation", "2")

                            filter
                                .append("feBlend")
                                .attr("in", "SourceGraphic")
                                .attr("in2", "blurOut")
                                .attr("mode", "normal");

                        });

                    const eventRect = svg.append("g")
                        .attr("class", "eventRect")
                        .append("use").attr('xlink:href', "#chartRenderRange");

                    const tooltip = chartContainerD3.select("#charts")
                        .append("div")
                        .attr("id", "tooltip");

                    //==zoom
                    var mouseDrag = () => {
                        const selectionRect = {
                            element: null,
                            previousElement: null,
                            currentY: 0,
                            currentX: 0,
                            originX: 0,
                            originY: 0,
                            setElement: function (ele) {
                                this.previousElement = this.element;
                                this.element = ele;
                            },
                            getNewAttributes: function () {
                                var x = this.currentX < this.originX ? this.currentX : this.originX;
                                var y = this.currentY < this.originY ? this.currentY : this.originY;
                                var width = Math.abs(this.currentX - this.originX);
                                var height = Math.abs(this.currentY - this.originY);
                                return {
                                    x: x,
                                    y: y,
                                    width: width,
                                    height: height
                                };
                            },
                            getCurrentAttributes: function () {
                                // use plus sign to convert string into number
                                var x = +this.element.attr("x");
                                var y = +this.element.attr("y");
                                var width = +this.element.attr("width");
                                var height = +this.element.attr("height");
                                return {
                                    x1: x,
                                    y1: y,
                                    x2: x + width,
                                    y2: y + height
                                };
                            },
                            // getCurrentAttributesAsText: function () {
                            //     var attrs = this.getCurrentAttributes();
                            //     return "x1: " + attrs.x1 + " x2: " + attrs.x2 + " y1: " + attrs.y1 + " y2: " + attrs.y2;
                            // },
                            init: function (newX, newY) {
                                var rectElement = svg
                                    .append("rect")
                                    .attr('rx', 0)
                                    .attr('ry', 0)
                                    .attr('x', 0)
                                    .attr('y', 0)
                                    .attr('width', 0)
                                    .attr('height', 0)
                                    // .attr('stroke', '#545454')
                                    // .attr('stroke-width', ' 2px')
                                    .attr('stroke-opacity', 1)
                                    .attr('fill', '#97CBFF')
                                    .attr('fill-opacity', 0.5);
                                this.setElement(rectElement);
                                this.originX = newX;
                                this.originY = newY;
                                this.update(newX, newY);
                            },
                            update: function (newX, newY) {
                                this.currentX = newX;
                                this.currentY = newY;

                                let newAttr = this.getNewAttributes();
                                this.element
                                    .attr('x', newAttr.x)
                                    .attr('y', newAttr.y)
                                    .attr('width', newAttr.width)
                                    .attr('height', newAttr.height);
                            },
                            // focus: function () {
                            //     this.element
                            //         .style("stroke", "#DE695B")
                            //         .style("stroke-width", "2.5");
                            // },
                            remove: function () {
                                this.element.remove();
                                this.element = null;
                            },
                            removePrevious: function () {
                                if (this.previousElement) {
                                    this.previousElement.remove();
                                }
                            }
                        };

                        const dragBehavior = d3.drag()
                            .on("start", () => {
                                // console.log("dragStart");
                                const p = d3.pointer(event, eventRect.node());
                                selectionRect.init(p[0], margin.top);
                                selectionRect.removePrevious();
                                d3.select(window).dispatch("click");//關閉dropdown
                                // eventRect.dispatch('mouseleave');//tooltip取消
                            })
                            .on("drag", () => {
                                // console.log("dragMove");
                                const p = d3.pointer(event, eventRect.node());

                                if (p[0] < margin.left)
                                    p[0] = margin.left;
                                else if (p[0] > width - margin.right)
                                    p[0] = width - margin.right;

                                selectionRect.update(p[0], height - margin.bottom);
                            })
                            .on("end", () => {
                                // console.log("dragEnd");
                                const finalAttributes = selectionRect.getCurrentAttributes();
                                // console.debug(finalAttributes);

                                if (finalAttributes.x2 - finalAttributes.x1 > 1)
                                    xAxis_domain = [x.invert(finalAttributes.x1), x.invert(finalAttributes.x2)];
                                else          //-------- reset zoom
                                    xAxis_domain = null;

                                newDataObj = getNewData(null, null, xAxis_domain);
                                updateChart();
                                selectionRect.remove();


                            });


                        eventRect.call(dragBehavior);
                    };
                    //==show tooltip
                    var mouseMove = () => {

                        //用來判斷tooltip應該在滑鼠哪邊
                        const chart_center = [x.range().reduce((a, b) => a + b) * 0.5, y.range().reduce((a, b) => a + b) * 0.5];
                        const tooltipMouseGap = 50;//tooltip與滑鼠距離

                        //讓NodeList能使用map
                        NodeList.prototype.map = Array.prototype.map;

                        var updateTooltip = (dataArr) => {

                            let svg_width = 20;
                            let dataKey = dataKeys[newDataObj.xAxisOption.metric == 'date' ? 2 : 1];
                            var display_rateDataKeys = rateDataKeys.filter((key, i) => display_timming_index.includes(i));

                            // console.debug(rateDataKeys);
                            // console.debug(display_rateDataKeys);

                            tooltip
                                .call(div => div
                                    .selectAll('.tooltipTitle')
                                    .data([0])
                                    .join('text')
                                    .style('font-size', '18px')
                                    .attr('class', 'tooltipTitle')
                                    .text(`${getString(dataKey)} ： `)
                                    .append('br')
                                )
                                .selectAll('div')
                                .data(dataArr)
                                .join('div')
                                // .style('color', (d, i) => 'black')
                                // .style('font-size', 10)
                                .call(divCollection => divCollection.each(function (obj, i) {
                                    let div = d3.select(this);

                                    let key = i == 0 ? dataKey : Object.keys(obj)[0];
                                    let value = obj[key];

                                    if (i != 0) {
                                        div
                                            .style('display', display_rateDataKeys.includes(key) ? 'block' : 'none')
                                            .selectAll('svg')
                                            .data([0])
                                            .join('svg')
                                            .attr("viewBox", [0, 2, svg_width, svg_width])
                                            .style("position", 'relative')
                                            // .style("left", '20px')
                                            .attr("width", svg_width)
                                            .attr("height", svg_width)
                                            .attr("stroke", () => getColor(dataArr[0][dataKeys[0]]))
                                            .call(displaySvg => {
                                                displaySvg.selectAll("*").remove();
                                                makeShape(displaySvg, rateDataKeys.indexOf(key), { x: svg_width * 0.5, y: svg_width * 0.5 }, 1);
                                            });
                                    };

                                    let unit = newDataObj.yAxisOption.metric;

                                    let text = i == 0 ?
                                        key == dataKeys[2] ?//==datetime
                                            new Date(value).toISOString().split('.')[0] :
                                            convert_download_unit(value, originUnit, unit).value + `  ${unit} ` :
                                        parseFloat(value.toFixed(unit == 'GB' ? 5 : 2)) + `  ${unit}/s `;


                                    div
                                        .selectAll('.value')
                                        .data([0])
                                        .join('text')
                                        .style('font-size', '18px')
                                        .attr('class', 'value ')
                                        .text(text);



                                }));

                        };

                        var hover = (target) => {
                            // console.debug(target);

                            //==改變其他g透明度
                            focusGroup.selectAll('g')
                                .call(g =>
                                    g.each(function (d, i) {
                                        let g = d3.select(this);
                                        let hover = (g.data()[0] === target.__data__);
                                        // console.debug(hover)

                                        g
                                            .attr("stroke", hover ? d => getColor(d[dataKeys[0]]) : 'grey')
                                            .selectAll('*')
                                            .attr("stroke-opacity", hover ? 1 : .5);

                                        //===加陰影和上移圖層
                                        if (hover)
                                            g.attr("filter", "url(#pathShadow)").raise();
                                    })
                                );
                        };

                        var leave = () => {
                            //==恢復所有g透明度
                            focusGroup.selectAll('g')
                                .attr("filter", null)//陰影都取消
                                .call(g => g
                                    .attr("stroke", d => getColor(d[dataKeys[0]]))
                                    .selectAll('*')
                                    .attr("stroke-opacity", 1)
                                );
                        };

                        focusGroup.raise()
                            .on('mouseout', function (e) {
                                tooltip.style("display", "none");
                                leave();
                            })
                            .on('mouseover', function (e) {
                                let dotGroup = e.target.parentNode;

                                var makeTooltip = () => {
                                    const pointer = d3.pointer(e, this);

                                    let mouseX = e.offsetX, mouseY = e.offsetY;
                                    let fullWidth = svg.property('clientWidth');
                                    //==show tooltip and set position
                                    tooltip.style("display", "inline")
                                        .call(tooltip => {
                                            //tooltip換邊
                                            let left, right, top;

                                            if (pointer[0] < chart_center[0]) {//滑鼠未過半,tooltip在右
                                                left = (mouseX + tooltipMouseGap) + 'px';
                                                right = null;
                                            } else {//tooltip在左
                                                left = null;
                                                right = (fullWidth - mouseX + tooltipMouseGap) + 'px';
                                            }

                                            if (pointer[1] < chart_center[1]) //tooltip在下
                                                top = (mouseY + tooltipMouseGap) + 'px';
                                            else //tooltip在上
                                                top = (mouseY - tooltip.property('clientHeight') - tooltipMouseGap) + 'px';

                                            tooltip
                                                .style("top", top)
                                                .style("left", left)
                                                .style("right", right);
                                        });


                                    let dataArr = dotGroup.childNodes.map((child, i) => {
                                        let obj = {};
                                        // console.debug(child.__data__);

                                        if (i == 0) obj = child.__data__;
                                        else obj[child.classList[0]] = child.__data__;

                                        return obj;
                                    });


                                    dataArr.sort(function (a, b) {
                                        // console.debug();

                                        if (Object.keys(b).length > 1)
                                            return 1;
                                        else
                                            return Object.values(b) - Object.values(a);

                                    });


                                    // console.debug(dataArr);
                                    updateTooltip(dataArr);
                                };
                                makeTooltip();
                                hover(dotGroup);
                            });
                    };
                    mouseDrag();
                    mouseMove();
                };
                function chartOptionEvent() {
                    //=====xaxis option
                    let xAxisMetric = chartContainerD3.selectAll('input[name ="xAxisMetric"]');
                    let xAxisMetricText = chartContainerD3.select('#xAxisOptionButton');
                    let xAxisLog = chartContainerD3.select('#xAxis_log');
                    // console.debug(xAxisLog);

                    xAxisMetric
                        .on('change', e => {
                            let value = e.target.value;
                            let checked = e.target.checked;
                            //＝＝＝單選,其他勾拿掉
                            xAxisMetric.nodes().filter(chkbox => chkbox !== e.target).forEach(chkbox => chkbox.checked = false);

                            //＝＝＝被點擊的勾不能拿掉
                            if (!checked) {
                                e.target.checked = true;
                                return;
                            };

                            //===改變按鈕text
                            xAxisMetricText.text(value);



                            //==date不能log scale
                            let metricIsDate = value == 'date';
                            xAxisOption.logScale = metricIsDate ? false : xAxisLog.property('checked');
                            xAxisLog.property('disabled', metricIsDate);

                            //===更新圖表
                            xAxisOption.metric = value;
                            newDataObj = getNewData(xAxisOption, null, null);
                            updateChart();

                        });

                    xAxisLog
                        .on('change', e => {
                            xAxisOption.logScale = e.target.checked;
                            newDataObj = getNewData(xAxisOption);
                            updateChart();
                        });

                    //=====yaxis option
                    let yAxisMetric = chartContainerD3.selectAll('input[name ="yAxisMetric"]');
                    let yAxisMetricText = chartContainerD3.select('#yAxisOptionButton');
                    let yAxisLog = chartContainerD3.select('#yAxis_log');

                    yAxisMetric
                        .on('change', e => {
                            let value = e.target.value;
                            let checked = e.target.checked;
                            //＝＝＝單選,其他勾拿掉
                            yAxisMetric.nodes().filter(chkbox => chkbox !== e.target).forEach(chkbox => chkbox.checked = false);

                            //＝＝＝被點擊的勾不能拿掉
                            if (!checked) {
                                e.target.checked = true;
                                return;
                            };

                            //===改變按鈕text
                            yAxisMetricText.text(value);


                            //===更新圖表
                            yAxisOption.metric = value;
                            newDataObj = getNewData(null, yAxisOption, xAxis_domain);
                            updateChart();
                        });

                    yAxisLog
                        .on('change', e => {
                            yAxisOption.logScale = e.target.checked;
                            newDataObj = getNewData(null, yAxisOption, xAxis_domain);
                            updateChart();
                        });
                    //=====change display
                    chartContainerD3.selectAll('input[name ="display"]')
                        .on('change', e => {
                            let display_index = parseInt(e.target.value);
                            let check = e.target.checked;
                            let display;
                            if (check) {
                                display = 'inline';
                                display_timming_index.push(display_index);

                            }
                            else {
                                display = 'none';
                                display_timming_index = display_timming_index.filter(i => i != display_index);
                            }
                            display_timming_index.sort((a, b) => a - b);
                            // console.debug(display_timming_index);
                            d3.selectAll('.' + rateDataKeys[display_index]).attr("display", display);
                            updateChart(true);
                        });
                    //=====show info
                    chartContainerD3.select('#showPath').on('change', e =>
                        d3.selectAll('.orderPath').attr("display", e.target.checked ? 'inline' : 'none'));
                    chartContainerD3.select('#showLegend').on('change', e =>
                        d3.selectAll('.legend').attr("display", e.target.checked ? 'inline' : 'none'));

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
                chartEvent();
                chartOptionEvent();
                legendEvent();

            };

            svg.call(events);

            return svg.node();
        };
        function barChart() {
            ~function init() {
                chartContainerJQ.append(`
                <form id="form-chart">
                <div class="form-group" id="chartsOptions" style="display: inline;">
                    <div class="row">

                    <!-- ... rate ... -->    
                    <div class="form-group col-lg-3 col-md-3 col-sm-6 d-flex flex-row align-items-start">
                        <label for="rateOptionButton" class="col-form-label col-3" >Rate</label>
                        <div class="btn-group btn-group-toggle col-9" role="group">
                            <button id="rateOptionButton" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        
                            </button>
                            <div class="dropdown-menu" aria-labelledby="rateOptionButton">
                                <div id="rateDropDownMenu" >
                                
    
    
                                </div>
                            </div>
                        </div>
                    </div>  
                    

                    <!-- ... metric ... -->                
                    <div class="form-group col-lg-4 col-md-4 col-sm-6 d-flex flex-row align-items-start">
                        <label class="col-form-label col-3" >Metric</label>
                        <div class="btn-group btn-group-toggle col-9" data-toggle="buttons">

                            <label class="btn btn-secondary">
                                <input type="radio" name ="metric" value="KB"> KB/s
                            </label>
                            <label class="btn btn-secondary active">
                                <input type="radio" name ="metric" value="MB" checked> MB/s
                            </label>
                            <label class="btn btn-secondary">
                                <input type="radio" name ="metric" value="GB"> GB/s
                            </label>

                        </div>
                    </div>   


                    <!-- ... scale ... -->                
                    <div class="form-group col-lg-4 col-md-4 col-sm-6 d-flex flex-row align-items-start">
                        <label class="col-form-label col-3" >Scale</label>
                        <div class="btn-group btn-group-toggle col-9" data-toggle="buttons">

                            <label class="btn btn-secondary active">
                                <input type="radio" name ="scale" value="0" checked> linear

                                <div class="dropdown-menu dropdown-menu-right" id="distMenu" aria-labelledby="xAxisName">
                                    <div class="form-group col-12 d-flex flex-row flex-wrap align-items-start justify-content-between" >       
                                        <label class="" for="distRange">distance range</label>
                                        <button type="button" class="btn btn-outline-secondary btn-sm" name="rangeReset" value='dist'>reset</button>

                                        <div class="d-flex flex-column  align-items-center">
                                            <input class="" type="range" id="distRange" style="width: 200px;"/>                                       
                                            <datalist  class="d-flex flex-row flex-wrap" id="distList">
                                            
                                            </datalist>

                                            <div class="d-flex flex-row  flex-nowrap justify-content-around align-items-stretch"  style="margin-top: 15px;">
                                                <input class="form-control col-5" type="text" id="distRange_min" name="xAxisRange">
                                                <input class="form-control col-5" type="text" id="distRange_max" name="xAxisRange">       
                                            </div>           
                                        </div>
                                    </div>
                                </div>
                                <sub class='dist' style="position:absolute; left:50%; bottom:5px; transform: translate(-50%, -50%);"></sub>
                                
                            </label>




                            <label class="btn btn-secondary">
                                <input type="radio" name ="scale" value="1"> logrithmic
                            </label>

                        </div>
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

                let All_dropdownMenu = chartContainerJQ.find('.dropdown-menu');

                All_dropdownMenu.on("click.bs.dropdown", function (e) {
                    e.stopPropagation();
                });

            }();

            const svg = d3.create("svg")
                .attr("viewBox", [0, 0, width, height]);
            const xAxis = svg.append("g").attr("class", "xAxis");
            const yAxis = svg.append("g").attr("class", "yAxis");
            const focusGroup = svg.append("g").attr('class', 'focus');
            const legendGroup = svg.append("g").attr('class', 'legendGroup');


            var x, y;
            var newDataObj;

            function getNewData(chartOption) {
                let rateOption = chartOption.hasOwnProperty('rateOption') ? chartOption.rateOption : newDataObj.rateOption,
                    metric = chartOption.hasOwnProperty('metric') ? chartOption.metric : newDataObj.metric,
                    gapScale = chartOption.hasOwnProperty('gapScale') ? chartOption.gapScale : newDataObj.gapScale,
                    logScale = chartOption.hasOwnProperty('logScale') ? chartOption.logScale : newDataObj.logScale;

                let gapGroupData;

                var getGapGroupData = () => {
                    let domain = d3.max(rateData, d => d[rateDataKeys[rateOption]]);
                    console.debug(domain);
                    gapGroupData = rateData;
                }

                getGapGroupData();

                return {
                    gapGroupData: gapGroupData,
                    rateOption: rateOption,
                    metric: metric,
                    gapScale: gapScale,
                    logScale: logScale,
                };
            };
            function updateChart(trans = false) {

                function init() {
                    //==title
                    let title = 'GDMS系統負載監測';

                    svg
                        .append("g")
                        .attr("class", "title")
                        .append('text')
                        .attr("fill", "currentColor")
                        // .attr("align", "center")
                        .attr("text-anchor", "middle")
                        .attr("alignment-baseline", "text-after-edge")
                        .attr("font-weight", "bold")
                        .attr("font-size", "15")
                        .attr("x", width / 2)
                        .attr("y", margin.top / 2)
                        .text(title);


                    xAxis
                        .append('text')
                        .attr("class", "axis_name")
                        .attr("fill", "black")
                        .attr("font-weight", "bold")
                        .attr("font-size", "12")
                        .attr('x', width / 2)
                        .attr("y", margin.bottom - 10);


                    yAxis
                        .append('text')
                        .attr("class", "axis_name")
                        .attr("fill", "black")
                        .attr("font-weight", "bold")
                        .attr("font-size", "12")
                        .style("text-anchor", "middle")
                        .attr("alignment-baseline", "text-before-edge")
                        .attr("transform", "rotate(-90)")
                        .attr('x', -(height - margin.top - margin.bottom) / 2 - margin.top)
                        .attr("y", -margin.left + 2);

                    //===rate DropDown
                    chartContainerD3.select('#rateDropDownMenu')
                        .selectAll('div')
                        .data(rateDataKeys)
                        .join('div')
                        .attr('class', 'form-check col-12 d-flex flex-nowrap')
                        .style("padding-left", '35px')
                        .style("position", 'static')
                        .call(menu => {

                            let svg_width = 20;
                            let rateOption = newDataObj.rateOption;

                            menu.each(function (d, i) {
                                // console.debug(d);
                                let div = d3.select(this);
                                div
                                    .append('input')
                                    .attr('class', 'form-check-input')
                                    .attr('type', 'checkbox')
                                    .attr('id', 'rate_' + i)
                                    .attr('name', 'rateOption')
                                    .attr('value', i)
                                    .property('checked', i == rateOption);
                                div
                                    .append('label')
                                    .attr('class', 'form-check-label')
                                    .attr('for', 'rate_' + i)
                                    .style("white-space", "nowrap")
                                    .text(getString(d));

                                div.append('svg')
                                    .attr("viewBox", [0, 0, svg_width, svg_width])
                                    .style("position", 'relative')
                                    // .style("left", '20px')
                                    .attr("width", svg_width)
                                    .attr("height", svg_width)
                                    .call(displaySvg => makeShape(displaySvg, i, { x: svg_width * 0.5, y: svg_width * 0.5 }));

                            });

                            //==按鈕上圖形
                            chartContainerD3.select('#rateOptionButton')
                                .append('svg')
                                .attr("viewBox", [0, 0, svg_width, svg_width])
                                .style("position", 'relative')
                                // .style("left", '20px')
                                .attr("width", svg_width)
                                .attr("height", svg_width)
                                .call(displaySvg => makeShape(displaySvg, rateOption, { x: svg_width * 0.5, y: svg_width * 0.5 }, null, 'white'));
                        });


                };
                function render() {


                    x = d3['scaleLinear']()
                        .domain(xAxisDomain)
                        .range([margin.left, width - margin.right]);
                    if (xAxisOption.logScale && !xAxis_domain) x.nice();

                    // console.debug(newDataObj);
                    y = d3['scaleLinear']()
                        .domain(getNiceDomain(yAxisDomain.map(d => convert_download_unit(d, originUnit, yAxisOption.metric).value), yAxisOption.logScale ? 0 : 0.01))
                        .range([height - margin.bottom, margin.top]);
                    if (yAxisOption.logScale) y.nice();


                    var refreshText = () => {
                        xAxis
                            .select('.axis_name')
                            .text();


                        yAxis
                            .select('.axis_name')
                            .text();


                    };
                    var updateAxis = () => {
                        function formatPower(x) {
                            const e = Math.log10(x);
                            if (e !== Math.floor(e)) return; // Ignore non-exact power of ten.
                            return `10${(e + "").replace(/./g, c => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c] || "⁻")}`;
                        };

                        var makeXAxis = g => g
                            .attr("transform", `translate(0,${height - margin.bottom})`)
                            .call(g => {
                                let axisFun = d3.axisBottom(x).tickSizeOuter(0);
                                xAxisOption.metric == 'date' ?
                                    axisFun.ticks(width / 80) :
                                    xAxisOption.logScale ?
                                        axisFun.ticks(Math.log10(x.domain()[1] / x.domain()[0]) + 1, formatPower) :
                                        axisFun.ticks(width / 80);
                                axisFun(g);
                            });

                        var makeYAxis = g => g
                            .attr("transform", `translate(${margin.left},0)`)
                            .call(g => {
                                let axisFun = d3.axisLeft(y);
                                yAxisOption.logScale ?
                                    axisFun.ticks(Math.log10(y.domain()[1] / y.domain()[0]) + 1, formatPower) :
                                    axisFun.ticks(height / 30);
                                axisFun(g);
                            })
                            .call(g =>
                                g.selectAll("g.yAxis g.tick line")
                                    .attr("x2", d => width - margin.left - margin.right)
                                    .attr("stroke-opacity", 0.2)
                            );

                        xAxis.call(makeXAxis);
                        yAxis.call(makeYAxis);
                    };
                    var updateFocus = () => {

                    };
                    refreshText();
                    updateAxis();
                    updateFocus();
                };

                if (!newDataObj) {
                    newDataObj = getNewData({
                        rateOption: 0,
                        metric: chartContainerD3.selectAll('input[name=metric]:checked').property("value"),
                        gapScale: 1,
                        logScale: false,
                    });
                    init();
                };
                // render();
                console.debug(newDataObj);
            };
            updateChart();

            function events(svg) {

                var chartOption = {};

                function chartOptionEvent() {
                    //=====rateOption
                    let rateOption = chartContainerD3.selectAll('input[name ="rateOption"]');
                    let rateOptionSvg = chartContainerD3.select('#rateOptionButton>svg');

                    // console.debug(rateOption);

                    rateOption
                        .on('change', e => {
                            let value = parseInt(e.target.value);
                            let checked = e.target.checked;
                            //＝＝＝單選,其他勾拿掉
                            rateOption.nodes().filter(chkbox => chkbox !== e.target).forEach(chkbox => chkbox.checked = false);

                            //＝＝＝被點擊的勾不能拿掉
                            if (!checked) {
                                e.target.checked = true;
                                return;
                            };

                            //===改變按鈕圖型

                            rateOptionSvg
                                .call(svg => {
                                    svg.selectAll('*').remove();
                                    let svg_width = svg.node().getBoundingClientRect().width;
                                    makeShape(svg, value, { x: svg_width * 0.5, y: svg_width * 0.5 }, null, 'white')
                                });

                            //===更新圖表
                            chartOption.rateOption = value;
                            newDataObj = getNewData(chartOption);
                            updateChart();

                        });

                    //=====metric
                    let metric = chartContainerD3.selectAll('input[name ="metric"]');
                    metric.on('click', e => {
                        let value = e.target.value;

                        chartOption.metric = value;
                        newDataObj = getNewData(chartOption);
                        updateChart();
                    });

                };
                chartOptionEvent();
            };
            svg.call(events);


            return svg.node();
        };
        function rateChart() {


            ~function init() {
                chartContainerJQ.append(`
                <form id="form-chart">
                <div class="form-group" id="chartsOptions" style="display: inline;">
                    <div class="row">
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

                let All_dropdownMenu = chartContainerJQ.find('.dropdown-menu');

                All_dropdownMenu.on("click.bs.dropdown", function (e) {
                    e.stopPropagation();
                });


            }();

            const svg = d3.create("svg")
                .attr("viewBox", [0, 0, width, height]);
            const xAxis = svg.append("g").attr("class", "xAxis");
            const yAxis = svg.append("g").attr("class", "yAxis");
            const focusGroup = svg.append("g").attr('class', 'focus');
            const legendGroup = svg.append("g").attr('class', 'legendGroup');


            var x, y;
            var newDataObj;

            function getNewData(trans = false) {

            };
            function updateChart(trans = false) {
                function init() {

                };
                function render() {

                    var refreshText = () => {
                        xAxis
                            .select('.axis_name')
                            .text();


                        yAxis
                            .select('.axis_name')
                            .text();


                    };
                    var updateAxis = () => {
                        function formatPower(x) {
                            const e = Math.log10(x);
                            if (e !== Math.floor(e)) return; // Ignore non-exact power of ten.
                            return `10${(e + "").replace(/./g, c => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c] || "⁻")}`;
                        };

                        var makeXAxis = g => g
                            .attr("transform", `translate(0,${height - margin.bottom})`)
                            .call(g => {
                                let axisFun = d3.axisBottom(x).tickSizeOuter(0);
                                xAxisOption.metric == 'date' ?
                                    axisFun.ticks(width / 80) :
                                    xAxisOption.logScale ?
                                        axisFun.ticks(Math.log10(x.domain()[1] / x.domain()[0]) + 1, formatPower) :
                                        axisFun.ticks(width / 80);
                                axisFun(g);
                            });

                        var makeYAxis = g => g
                            .attr("transform", `translate(${margin.left},0)`)
                            .call(g => {
                                let axisFun = d3.axisLeft(y);
                                yAxisOption.logScale ?
                                    axisFun.ticks(Math.log10(y.domain()[1] / y.domain()[0]) + 1, formatPower) :
                                    axisFun.ticks(height / 30);
                                axisFun(g);
                            })
                            .call(g =>
                                g.selectAll("g.yAxis g.tick line")
                                    .attr("x2", d => width - margin.left - margin.right)
                                    .attr("stroke-opacity", 0.2)
                            );

                        xAxis.call(makeXAxis);
                        yAxis.call(makeYAxis);
                    };
                    var updateFocus = () => {

                    }


                };

                if (!newDataObj) {
                    newDataObj = getNewData();
                    init();
                };
                render();
            };
            updateChart();

            function events(svg) { };
            svg.call(events);


            return svg.node();
        };

        if (!(chartContainerJQ.find('#form-header').length >= 1)) {
            init();
            console.log('init header & data for once');
        };
        printChart();

    };
    return chart;


}
