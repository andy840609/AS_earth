function QCchart() {

    var selector = 'body';
    var data = [];
    var title = '';

    function init() {
        $(selector).append(`
       <form id="form-chart">
            <div class="form-group" id="chartsOptions">
                <div class="row">
                    <div class="form-group col-lg-3 col-md-3 col-sm-6">
                        <label for="Metric" class="col-form-label" lang="Metric">Metric</label>
                        <div class="form-group">
                            <select class="form-control" id="metric" name="metric">
                                <option value="rms">root-mean-square amplitudes</option>
                                <option value="mean">mean amplitudes</option>
                                <option value="max">max amplitudes</option>
                                <option value="maxDemean">maxDemean amplitudes</option>
                                <option value="min">min amplitudes</option>
                                <option value="minDemean">minDemean amplitudes</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group col-lg-3 col-md-3 col-sm-6">
                        <label for="chartsScale" class="col-form-label" lang="">chart option</label>
                        <div class="form-group">
                            <select id="chartsScale" class="form-control">
                                <option value="linearScale">linear scale</option>
                                <option value="logrithmicScale">logrithmic scale</option>
                            </select>
                        </div>
                    </div>
                    <div
                        class="form-group col-lg-3 col-md-3 col-sm-6 d-flex justify-content-end  align-items-start flex-column col-md-6">
                        <div class="form-group">
                            <input class="form-check-label" type="checkbox" id="overlay" name="overlay">
                            <label class="form-check-label" for="overlay" data-lang="">
                                overlay
                            </label>
                        </div>
                    </div>
                    <div id="tzDiv" class="form-group col-lg-3 col-md-3 col-sm-6" style="display: none;">
                        <label for="tz" class="col-form-label" lang="">time zone</label>
                        <div class="form-group">
                            <select id="tz" class="form-control">
                                <option value="UTC">UTC</option>
                                <option value="local">local</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-group row" id="charts">

            </div>
            <div id="outerdiv"
                style="position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);z-index:999;width:100%;height:100%;display:none;">
                <div id="innerdiv" style="background-color: rgb(255, 255, 255);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
                </div>
            </div>
        </form>
            `);


        $('#chartsScale').change(e => chart());
        $('#metric').change(e => chart());
        $('#overlay').change(e => chart());
        $('#tz').change(e => chart());
        //==========test=====

        //===================
    };

    chart.selector = (vaule) => {
        selector = vaule;
        return chart;
    }

    chart.data = (obj) => {
        let pathArr = obj.pathArr;
        let channelArr = obj.channelArr;
        let replaceSymbol = obj.replaceSymbol ? obj.replaceSymbol : '???';

        data = [];
        var getFileData = (path) => {
            var data;
            // try {
            $.ajax({
                url: path,
                dataType: "json",
                async: false,
                success: function (d) {
                    data = d.data
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    // console.error(jqXHR, textStatus, errorThrown);
                    //-------------------404 NoData or 200 parsererror(SyntaxError: Unexpected end of JSON input)
                    var pathArr = path.split('/');
                    var dateStr = pathArr[pathArr.length - 2];
                    var year = dateStr.split('.')[0];
                    var solorDay = dateStr.split('.')[1];

                    var ms = new Date(Date.UTC(year, 0, 1)).getTime() + ((solorDay - 1) * 24 * 60 * 60 * 1000);
                    // var date = new Date(ms);
                    // console.debug(date);
                    //-----------------dayEnd=23:59:59
                    var dayEndInMs = 23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000;
                    // var date = new Date(ms + dayEndInMs);
                    // console.debug(date);
                    data = [{ timestamp: new Date(ms).toISOString(), rms: undefined, mean: undefined }, { timestamp: new Date(ms + dayEndInMs).toISOString(), rms: undefined, mean: undefined }];

                },
            });
            return data;
        }

        //將各分量每天的檔案資料合併
        channelArr.forEach(channel => {
            let eachChannelData = [];

            pathArr.forEach(path => {
                let tmp = getFileData(path.replace(replaceSymbol, channel));
                console.debug(tmp);
                tmp.forEach(d => {
                    // console.debug(d);
                    //==========ISO+Z for UTC Time
                    var lastChar = d.timestamp.charAt(d.timestamp.length - 1);
                    if (lastChar != 'Z')
                        d.timestamp += 'Z';
                    eachChannelData.push(d);
                });
            });
            // console.debug(eachChannelData);
            data.push({ channel: channel, data: eachChannelData });
        })

        console.log(data);
        return chart;
    }

    chart.title = (vaule) => {
        title = vaule;
        return chart;
    }
    function chart() {
        function getEachChannelData(data, metric, scale) {
            var lineData = [];

            lineData.y = metric + " (count)";
            if (scale == 'linearScale')
                data.forEach(d => lineData.push({ date: moment.utc(d.timestamp), value: d[metric] }));
            else if (scale == 'logrithmicScale') {

                var value, signed;
                data.forEach(d => {
                    if (d[metric] == 0) {
                        value = undefined;
                        signed = 0;
                    }
                    else if (d[metric] < 0) {
                        value = Math.log10(Math.abs(d[metric])) * (-1);
                        signed = 1;
                    }
                    else if (d[metric] < 1) {
                        // value = Math.log10(d[metric]) * (-1);
                        // signed = 0;
                        console.debug(metric + ' = ' + d[metric]);
                        value = undefined;
                        signed = 0;
                    }
                    else if (Math.log10(d[metric])) {
                        value = Math.log10(d[metric]);
                        signed = 0;
                    }
                    else {
                        value = undefined;
                        signed = 0;
                    }
                    lineData.push({ date: moment.utc(d.timestamp), value: value, signed: signed });
                });
            }
            else
                console.log(`no Scale`);

            return lineData;
        }
        //-----if start date and end date are in the same year/same month ,give a label to mark year/month
        function getDateLabel(x) {
            var xStartDate = x.domain()[0];
            var xEndDate = x.domain()[1];
            var YearStr, MDStr;
            if (xStartDate.getUTCFullYear() == xEndDate.getUTCFullYear()) {
                var dayRange = moment.utc(xEndDate).format('DDDD') - moment.utc(xStartDate).format('DDDD') + 1;
                // console.debug(moment.utc(xEndDate).format('DDDD') + '-' + moment.utc(xStartDate).format('DDDD'));
                // console.debug(dayRange);
                if (xStartDate.getUTCMonth() == xEndDate.getUTCMonth() && dayRange < 24)
                    if (xStartDate.getUTCDate() == xEndDate.getUTCDate()) {
                        YearStr = moment(xStartDate).format("YYYY");
                        MDStr = moment(xStartDate).format("MMM DD");
                    }
                    else {
                        YearStr = moment(xStartDate).format("YYYY");
                        MDStr = moment(xStartDate).format("MMM");
                    }
                else {
                    YearStr = moment(xStartDate).format("YYYY");
                    MDStr = '';
                }
            }
            else {
                YearStr = '';
                MDStr = '';
            }
            return new Array(YearStr, MDStr);
        }

        function getLineColor(index) {
            switch (index) {
                case 0:
                    return "steelblue";
                    break;
                case 1:
                    return "#AE0000";
                    break;
                case 2:
                    return "#006030";
                    break;
                default:
                    return "steelblue";
            }

        }


        function lineChart(index, title, chartData, metric, scale) {

            var ChartDatas = [];
            ChartDatas = getEachChannelData(chartData, metric, scale);

            var height = 500;
            var width = 500;
            var margin = ({ top: 20, right: 30, bottom: 30, left: 45 });
            var x = d3.scaleUtc()
                .domain(d3.extent(ChartDatas, d => d.date))
                .range([margin.left, width - margin.right]);
            if (metric == 'rms')
                var y = d3.scaleLinear()
                    .domain([0, d3.max(ChartDatas, d => d.value)]).nice()
                    .range([height - margin.bottom, margin.top]);
            else
                var y = d3.scaleLinear()
                    .domain(d3.extent(ChartDatas, d => d.value)).nice()
                    .range([height - margin.bottom, margin.top]);



            var xAxis = g => g
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(
                    d3.axisBottom(x)
                        .ticks(width / 80)
                        .tickSizeOuter(0)
                );


            // var Pre_d;
            var yAxis = g => g
                .attr("transform", `translate(${margin.left},0)`)
                .call(
                    d3.axisLeft(y)
                    // .tickValues([0, 200])     
                )
                .call(g => g.select(".domain").remove())
                .call(g => {
                    if (scale == 'logrithmicScale') {
                        g.selectAll(".tick text")
                            .text(d => {
                                // console.debug(Pre_d);
                                // if (d.toFixed(1) == Pre_d)
                                //     return '';
                                // else {
                                //     Pre_d = d.toFixed(1);
                                if (d < 0) {
                                    return (-d).toFixed(1);
                                }
                                else
                                    return d.toFixed(1);
                                // }
                            });
                        g.selectAll(".tick text").clone()
                            .append('tspan')
                            .attr("x", -25)
                            .attr("dy", 8)
                            .attr("font-size", "9")
                            .text(d => {
                                // console.debug(d);
                                if (d < 0)
                                    return '-10';
                                else
                                    return '10';
                            });
                    }
                }
                );

            var line = d3.line()
                .defined(d => !isNaN(d.value))
                .x(d => x(d.date))
                .y(d => y(d.value));



            // =========================================chart
            const svg = d3.create("svg")
                .attr("viewBox", [0, 0, width, height])
                .attr("fill", "none")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round");

            svg.append("g")
                .call(xAxis);

            svg.append("g")
                .call(yAxis);

            var path = svg.append("g")
                .attr("class", "path");

            path.append("path")
                .datum(ChartDatas.filter(line.defined()))
                .attr("stroke", "#000")
                .attr("stroke-width", 0.4)
                .attr("d", line);

            path.append("path")
                .datum(ChartDatas)
                .attr("stroke", getLineColor(index))
                .attr("stroke-width", 0.8)
                .attr("d", line);

            //------channel Title
            svg.append("g")
                .append('text')
                .attr("x", "50%")
                .attr("y", 20)
                .attr("fill", "currentColor")
                .attr("text-anchor", "middle")
                .attr("font-weight", "bold")
                .attr("font-size", "13")
                .text(title);

            //------y count
            svg.append("g")
                .append('text')
                .attr("x", margin.left + 5)
                .attr("y", margin.top)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "central")
                .attr("font-weight", "bold")
                .attr("font-size", "13")
                .text(ChartDatas.y);

            //------DateLabel
            var DateLabel = getDateLabel(x);
            // console.debug(DateLabel);
            svg.append("g")
                .append('text')
                .attr("x", margin.left + 10)
                .attr("y", height)
                .attr("fill", "currentColor")
                .attr("text-anchor", "end")
                .attr("alignment-baseline", "text-after-edge")
                .attr("font-weight", "lighter")
                .attr("font-size", "10")
                .text(DateLabel[0] + " " + DateLabel[1])


            function event(svg) {
                if ("ontouchstart" in document) svg
                    .style("-webkit-tap-highlight-color", "transparent")
                    .on("touchmove", moved)
                    // .on("touchstart", entered)
                    .on("touchend", left)
                else svg
                    .on("mousemove", moved)
                    // .on("mouseenter", entered)
                    .on("mouseleave", left)

                const dot = svg.append("g")
                    .attr("class", "dot")
                    .attr("display", "none");

                dot.append("circle")
                    .attr("fill", "currentColor")
                    .attr("r", 2.5);

                const tooltip = d3.select('#chart' + (index + 1)).append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

                let channel = data[index].channel;
                function moved(event) {
                    event.preventDefault();
                    const pointer = d3.pointer(event, this);
                    const xm = x.invert(pointer[0]);
                    const ym = y.invert(pointer[1]);
                    const datesArr = ChartDatas.map(obj => obj.date);
                    const i = d3.bisectCenter(datesArr, xm);

                    var dataHtml = '';

                    if (ChartDatas[i].value == undefined) {
                        dot.attr("display", "none");
                        dataHtml = '<br/>No data';
                    }
                    else {
                        dot.attr("display", 'inline');
                        dot.attr("transform", `translate(${x(ChartDatas[i].date)},${y(ChartDatas[i].value)})`);

                        var date = '';
                        date = "<p  style='text-align:left;font-size:1px;'>" + moment.utc(ChartDatas[i].date).format('dddd, MMM DD, YYYY  HH:mm:ss') + "</p>";

                        if (scale == 'logrithmicScale') {
                            var power, index;
                            if (ChartDatas[i].signed == 1) {
                                power = '-10';
                                index = -ChartDatas[i].value;
                            }
                            else {
                                power = '10';
                                index = ChartDatas[i].value;
                            }
                            dataHtml = date + "<p style='text-align:left;'>&emsp;" + metric + " ≒ <br/>" + "<span style='display:flex;justify-content:center;font-size:20px;'><b>" + power + "<sup>" + index.toFixed(4) + "</sup></b></span></p>";
                        }
                        else
                            dataHtml = date + "<p style='text-align:left;'>&emsp;" + metric + " : <br/>" + "<span style='display:flex;justify-content:center;font-size:20px;'><b>" + ChartDatas[i].value + "</b></span></p>";
                    }




                    const divHtml = "<font size='5'>" + channel + "</font><br/>" + dataHtml;


                    let BrowserToolBarHeight = window.outerHeight - window.innerHeight;
                    tooltip.transition()
                        .duration(100)
                        .style("opacity", .9);
                    tooltip.html(divHtml)
                        .style("left", function () {
                            let left = this.parentNode.getBoundingClientRect().left;
                            return (event.screenX - left) + "px";
                        })
                        .style("top", function () {
                            let top = this.parentNode.getBoundingClientRect().top;
                            return (event.screenY - (BrowserToolBarHeight + top)) + "px";
                        })
                }

                function left() {
                    dot.attr("display", "none");
                    tooltip.transition()
                        .duration(100)
                        .style("opacity", 0);
                }
            }

            svg.call(event);
            return svg.node();
        }

        function overlayChart(timseZone, title, ChartDatas, metric, scale) {

            var multiChartData = [];

            ChartDatas.forEach(Datas => {
                // Datas.data[0].rms = 0.1;
                // Datas.data[0].minDemean = 0.1;
                var tmpDatas = [];
                tmpDatas = getEachChannelData(Datas.data, metric, scale);
                multiChartData.push({ channel: Datas.channel, data: tmpDatas });
            })

            // multiChartData[0].data[0].signed = 0;
            // multiChartData[0].data[0].value = -3.7320663070467677;
            // console.debug(multiChartData);
            // console.debug(Math.log10(1.9));
            var margin = ({ top: 20, right: 30, bottom: 30, left: 45 })
            var height = 350
            var width = 1000;

            // console.debug(timseZone);

            if (timseZone == 'UTC')
                var x = d3.scaleUtc()
                    // .domain(d3.extent(multiChartData[0].data, d => d.date))
                    .domain(
                        [
                            d3.min(multiChartData, Data => d3.min(Data.data, d => d.date)),
                            d3.max(multiChartData, Data => d3.max(Data.data, d => d.date))
                        ]
                    )
                    .range([margin.left, width - margin.right]);
            else
                var x = d3.scaleTime()
                    // .domain(d3.extent(multiChartData[0].data, d => d.date))
                    .domain(
                        [
                            d3.min(multiChartData, Data => d3.min(Data.data, d => d.date)),
                            d3.max(multiChartData, Data => d3.max(Data.data, d => d.date))
                        ]
                    )
                    .range([margin.left, width - margin.right]);

            // console.debug(x.domain());
            // console.debug(!1 * 1);


            if (metric == 'rms')
                var y = d3.scaleLinear()
                    .domain([0, d3.max(multiChartData, Data => d3.max(Data.data, d => d.value))]).nice()
                    .range([height - margin.bottom, margin.top]);
            else
                var y = d3.scaleLinear()
                    .domain(
                        [
                            d3.min(multiChartData, Data => d3.min(Data.data, d => d.value)),
                            d3.max(multiChartData, Data => d3.max(Data.data, d => d.value))
                        ]
                    ).nice()
                    .range([height - margin.bottom, margin.top]);


            // console.debug(y.domain());
            var xAxis = g => g
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(
                    d3.axisBottom(x)
                        .ticks(width / 80)
                        .tickSizeOuter(0)
                    // .tickFormat(d => moment(d).tz("Asia/Jakarta").format('hh:mm:ss'))
                );


            var yAxis = g => g
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y))
                .call(g => g.select(".domain").remove())
                .call(g => {
                    if (scale == 'logrithmicScale') {
                        g.selectAll(".tick text")
                            .text(d => {
                                // console.debug(d);
                                if (d < 0)
                                    return (-d).toFixed(1);
                                else
                                    return d.toFixed(1);
                            });
                        g.selectAll(".tick text").clone()
                            .append('tspan')
                            .attr("x", -25)
                            .attr("dy", 8)
                            .attr("font-size", "9")
                            .text(d => {
                                // console.debug(d);
                                if (d < 0)
                                    return '-10';
                                else
                                    return '10';
                            });
                    }
                });

            // var line = d3.line()
            //     .defined(d => !isNaN(d))
            //     .x((d, i) => x(data.dates[i]))
            //     .y(d => y(d))

            var line = d3.line()
                .defined(d => !isNaN(d.value))
                .x(d => x(d.date))
                .y(d => y(d.value));


            function hover(svg, path) {
                if ("ontouchstart" in document) svg
                    .style("-webkit-tap-highlight-color", "transparent")
                    .on("touchmove", moved)
                    .on("touchstart", entered)
                    .on("touchend", left)
                else svg
                    .on("mousemove", moved)
                    .on("mouseenter", entered)
                    .on("mouseleave", left)
                    .on("click", click);

                const dot = svg.append("g")
                    .attr("display", "none");

                dot.append("circle")
                    .attr("r", 2.5);

                const tooltip = d3.select(".chart").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);
                //------tip
                const tipText = "＊Tip : Click on one path to select a channel";
                const tip = d3.select("#charts").append("p")
                    .style("font-size", "15px")
                    .style("font-style", "italic")
                    .text(tipText);

                var blurStrokeColor = '#ADADAD';
                var click = false;
                var sPrevious = multiChartData[0];
                function moved(event) {
                    event.preventDefault();
                    const pointer = d3.pointer(event, this);
                    const xm = x.invert(pointer[0]);
                    const ym = y.invert(pointer[1]);
                    const datesArr = multiChartData[0].data.map(obj => obj.date);
                    const i = d3.bisectCenter(datesArr, xm);
                    var s;
                    if (click)
                        s = sPrevious;
                    else {
                        s = d3.least(multiChartData, Data => Math.abs(Data.data[i].value - ym));
                        if (!s)
                            s = sPrevious;
                        else
                            sPrevious = s;
                    }

                    path.attr("stroke", (d, i) => d === s ? getLineColor(i) : blurStrokeColor).filter(d => d === s).raise();

                    // console.debug(s);
                    var dataHtml = '';

                    if (s.data[i].value == undefined) {
                        dot.attr("display", "none");
                        dataHtml = '<br/>No data';
                    }
                    else {
                        dot.attr("display", null);
                        dot.attr("transform", `translate(${x(s.data[i].date)},${y(s.data[i].value)})`);

                        var date = '';
                        if (timseZone == 'UTC')
                            date = "<p  style='text-align:left;font-size:1px;'>" + moment.utc(s.data[i].date).format('dddd, MMM DD, YYYY  HH:mm:ss') + "</p>";
                        else {
                            var tz = new Date().toTimeString();
                            var startIndex = tz.search(/[a-zA-Z]/);
                            var endIndex = tz.indexOf('(');
                            var tzStr = tz.substring(startIndex, endIndex).trim();
                            date = "<p  style='text-align:left;font-size:1px;'>" + moment(s.data[i].date).local().format('dddd, MMM DD, YYYY  HH:mm:ss ') + tzStr + "</p>";
                        }

                        if (scale == 'logrithmicScale') {
                            var power, index;
                            if (s.data[i].signed == 1) {
                                power = '-10';
                                index = -s.data[i].value;
                            }
                            else {
                                power = '10';
                                index = s.data[i].value;
                            }
                            dataHtml = date + "<p style='text-align:left;'>&emsp;" + metric + " ≒ <br/>" + "<span style='display:flex;justify-content:center;font-size:20px;'><b>" + power + "<sup>" + index.toFixed(4) + "</sup></b></span></p>";
                        }
                        else
                            // dataHtml = date + metric + ":<b>" + s.data[i].value + "</b>";
                            dataHtml = date + "<p style='text-align:left;'>&emsp;" + metric + " : <br/>" + "<span style='display:flex;justify-content:center;font-size:20px;'><b>" + s.data[i].value + "</b></span></p>";
                    }

                    // console.debug(s.data[i].date);
                    // console.debug(moment.utc(s.data[i].date).format('MMM DD HH:mm:ss'));



                    const divHtml = "<font size='5'>" + s.channel + "</font><br/>" + dataHtml;
                    // console.debug(dot.offset());
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);

                    let BrowserToolBarHeight = window.outerHeight - window.innerHeight;
                    tooltip.html(divHtml)
                        .style("left", function () {
                            let left = this.parentNode.getBoundingClientRect().left;
                            return (event.screenX - left) + "px";
                        })
                        .style("top", function () {
                            let top = this.parentNode.getBoundingClientRect().top;
                            return (event.screenY - (BrowserToolBarHeight + top)) + "px";
                        })
                    // // selects the horizontal dashed line in the group
                    // d3.select(this.nextElementSibling).transition()
                    //     .duration(200)
                    //     .style("opacity", .9);
                    // //selects the vertical dashed line in the group
                    // d3.select(this.nextElementSibling.nextElementSibling).transition()
                    //     .duration(200)
                    //     .style("opacity", .9);
                }

                function entered() {
                    path.style("mix-blend-mode", null).attr("stroke", blurStrokeColor);
                    dot.attr("display", null);
                }

                function left() {
                    path.style("mix-blend-mode", "normal").attr("stroke", (d, i) => getLineColor(i));
                    dot.attr("display", "none");
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                }
                function click() {
                    click = !click;
                    if (click) {
                        svg.on("mouseenter", null)
                            .on("mouseleave", null);
                        tip.text("＊Tip : Click again to cancel");
                    }
                    else {
                        svg.on("mouseenter", entered)
                            .on("mouseleave", left);
                        tip.text(tipText);
                    }

                }
            }



            const svg = d3.create("svg")
                .attr("viewBox", [0, 0, width, height])
                .style("overflow", "visible");

            svg.append("g")
                .call(xAxis);

            svg.append("g")
                .call(yAxis);


            //------channel Title
            svg.append("g")
                .append('text')
                .attr("x", '50%')
                .attr("align", "center")
                .attr("y", 20)
                .attr("fill", "currentColor")
                .attr("text-anchor", "middle")
                .attr("font-weight", "bold")
                .attr("font-size", "13")
                .text(title);

            //------y count
            svg.append("g")
                .append('text')
                .attr("x", margin.left + 5)
                .attr("y", margin.top)
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "central")
                .attr("font-weight", "bold")
                .attr("font-size", "13")
                .text(multiChartData[0].data.y);

            //------DateLabel
            var DateLabel = getDateLabel(x);
            // console.debug(DateLabel);
            svg.append("g")
                .append('text')
                .attr("x", margin.left + 10)
                .attr("y", height)
                .attr("text-anchor", "end")
                .attr("alignment-baseline", "text-after-edge")
                .attr("font-weight", "lighter")
                .attr("font-size", "10")
                .text(DateLabel[0] + " " + DateLabel[1])





            //==========legend===============
            var lineOpacity = .9;
            const legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(650,10)")
                .style("font-size", "12px");

            legend.append("rect")
                .attr("height", 20)
                .attr("width", 245)
                .attr("fill", "white")
                .attr("stroke-width", "1")
                .attr("stroke", "#BEBEBE");

            var legendX = 70;
            var lineLength = 25;
            legend
                .selectAll('path')
                .data(multiChartData)
                .enter()
                .append('path')
                .attr("transform", "translate(25,10)")
                .attr("stroke-width", 3)
                .attr("stroke-opacity", lineOpacity)
                .attr("stroke", (d, i) => getLineColor(i))
                .attr('d', (d, i) => "M" + (i * legendX) + " 0 H" + (i * legendX + lineLength))

            legend
                .selectAll('text')
                .data(multiChartData)
                .enter()
                .append('text')
                .attr("font-weight", "bold")
                .attr("transform", "translate(50,15)")
                .attr('x', (d, i) => i * legendX + 5)
                .text(d => d.channel);
            //==========legend===============

            const path = svg.append("g")
                .selectAll("path")
                .data(multiChartData)
                .join("path")
                .style("mix-blend-mode", "normal")
                .attr("fill", "none")
                .attr("stroke-width", 1.5)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-opacity", lineOpacity)
                .attr("stroke", (d, i) => getLineColor(i))
                .attr("d", Data => line(Data.data));
            // .attr("data-legend", (d, i) => legend(d.channel, i));
            // console.debug(path);

            svg.call(hover, path);

            return svg.node();

        }

        function printChart(overlay) {
            $('#charts').children().remove();
            // $('.tooltip').remove();
            var i = 1;

            var getChartMenu = (title, overlay) => {
                // console.log(d.data);
                var div = document.createElement("div");
                div.setAttribute("id", "chart" + i);
                let divClass = overlay ? "col-md-12 col-sm-12" : "col-md-4 col-sm-12";
                div.setAttribute("class", "chart " + divClass);
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
                        // console.debug(e.target)
                        chartIDArr.push("#" + $(e.target).parents('.chart')[0].id + " svg");
                        // console.debug($(e.target))
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
                function show(width, height) {

                    $('#outerdiv').fadeIn("fast");//淡入显示#outerdiv及.pimg 
                    $('#outerdiv').off('click');
                    $('#outerdiv').click(function () {//再次点击淡出消失弹出层 
                        $(this).fadeOut("fast");
                        $(originParent_id + ' svg').remove();
                        originSvg.attr('width', null)
                            .attr('height', null)
                        originSvg.appendTo(originParent_id);
                    });


                    let originSvg = $(chartQueryStrs[0]);
                    let originParent_id = '#' + originSvg.parent()[0].id;
                    let cloneSvg = originSvg.clone(true);

                    originSvg.attr('width', width)
                        .attr('height', height)
                    originSvg.appendTo('#innerdiv');
                    cloneSvg.appendTo(originParent_id);

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
                else if (option == 'bigimg') {

                    let canvas = getCanvas(true)[0];
                    // console.debug(canvas);
                    show(canvas.width, canvas.height);

                }
                else {
                    //==============each svg draw to canvas
                    var CanvasObjArr = getCanvas(false);
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
                                var imgUrl = canvas.toDataURL('image/' + option);
                                download(imgUrl, fileName + '.' + option);
                            }
                        }
                    });
                }

            }
            // console.debug(overlay);  


            if (overlay) {
                getChartMenu(title, overlay);
                $('#chart' + i).append(overlayChart($('#tz').val(), title, data, $('#metric').val(), $('#chartsScale').val()));
                $('#tzDiv').css('display', 'inline');
            }
            else {
                data.forEach(d => {
                    let titleWithChennal = title + "." + d.channel;
                    getChartMenu(titleWithChennal, overlay);
                    $('#chart' + i).append(lineChart((i - 1), titleWithChennal, d.data, $('#metric').val(), $('#chartsScale').val()));
                    i++;
                })
                $('#tzDiv').css('display', 'none');
            }
            MenuEvents();
        }

        if (!($('#form-chart').length >= 1))
            init();

        printChart($('#overlay').prop('checked'));


    }
    return chart;


}


