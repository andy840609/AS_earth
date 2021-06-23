function DSBC() {

    var selector = 'body';
    var data = [];
    var colorPalette = null;

    function init() {
        $(selector).append(`
            <form id="form-chart">
            <div class="form-group" id="chartsOptions" style="display: inline;position: absolute; top: 3em; left: 3em;  z-index:3;">
            <div class="row">
            <div class="form-group col-lg-3 col-md-3 col-sm-6" >
                <button type="button" class="btn btn-secondary" id="reset">
                    reset
                </button>
            </div>
        </div>
            </div>
                <div class="form-group" id="charts" style="position: relative; z-index:0;"></div>          
                <div id="outerdiv"
                    style="position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);z-index:999;width:100%;height:100%;display:none;">
                    <div id="innerdiv" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
                        <img id="bigimg" style=" background-color: rgb(255, 255, 255);" src="" />
                    </div>
                </div>
            </form>
            `);

        $('#reset').click(() => {
            chart();
        });

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
                        year: '#808080',
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

    chart.selector = (vaule) => {
        selector = vaule;
        return chart;
    }

    chart.data = (vaule) => {
        console.log(vaule);
        let copyObj = JSON.parse(JSON.stringify(vaule));//不影響原資料
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

                        var yAxis;
                        // console.debug(fileName.indexOf('time') != -1);
                        if (fileName.indexOf('time') != -1)
                            yAxis = "次數";
                        else if (fileName.indexOf('size') != -1)
                            yAxis = "下載量";
                        else
                            yAxis = fileName;

                        tmpData = {
                            data: tmp,
                            columns: columns,
                            legend: '資料庫',
                            title: 'title',
                            yAxis: yAxis,
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
            let paths = vaule;
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

    function chart() {
        function stackedBar(chartData, yAxisDomainMax = null, yAxis2DomainMax = null) {
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
                    case 'name':
                        keyName = '資料庫';
                        break;
                    case 'year':
                        keyName = '年';
                        break;
                    case 'times':
                        keyName = '下載次數';
                        keyUnit = '次';
                        break;
                    case 'size':
                        keyName = '下載量';
                        keyUnit = 'GB';
                        break;
                    default:
                        keyName = key;
                        break;
                }
                return { name: keyName, unit: keyUnit };
            };
            const color = (network, dataCount) => {
                // console.debug(network, dataCount);
                let color, gradientColor;
                function getGradientColor(hex, level) {
                    // console.debug(hex, level);
                    let maxLevel = dataKeys.length - 1;

                    var gradient = (color, level) => {
                        let val = 20;

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

                color = colorPalette[network];
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
                    colorPalette[network] = color;
                }

                // console.debug(colorPalette);
                gradientColor = getGradientColor(color, dataCount - 1);
                // console.debug(gradientColor);
                return gradientColor;
            };

            const width = 800;
            const height = 600;
            const margin = ({ top: 80, right: 50, bottom: 40, left: 50 });
            const max_barWidth = 50;
            const bar_interval = 5;

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
                                    const dataUnit = 'GB';
                                    yearKeys.forEach(yearKey => {
                                        // console.debug(obj[DBkey][yearKey]);
                                        if (typeof (obj[DBkey][yearKey]) == 'string')
                                            obj[DBkey][yearKey] = split_and_convert(obj[DBkey][yearKey], dataUnit);
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
            console.debug(data);
            const dataKeys = data.columns;
            //===取出所有最下層key(ex:每個DB的年份)並去重複
            const categories = Array.from(new Set([].concat(...dataKeys.map(key => [].concat(...data[key].columns.map(k => data[key][k].columns))))));
            // console.debug(categories);
            // console.debug(getKeyName('size'));
            const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);
            const xAxis = svg.append("g").attr("class", "xAxis");
            const yAxis = svg.append("g").attr("class", "yAxis");
            const yAxis2 = svg.append("g").attr("class", "yAxis2");

            const group1_color = "red";
            const group2_color = "blue";

            var All_series;
            function updateChart(trans = false) {

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
                        .text(Data.title);
                    //===single year chart dont need legend
                    // console.debug(dataKeys.length);
                    if (dataKeys.length != 2) {
                        var rect_interval = 1;
                        var rect_width = 50;
                        var rect_height = 10;
                        var legend = svg.append("g")
                            .attr("class", "legend")
                            .attr("transform", `translate(${width - margin.right - series.length * (rect_width + rect_interval)}, ${margin.top * 0.6})`)
                            .selectAll("g")
                            .data(series)
                            .join("g")
                            .attr("transform", (d, i) => `translate(${i * (rect_width + rect_interval)
                                }, 0)`);

                        svg.select('.legend')
                            .append("text")
                            .attr("font-size", 10)
                            .attr("font-weight", 900)
                            .attr("text-anchor", "start")
                            .attr("alignment-baseline", "after-edge")
                            .text(getKeyName(Data.legend).name);

                        legend
                            .call(g => {
                                g.append("rect")
                                    .attr("width", rect_width)
                                    .attr("height", rect_height)
                                    .attr("fill", (d, i) => color('year', i));


                                g.append("text")
                                    // .attr("y", rect_width)
                                    .attr("x", rect_width / 2)
                                    .attr("y", rect_height)
                                    .attr("fill", "currentcolor")
                                    .attr("color", "black")
                                    .attr("font-family", "sans-serif")
                                    .attr("font-size", 8)
                                    .attr("font-weight", 600)
                                    .attr("text-anchor", "middle")
                                    .attr("alignment-baseline", "before-edge")
                                    .text(d => d.key)
                            });

                    }
                };
                function render() {
                    var updateAxis = () => {
                        var makeXAxis
                        xAxis.call(xAxis);
                        yAxis.call(yAxis);
                        yAxis2.call(yAxis2);
                    }

                    var x = d3.scaleBand()
                        .domain(data.map(d => d[dataKeys[0]]))
                        .range([margin.left, width - margin.right])
                        .padding(0.1);

                    var y_domain = (yAxisDomainMax ? [0, yAxisDomainMax] : [0, d3.max(series, d => d3.max(d, d => d[1]))]);
                    var y = d3.scaleLinear()
                        .domain(y_domain)
                        .rangeRound([height - margin.bottom, margin.top]);
                    var y2_domain = (yAxis2DomainMax ? [0, yAxis2DomainMax] : [0, d3.max(series2, d => d3.max(d, d => d[1]))]);
                    var y2 = d3.scaleLinear()
                        .domain(y2_domain)
                        .rangeRound([height - margin.bottom, margin.top]);

                    var xAxis = g => g
                        .attr("transform", `translate(0,${height - margin.bottom})`)
                        .call(d3.axisBottom(x).tickSizeOuter(0))
                        .append('text')
                        .attr('x', margin.left + (width - margin.left - margin.right) / 2)
                        .attr("y", margin.bottom * 0.8)
                        .attr("fill", "black")
                        .attr("font-weight", "bold")
                        .attr("font-size", 12)
                        .text(getKeyName(dataKeys[0]).name);
                    // .call(g => g.selectAll(".domain").remove());

                    let yAxisTag = getKeyName(Data.yAxis);
                    var yAxis = g => g
                        .attr("transform", `translate(${margin.left},0)`)
                        .call(d3.axisLeft(y).ticks(null, "s").tickSizeOuter(0))
                        .call(g =>
                            g.append('rect')
                                .attr('class', 'group')
                                .attr('x', -margin.left * 0.85)
                                .attr("y", height * 0.4)
                                .attr("width", 10)
                                .attr("height", 10)
                                .attr("fill", 'none')
                                .attr("stroke", group1_color)
                                .attr("stroke-width", 2)
                                .attr("stroke-dasharray", "4,1")
                                .attr("stroke-dashoffset", "2")
                        )
                        .append('text')
                        .attr('x', -height / 2)
                        .attr("y", -margin.left * 0.9)
                        .attr("fill", "black")
                        .attr("font-weight", "bold")
                        .attr("font-size", 12)
                        .style("text-anchor", "middle")
                        .attr("alignment-baseline", "text-before-edge")
                        .attr("transform", "rotate(-90)")
                        .text(yAxisTag.name + (yAxisTag.unit ? "(" + yAxisTag.unit + ")" : ""));


                    let yAxis2Tag = getKeyName(Data.yAxis2);
                    var yAxis2 = g => g
                        .attr("transform", `translate(${width - margin.right},0)`)
                        .call(d3.axisRight(y2).ticks(null, "s").tickSizeOuter(0))
                        .call(g =>
                            g.append('rect')
                                .attr('class', 'group')
                                .attr('x', margin.right * 0.85 - 10)
                                .attr("y", height * 0.4)
                                .attr("width", 10)
                                .attr("height", 10)
                                .attr("fill", 'none')
                                .attr("stroke", group2_color)
                                .attr("stroke-width", 2)
                                .attr("stroke-dasharray", "4,1")
                                .attr("stroke-dashoffset", "2")
                        )
                        .append('text')
                        .attr('x', height / 2)
                        .attr("y", -margin.left * 0.9)
                        .attr("fill", "black")
                        .attr("font-weight", "bold")
                        .attr("font-size", 12)
                        .style("text-anchor", "middle")
                        .attr("alignment-baseline", "text-before-edge")
                        .attr("transform", "rotate(90)")
                        .text(yAxis2Tag.name + (yAxis2Tag.unit ? "(" + yAxis2Tag.unit + ")" : ""));






                    let barWidth = x.bandwidth() / 2 > max_barWidth ? max_barWidth : x.bandwidth() / 2;
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

                    var barGroup1 = svg
                        .append("g")
                        .attr("class", "barGroup")
                        .attr("id", "barGroup1")
                        .attr("groupIndex", 0);

                    barGroup1
                        .selectAll("g")
                        .data(series)
                        .join("g")
                        .selectAll("rect")
                        .data(d => d)
                        .join("rect")
                        .attr("class", "bar")
                        .attr("id", (d, i) => "G1-" + (dataKeys.indexOf(d.key) + i * (dataKeys.length - 1)))
                        .attr("fill", d => color(d.data[dataKeys[0]], dataKeys.indexOf(d.key)))
                        .attr("x", d => x(d.data[dataKeys[0]]))
                        .attr("y", d => y(d[1]))
                        .attr("height", d => y(d[0]) - y(d[1]))
                        .attr("width", barWidth)
                        .attr("stroke", "#D3D3D3")
                        .attr("stroke-width", 3)
                        .attr('stroke-opacity', 0)
                        .attr("transform", function () {
                            // let barWidth = parseInt(this.getAttribute('width'));
                            return `translate(${x.bandwidth() / 2 - barWidth - bar_interval},0)`;
                        });

                    // console.debug(series[series.length - 1])
                    // let groupTotal_interval = 3;
                    barGroup1
                        .append('g')
                        .attr("class", "groupTotal")
                        .attr("position", "relative")
                        .attr("top", 5)
                        .selectAll("rect")
                        .data(series[series.length - 1])
                        .join("rect")
                        .attr("fill", "none")
                        .attr("x", d => x(d.data[dataKeys[0]]))
                        .attr("y", d => y(d[1]) - 1.5)
                        .attr("height", d => y(0) - y(d[1]) + 3)
                        .attr("width", barWidth + 3)
                        .attr("stroke", group1_color)
                        .attr("stroke-width", 3)
                        .attr("stroke-dasharray", function () {
                            let barWidth = parseInt(this.getAttribute("width"));
                            let barHeight = parseInt(this.getAttribute("height"));
                            let dashStr = getDasharrayStr(barWidth, barHeight);
                            return dashStr;
                        })
                        .attr('stroke-opacity', .8)
                        .attr("transform", `translate(${(x.bandwidth() - 3) / 2 - (barWidth) - bar_interval}, 0)`);

                    var barGroup2 = svg
                        .append("g")
                        .attr("class", "barGroup")
                        .attr("id", "barGroup2")
                        .attr("groupIndex", 1);

                    barGroup2
                        .selectAll("g")
                        .data(series2)
                        .join("g")
                        // .call(g => console.debug(g.nodes()))
                        .selectAll("rect")
                        .data(d => d)
                        .join("rect")
                        .attr("class", "bar")
                        .attr("id", (d, i) => "G2-" + (dataKeys.indexOf(d.key) + i * (dataKeys.length - 1)))
                        .attr("fill", d => color(d.data[dataKeys[0]], dataKeys.indexOf(d.key)))
                        .attr("x", d => x(d.data[dataKeys[0]]))
                        .attr("y", d => y2(d[1]))
                        .attr("height", d => y2(d[0]) - y2(d[1]))
                        .attr("width", barWidth)
                        .attr("stroke", "#D3D3D3")
                        .attr("stroke-width", 3)
                        .attr('stroke-opacity', 0)
                        .attr("transform", function () {
                            return `translate(${x.bandwidth() / 2 + bar_interval}, 0)`;
                        });


                    // console.debug(series2[series2.length - 1])
                    // console.debug(dataKeys)

                    barGroup2
                        .append('g')
                        .attr("class", "groupTotal")
                        .attr("position", "relative")
                        .attr("top", 5)
                        .selectAll("rect")
                        .data(series2[series2.length - 1])
                        .join("rect")
                        .attr("fill", "none")
                        .attr("x", d => x(d.data[dataKeys[0]]))
                        .attr("y", d => y2(d[1]) - 1.5)
                        .attr("height", d => y2(0) - y2(d[1]) + 3)
                        .attr("width", barWidth + 3)
                        .attr("stroke", group2_color)
                        .attr("stroke-width", 3)
                        .attr("stroke-dasharray", function () {
                            let barWidth = parseInt(this.getAttribute("width"));
                            let barHeight = parseInt(this.getAttribute("height"));
                            let dashStr = getDasharrayStr(barWidth, barHeight);
                            return dashStr;
                        })
                        .attr('stroke-opacity', .8)
                        .attr("transform", `translate(${(x.bandwidth() - 3) / 2 + bar_interval}, 0)`);
                };
                if (!All_series) {
                    All_series = getNewData();
                    init();
                }
                render();
            }
            function getNewData() {
                let All_series = [];
                var getSeries = (key) => {
                    //===count or size....
                    const seriesData = data[key];
                    const subjects = seriesData.columns;
                    // console.debug(seriesData);
                    // console.debug(seriesDataKeys);

                    const series = d3.stack()
                        .keys(categories)
                        .value((subject, category) => seriesData[subject][category])
                        (subjects)
                    // (data[dataKeys[0]])
                    // (data).map(d => {
                    //     // console.debug(d);
                    //     return (d.forEach(v => {
                    //         // console.debug(v);
                    //         return v.key = d.key
                    //     }), d)
                    // });
                    // console.debug(series);
                    return series;
                }
                dataKeys.forEach(key => All_series.push(getSeries(key)));
                return All_series;
            }


            updateChart();













            var tooltip_width = 100;
            var tooltip_height = margin.bottom * 2;

            const tooltip = svg
                .append("g")
                .attr('id', 'tooltip')
                .attr('display', 'none')
                .attr("opacity", .9);

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
                .attr('x', tooltip_width / 2)
                .attr('y', tooltip_height / 3)
                .attr('text-anchor', 'middle')
                // .attr("font-family", "DFKai-sb")
                .attr("font-size", 18)
                .attr('opacity', 1);

            function events(svg) {

                function barEvent(bar) {
                    var tooltipMove = (bar) => {

                        let barData = bar.__data__;
                        let barDataKey = barData.key;
                        let groupIndex = parseInt(bar.parentNode.parentNode.getAttribute('groupIndex'));
                        let group = barData.data.columns[groupIndex];
                        let dataUnit = getKeyName(group).unit;
                        // console.debug((!groupIndex - groupIndex));

                        let bar_x = parseInt(bar.getAttribute('x'));
                        let bar_y = parseInt(bar.getAttribute('y'));
                        let barWidth = parseInt(bar.getAttribute('width'));
                        let barHeight = parseInt(bar.getAttribute('height'));

                        let trans_x = bar_x + x.bandwidth() / 2 + groupIndex * barWidth + (groupIndex - !groupIndex) * bar_interval + tooltip_width * 0.1;
                        let trans_y = bar_y + (barHeight - tooltip_height) / 2;

                        // console.debug(trans_x + tooltip_width * 1.1, width);


                        let polygon = tooltip.select('polygon');
                        if (trans_x + tooltip_width * 1.1 > width) {
                            trans_x -= barWidth + tooltip_width * 1.2;

                            polygon
                                .attr("points", `${tooltip_width}, ${tooltip_height * 0.4} ${tooltip_width}, ${tooltip_height * 0.6} ${tooltip_width + tooltip_width * 0.1}, ${tooltip_height / 2} `)
                        }
                        else
                            polygon
                                .attr("points", `0, ${tooltip_height * 0.4} 0, ${tooltip_height * 0.6} ${-tooltip_width * 0.1}, ${tooltip_height / 2} `)

                        tooltip
                            .attr("transform", `translate(${trans_x}, ${trans_y})`)
                            .attr('display', 'inline');

                        let tooltip_text = tooltip.select('text');
                        tooltip_text
                            .text(barData.data[dataKeys[0]])
                            .append('tspan')
                            .attr('x', function () { return this.parentNode.getAttribute('x') })
                            .attr("dy", "1em")
                            .attr("font-size", 20)
                            .text(barDataKey + " " + getKeyName(Data.legend).name)
                            .append('tspan')
                            .attr('x', function () { return this.parentNode.getAttribute('x') })
                            .attr("dy", "1em")
                            .attr("font-weight", 900)
                            .attr("font-size", 25)
                            .text(barData.data[barDataKey][group])
                            .append('tspan')
                            .attr("font-weight", "normal")
                            .attr("font-size", 14)
                            .text(" " + dataUnit);
                    };
                    var barHighLight = (bar, dir) => {
                        // console.debug()
                        // console.debug(bar.classList)
                        const fadeOut = 0.4;
                        const highLight = 1;


                        let group = d3.select(bar.parentNode.parentNode);
                        switch (dir) {
                            //===0:out 1:over
                            case 0:
                                var beenClicked = false;
                                group.selectAll('.bar')
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
                                    group.selectAll('.bar')
                                        .attr("fill-opacity", 1);
                                break;

                            case 1:
                                group.selectAll('.bar')
                                    .attr("fill-opacity", function () {
                                        var isTarget = (this == bar);
                                        var beenClicked = this.classList.contains("clicked");
                                        // // console.debug(this.classList.contains("clicked"));
                                        // console.debug(isTarget, beenClicked)
                                        // console.debug(bar)
                                        if (!(isTarget || beenClicked))
                                            return fadeOut
                                        else
                                            d3.select(bar).attr('stroke-opacity', 1);
                                    });
                                break;
                        }
                    };
                    var checkAllBarClicked = (bar, barID) => {
                        let data = bar.data()[0];
                        let barIDArr = barID.split('-');
                        let barGroup = barIDArr[0];
                        let barNo = barIDArr[1];
                        let years = dataKeys.length - 1;
                        let netWorkCount = (parseInt(barNo) - dataKeys.indexOf(data.key)) / years;


                        //===all barID in same group
                        let allBarID = dataKeys.slice(1).map((key, i) => barGroup + "-" + (netWorkCount * years + i + 1));
                        // console.debug(allBarID);

                        let allBarBeenClicked = true;
                        for (let i = 0; i < allBarID.length; i++) {
                            let clicked = svg.select("#" + allBarID[i]).classed('clicked');
                            if (!clicked) {
                                allBarBeenClicked = false;
                                break;
                            }
                            // console.debug(clicked);
                        }
                        return { clicked: allBarBeenClicked, netWorkCount: netWorkCount, barGroup: barGroup };
                    };
                    bar
                        .on('mouseover', function (e) {
                            console.log('mouseover');
                            tooltipMove(this);
                            barHighLight(this, 1);
                        })
                        .on('mouseout', function (e) {
                            console.log('mouseout');
                            // console.debug(this.classList.contains("clicked"))

                            if (!this.classList.contains("clicked")) {
                                barHighLight(this, 0);
                                tooltip
                                    .attr("display", 'none');
                            }
                        })
                        .on('click', function (e) {
                            console.log('click');
                            var bar = d3.select(this);
                            var clicked = bar.classed('clicked');
                            // console.debug(clicked);
                            // pieMove(thisPie, !clicked);
                            bar.classed('clicked', !clicked);
                            let barID = this.id;
                            let allBarStatus = checkAllBarClicked(bar, barID);

                            // console.debug(allBarStatus);


                            if (!clicked) {
                                let tooltip_colne = tooltip.clone(true).node();
                                tooltip_colne.setAttribute('id', 'tooltip' + barID);
                                this.parentNode.append(tooltip_colne);

                                //====make tooltip always on top layer
                                svg
                                    .append('use')
                                    .attr('xlink:href', "#tooltip" + barID)
                                    .attr('id', "use" + barID);

                                if (allBarStatus.clicked) {
                                    let netWorkCount = allBarStatus.netWorkCount + 1;
                                    let groupCount = (allBarStatus.barGroup == "G1" ? 1 : 2);
                                    makeTotalTooltip(netWorkCount, groupCount);
                                }
                            }
                            else {
                                let tooltip_colne = this.parentNode.querySelector("#tooltip" + barID);
                                // console.debug(tooltip_colne);
                                tooltip_colne.remove();

                                let use = svg.select("#use" + barID);
                                // console.debug(use.node());
                                use.remove();
                                if (!allBarStatus.clicked) {
                                    let totalTooltipID = 'totalTooltip-' + "N" + (allBarStatus.netWorkCount + 1) + allBarStatus.barGroup;
                                    let totalTooltip = svg.select('#' + totalTooltipID);
                                    totalTooltip.remove();
                                    let use = svg.select("#use-" + totalTooltipID);
                                    use.remove();

                                }
                            }

                        })


                }
                function xAxisEvent(tick, tickString, i) {
                    // console.debug(tick, tickString, i);
                    tick.on('click', function (e) {
                        let clicked = tick.classed('clicked');
                        tick.classed('clicked', !clicked);
                        // console.debug(tick.node());

                        let networkCount = i + 1;
                        let groupCountArr = [1, 2];

                        if (!clicked)
                            groupCountArr.forEach(groupCount => makeTotalTooltip(networkCount, groupCount));
                        else {
                            groupCountArr.forEach(groupCount => {
                                let totalTooltipID = 'totalTooltip-' + "N" + networkCount + "G" + groupCount;
                                let totalTooltip = svg.select('#' + totalTooltipID);
                                totalTooltip.remove();
                                let use = svg.select("#use-" + totalTooltipID);
                                use.remove();
                            });
                        }
                    });
                }

                var makeTotalTooltip = (netWorkCount, groupCount) => {
                    let totalTooltipID = 'totalTooltip-' + "N" + netWorkCount + "G" + groupCount;

                    let totalTooltip_exist = (svg.select('#' + totalTooltipID).node() != null);
                    // console.debug(totalTooltip_exist);
                    //=== if totalTooltip exist then do nothing
                    if (!totalTooltip_exist) {
                        let groupTotal = svg.select('#barGroup' + groupCount).select('.groupTotal');
                        let totalRect = groupTotal.selectAll('rect').filter(':nth-child(' + netWorkCount + ')');
                        let rectData = totalRect.data()[0];

                        // console.debug(totalRect.node());

                        let total = Number.isInteger(rectData[1]) ? rectData[1] : parseFloat(rectData[1].toFixed(3));
                        let unit = getKeyName(rectData.data.columns[groupCount - 1]).unit;

                        let totalTooltip = tooltip.clone(true);
                        groupTotal.node().append(totalTooltip.node());
                        // console.debug(totalTooltip.node());

                        let x = parseInt(totalRect.attr('x'));
                        let y = parseInt(totalRect.attr('y'));
                        let width = parseInt(totalRect.attr('width'));

                        let transformStr = totalRect.attr('transform');
                        let transformArr = transformStr.substring(transformStr.indexOf('(') + 1, transformStr.indexOf(')')).split(',');
                        let transformX = parseInt(transformArr[0]);
                        let transformY = parseInt(transformArr[1]);

                        let rect_width = 100;
                        let rect_height = 65;
                        let trans_x = x + transformX + width * 0.5 - rect_width * 0.5;
                        let trans_y = y + transformY - rect_height - rect_width * 0.1;
                        // console.debug(x, y, width, transformArr);

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

                        svg
                            .append('use')
                            .attr('xlink:href', "#" + totalTooltipID)
                            .attr('id', "use-" + totalTooltipID);
                    }
                };


                // each bar call barEvent
                barGroup1.selectAll('.bar').each(function () { d3.select(this).call(barEvent) });
                barGroup2.selectAll('.bar').each(function () { d3.select(this).call(barEvent) });

                let ticks = svg.select('.xAxis').selectAll('.tick');
                ticks.each(function (d, i) { xAxisEvent(d3.select(this), d, i) });

            }

            svg.call(events);

            return svg.node();
        }

        function printChart() {
            $('#charts').children().remove();
            // $('.tooltip').remove();
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
                        let chartIDArr = [];
                        chartIDArr.push("#" + $(e.target).parents('.chart')[0].id + " svg");
                        // console.log(chartIDArr);
                        downloadSvg(chartIDArr, title, option);
                    });

                    li.append(item);
                    ul.append(li);
                });
                $('#charts').append(div);
                $('#chart' + i).append(nav);
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
            var downloadSvg = (chartQueryStrs, fileName, option) => {

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

                    var svgWidth = $(chartQueryStrs[0])[0].viewBox.baseVal.width;
                    var svgHeight = $(chartQueryStrs[0])[0].viewBox.baseVal.height * chartQueryStrs.length;
                    var canvasWidth, canvasHeight;
                    //檢視時縮放,下載時放大
                    if (resize) {
                        var windowW = $(window).width();//获取当前窗口宽度 
                        var windowH = $(window).height();//获取当前窗口高度 
                        // console.debug(windowW, windowH);
                        // console.debug(svgW, svgH);
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
                function show(img) {
                    $('#bigimg').attr("src", img);//设置#bigimg元素的src属性 
                    $('#outerdiv').fadeIn("fast");//淡入显示#outerdiv及.pimg 
                    $('#outerdiv').off('click');
                    $('#outerdiv').click(function () {//再次点击淡出消失弹出层 
                        $(this).fadeOut("fast");
                    });
                }

                if (option == 'svg') {
                    //==============merge svg
                    var newSvg = document.createElement('svg');


                    chartQueryStrs.forEach(queryStr => {
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
                    var imageHeight = canvas.height / chartQueryStrs.length;


                    chartQueryStrs.forEach((queryStr, index) => {
                        var svgNode = $(queryStr)[0];
                        var svgUrl = getSvgUrl(svgNode);
                        var image = new Image();
                        image.src = svgUrl;
                        image.onload = () => {
                            context.drawImage(image, 0, index * imageHeight, imageWidth, imageHeight);

                            //done drawing and output
                            if (index == chartQueryStrs.length - 1) {
                                var imgUrl;
                                if (option == 'bigimg') {
                                    imgUrl = canvas.toDataURL();// default png
                                    show(imgUrl);
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


            var yAxisDomainMax = null, yAxis2DomainMax = null;
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
            //     yAxisDomainMax = getMaxDomain(data, 0);
            //     // console.debug(yAxisDomainMax);
            //     yAxis2DomainMax = getMaxDomain(data, 1);
            //     // console.debug(yAxis2DomainMax);
            // }
            data.forEach(d => {
                // console.debug(d);
                let chartNode = stackedBar(d, yAxisDomainMax, yAxis2DomainMax);
                // console.debug(chartNode);
                getChartMenu('A');
                $('#chart' + i).append(chartNode);
                i++;
                // console.debug(i);
            })
            MenuEvents();
        }

        if (!($('#form-chart').length >= 1))
            init()

        printChart();
    }
    return chart;


}
