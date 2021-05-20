function VR_WEB() {
    var selector = 'body';
    var dataPath = "../data/";
    var data = [];
    const fileDataKey = ['DateInSecond', 'a', 'b', 'c'];
    // var title, channel;
    //remember zoom domain
    var zoomAll = false;


    //===append chart options
    function init() {
        $(selector).append(`
                <form id="form-chart">
                <div class="form-group" id="chartsOptions" style="display: inline;">
                <div class="row">
                



                <label for="station" class="col-form-label" >Station</label>
                <div class="form-group col-lg-3 col-md-3 col-sm-6">
                <div class="form-group">
                    <select class="form-control" id="station">
                     
                    </select>
                </div>
                </div>
                <div
                class="form-group col-lg-3 col-md-3 col-sm-6 d-flex justify-content-end  align-items-start flex-column col-md-6">
                <div id="zoomAll-group" class="form-group">
                    <input class="form-check-label" type="checkbox" id="zoomAll" name="zoomAll">
                    <label class="form-check-label" for="zoomAll" data-lang="">
                        synchronize
                    </label>
                </div>
                </div>



                    

                
                </div>
                </div>
                    <div class="form-group" id="charts"></div>          
                    <div id="outerdiv"
                        style="position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);z-index:999;width:100%;height:100%;display:none;">
                        <div id="innerdiv" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
                            <img id="bigimg" style=" background-color: rgb(255, 255, 255);" src="" />
                        </div>
                    </div>
                </form>
                `);



        function readData(paths) {
            data = [];
            var fileData = [];

            var readTextFile = (file) => {
                var rawFile = new XMLHttpRequest();
                rawFile.open("GET", file, false);
                rawFile.onreadystatechange = function () {
                    if (rawFile.readyState === 4) {
                        if (rawFile.status === 200 || rawFile.status == 0) {
                            var rows = rawFile.responseText.split("\n");
                            // console.debug(rows);
                            var tmpData = [];
                            rows.forEach(row => {
                                if (row != '') {
                                    var col = row.trim().split(/\s+/);
                                    // console.debug(col);
                                    let obj = {};
                                    col.forEach((c, index) => obj[fileDataKey[index]] = parseFloat(c));
                                    tmpData.push(obj);
                                }

                            })
                            var startStr = '/';
                            var startIndex = file.lastIndexOf(startStr) + startStr.length;
                            var fileName = file.substring(startIndex);
                            fileData.push({ fileName: fileName, data: tmpData });

                        }
                    }
                }
                rawFile.send(null);
            }
            var getData = (fileData) => {

                //找出不同時間點
                // var iMax = chartData[0].data.length;
                // var j = 0;
                // for (let i = 0; i < iMax; i++) {
                //     if (chartData[0].data[i] != chartData[2].data[j]) {
                //         console.debug(chartData[2].data[j]);
                //         j++;
                //     }
                //     // console.debug(j);
                //     j++;
                // }
                var dataFileCount = data.length;
                var DateArr = [], dataArr = [];
                var dataArr1 = [], dataArr2 = [], dataArr3 = [];
                // console.debug(dataArr);
                let i = 0, j = 0, k = 0;//index of Z,N,E data

                // let eachDataIndexOfSame = new Array(dataFileCount);

                // for (let dataNum = 0; dataNum < dataFileCount; dataNum++) {

                //     data[dataNum]
                // }
                // for (i = 0; i < chartData[0].data.length; i++)

                // var test = [0, 1, 2];
                // test[0]++;
                // console.debug(test);

                // function compare(dataArr, indexOfDiff) {
                //     console.debug(dataArr);
                //     let indexOfSame = indexOfDiff;
                //     for (let i = 0; i < dataArr.length; i++)

                //         if (dataArr[dataNum1].data[indexOfSame].DateTime > dataArr[dataNum1].data[indexOfSame].DateTime)
                // }

                let date = fileDataKey[0];
                while (i < fileData[0].data.length) {

                    // while (data[0].data[i][date] !== data[1].data[j][date]) {


                    //a>b
                    if (fileData[0].data[i][date] > fileData[1].data[j][date]) {
                        //b>c
                        if (fileData[1].data[j][date] > fileData[2].data[k][date]) {
                            DateArr.push(fileData[2].data[k][date] * 1000);
                            dataArr1.push({ a: undefined, b: undefined, c: undefined });
                            dataArr2.push({ a: undefined, b: undefined, c: undefined });
                            dataArr3.push({ a: fileData[2].data[k].a, b: fileData[2].data[k].b, c: fileData[2].data[k].c });
                            k++;
                        }
                        //b<c
                        else if (fileData[1].data[j][date] < fileData[2].data[k][date]) {
                            DateArr.push(fileData[1].data[j][date] * 1000);
                            dataArr1.push({ a: undefined, b: undefined, c: undefined });
                            dataArr2.push({ a: fileData[1].data[j].a, b: fileData[1].data[j].b, c: fileData[1].data[j].c });
                            dataArr3.push({ a: undefined, b: undefined, c: undefined });
                            j++;
                        }
                        //b=c
                        else {
                            DateArr.push(fileData[1].data[j][date] * 1000);
                            dataArr1.push({ a: undefined, b: undefined, c: undefined });
                            dataArr2.push({ a: fileData[1].data[j].a, b: fileData[1].data[j].b, c: fileData[1].data[j].c });
                            dataArr3.push({ a: fileData[2].data[k].a, b: fileData[2].data[k].b, c: fileData[2].data[k].c });
                            j++;
                            k++;
                        }
                    }
                    //a<b
                    else if (fileData[0].data[i][date] < fileData[1].data[j][date]) {
                        //a<c
                        if (fileData[0].data[i][date] < fileData[2].data[k][date]) {
                            DateArr.push(fileData[0].data[i][date] * 1000);
                            dataArr1.push({ a: fileData[0].data[i].a, b: fileData[0].data[i].b, c: fileData[0].data[i].c });
                            dataArr2.push({ a: undefined, b: undefined, c: undefined });
                            dataArr3.push({ a: undefined, b: undefined, c: undefined });
                            i++;
                        }
                        //a>c
                        else if (fileData[0].data[i][date] > fileData[2].data[k][date]) {
                            DateArr.push(fileData[2].data[k][date] * 1000);
                            dataArr1.push({ a: undefined, b: undefined, c: undefined });
                            dataArr2.push({ a: undefined, b: undefined, c: undefined });
                            dataArr3.push({ a: fileData[2].data[k].a, b: fileData[2].data[k].b, c: fileData[2].data[k].c });
                            k++;
                        }
                        //a=c
                        else {
                            DateArr.push(fileData[0].data[i][date] * 1000);
                            dataArr1.push({ a: fileData[0].data[i].a, b: fileData[0].data[i].b, c: fileData[0].data[i].c });
                            dataArr2.push({ a: undefined, b: undefined, c: undefined });
                            dataArr3.push({ a: fileData[2].data[k].a, b: fileData[2].data[k].b, c: fileData[2].data[k].c });
                            i++;
                            k++;
                        }
                    }
                    //a=b
                    else {
                        //a>c
                        if (fileData[0].data[i][date] > fileData[2].data[k][date]) {
                            DateArr.push(fileData[2].data[k][date] * 1000);
                            dataArr1.push({ a: undefined, b: undefined, c: undefined });
                            dataArr2.push({ a: undefined, b: undefined, c: undefined });
                            dataArr3.push({ a: fileData[2].data[k].a, b: fileData[2].data[k].b, c: fileData[2].data[k].c });
                            k++;
                        }
                        //a<c
                        else if (fileData[0].data[i][date] < fileData[2].data[k][date]) {
                            DateArr.push(fileData[0].data[i][date] * 1000);
                            dataArr1.push({ a: fileData[0].data[i].a, b: fileData[0].data[i].b, c: fileData[0].data[i].c });
                            dataArr2.push({ a: fileData[1].data[j].a, b: fileData[1].data[j].b, c: fileData[1].data[j].c });
                            dataArr3.push({ a: undefined, b: undefined, c: undefined });
                            i++;
                            j++;
                        }
                        //a=c
                        else {
                            DateArr.push(fileData[0].data[i][date] * 1000);
                            dataArr1.push({ a: fileData[0].data[i].a, b: fileData[0].data[i].b, c: fileData[0].data[i].c });
                            dataArr2.push({ a: fileData[1].data[j].a, b: fileData[1].data[j].b, c: fileData[1].data[j].c });
                            dataArr3.push({ a: fileData[2].data[k].a, b: fileData[2].data[k].b, c: fileData[2].data[k].c });
                            i++;
                            j++;
                            k++;
                        }
                    }
                }

                dataArr.push({ fileName: fileData[0].fileName, data: dataArr1 });
                dataArr.push({ fileName: fileData[1].fileName, data: dataArr2 });
                dataArr.push({ fileName: fileData[2].fileName, data: dataArr3 });
                dataArr.date = DateArr;
                return dataArr;
            }
            //每個測站資料的時間點都要相同，如果其他測站少時間點就要補上時間點並給undefine值(event讀同個時間資料才不出錯)
            var convertChartData = (fileData) => {
                // console.log(fileData);
                let Datakey_time = fileDataKey[0];
                // let Datakey_vaule = fileData[0].column[1];
                // console.debug(Datakey_time);

                let i = 0;
                let min = undefined;
                let indexArr = fileData.map(() => 0);
                // console.debug(indexArr);
                let dataArr = fileData.map(() => []);
                let timeArr = [];
                // console.debug(dataArr);
                let done = false;
                while (!done) {
                    for (let j = 0; j < fileData.length - 1; j++) {
                        let A = (fileData[j].data[indexArr[j]] ? fileData[j].data[indexArr[j]][Datakey_time] : undefined),
                            B = (fileData[j + 1].data[indexArr[j + 1]] ? fileData[j + 1].data[indexArr[j + 1]][Datakey_time] : undefined);
                        if (A != B) {
                            if (isNaN(min)) {
                                // A & B
                                if (!isNaN(A) && !isNaN(B))
                                    min = (A < B ? A : B);
                                else if (!isNaN(A))
                                    min = A;
                                else if (!isNaN(B))
                                    min = B;
                            }
                            else {
                                if (B < min)
                                    min = B;
                            }
                        }
                        if (j == fileData.length - 2) {
                            if (min) {
                                timeArr.push(min * 1000);
                                dataArr.forEach((arr, index) => {
                                    let d = fileData[index].data[indexArr[index]];
                                    if (d && d[Datakey_time] == min) {
                                        let tmp = {};
                                        for (let i = 1; i < fileDataKey.length; i++)
                                            tmp[fileDataKey[i]] = d[fileDataKey[i]];
                                        arr.push(tmp);
                                        indexArr[index]++;
                                    }
                                    else
                                        arr.push(undefined);
                                });

                            }
                            else {
                                timeArr.push(A * 1000);
                                dataArr.forEach((arr, index) => {
                                    let d = fileData[index].data[indexArr[index]];

                                    let tmp = {};
                                    for (let i = 1; i < fileDataKey.length; i++)
                                        tmp[fileDataKey[i]] = d[fileDataKey[i]];
                                    arr.push(tmp);
                                    indexArr[index]++;
                                });
                            }
                        }
                    }
                    min = undefined;
                    for (let k = 0; k < indexArr.length; k++) {
                        if (indexArr[k] < fileData[k].data.length) {
                            done = false;
                            break;
                        }
                        else if (k == indexArr.length - 1)
                            done = true;
                    }
                }

                let chartData = fileData.map((d, i, arr) => {
                    let tmp = {};
                    tmp.fileName = d.fileName;
                    tmp.data = dataArr[i];
                    // tmp.column = d.column;
                    return tmp;
                });
                chartData.date = timeArr;
                return chartData;
            }

            paths.forEach(path => readTextFile(path));
            console.log(fileData);
            // data = getData(fileData);
            // console.debug(data);
            data = convertChartData(fileData);
            console.debug(data);
        }

        //===get floder name(station) to make option
        var fileNameArr;
        $.ajax({
            url: "../src/php/getStation.php",
            data: { path: dataPath },
            method: 'POST',
            dataType: 'json',
            async: false,
            success: function (result) {
                fileNameArr = result;
                console.log(result);
                result.forEach((r, i) => {
                    // let station = Object.keys(r)[0];
                    let station = r.station;
                    // console.debug(station);
                    $("#station").append($("<option></option>").attr("value", i).text(station));
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error(jqXHR, textStatus, errorThrown);
            },
        });

        var getPaths = (optionValue) => {
            let obj = fileNameArr[optionValue];
            let station = obj.station;
            let fileNames = obj.fileNames;
            let paths = fileNames.map(file => dataPath + station + "/" + file);
            return paths;
        }

        $('#station').change(e => {
            let paths = getPaths(e.target.value);
            // chart.data(paths);
            readData(paths);
            chart();
            $('#zoomAll').trigger('change');
        });


        $('#zoomAll').change(e => {
            zoomAll = e.target.checked;
            if (zoomAll) {
                $("nav[id!='nav1']").hide();
                $(".title:not(.title:first)").hide();
            }
            else {
                $('nav').show();
                $(".title").show();
            }

        });

        //===show first data charts when onload
        readData(getPaths(0));
    };


    chart.selector = (vaule) => {
        selector = vaule;
        return chart;
    }
    chart.data = (vaule) => {
        dataPath = vaule;
        return chart;
    }

    chart.title = (vaule) => {
        title = vaule;
        return chart;
    }

    chart.legend = (vaule) => {
        channel = vaule;
        return chart;
    }
    function chart() {
        var chartNameArr = ['Shift Time (s)', 'Cross-Correlation Coefficient', 'Variance Reduction'];
        var chartsCount = chartNameArr.length;

        //===init once
        if (!($('#form-chart').length >= 1)) {
            init();
        }

        function getLineColor(index) {
            switch (index % 6) {
                case 0:
                    return "#AE0000";
                case 1:
                    return "#006030";
                case 2:
                    return "steelblue";
                case 3:
                    return "#EA7500";
                case 4:
                    return "#4B0091";
                case 5:
                    return "#272727";
                default:
                    return "steelblue";
            }
        }

        function getMargin(yAxisDomain = null) {
            // console.debug(yAxisDomain);
            var top = 20, right = 30, bottom = 30, left = 50;
            if (yAxisDomain) {
                let yAxisMaxTick = parseInt(Math.max(...yAxisDomain.map(domain => Math.abs(domain))));
                let tickLength = yAxisMaxTick.toString().length;
                console.debug(tickLength);
                left = tickLength >= 10 ? 120 : tickLength >= 7 ? 60 : tickLength >= 5 ? 50 : 45;
            }
            return { top: top, right: right, bottom: bottom, left: left };
        }

        function getNiceRange(data) {
            var max = d3.max(data, d => d3.max(d.values));
            var min = d3.min(data, d => d3.min(d.values));
            var addRange = Math.abs(max - min) * 0.1;
            max += addRange;
            min -= addRange;

            return [min, max];
        }
        function VR_Charts() {
            var chartNodes = [];
            var all_xdomain = [];
            const tooltip = d3.select("#charts").append("div")
                .attr("id", "tooltip")
                .style('position', 'absolute')
                .style('z-index', '1')
                .style("background-color", "#D3D3D3")
                .style('padding', '20px 20px 20px 20px')
                .style("opacity", " .9")
                .style('display', 'none');
            var getChartNode = (data, station) => {
                const width = 800;
                const height = 250;
                const svg = d3.create("svg")
                    .attr("viewBox", [0, 0, width, height]);

                // var yAxisDomain = getNiceRange(data.channel);
                const margin = getMargin();

                var x = d3.scaleUtc()
                    .domain(d3.extent(data.dates))
                    .range([margin.left, width - margin.right]);
                // console.debug(x.range())
                var origin_x_domain = x.domain();

                var y = d3.scaleLinear()
                    .domain(getNiceRange(data.channel))
                    .range([height - margin.bottom, margin.top]);

                var origin_y_domain = y.domain();

                var xAxis_g = g => g
                    .attr("transform", `translate(0,${height - margin.bottom})`)
                    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
                    .append('text')
                    .attr('x', width / 2)
                    .attr("y", margin.top + 6)
                    .attr("fill", "black")
                    .attr("font-weight", "bold")
                    .text("Date");

                // var tick_toSN_index, tick_SN_Arr;

                var yAxis_g = g => g
                    .attr("transform", `translate(${margin.left},0)`)
                    .attr("class", "yAxis")
                    .call(d3.axisLeft(y)
                        .ticks(height / 30))
                    .call(g => g.select(".domain").remove())
                    .call(g =>
                        g.selectAll("g.yAxis g.tick line")
                            .attr("x2", d => width - margin.left - margin.right)
                            .attr("stroke-opacity", 0.2)
                    )
                    .append('text')
                    .attr('x', -height / 2)
                    .attr("y", -margin.left + 8)
                    .attr("fill", "black")
                    .attr("font-weight", "bold")
                    .attr("font-size", "10")
                    .style("text-anchor", "middle")
                    .attr("alignment-baseline", "text-before-edge")
                    .attr("transform", "rotate(-90)")
                    .call(g => {
                        g.text(data.yName);
                    });



                var xAxis = svg.append("g")
                    .call(xAxis_g);

                // console.debug(xAxis);

                var yAxis = svg.append("g")
                    .call(yAxis_g);

                var focus = svg.append("g")
                    .attr('class', 'focus')
                    .attr("clip-path", "url(#clip)");


                // console.debug(data);
                var dataRect_width = 5;
                var renderData = (trans = false, newData = data.channel, newDateArr = data.dates) => {
                    console.debug(newData)
                    var transitionDuration = trans ? 500 : 0;
                    //==============path================
                    // focus
                    //     .selectAll("path")
                    //     .data(newData)
                    //     .join("path")
                    //     .transition().duration(transitionDuration)
                    //     .style("mix-blend-mode", "normal")
                    //     .attr("fill", "none")
                    //     .attr("stroke-width", 3)
                    //     .attr("stroke-linejoin", "round")
                    //     .attr("stroke-linecap", "round")
                    //     .attr("stroke-opacity", .7)
                    //     .attr("stroke", (d, i) => getLineColor(i))
                    //     .attr("d", d => line(d.values, newDateArr));

                    //==============circle================
                    // focus
                    //     .selectAll("g")
                    //     .data(newData)
                    //     .join("g")
                    //     .attr("class", "dot")
                    //     .attr("stroke", (d, i) => getLineColor(i))
                    //     .selectAll("circle")
                    //     .data(d => d.values)
                    //     .join("circle")
                    //     .style('opacity', 0)
                    //     .attr("stroke-width", 1.5)
                    //     .attr("fill", "none")
                    //     .attr("cx", (d, i) => x(newDateArr[i]))
                    //     .attr("cy", d => y(d))
                    //     .transition().duration(transitionDuration)
                    //     .style('opacity', 1)
                    //     .attr("r", 1);
                    //==============rect================


                    focus
                        .selectAll("g")
                        .data(newData)
                        .join("g")
                        .attr("class", "dot")
                        .attr("stroke", (d, i) => getLineColor(i))
                        .selectAll("rect")
                        .data(d => d.values)
                        .join("rect")
                        .style('opacity', 0.5)
                        .attr("stroke-width", 1.5)
                        .attr("width", 0)
                        .attr("height", 0)
                        .attr("fill", "none")
                        .attr("x", (d, i) => x(newDateArr[i]) - dataRect_width / 2)
                        .attr("y", d => isNaN(d) ? undefined : y(d) - dataRect_width / 2)
                        .transition().duration(transitionDuration)
                        .style('opacity', 1)
                        .attr("width", dataRect_width)
                        .attr("height", dataRect_width);
                }
                renderData();
                //====================================channel Title====================================


                svg.append("g")
                    .append('text')
                    .attr("class", "title")
                    .attr("x", width / 2)
                    .attr("align", "center")
                    .attr("y", margin.top / 2)
                    .attr("fill", "currentColor")
                    .attr("text-anchor", "middle")
                    .attr("alignment-baseline", "hanging")
                    .attr("font-weight", "bold")
                    .attr("font-size", "15")
                    .text(station);
                //====================================legend=========================================================

                const symbol_width = dataRect_width;
                const symbol_interval = 30;
                const symbol_margin_horizontal = 10;
                const symbol_margin_vertical = 5;

                const text_interval = symbol_interval / 5;

                const legend_width = (symbol_width + symbol_interval) * data.channel.length - symbol_interval + (text_interval + symbol_margin_horizontal) * 2;
                const legend_height = margin.top - 6;

                const legend_x = width - margin.right - legend_width - 10;
                const legend_y = 5;


                const legend = svg.append("g")
                    .attr("class", "legend")
                    .style("font-size", "12px");

                legend.append("rect")
                    .attr('class', 'legend_frame')
                    .attr("x", legend_x)
                    .attr("y", legend_y)
                    .attr("height", legend_height)
                    .attr("width", legend_width)
                    .attr("fill", "#D3D3D3")
                    .attr("opacity", .5)
                    .attr("stroke-width", "1")
                    .attr("stroke", "black")
                    .attr("stroke-opacity", .8);

                // legend
                //     .selectAll('line')
                //     .data(data.channel)
                //     .enter()
                //     .append('line')
                //     .attr("stroke-width", 3)
                //     .attr("stroke-opacity", 1)
                //     .attr("stroke", (d, i) => getLineColor(i))
                //     .attr("x1", (d, i) => legend_x + (symbol_width + symbol_interval) * i + symbol_margin_horizontal)
                //     .attr("x2", (d, i) => legend_x + (symbol_interval + symbol_width) * i + symbol_width + symbol_margin_horizontal)
                //     .attr("y1", (d, i) => legend_y + legend_height / 2)
                //     .attr("y2", (d, i) => legend_y + legend_height / 2)
                legend
                    .selectAll('rect.legend_symbol')
                    .data(data.channel)
                    .join("rect")
                    .attr('class', 'legend_symbol')
                    .attr("stroke-width", 1.5)
                    .attr("stroke", (d, i) => getLineColor(i))
                    .attr("fill", "none")
                    .attr("x", (d, i) => legend_x + symbol_margin_horizontal + (symbol_width + symbol_interval) * i)
                    .attr("y", (d, i) => legend_y + legend_height / 2 - symbol_width / 2)
                    .style('opacity', 1)
                    .attr("width", symbol_width)
                    .attr("height", symbol_width);

                legend
                    .selectAll('text')
                    .data(data.channel)
                    .enter()
                    .append('text')
                    .attr('class', 'legend_text')
                    .attr("font-weight", "bold")
                    .style("text-anchor", "start")
                    .attr("alignment-baseline", "central")
                    .attr("transform", `translate( ${legend_x}, ${legend_y} )`)
                    .attr('x', (d, i) => symbol_margin_horizontal + symbol_width * (i + 1) + symbol_interval * i + text_interval)
                    .attr('y', legend_height / 2)
                    .text((d, i) => d.name.split('.')[1]);
                //====================================legend=========================================================


                //====================================events=========================================================
                function events(svg) {

                    const datesArr = data.dates;
                    var newDatesArr = datesArr;
                    var newData = data.channel;

                    const lineStroke = "2px";
                    const lineStroke2 = "0.5px";

                    //====================================mouse move==================================================
                    const mouseG = svg.append("g")
                        .attr("class", "mouse-over-effects");

                    mouseG.append("path") // create vertical line to follow mouse
                        .attr("class", "mouse-line")
                        .style("stroke", "#A9A9A9")
                        .style("stroke-width", lineStroke)
                        .style("opacity", "0");


                    // console.debug(data);
                    const mousePerLine = mouseG.selectAll('.mouse-per-line')
                        .data(newData)
                        .enter()
                        .append("g")
                        .attr("class", "mouse-per-line");

                    mousePerLine.append("circle")
                        .attr("r", 3)
                        .style("stroke", "white")
                        .style("fill", "none")
                        .style("stroke-width", lineStroke2)
                        .style("opacity", "0");
                    mousePerLine.append("circle")
                        .attr("r", 4)
                        .style("stroke", (d, i) => getLineColor(i))// console.debug(i)
                        .style("fill", "none")
                        .style("stroke-width", lineStroke)
                        .style("opacity", "0");
                    mousePerLine.append("circle")
                        .attr("r", 5)
                        .style("stroke", "white")
                        .style("fill", "none")
                        .style("stroke-width", lineStroke2)
                        .style("opacity", "0");


                    svg
                        .append("defs")
                        .append("clipPath")
                        .attr("id", "clip")
                        .append("rect")
                        .attr("id", "rectRenderRange")
                        .attr('x', margin.left)
                        .attr('y', margin.top)
                        .attr('width', width - margin.right - margin.left)
                        .attr('height', height - margin.top - margin.bottom)
                        .attr('fill', 'none')
                        .attr('pointer-events', 'all');

                    // append a rect to catch mouse movements on canvas
                    // console.debug(data);
                    var event_rect =
                        mouseG
                            .append("use")
                            .attr('class', "eventRect")
                            // .attr('id', "er_" + data.yName)
                            .attr('xlink:href', "#rectRenderRange")
                            .on('mouseleave', function () { // on mouse out hide line, circles and text
                                // console.log('mouseleave');
                                svg.select(".mouse-line")
                                    .style("opacity", "0");
                                svg.selectAll(".mouse-per-line circle")
                                    .style("opacity", "0");
                                svg.selectAll(".mouse-per-line text")
                                    .style("opacity", "0");
                                tooltip
                                    // .transition().duration(500)
                                    // .style("opacity", 0)
                                    .style("display", "none");

                            })
                            .on('mousemove', function (event) { // update tooltip content, line, circles and text when mouse moves
                                // console.log(event.target);
                                event.preventDefault();
                                const pointer = d3.pointer(event, this);
                                const xm = x.invert(pointer[0]);
                                // const ym = y.invert(pointer[1]);


                                // console.debug(newData);
                                const idx = d3.bisectCenter(newDatesArr, xm);
                                const sortedIndex = d3.range(newData.length);
                                // console.debug('start' + sortedIndex);
                                // console.debug(newData[0].values.length);
                                // console.debug(idx + "/" + (newData[0].values.length - 1));
                                // console.debug(data[0].data.length);
                                svg.select(".mouse-line")
                                    .attr("d", function () {
                                        let data = "M" + x(newDatesArr[idx]) + "," + (height - margin.bottom);
                                        data += " " + x(newDatesArr[idx]) + "," + margin.top;
                                        return data;
                                    })
                                    .style("opacity", "0.7");
                                // d3.selectAll(".mouse-per-line circle")
                                //     .style("opacity", "1");
                                svg.selectAll(".mouse-per-line")
                                    .attr("transform", function (d, i) {
                                        // console.debug(newData[i].values[idx]);

                                        if (isNaN(newData[i].values[idx])) {
                                            d3.select(this).selectAll("circle")
                                                .style("opacity", "0");
                                        }
                                        else {
                                            d3.select(this).selectAll("circle")
                                                .style("opacity", "1");
                                            return "translate(" + x(newDatesArr[idx]) + "," + y(newData[i].values[idx]) + ")";
                                        }
                                    });

                                let timeStr = new Date(newDatesArr[idx]).toISOString();
                                const divHtml = "Time : <br/><font size='5'>" + timeStr + "</font><br/>" + data.yName + " : <br/>";
                                tooltip
                                    // .transition().duration(200)
                                    // .style("opacity", .9)
                                    .style("display", "inline");
                                tooltip.html(divHtml)
                                    .style("left", (event.pageX + 20) + "px")
                                    .style("top", (event.pageY - 20) + "px")
                                    .selectAll()
                                    .data(newData).enter()
                                    .append('div')
                                    .call(() => {
                                        // console.debug('=============');
                                        for (let i = 0; i < newData.length - 1; i++)
                                            for (let j = 0; j < newData.length - 1 - i; j++)
                                                // console.debug(data[sortedIndex[j]].data[idx].y, data[sortedIndex[j + 1]].data[idx].y);
                                                if (newData[sortedIndex[j]].values[idx] < newData[sortedIndex[j + 1]].values[idx]) {
                                                    let tmp = sortedIndex[j];
                                                    sortedIndex[j] = sortedIndex[j + 1];
                                                    sortedIndex[j + 1] = tmp;
                                                }
                                        // console.debug(sortedIndex);
                                    })
                                    .style('color', (d, i) => getLineColor(sortedIndex[i]))
                                    .style('font-size', 10)
                                    .html((d, i) => {
                                        // console.debug(d.data);
                                        let y = newData[sortedIndex[i]].values[idx];

                                        let html = "<font size='5'>" + (isNaN(y) ? 'no data' : y) + "</font>";

                                        return html;
                                    });
                            });

                    //====================================context==================================================
                    function getNewDataArr(x_domain) {
                        let newData = [];

                        let i1 = d3.bisectCenter(datesArr, x_domain[0]);
                        let i2 = d3.bisectCenter(datesArr, x_domain[1]);
                        // console.debug(x_domain[0].getTime());
                        // console.debug(x_domain[1].getTime());
                        // console.debug(i1, i2);

                        // //make sure zoom in path will be continue 
                        // if (i1 - 1 >= 0)
                        //     i1--;
                        // if (i2 + 1 < data.dates.length)
                        //     i2++;
                        data.channel.forEach((d, index) => {
                            let tmpData = [], tmpDates = [];
                            for (let i = i1; i <= i2; i++) {
                                // if (d.values[i] == undefined)
                                //     d.values[i] = 0
                                tmpData.push(d.values[i]);
                                if (index == 0) {
                                    tmpDates.push(datesArr[i]);
                                    newDatesArr = tmpDates;
                                }
                            }
                            // tmpCha.push({ name: d.name, values: tmpData });
                            newData.push({ values: tmpData });
                        });
                        // }

                        // console.log(newData);
                        // console.log(newDatesArr);
                        return newData;
                    }
                    let update_xAxis = (x_domain, trans = false) => {
                        var origin = (x_domain.toString() == origin_x_domain.toString());

                        var transitionDuration = trans ? 1000 : 0;
                        x.domain(x_domain);
                        xAxis
                            .transition().duration(transitionDuration)
                            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));
                        return origin;
                    }
                    let update_yAxis = (origin = true, newDataArr = undefined) => {
                        if (origin) {
                            y.domain(origin_y_domain);
                            newData = data.channel;
                            newDatesArr = datesArr;
                        }
                        else {
                            y.domain(getNiceRange(newDataArr))
                            // console.debug(y.domain())

                        }
                        // console.debug(y)

                        yAxis.selectAll('*').remove();
                        yAxis.call(yAxis_g);
                    }
                    // //====================================zoom==================================================
                    var selectionRect = {
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
                    //================alarm
                    var alarm_width = 300;
                    var alarm_height = 50;

                    var alarm = svg.append("g")
                        .attr('class', 'alarm')
                        .attr('display', 'none');

                    var minimum_data = 10;
                    const timeDiff = datesArr[1] - datesArr[0];//======for limit zooming range
                    // console.debug(timeDiff);

                    var alarm_g_timeOut;
                    var alarm_rect = alarm.append("rect")
                        .attr('rx', 5)
                        .attr('ry', 5)
                        .attr('x', margin.left + (width - margin.left - margin.right - alarm_width) / 2)
                        .attr('y', margin.top + (height - margin.bottom - margin.top - alarm_height) / 2)
                        .attr('width', alarm_width)
                        .attr('height', alarm_height)
                        .attr('stroke', '#000000')
                        .attr('stroke-opacity', 0)
                        .attr('fill', '#D3D3D3')
                        .attr('fill-opacity', 0);
                    var alarm_text = alarm.append('text')
                        .attr('x', margin.left + (width - margin.left - margin.right) / 2)
                        .attr('y', margin.top + (height - margin.bottom - margin.top) / 2)
                        .attr('text-anchor', 'middle')
                        .attr('alignment-baseline', 'middle')
                        .attr('opacity', 0)
                        .text("It can\'t be less than " + minimum_data + " data points");
                    //================alarm


                    var dragBehavior = d3.drag()
                        .on("start", () => {
                            // console.log("dragStart");
                            let xrange = d3.pointer(event, event_rect.node());
                            all_xdomain = x.invert(xrange[0]);

                            if (zoomAll)
                                d3.selectAll('.eventRect').dispatch('selectionRectStart');
                            else
                                event_rect.dispatch('selectionRectStart');

                        })
                        .on("drag", () => {
                            // console.log("dragMove");
                            let xrange = d3.pointer(event, event_rect.node());
                            all_xdomain = x.invert(xrange[0]);

                            // event_rect.dispatch('selectionRectDrag');
                            if (zoomAll)
                                d3.selectAll('.eventRect').dispatch('selectionRectDrag');
                            else
                                event_rect.dispatch('selectionRectDrag');

                        })
                        .on("end", () => {
                            const finalAttributes = selectionRect.getCurrentAttributes();
                            // console.debug(finalAttributes);
                            if (finalAttributes.x2 - finalAttributes.x1 > 1 && finalAttributes.y2 - finalAttributes.y1 > 1) {
                                event.preventDefault();
                                //-------- Update x_domain
                                all_xdomain = [x.invert(finalAttributes.x1), x.invert(finalAttributes.x2)];
                                //-------- Update Axis and paths(at less minimum_data  points)
                            }
                            else {
                                all_xdomain = origin_x_domain;
                                //-------- reset zoom
                                // console.log("single point");
                            }
                            if (zoomAll)
                                d3.selectAll('.eventRect').dispatch('selectionRectEnd');
                            else
                                event_rect.dispatch('selectionRectEnd');
                        })
                    event_rect.call(dragBehavior);

                    event_rect.on("selectionRectStart", () => {

                        let xrange = x(all_xdomain);
                        selectionRect.init(xrange, margin.top);
                        selectionRect.removePrevious();
                    });
                    event_rect.on("selectionRectDrag", () => {


                        let xrange = x(all_xdomain);
                        // console.debug(xrange);


                        if (xrange < margin.left)
                            xrange = margin.left;
                        else if (xrange > width - margin.right)
                            xrange = width - margin.right;

                        selectionRect.update(xrange, height - margin.bottom);

                    });

                    event_rect.on("selectionRectEnd", () => {

                        var origin = update_xAxis(all_xdomain, true);

                        if (origin) {
                            update_yAxis(true);
                            renderData();
                        }
                        else {
                            newData = getNewDataArr(all_xdomain);
                            update_yAxis(false, newData);
                            renderData(true, newData, newDatesArr);
                        }
                        selectionRect.remove();
                    });

                }
                svg.call(events);

                return svg.node();
            }
            var getChartData = (chartIndex) => {
                var chartName = chartNameArr[chartIndex];
                var chartData = {};
                chartData.channel = data.map(obj => {
                    // console.debug(obj);
                    var rObj = {};
                    rObj.name = obj.fileName;
                    rObj.values = obj.data.map(d => d[fileDataKey[chartIndex + 1]]);
                    return rObj;
                });
                chartData.dates = data.date;
                chartData.yName = chartName;
                // var chartData = data.map(obj => {
                //     // console.debug(obj);
                //     var rObj = {};
                //     rObj.fileName = obj.fileName;
                //     rObj.data = obj.data.map(d => d.second);
                //     return rObj;
                // });
                // console.debug(chartData);
                return chartData;
            }

            let selectNode = document.querySelector('#station');
            let station = selectNode.options[selectNode.selectedIndex].text;

            for (i = 0; i < chartsCount; i++) {
                let chartData = getChartData(i);
                chartNodes.push(getChartNode(chartData, station));
            }
            return chartNodes;
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

                        if (zoomAll)
                            for (let i = 1; i <= chartsCount; i++)
                                chartIDArr.push("#chart" + i + " svg");
                        else
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

            let chartNodes = VR_Charts();
            chartNodes.forEach(d => {
                getChartMenu('A');
                $('#chart' + i).append(d);
                i++;
            });
            MenuEvents();
        }
        printChart();
    }
    return chart;
}