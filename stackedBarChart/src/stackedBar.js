function stackedBarChart() {

    var selector = 'body';
    var data = [];


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
        // console.debug(vaule);
        data = [];
        let dataType = typeof (vaule[0]);

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
            // console.debug(data);

            //=============計算total
            let keys = Object.getOwnPropertyNames(data[0]);
            let keysForSum = keys.slice(keys.indexOf(sortByKey) + 1);
            let sortedData = data.map((d, i) => {
                // ＝＝＝＝深拷貝物件（才不會改變原物件值）
                let obj = JSON.parse(JSON.stringify(d));
                // console.debug(obj);
                obj.total = d3.sum(keysForSum, k => obj[k]);
                return obj;
            });
            // console.debug(sortedData);

            //=============排序
            sortedData.sort((a, b) => a[sortByKey] - b[sortByKey]);
            return sortedData;
        }

        //判斷第一個元素是字串路徑要讀檔,還是物件資料
        if (dataType == 'string') {
            let paths = vaule;
            //=========sorting and push to data
            paths.forEach(path => {
                let tmp = readTextFile(path);
                // console.debug(tmp);
                let sortedData = sortData(tmp.data, tmp.columns[0]);
                tmp.data = sortedData;
                data.push(tmp);
            });
        }
        else if (dataType == 'object') {
            let Data = vaule;
            data = Data.map(D => {
                // ＝＝＝＝深拷貝物件（才不會改變原物件值）
                let obj = JSON.parse(JSON.stringify(D));
                let columns = Object.getOwnPropertyNames(obj.data[0]);
                obj.columns = columns;
                let sortedData = sortData(obj.data, obj.columns[0]);
                // console.debug(sortedData);
                obj.data = sortedData;
                return obj;
            });

        }
        else {
            console.debug("unknow dataType");
        }
        console.debug("===data===");
        console.debug(data);
        console.debug("===data===");
        return chart;
    }

    function chart() {
        function stackedBar(Data) {
            // console.debug(Data);
            var width = 800;
            var height = 600;
            var margin = ({ top: 80, right: 10, bottom: 40, left: 50 });
            var max_barWidth = 100;

            var data = Data.data;
            var dataKeys = Data.columns;

            var series = d3.stack()
                .keys(dataKeys.slice(1))
                (data).map(d => {
                    // console.debug(d);
                    return (d.forEach(v => {
                        // console.debug(v);
                        v.key = d.key
                    }), d);
                });
            console.debug(series);

            var color = (network) => {
                let color;
                switch (network) {
                    case "CWBSN":
                        color = "#2ca9e1";
                        break;
                    case "GNSS":
                        color = "#df7163";
                        break;
                    case "GW":
                        color = "#f8b500";
                        break;
                    case "MAGNET":
                        color = "#005243";
                        break;
                    case "TSMIP":
                        color = "#7a4171";
                        break;
                    default:
                        color = "orange";
                        break;
                }

                return color;
            };


            var x = d3.scaleBand()
                .domain(data.map(d => d[dataKeys[0]]))
                .range([margin.left, width - margin.right])
                .padding(0.1);

            var y = d3.scaleLinear()
                .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
                .rangeRound([height - margin.bottom, margin.top]);


            const xAxis_tag = dataKeys[0] == 'year' ? '年' : dataKeys[0];
            var xAxis = g => g
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x).tickSizeOuter(0))
                .append('text')
                .attr('x', margin.left + (width - margin.left - margin.right) / 2)
                .attr("y", margin.bottom * 0.8)
                .attr("fill", "black")
                .attr("font-weight", "bold")
                .attr("font-size", 12)
                .text(xAxis_tag);
            // .call(g => g.selectAll(".domain").remove());

            var yAxis = g => g
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y).ticks(null, "s").tickSizeOuter(0))
                .append('text')
                .attr('x', -height / 2)
                .attr("y", -margin.left * 0.9)
                .attr("fill", "black")
                .attr("font-weight", "bold")
                .attr("font-size", 12)
                .style("text-anchor", "middle")
                .attr("alignment-baseline", "text-before-edge")
                .attr("transform", "rotate(-90)")
                .text(Data.yAxis);
            // .call(g => g.selectAll(".domain").remove());
            // console.debug()

            const svg = d3.create("svg")
                .attr("viewBox", [0, 0, width, height]);

            svg
                .append("g")
                .attr("class", "barGroup")
                .selectAll("g")
                .data(series)
                .join("g")
                .attr("fill", d => color(d.key))
                .selectAll("rect")
                .data(d => d)
                .join("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.data[dataKeys[0]]))
                .attr("y", d => y(d[1]))
                .attr("height", d => y(d[0]) - y(d[1]))
                .attr("width", x.bandwidth() > max_barWidth ? max_barWidth : x.bandwidth())
                .attr("stroke", "#D3D3D3")
                .attr("stroke-width", 3)
                .attr('stroke-opacity', 0)
                .attr("transform", function () {
                    let barWidth = this.getAttribute('width');
                    return `translate(${(x.bandwidth() - barWidth) / 2},0)`;
                })


            svg.append("g")
                .attr("class", "xAxis")
                .call(xAxis);

            svg.append("g")
                .attr("class", "yAxis")
                .call(yAxis);



            var rect_interval = 1;
            var rect_width = 50;
            var rect_height = 10;
            var legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${width - margin.right - series.length * (rect_width + rect_interval)},${margin.top * 0.6})`)
                .selectAll("g")
                .data(series)
                .join("g")
                .attr("transform", (d, i) => `translate(${i * (rect_width + rect_interval)},0)`);
            // .attr("x", (d, i) => i * (rect_width + rect_interval))
            // .attr("width", rect_width);

            // console.debug(legend)


            svg.select('.legend')
                .append("text")
                .attr("font-size", 10)
                .attr("font-weight", 900)
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "after-edge")
                .text(Data.legend);

            legend
                .call(g => {
                    g.append("rect")
                        .attr("width", rect_width)
                        .attr("height", rect_height)
                        .attr("fill", d => color(d.key));


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

            // legend
            //     .selectAll("rect")
            //     .data(series)
            //     .join("rect")
            //     .attr("x", (d, i) => i * (rect_width + rect_interval))
            //     .attr("width", rect_width)
            //     .attr("height", 10)
            //     .attr("fill", d => color(d.key));


            // legend
            //     .selectAll("text")
            //     .data(series)
            //     .join("text")
            //     .attr("x", (d, i) => i * (rect_width + rect_interval))
            //     .text("AAA")

            svg.append('g')
                .attr("class", "title")
                .attr("transform", `translate(${margin.left + (width - margin.left - margin.right) / 2},${margin.top / 2})`)
                .append('text')
                .attr("fill", "currentcolor")
                .attr("color", "black")
                .attr("font-family", "sans-serif")
                .attr("font-size", 20)
                .attr("font-weight", 900)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .text(Data.title);





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
                // .attr("points", `0,${tooltip_height * 0.4} 0,${tooltip_height * 0.6} ${-tooltip_width * 0.1},${tooltip_height / 2}`)
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



            var bars = svg.select('.barGroup').selectAll('.bar');

            // each bar call event
            bars.each(function () { d3.select(this).call(event) });


            function event(bar) {

                var tooltipMove = (bar) => {
                    let bar_x = parseInt(bar.getAttribute('x'));
                    let bar_y = parseInt(bar.getAttribute('y'));
                    let barWidth = parseInt(bar.getAttribute('width'));
                    let barHeight = parseInt(bar.getAttribute('height'));

                    let trans_x = bar_x + (x.bandwidth() - barWidth) / 2 + barWidth + tooltip_width * 0.1;
                    let trans_y = bar_y + (barHeight - tooltip_height) / 2;

                    // console.debug(trans_x + tooltip_width * 1.1, width);


                    let polygon = tooltip.select('polygon');
                    if (trans_x + tooltip_width * 1.1 > width) {
                        trans_x -= barWidth + tooltip_width * 1.2;

                        polygon
                            .attr("points", `${tooltip_width},${tooltip_height * 0.4} ${tooltip_width},${tooltip_height * 0.6} ${tooltip_width + tooltip_width * 0.1},${tooltip_height / 2}`)
                    }
                    else
                        polygon
                            .attr("points", `0,${tooltip_height * 0.4} 0,${tooltip_height * 0.6} ${-tooltip_width * 0.1},${tooltip_height / 2}`)

                    tooltip
                        .attr("transform", `translate(${trans_x},${trans_y})`)
                        .attr('display', 'inline');


                    let barData = bar.__data__;
                    let tooltip_text = tooltip.select('text');
                    let barDataKey = barData.key;

                    let dataUnit;
                    switch (Data.yAxis) {
                        case '次數':
                            dataUnit = "次";
                            break;
                        case '下載量':
                            dataUnit = "GB";
                            break;
                        default:
                            dataUnit = "";
                            break;
                    }


                    tooltip_text
                        .text(barData.data[dataKeys[0]] + xAxis_tag)
                        .append('tspan')
                        .attr('x', function () { return this.parentNode.getAttribute('x') })
                        .attr("dy", "1em")
                        .attr("font-size", 20)
                        .text(barDataKey)
                        .append('tspan')
                        .attr('x', function () { return this.parentNode.getAttribute('x') })
                        .attr("dy", "1em")
                        .attr("font-weight", 900)
                        .attr("font-size", 25)
                        .text(barData.data[barDataKey])
                        .append('tspan')
                        .attr("font-weight", "normal")
                        .attr("font-size", 14)
                        .text(" " + dataUnit);
                };
                var barHighLight = (bar, dir) => {
                    // console.debug(bar.classList)
                    const fadeOut = 0.4;
                    const highLight = 1;

                    switch (dir) {
                        //===0:out 1:over
                        case 0:
                            var beenClicked = false;
                            svg.selectAll('.bar')
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
                                svg.selectAll('.bar')
                                    .attr("fill-opacity", 1);
                            break;

                        case 1:
                            svg.selectAll('.bar')
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
                }

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

                        // pieMove(thisPie, !clicked);
                        bar.classed('clicked', !clicked);

                        // console.debug(this);
                    })


            }


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
            // console.debug(data);
            data.forEach(d => {
                // console.debug(d);
                let chartNode = stackedBar(d);
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
