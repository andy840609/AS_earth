function pieChart() {

    var selector = 'body';
    var paths = [];
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
        paths = vaule;
        data = [];
        var readTextFile = (file) => {
            var rawFile = new XMLHttpRequest();
            rawFile.open("GET", file, false);
            rawFile.onreadystatechange = function () {
                if (rawFile.readyState === 4) {
                    if (rawFile.status === 200 || rawFile.status == 0) {
                        var rows = rawFile.responseText.split("\n");
                        // console.debug(rows);
                        var tmpData = [];
                        rows.forEach((row, index) => {
                            if (row != '') {
                                var col = row.trim().split(',');
                                // console.debug(col);
                                if (index == 0) {
                                    let arr = [];
                                    col.forEach(c => arr.push(c));
                                    tmpData.columns = arr;
                                }
                                else {
                                    let obj = {};
                                    col.forEach((c, index) => obj[tmpData.columns[index]] = c);
                                    tmpData.push(obj);
                                }
                            }

                        })
                        var startStr = '/';
                        var startIndex = file.lastIndexOf(startStr) + startStr.length;
                        var fileName = file.substring(startIndex);
                        data.push({ fileName: fileName, data: tmpData });
                    }
                }
            }
            rawFile.send(null);
        }

        paths.forEach(path => readTextFile(path));
        // console.debug(data);
        return chart;
    }

    function chart() {
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

        function PieSvg(data) {

            var dataKey = data.columns;
            var width = 500;
            var height = Math.min(width, 500);
            const svg = d3.create("svg")
                .attr("viewBox", [-width / 2, -height / 2, width, height]);

            const tooltip = d3.select("#charts").append("div")
                .attr("id", "tooltip")
                .style('position', 'absolute')
                .style('z-index', '1')
                // .style("background-color", "#D3D3D3")
                // .style('padding', '20px 20px 20px 20px')
                .style("opacity", 0)
                .style('display', 'none');

            console.debug(data);
            var color = d3.scaleOrdinal()
                .domain(data.map(d => d[dataKey[0]]))
                .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());

            var appendPie = (dataKeyIndex) => {
                var pie = d3.pie()
                    .padAngle(0.005)
                    .sort(null)
                    .value(d => d[dataKey[dataKeyIndex]]);


                const diff = 50;
                const radius = Math.min(width, height) / 10 + (dataKeyIndex - 1) * (diff + 20);

                var arc = d3.arc()
                    .innerRadius(radius)
                    .outerRadius(radius + diff);


                const arcs = pie(data);
                // console.debug(arcs);

                var pieGroup = svg
                    .append("g")
                    .attr("class", "pieGroup")
                    .attr("id", "group" + dataKeyIndex);

                var pie = pieGroup
                    .selectAll("g")
                    .data(arcs)
                    .join("g")
                    .attr("class", "pie");

                var path = pie
                    .append("path")
                    .attr("fill", d => color(d.data[dataKey[0]]))
                    .attr("d", arc)
                    .attr("position", "relative")
                    .attr("z-index", 100);


                var text = pie
                    .append("g")
                    .attr("class", "text")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", 12)
                    .attr("text-anchor", "middle")
                    .attr("position", "relative")
                    .attr("z-index", 0)
                    .style("user-select", "none");

                text
                    .append("text")
                    .attr("transform", d => `translate(${arc.centroid(d)})`)
                    .call(text => text.append("tspan")
                        .attr("y", "-0.4em")
                        .attr("font-weight", "bold")
                        .text(d => d.data[dataKey[0]]))
                    .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
                        .attr("x", 0)
                        .attr("y", "0.7em")
                        .attr("fill-opacity", 0.7)
                        .text(d => d.data[dataKey[dataKeyIndex]].toLocaleString() + " " + dataKey[dataKeyIndex]));

                function events() {
                    const fadeOut = 0.4;

                    var pieMove = function (pie, dir) {
                        // console.debug(pie.node());
                        var path = pie.select('path');
                        var text = pie.select('text');
                        // console.debug(text.node());
                        switch (dir) {
                            //===0:out 1:over
                            case 0:
                                var beenClicked = false;
                                d3.selectAll('path')
                                    .each(function () {
                                        if (this.classList.contains("clicked"))
                                            beenClicked = true;
                                    });
                                if (!beenClicked)
                                    d3.selectAll('path').attr("fill-opacity", 1);
                                else
                                    path.attr("fill-opacity", fadeOut);

                                path
                                    .transition()
                                    .duration(100)
                                    .attr('d', arc
                                        .innerRadius(radius)
                                        .outerRadius(radius + diff)
                                    );
                                text
                                    .transition()
                                    .duration(100)
                                    .attr("transform", d => `translate(${arc.centroid(d)})`);
                                break;

                            case 1:
                                // console.debug(path.data()[0]);
                                // d3.selectAll('path').filter(p => {
                                //     console.debug(p);
                                //     if (p != path.data()[0])
                                //         return p;
                                // })
                                //     // .transition()
                                //     // .duration(100)
                                //     .attr("fill-opacity", 0.5);
                                d3.selectAll('path')
                                    .attr("fill-opacity", function () {
                                        var isNotTarget = this != path.node();
                                        var isNotClicked = !this.classList.contains("clicked");
                                        // console.debug(this.classList.contains("clicked"));
                                        if (isNotTarget && isNotClicked)
                                            return fadeOut;
                                    });
                                path.transition()
                                    .attr('d', arc
                                        .innerRadius(radius + 10)
                                        .outerRadius((radius + diff + 10) * 1.08)
                                    );

                                text
                                    .transition()
                                    .duration(250)
                                    .attr("transform", d => `translate(${arc.centroid(d)})`);
                                break;
                        }
                    }


                    path
                        .on('mouseover', function (e) {
                            // console.log('mouseover');
                            var thisPie = d3.select(this.parentNode);
                            // console.log(thisPie.node());
                            var thisPieData = thisPie.data()[0];
                            // console.log(this.parentNode.parentNode.id);
                            var tooltipTag, unit;
                            switch (this.parentNode.parentNode.id) {
                                case 'group1':
                                    tooltipTag = 'download times : ';
                                    unit = ' times';
                                    break;
                                case 'group2':
                                    tooltipTag = 'download sizes : ';
                                    unit = ' GB';
                                    break;
                            }
                            var tooltipHtml = "<font size='6'><b>" + thisPieData.data.name + "</b></font><hr style='background-color:white;'>" +
                                tooltipTag + "<b>" + thisPieData.value + "</b><font size='1'>" + unit + "</font>";
                            pieMove(thisPie, 1);
                            // console.log(thisPie);
                            // console.log(event.pageX, event.pageY);

                            tooltip
                                .html(tooltipHtml)
                                .style("display", "inline")
                                // .style("left", (e.pageX - 20) + "px")
                                // .style("top", (e.pageY + 6) + "px")
                                .transition().duration(200)
                                .style("opacity", .8);
                        })
                        .on('mouseout', function (e) {
                            // console.log('mouseout');
                            var thisPie = d3.select(this.parentNode);
                            var thisPath = thisPie.select('path');
                            // console.log(thisPie.node());
                            if (!thisPath.classed('clicked'))
                                pieMove(thisPie, 0);
                            tooltip
                                .style("display", "none")
                                .style("opacity", 0);

                        })
                        .on('click', function (e) {
                            // console.log('click');
                            var thisPie = d3.select(this.parentNode);
                            var thisPath = thisPie.select('path');
                            var clicked = thisPath.classed('clicked');
                            // console.debug(clicked);
                            pieMove(thisPie, !clicked);
                            thisPath.classed('clicked', !clicked);

                        });

                    //===for text also dispatch event
                    text
                        .on("mouseover", function (e) {
                            // console.debug(this.previousSibling);
                            // console.log("mouseover");
                            d3.select(this.previousSibling).dispatch('mouseover');
                        })
                        .on("mouseout", function (e) {
                            // console.log("mouseout");
                            d3.select(this.previousSibling).dispatch('mouseout');
                        })
                        .on("click", function (e) {
                            // console.log("click");
                            d3.select(this.previousSibling).dispatch('click');
                        })

                    //===for tooltip position
                    svg.on("mousemove", function (e) {
                        // console.debug(e.isTrusted);
                        if (e.isTrusted)
                            tooltip
                                .style("left", (e.pageX - 20) + "px")
                                .style("top", (e.pageY + 6) + "px");
                    });

                }
                path.call(events);
            }

            for (let i = 1; i < dataKey.length; i++)
                appendPie(i)

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
            data.forEach(d => {
                // console.debug(d.data);
                let chartNode = PieSvg(d.data);
                // console.debug(chartNode);
                getChartMenu('A');
                $('#chart' + i).append(chartNode);
                i++;
            })
            MenuEvents();
        }

        if (!($('#form-chart').length >= 1))
            init()

        printChart();
    }
    return chart;


}
