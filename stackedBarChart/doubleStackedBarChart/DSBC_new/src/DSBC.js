function DSBC() {

    var selector = 'body';
    var data = [];
    var dataString = {};
    var colorPalette = null;

    chart.selector = (value) => {
        selector = value;
        return chart;
    }
    chart.data = (value) => {
        console.log(value);
        let copyObj = JSON.parse(JSON.stringify(value));//不影響原資料
        let dataType = typeof (copyObj[0]);

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

                        var series1Axis;
                        // console.debug(fileName.indexOf('time') != -1);
                        if (fileName.indexOf('time') != -1)
                            series1Axis = "次數";
                        else if (fileName.indexOf('size') != -1)
                            series1Axis = "下載量";
                        else
                            series1Axis = fileName;

                        tmpData = {
                            data: tmp,
                            columns: columns,
                            legend: '資料庫',
                            title: 'title',
                            series1Axis: series1Axis,
                        };

                    }
                }
            }
            rawFile.send(null);
            // console.debug(tmpData);
            return tmpData;
        }
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
        }

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
        }

        return chart;
    }
    chart.string = (value) => {
        dataString = value;
        return chart;
    }
    function chart() {

        const chartContainerJQ = $(selector);

        function init() {
            chartContainerJQ.append(`
            <form id="form-chart">
            <div class="form-group" id="chartsOptions" style="display: inline;">
            <div class="row">

            <!-- ... reset 
            <div class="form-group col-lg-3 col-md-3 col-sm-6" >
                <button type="button" class="btn btn-secondary" id="reset">
                    reset
                </button>
            </div>
            ...-->

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

            <!-- ... show info ... -->    
            <div class="form-group col-md-6 d-flex flex-row align-items-start">
                <label for="showInfoButton" class="col-form-label col-4" >Show</label>
                <div class="btn-group btn-group-toggle col-8" role="group">
                    <button id="showInfoButton" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        select
                    </button>
                    <div class="dropdown-menu" id="showInfoMenu" aria-labelledby="showInfoButton">
                        <div  id="showInfoDropDownMenu">

                            <div class="form-check d-flex flex-row flex-wrap " style="text-align: ;">
                                <input class="form-check-input  col-4" type="checkbox" id="showLegend" name="show" value="0" checked>
                                <label class="form-check-label  col-12" for="showLegend">legend</label>
                            </div>
                           
                        </div>
                    </div>
                </div>
            </div>  

            <!-- ...log scale  ...-->
            <div
            class="form-group col-md-6  d-flex  flex-row justify-content-start  align-items-end">               
                <div id="logScale-group" class="form-check" >
                    <input class="form-check-input  col-4" type="checkbox" id="logScale" name="logScale">
                    <label class="form-check  col-12" for="logScale" data-lang="">
                        log scale
                    </label>                        
                </div>                         
            </div>

 

            </div>
            </div>
                <div class="form-group" id="charts" style="position: relative; z-index:0;"></div>          
                <div id="outerdiv"
                     style="position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);z-index:999;width:100%;height:100%;display:none;">
                    <div id="innerdiv" style=" background-color: rgb(255, 255, 255);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
                </div>
            </div>
            </form>
            `);

            //================dropdown-menu內元素被點擊不關閉menu
            let All_dropdownMenu = $('.dropdown-menu');
            All_dropdownMenu.on("click.bs.dropdown", e => e.stopPropagation());


            ~function requestColors() {
                var url = '../src/php/getNetworkList.php';
                $.ajax({
                    url: url,
                    dataType: 'json',
                    async: false,
                    success: function (rtdata) {
                        let obj = {};
                        rtdata.forEach(d => obj[d.network_code] = d.color);
                        colorPalette = obj;
                    }, error: function (jqXHR, textStatus, errorThrown) {
                        console.log("can't get color on database");
                        colorPalette = {
                            CWBSN: "#2ca9e1",
                            GNSS: "#df7163",
                            GW: "#f8b500",
                            MAGNET: "#005243",
                            TSMIP: "#7a4171",
                            categories: '#808080',
                        }
                    }

                });
            }();
            // console.debug(colorPalette);
            //==========test=====
            // $('body').on("mouseover", function (e) {
            //     console.debug(e.target.nodeName);
            // })
            //===================
        };
        function stackedBar(chartData, series1DomainMax = null, series2DomainMax = null) {
            // console.debug(chartData);

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
                        keyUnit = dataSizeUnit;
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
                }

                // console.debug(colorPalette);
                gradientColor = getGradientColor(color, dataCount);
                // console.debug(gradientColor);
                return gradientColor;
            };
            //TSMIP放第一, CWBSN第二
            const sortDataKeys = (array) => {
                array.sort(function (a, b) {
                    // console.debug(a, b);

                    // if (a > b) {
                    //     return 1;
                    // }
                    if (a < b) {
                        return -1;
                    }
                    if (a == 'TSMIP' || a == 'CWBSN') {
                        return -1;
                    }
                    return 0;
                });

            }

            const width = 800;
            const height = 600;
            const margin = ({ top: 80, right: 50, bottom: 40, left: 50 });

            const dataSizeUnit = 'GB';
            const data = function () {
                const convertData = function (data) {

                    let dataObj = data;
                    let Objkeys = Object.getOwnPropertyNames(dataObj).filter(key => key != 'columns');
                    // console.debug(Objkeys);
                    let split_and_convert = (string, convertedUnit) => {
                        let sizeArr = string.split(' ');
                        let size = parseFloat(sizeArr[0]);
                        let unit = sizeArr[1];
                        return convert_download_unit(size, unit, convertedUnit).value;
                    };

                    Objkeys.forEach((Objkey, index, arr) => {
                        let obj = dataObj[Objkey];
                        let DBKeys = Object.getOwnPropertyNames(obj).filter(key => key != 'columns' && key != 'total');
                        obj.columns = DBKeys;
                        // console.debug(DBKeys);

                        DBKeys.forEach(DBkey => {
                            // console.debug((obj[DBkey]));
                            if (typeof (obj[DBkey]) == 'object') {
                                let yearKeys = Object.getOwnPropertyNames(obj[DBkey]).filter(key => key != 'columns');
                                obj[DBkey].columns = yearKeys;

                                if (Objkey == 'file_size') //==file_size
                                {
                                    yearKeys.forEach(yearKey => {
                                        // console.debug(obj[DBkey][yearKey]);
                                        if (typeof (obj[DBkey][yearKey]) == 'string')
                                            obj[DBkey][yearKey] = split_and_convert(obj[DBkey][yearKey], dataSizeUnit);
                                    });
                                };
                            };

                        });

                    });
                    dataObj.columns = Objkeys.filter(key => {
                        // console.debug(dataObj[key].total);
                        let boolean = true;
                        if (dataObj[key].hasOwnProperty('total'))
                            if (dataObj[key].total == 0)
                                boolean = false;
                        return boolean;
                    });
                    // console.debug(dataObj);
                    return dataObj;
                };
                chartData.data = convertData(chartData.data);
                return chartData.data;
            }();
            // console.debug(data);
            const dataKeys = data.columns;//series key
            // console.debug(dataKeys);
            // console.debug(colorPalette);
            //放入seriesColor
            ~function () {
                const seriesColor = ["#d53e4f", "#3288bd"];
                if (!colorPalette) colorPalette = {};
                dataKeys.forEach((key, i) => colorPalette[key] = seriesColor[i % seriesColor.length]);
            }();

            //===取出所有主要的key(ex:每個DB)並去重複
            const subjects = Array.from(new Set([].concat(...dataKeys.map(key => [].concat(...data[key].columns)))));
            // console.debug(subjects);
            sortDataKeys(subjects);

            //===取出所有最下層key(ex:每個DB的年份)並去重複
            const categories = Array.from(new Set([].concat(...dataKeys.map(key => [].concat(...data[key].columns.map(k => data[key][k].columns))))));
            sortDataKeys(categories);
            // console.debug(categories);
            // console.debug(categories);

            // console.debug(getKeyName('size'));
            const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);
            const focusGroup = svg.append("g").attr("class", "focusGroup");
            const subjectAxis = svg.append("g").attr("class", "subjectAxis");
            const series1Axis = svg.append("g").attr("class", "series1Axis");
            const series2Axis = svg.append("g").attr("class", "series2Axis");




            var newDataObj;
            var subjectScale, series1Scale, series2Scale;
            var bar_interval;
            function updateChart(chartType = 'vertical', trans = false, logScale = false) {
                // console.debug(chartType)
                // console.debug(newDataObj)
                // var chartType = chartType;//vertical horizontal
                const max_barWidth = chartType == 'vertical' ? 500 : 60;
                bar_interval = chartType == 'vertical' ? 1 : 50;
                const trans_duration = trans ? 500 : 0;

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
                        .text(chartData.title);

                    //===Axis
                    subjectAxis
                        .append('text')
                        .attr("class", "axisName")
                        .attr("fill", "black")
                        .attr("font-weight", "bold")
                        .attr("font-size", 12)
                        .text(getKeyName('subject').name);

                    series1Axis
                        .attr("color", getColor(dataKeys[0]))
                        .append('text')
                        .attr("class", "axisName")
                        .attr("fill", "currentcolor")
                        .attr("font-weight", "bold")
                        .attr("font-size", 12)
                        .style("text-anchor", "middle")
                        .attr("alignment-baseline", "text-before-edge");

                    series2Axis
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
                        var legend = svg.append("g")
                            .attr("class", "legend")
                            .attr("transform", `translate(${width - margin.right - categories.length * (rect_width + rect_interval)}, ${margin.top * 0.6})`)
                            .selectAll("g")
                            .data(categories)
                            .join("g")
                            .attr("transform", (d, i) => `translate(${i * (rect_width + rect_interval)}, 0)`);

                        svg.select('.legend')
                            .append("text")
                            .attr("font-size", 13)
                            .attr("font-weight", 900)
                            .attr("text-anchor", "start")
                            .attr("alignment-baseline", "after-edge")
                            .text(getKeyName('category').name);

                        legend
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

                    }
                };
                function render() {

                    let All_seriesData = newDataObj.seriesData;
                    let series1Domain = newDataObj.series1Domain;
                    let series2Domain = newDataObj.series2Domain;

                    var subjectScaleRange, series1ScaleRange, series2ScaleRange;

                    switch (chartType) {
                        default:
                        case 'vertical':
                            subjectScaleRange = [margin.left, width - margin.right];
                            series1ScaleRange = [height - margin.bottom, margin.top];
                            series2ScaleRange = [height - margin.bottom, margin.top];

                            break;
                        case 'horizontal':
                            let chartWidth = width - margin.right - margin.left;
                            let seriesAxisWidth = (chartWidth - bar_interval) * 0.5;
                            subjectScaleRange = [height - margin.bottom, margin.top];
                            series1ScaleRange = [margin.left + seriesAxisWidth, margin.left];
                            series2ScaleRange = [series1ScaleRange[0] + bar_interval, width - margin.right];
                            break;

                    }

                    subjectScale = d3.scaleBand()
                        .domain(subjects)
                        .range(subjectScaleRange)
                        .padding(0.1);

                    //==================================test
                    // console.debug(series1ScaleRange)
                    // series1Domain[0] = 1
                    // series2Domain[0] = 1
                    // series1ScaleRange.reverse();
                    // series2ScaleRange.reverse();

                    // var logScale = d3.scaleLog()
                    //     .domain([0, 100000])
                    //     .range([0, 700]);
                    //==================================test
                    let seriesScale = logScale ? 'scaleLog' : 'scaleLinear';

                    series1Scale = d3[seriesScale]()
                        .domain(series1Domain)
                        .nice()
                        .range(series1ScaleRange);

                    series2Scale = d3[seriesScale]()
                        .domain(series2Domain)
                        .nice()
                        .range(series2ScaleRange);

                    console.debug(series1Scale.domain())
                    console.debug(series1Scale.range())

                    var updateAxis = () => {
                        var removeAxis = g => g.selectAll(":not(.axisName)").remove();
                        var makeSubjectAxis = g => {
                            let axisPos, translate, refreshing;
                            if (chartType == 'vertical') {
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
                                        .data(All_seriesData)
                                        .join('path')
                                        .attr('class', 'domain')
                                        .attr('stroke', 'currentColor')
                                        .attr('d', domain_d)
                                        .attr("transform", (d, i) => `translate(${bar_interval * 0.5 * (i * 2 - 1)},0)`)

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
                        var makeSeriesAxis = (g, yNum) => {

                            let seriesScale = yNum - 1 ? series2Scale : series1Scale;
                            let axisPos, translate, refreshing;
                            let sign = { 1: -1, 2: 1 }[yNum];
                            let seriesName = getKeyName(dataKeys[yNum - 1]);
                            let axisText = seriesName.name + '(' + seriesName.unit + ')';

                            // console.debug(seriesName)
                            if (chartType == 'vertical') {
                                axisPos = { 1: 'axisLeft', 2: 'axisRight' }[yNum];
                                translate = { 1: [margin.left, 0], 2: [width - margin.right, 0] }[yNum];
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
                                    let axisTextArrow = { 1: '← ', 2: ' →' }[yNum];

                                    g.selectAll('.tick').style("text-anchor", "middle");
                                    g.select('.axisName')
                                        .attr("transform", `translate(${[axisOrigin + 2 * bar_interval * sign, margin.bottom * 0.5]})`)
                                        .text(axisText)
                                        .append('tspan')
                                        .attr("x", sign * bar_interval * 1.5)
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
                                .transition().duration(trans_duration)
                                .call(d3[axisPos](seriesScale).ticks(null, "s").tickSizeOuter(0))

                            g.call(refreshing)//有呼叫補間動畫會不能append所以另外call一次
                        }
                        subjectAxis.call(makeSubjectAxis);
                        series1Axis.call(series1Axis => makeSeriesAxis(series1Axis, 1));
                        series2Axis.call(series1Axis => makeSeriesAxis(series1Axis, 2));
                    }

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
                        }

                        focusGroup
                            .selectAll("g.seriesGroup")
                            .data(dataKeys)
                            .join("g")
                            .attr("class", "seriesGroup")
                            .attr("id", (d, i) => "seriesGroup" + (i + 1))
                            // .attr("groupIndex", 0)
                            .call(barGroup_collection =>
                                barGroup_collection.each(function (dataKey, i) {
                                    // console.debug(dataKey, i)
                                    let seriesGroup = d3.select(this);
                                    let seriesData = All_seriesData[i];
                                    let seriesScale = i ? series2Scale : series1Scale;

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

                                                if (chartType == 'vertical') {
                                                    let barWidth = subjectScale.bandwidth() / 2 > max_barWidth ? max_barWidth : subjectScale.bandwidth() / 2;
                                                    let transX = i ? subjectScale.bandwidth() / 2 + bar_interval : subjectScale.bandwidth() / 2 - barWidth - bar_interval;
                                                    rect
                                                        .transition().duration(trans_duration)
                                                        .attr("transform", `translate(${transX}, 0)`)
                                                        .attr("x", d => subjectScale(d.data))
                                                        .attr("y", d => seriesScale(d[1]))
                                                        .attr("height", d => seriesScale(d[0]) - seriesScale(d[1]))
                                                        .attr("width", barWidth)
                                                }
                                                else {
                                                    let barWidth = subjectScale.bandwidth() > max_barWidth ? max_barWidth : subjectScale.bandwidth();
                                                    let transY = (subjectScale.bandwidth() - barWidth) * 0.5;
                                                    rect
                                                        .transition().duration(trans_duration)
                                                        .attr("transform", `translate(0, ${transY})`)
                                                        .attr("x", d => seriesScale(d[i ? 0 : 1]))
                                                        .attr("y", d => subjectScale(d.data))
                                                        .attr("height", barWidth)
                                                        .attr("width", d => Math.abs(seriesScale(d[0]) - seriesScale(d[1])))

                                                }
                                            }))


                                    // let subjectTotal_width = 3;

                                    // seriesGroup
                                    //     .append('g')
                                    //     .attr("class", "subjectTotal")
                                    //     .attr("position", "relative")
                                    //     .attr("top", 5)
                                    //     .selectAll("rect")
                                    //     .data(seriesData[seriesData.length - 1])
                                    //     .join("rect")
                                    //     .attr("fill", "none")
                                    //     .attr("x", d => subjectScale(d.data))
                                    //     .attr("y", d => seriesScale(d[1]) - subjectTotal_width * 0.5)
                                    //     .attr("height", d => seriesScale(0) - seriesScale(d[1]) + subjectTotal_width)
                                    //     .attr("width", barWidth + subjectTotal_width)
                                    //     .attr("stroke", seriesColor[i])
                                    //     .attr("stroke-width", subjectTotal_width)
                                    //     .attr("stroke-dasharray", function () {
                                    //         let barWidth = parseInt(this.getAttribute("width"));
                                    //         let barHeight = parseInt(this.getAttribute("height"));
                                    //         let dashStr = getDasharrayStr(barWidth, barHeight);
                                    //         return dashStr;
                                    //     })
                                    //     .attr('stroke-opacity', .8)
                                    //     .attr("transform", `translate(${ transX - subjectTotal_width * 0.5}, 0)`);

                                })
                            );

                    }
                    var updateTooltips = () => {

                    }
                    updateAxis();
                    updateFocus();
                    updateTooltips();
                };
                if (!newDataObj) {
                    newDataObj = getNewData();
                    init();
                }
                render();
                return trans_duration;
            }
            function getNewData() {
                let All_seriesData = [];
                let series1Domain, series2Domain;
                var getSeries = (key) => {
                    //===count or size....
                    const seriesData = data[key];
                    // const subjects = seriesData.columns;
                    // console.debug(seriesData);
                    // console.debug(subjects);
                    const series = d3.stack()
                        .keys(categories)
                        .value((subject, category) => seriesData[subject] ? (seriesData[subject][category] || 0) : 0)//沒有值當0(bar heigth=0)
                        (subjects).map(d => { return d.forEach(v => v.key = d.key), d });
                    // console.debug(series1);
                    return series;
                }
                var getSeriesDomain = () => {
                    let series1 = All_seriesData[0];
                    let series2 = All_seriesData[1];
                    series1Domain = (series1DomainMax ? [0, series1DomainMax] : [0, d3.max(series1, d => d3.max(d, d => d[1]))]);
                    series2Domain = (series2DomainMax ? [0, series2DomainMax] : [0, d3.max(series2, d => d3.max(d, d => d[1]))]);
                }
                dataKeys.forEach(key => All_seriesData.push(getSeries(key)));
                // console.debug(All_seriesData);
                getSeriesDomain();

                return {
                    seriesData: All_seriesData,
                    series1Domain: series1Domain,
                    series2Domain: series2Domain,
                    chartType: 'vertical',
                };
            }

            updateChart();


            function events(svg) {

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

                            // let trans_x = bar_x + subjectScale.bandwidth() / 2 + seriesIndex * barWidth + (seriesIndex - !seriesIndex) * bar_interval + tooltip_width * 0.1;
                            // let trans_y = bar_y + (barHeight - tooltip_height) / 2;
                            let trans_x =
                                newDataObj.chartType == 'vertical' ?
                                    bar_x + subjectScale.bandwidth() / 2 + seriesIndex * barWidth + (seriesIndex - !seriesIndex) * bar_interval + tooltip_width * 0.1 :
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
                    }
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
                    }))
                };
                var chartOptionEvent = () => {
                    const chartContainer = d3.select(selector);
                    //=====change 
                    // console.debug(chartContainer.select('input[name ="changeChart"]'))
                    chartContainer.selectAll('input[name ="changeChart"]')
                        .on('click', e => {
                            // console.debug('change')
                            //===for reset tooltip after chart change
                            let barBeenClicked = barNodes.filter(bar => bar.classList.contains('clicked') ? true : false);
                            let tickBeenClicked = subjectTickCollection.nodes().filter(bar => bar.classList.contains('clicked') ? true : false);
                            //===for reset tooltip after chart change
                            let changeChart = e.target.value;
                            // console.debug(changeChart);
                            newDataObj.chartType = changeChart;
                            let trans_duration = updateChart(changeChart, true);
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
                            }, trans_duration);

                        });
                    //=====shows
                    chartContainer.select('#showLegend').on('change', e =>
                        svg.selectAll('.legend').attr("display", e.target.checked ? 'inline' : 'none'));


                    //=====logScale
                    chartContainer.select('#logScale').on('change', e => {
                        let check = e.target.checked;
                        // console.debug(check)
                        updateChart(newDataObj.chartType, true, check);
                    });

                };
                var infoBoxDragEvent = () => {

                    var raiseAndDrag = (d3_selection) => {
                        let x_fixed = 0, y_fixed = 0;
                        let legend_dragBehavior = d3.drag()
                            .on('start', function (e) {
                                // console.log('drag start');
                                let matrix = this.transform.baseVal[0].matrix;
                                x_fixed = e.x - matrix.e;
                                y_fixed = e.y - matrix.f;
                            })
                            .on('drag', function (e) {
                                d3.select(this).attr("transform", `translate(${e.x - x_fixed}, ${e.y - y_fixed})`);
                            })
                            .on('end', e => {
                                // console.log('drag end');
                            });

                        d3_selection
                            .call(g => g.raise())//把選中元素拉到最上層(比zoom的選取框優先)
                            .call(legend_dragBehavior);

                    }
                    svg.select('.legend').call(raiseAndDrag);

                };
                chartOptionEvent();
                infoBoxDragEvent();
                tooltipEvent();
            }

            svg.call(events);

            return svg.node();
        }
        function printChart() {
            chartContainerJQ.find('#charts').children().remove();
            var i = 1;

            var getChartMenu = (title) => {
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
                        downloadSvg(svgArr, title, option);
                    });

                    li.append(item);
                    ul.append(li);
                });
                // console.debug(chartContainerJQ.find());
                chartContainerJQ.find('#charts').append(div);
                chartContainerJQ.find('#chart' + i).append(nav);
            }
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
            }
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

            }
            var series1DomainMax = null, series2DomainMax = null;
            //====more than one chart so get the max domain to make yaxis in the same range
            // if (data.length > 1) {

            //     function getMaxDomain(data, groupCount) {
            //         let maxDomain = d3.max(data, d => {
            //             // console.debug(d);
            //             let dataKeys = d.columns.slice(1);
            //             // console.debug(dataKeys);
            //             return d3.max(d.data, name => {
            //                 // console.debug(name);
            //                 let groupKey = name.columns;
            //                 let total = 0;
            //                 for (let i = 0; i < dataKeys.length; i++)
            //                     total += parseFloat(name[dataKeys[i]][groupKey[groupCount]]);
            //                 // console.debug(total);
            //                 return total;
            //             })
            //         });
            //         return maxDomain;
            //     }


            //     // console.debug(dataKeys);
            //     series1DomainMax = getMaxDomain(data, 0);
            //     // console.debug(series1DomainMax);
            //     series2DomainMax = getMaxDomain(data, 1);
            //     // console.debug(series2DomainMax);
            // }
            data.forEach(d => {
                // console.debug(d);
                let chartNode = stackedBar(d, series1DomainMax, series2DomainMax);
                // console.debug(chartNode);
                getChartMenu('A');
                chartContainerJQ.find('#chart' + i).append(chartNode);
                i++;
                // console.debug(i);
            })
            MenuEvents();
        }

        if (!(chartContainerJQ.find('#form-chart').length >= 1))
            init();

        printChart();
    }
    return chart;


}
