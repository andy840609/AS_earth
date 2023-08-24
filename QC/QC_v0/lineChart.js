//=================================funtions for DATA=========================================
//************ ($.ajax return a promise obj)********************
async function getData(path) {
    var data;
    try {
        await
            $.ajax({
                url: path,
                dataType: "json",
                success: function (d) {
                    data = d.data
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    // console.error(jqXHR, textStatus, errorThrown);

                },
            });

        // console.debug(data);
    }
    catch (error) {
        // console.debug(error.status);
        //-------------------404 NoData or 200 parsererror(SyntaxError: Unexpected end of JSON input)
        if (error.status == 404 || error.status == 200) {
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
        }
    }

    return data;
}

async function dataExtend(channelArr, paths) {
    var promises;
    var datas = [];
    var ChartDatas = [];



    for (var i = 0; i < channelArr.length; i++) {
        promises = [];
        // console.debug(channel);
        paths.forEach(path => {
            path = path.replace('???', channelArr[i]);
            // console.debug(path);
            promises.push(getData(path));
        });
        // console.log('paths=');
        // console.log(paths);

        // console.debug(promises);

        await Promise.all(promises).then(success => {
            // console.debug(success);
            success.forEach(data => {
                // console.debug(data);
                data.map(d => {
                    // console.debug(d);
                    //==========ISO+Z for UTC Time
                    var lastChar = d.timestamp.charAt(d.timestamp.length - 1);
                    if (lastChar != 'Z')
                        d.timestamp += 'Z';
                    datas.push(d);
                });
            });
        });

        // console.debug(datas);
        ChartDatas.push({ channel: channelArr[i], data: datas });
        datas = [];

    }

    // console.debug(ChartDatas);

    return ChartDatas;

}

//=================================funtion for DOWNLOAD=========================================
function downloadSvg(chartID, chartName, fileType, option) {
    // var svgElementArr = document.getElementById('charts').childNodes;
    // var svgData = $("#charts svg")[0].outerHTML;
    // console.debug(chartID);
    var svgNode = $(chartID)[0];
    var svgData = (new XMLSerializer()).serializeToString(svgNode);
    var svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    var svgUrl = URL.createObjectURL(svgBlob);




    let image = new Image();
    image.onload = () => {
        // alert('onload');
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        var windowW = $(window).width();//获取当前窗口宽度 
        var windowH = $(window).height();//获取当前窗口高度 
        var svgWidth = svgNode.viewBox.baseVal.width;
        var svgHeight = svgNode.viewBox.baseVal.height;
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

        canvas.width = width;
        canvas.height = height;
        // draw image in canvas starting left-0 , top - 0  
        context.drawImage(image, 0, 0, width, height);
        let png = canvas.toDataURL(); // default png
        let jpeg = canvas.toDataURL('image/jpg');
        // let webp = canvas.toDataURL('image/webp');

        if (option == 'download') {
            switch (fileType) {
                case 'svg':
                    download(svgUrl, chartName + ".svg");
                    break;
                case 'png':
                    download(png, chartName + ".png");
                    break;
                case 'jpg':
                    download(jpeg, chartName + ".jpg");
                    break;
                // case 'webp':
                //     download(webp, chartName + ".webp");
                //     break;
                default:
                    download(png, chartName + ".png");
            }
        }
        else if (option == 'show') {
            $('#bigimg').attr("src", png);//设置#bigimg元素的src属性 
            $('#outerdiv').fadeIn("fast");//淡入显示#outerdiv及.pimg 
            $('#outerdiv').off('click');
            $('#outerdiv').click(function () {//再次点击淡出消失弹出层 
                $(this).fadeOut("fast");
            });
        }
    };

    image.src = svgUrl;
    // $('#charts').append(image);



    var download = function (href, name) {
        var downloadLink = document.createElement("a");
        downloadLink.href = href;
        downloadLink.download = name;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
}


//=================================funtions for CHART=========================================
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

function lineChart(index, title, data, metric, scale) {

    var ChartDatas = [];
    ChartDatas = getEachChannelData(data, metric, scale);
    console.debug(data);
    // console.debug(ChartDatas);


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


    // console.debug('x.domain = ' + x.domain());
    // console.debug('y.domain = ' + y.domain());
    // console.debug('y.range = ' + y.range());
    // var ticks = x.ticks();
    // ticks.splice(0, 0, new Date('2020-1-1Z'));
    // console.debug(ticks);
    // console.debug(x.domain()[0]);
    // if(x.domain()[0])


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

    svg.append("path")
        .datum(ChartDatas.filter(line.defined()))
        .attr("stroke", "#000")
        .attr("stroke-width", 0.4)
        .attr("d", line);

    svg.append("path")
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

    return svg.node();
}

function multiLineChart(timseZone, title, ChartDatas, metric, scale) {

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

        const div = d3.select("body").append("div")
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
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(divHtml)
                .style("left", (event.pageX - 20) + "px")
                .style("top", (event.pageY + 6) + "px");
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
            div.transition()
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



    // const path = svg.append("g");

    // path.selectAll("path")
    //     .data(multiChartData)
    //     .join("path")
    //     .style("mix-blend-mode", "multiply")
    //     .attr("fill", "none")
    //     .attr("stroke-width", 1.5)
    //     // .attr("stroke-linejoin", "round")
    //     // .attr("stroke-linecap", "round")
    //     // .attr("stroke-opacity", "0")
    //     .attr("stroke", "#000")
    //     .attr("d", Data => line(Data.data.filter(line.defined())));


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
