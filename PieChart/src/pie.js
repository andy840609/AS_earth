function pieChart() {

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

        d3.select("#form-chart").append("div")
            .attr("id", "tooltip")
            .style('position', 'absolute')
            .style('z-index', '1')
            .style("opacity", 0)
            .style('display', 'none');

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
        const columns = ['DB', 'count', 'size'];
        let dataType = typeof (vaule[0]);
        // console.debug(dataType);

        var readTextFile = (file) => {
            var tmpData;

            var rawFile = new XMLHttpRequest();
            rawFile.open("GET", file, false);
            rawFile.onreadystatechange = function () {
                if (rawFile.readyState === 4) {
                    if (rawFile.status === 200 || rawFile.status == 0) {
                        var rows = rawFile.responseText.split("\n");
                        // console.debug(rows);
                        let tmp = [];
                        rows.forEach((row, index) => {
                            if (row != '') {
                                var col = row.trim().split(',');
                                // console.debug(col);
                                if (index == 0) {
                                    let arr = [];
                                    col.forEach(c => arr.push(c));
                                    tmp.columns = arr;
                                }
                                else {
                                    let obj = {};
                                    col.forEach((c, index) => obj[tmp.columns[index]] = c);
                                    tmp.push(obj);
                                }
                            }

                        });
                        var startStr = '/';
                        var startIndex = file.lastIndexOf(startStr) + startStr.length;
                        var fileName = file.substring(startIndex);


                        // console.debug(fileName.indexOf('time') != -1);
                        // if (fileName.indexOf('time') != -1)
                        //     title = "次數";
                        // else if (fileName.indexOf('size') != -1)
                        //     title = "下載量";
                        // else
                        //     tmpData.fileName = fileName;

                        // tmpData.legend = '資料庫';
                        // tmpData.title = 'title';

                        tmpData = { data: tmp, title: fileName };
                    }
                }
            }
            rawFile.send(null);
            // console.debug(tmpData);
            return tmpData;
        }
        var sortData = (Data) => {
            let data = Data.data;
            data.map(
                (d, i, array) => {
                    let key = array.columns.slice(1);
                    d.total = d3.sum(key, k => d[k]);
                }
            )
            let sortBy = data.columns[0];
            data.sort((a, b) => a[sortBy] - b[sortBy]);
            return Data;
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
            data = vaule.map(v => {
                let dataObj = v.data;
                let Objkeys = Object.getOwnPropertyNames(dataObj);
                let countObj = dataObj[Objkeys[0]];
                let sizeObj = dataObj[Objkeys[1]];
                // console.debug(v);
                // console.debug(Objkeys[0]);
                let DBKeys = Object.getOwnPropertyNames(countObj).filter(key => key != 'total');

                let chartData = DBKeys.map(key => {
                    let obj = {};
                    obj[columns[0]] = key;
                    obj[columns[1]] = countObj[key];

                    let sizeArr = sizeObj[key].split(' ');
                    let size = parseFloat(sizeArr[0]);
                    switch (sizeArr[1]) {//單位轉GB
                        case 'KB':
                            size /= 1048576;
                            break;
                        case 'MB':
                            size /= 1024;
                            break;
                        case 'GB':
                            break;
                        default:
                            break;
                    }
                    obj[columns[2]] = size;
                    return obj;
                })
                chartData.columns = columns;
                chartData.sizeUnit = 'GB';

                return {
                    data: chartData,
                    title: v.title,
                };
            });


        }
        else {
            console.debug("unknow dataType");
        }

        console.debug(data);
        return chart;
    }
    function chart() {
        function PieSvg(Data) {
            // console.debug(Data);
            var data = Data.data;
            var dataKey = data.columns;
            var dataKeyName = dataKey.map(key => {
                // console.debug(key);
                let keyName = key;
                let keyUnit = '';
                switch (key) {
                    case 'name':
                        keyName = '資料庫';
                        break;
                    case 'count':
                        keyName = '下載次數';
                        keyUnit = '次';
                        break;
                    case 'size':
                        keyName = '下載量';
                        keyUnit = 'GB';
                        break;
                }
                return { name: keyName, unit: keyUnit };
            });
            // console.debug(dataKeyName);



            var dataGroup_count = dataKey.length - 1;
            var width = 500;
            var height = 500;


            const svg = d3.create("svg")
                .attr("viewBox", [-width / 2, -height / 2, width, height]);

            svg.append('g')
                .attr("transform", `translate(${0},${-height / 2 + 20})`)
                .append('text')
                .attr("id", "title")
                .attr("fill", "currentcolor")
                .attr("color", "black")
                .attr("font-family", "sans-serif")
                .attr("font-size", 20)
                .attr("font-weight", 900)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                // .attr("position", "relative")
                // .attr("left", 0)
                .text(Data.title);


            svg.append('text')
                .attr("id", "centre")
                .attr("fill", "currentcolor")
                .attr("color", "black")
                .attr("font-family", "sans-serif")
                .attr("font-size", 20)
                .attr("font-weight", 900)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .attr("position", "relative")
                .text("GDMS");


            var color = (network, dataGroup = 1) => {
                let color;
                if (dataGroup == 1)
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
                else
                    switch (network) {
                        case "CWBSN":
                            color = "#97CBFF";
                            break;
                        case "GNSS":
                            color = "#FFAD86";
                            break;
                        case "GW":
                            color = "#FFE153";
                            break;
                        case "MAGNET":
                            color = "#64A600";
                            break;
                        case "TSMIP":
                            color = "#AE57A4";
                            break;
                        default:
                            color = "#8080C0";
                            break;

                    };

                return color;
            };



            var appendPie = (dataGroup) => {
                var pie = d3.pie()
                    .padAngle(0.01)
                    .sort(null)
                    .value(d => d[dataKey[dataGroup]]);

                const margin = 50;
                const diff = (Math.min(width, height) / 2 - margin * dataGroup_count) / (dataGroup_count + 1);
                const radius = Math.min(width, height) / 2 - margin - (dataGroup - 1) * (diff + margin);

                var arc = d3.arc()
                    .innerRadius(radius - diff)
                    .outerRadius(radius);


                const arcs = pie(data);
                // console.debug(arcs);

                var pieGroup = svg
                    .append("g")
                    .attr("class", "pieGroup")
                    .attr("id", "group" + dataGroup);

                pieGroup
                    .append("text")
                    .attr("class", "groupName")
                    .attr("transform", () => {
                        // console.debug(radius);
                        let rad = 0.25 * Math.PI;
                        let r = radius - diff;
                        let shift = Math.sin(rad) * r;
                        return `translate(${shift},${shift})`
                    })
                    .attr("fill", "currentcolor")
                    .attr("color", "#5B5B5B")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", 8)
                    .attr("font-weight", 600)
                    .attr("text-anchor", "end")
                    .text(dataKeyName[dataGroup].name);

                var pie = pieGroup
                    .selectAll("g")
                    .data(arcs)
                    .join("g")
                    .attr("class", "pie");

                pie
                    .append("path")
                    .attr("fill", d => color(d.data[dataKey[0]], dataGroup))
                    .attr("d", arc)
                    .attr("position", "relative")
                    .attr("z-index", 100)
                    .attr("stroke", "black")
                    .attr("stroke-width", 0.1);


                pie
                    .append("g")
                    .attr("class", "text")
                    .attr("fill", "currentcolor")
                    .attr("color", "black")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", 12)
                    .attr("font-weight", "bold")
                    .attr("text-anchor", "middle")
                    .attr("position", "relative")
                    .attr("z-index", 0)
                    .append("text")
                    .attr("transform", d => `translate(${arc.centroid(d)})`)
                    .call(text => {
                        text.filter(d => !isSmallPie(d)).append("tspan")
                            .attr("y", "-0.4em")
                            .text(d => d.data[dataKey[0]]);

                        var smallPie = text.filter(d => isSmallPie(d));
                        smallPie.nodes().forEach(d => {
                            let label = d3.select(d.parentNode);
                            let labelRadius = radius + margin / 5;

                            label
                                .append("circle")
                                .attr('class', "label-circle")
                                .attr('fill', "#393939")
                                .attr("opacity", 0.7)
                                .attr('r', 1.5);

                            label
                                .append('polyline')
                                .attr('class', "label-line")
                                .attr('stroke-width', "1px")
                                .attr('stroke', "#393939")
                                .attr("opacity", 0.7)
                                .attr('fill', "none");

                            label
                                .attr('class', 'label')
                                .select('text')
                                .attr('dy', '.35em')
                                .text(d => d.data[dataKey[0]]);

                            setTimeout(() => label.call(relax), labelMove(label, labelRadius));
                            // labelMove(label, labelRadius)
                        });

                    })
                    .call(text => text.filter(d => !isSmallPie(d))
                        .append("tspan")
                        .attr("x", 0)
                        .attr("y", "0.7em")
                        .attr("fill-opacity", 0.7)
                        .attr("font-size", 10)
                        .attr("font-weight", 500)
                        .text(d => d.data[dataKey[dataGroup]].toLocaleString())
                        .append("tspan")
                        .attr("font-size", 7)
                        .attr("font-weight", "normal")
                        .text(dataKeyName[dataGroup].unit)
                    );

                function isSmallPie(data) {
                    var isSmallPie;
                    if (data.endAngle - data.startAngle < 0.25)
                        isSmallPie = true;
                    else
                        isSmallPie = false;
                    return isSmallPie;
                }
                function labelMove(relaxLabel, labelRadius, duration = 0, circleMove = true) {
                    // circleMove = false;


                    var circlePos, midPos, textPos;
                    // circleMove = false;
                    // var pieData = relaxLabel.data()[0];
                    // circlePos = arc.centroid(pieData);
                    // console.debug(circlePos);

                    var sign;

                    // var labelName = relaxLabel.data()[0].data.name;

                    // if (circleMove) {
                    //     // console.debug(labelName + '\'s circleMove');
                    //     relaxLabel.select('circle')
                    //         .transition()
                    //         .duration(duration)
                    //         .attr('transform', d => `translate(${arc.centroid(d)})`);
                    // }

                    // console.debug(relaxLabel.select('circle'));
                    // setTimeout(console.debug(relaxLabel.select('circle').attr('transform')), duration);

                    relaxLabel
                        .select('polyline')
                        .transition()
                        .duration(duration)
                        .attr('points', function (d) {

                            // console.log(labelName + '\'s');


                            // console.debug(labelName + " move");
                            // console.debug(this.points);



                            // console.log(relaxLabel.select('circle'));
                            if (circleMove) {
                                circlePos = arc.centroid(d);
                                relaxLabel.select('circle')
                                    .transition()
                                    .duration(duration)
                                    .attr('transform', `translate(${circlePos})`);
                            }
                            else {
                                var circleTransform = relaxLabel.select('circle').node().transform.baseVal[0];
                                if (circleTransform) {
                                    circlePos = [circleTransform.matrix.e, circleTransform.matrix.f];
                                    // console.debug(circlePos);
                                }
                            }

                            let midAngle = Math.atan2(circlePos[1], circlePos[0]);
                            midPos = [Math.cos(midAngle) * labelRadius, Math.sin(midAngle) * labelRadius];
                            // console.debug(midAngle);
                            // console.debug(d.data.name);
                            // console.debug(midPos[1]);
                            let y = midPos[1];
                            // console.debug("y=" + y);
                            sign = (y > 0) ? 1 : -1;


                            //垂直向量內積＝0、勾股 解方程式算切線上距離5的點
                            let dist = 5;
                            let dx = Math.sqrt(Math.pow(dist, 2) / (1 + Math.pow((circlePos[0] - midPos[0]) / (midPos[1] - circlePos[1]), 2)));
                            let dy = dx * (circlePos[0] - midPos[0]) / (midPos[1] - circlePos[1]);

                            // console.debug(dx, dy);
                            textPos = [midPos[0] + dx * sign, midPos[1] + dy * sign];
                            // console.debug(textPos);
                            d.labelRadius = labelRadius;
                            return [circlePos, midPos, textPos];

                        });


                    relaxLabel
                        .select('text')
                        .transition()
                        .duration(duration)
                        .attr('transform', "translate(" + textPos + ")")
                        .attr('text-anchor', textPos[0] >= 0 ? 'start' : 'end')
                        .attr("alignment-baseline", textPos[0] * textPos[1] < 0 ? (textPos[0] > 0 ? "after-edge" : "middle") : "baseline");

                    return duration;

                }
                function relax(label) {
                    console.log("collide checking...");

                    var thisLabel_node = label.node();
                    var thisPie_node = thisLabel_node.parentNode;
                    var thisPieGroup_node = thisPie_node.parentNode;


                    var allPies = thisPieGroup_node.childNodes;




                    var thisIndex;
                    //=========get event target's index in pieGroup childNodes
                    for (let i = 0; i < allPies.length; i++) {
                        if (allPies[i] == thisPie_node) {
                            thisIndex = i;
                            break;
                        }
                    }


                    var preLabel_node, nextLabel_node;
                    // thisLabel = allPies[thisIndex].querySelector('.label');
                    if (thisIndex - 1 >= 0)
                        preLabel_node = allPies[thisIndex - 1].querySelector('.label');
                    if (thisIndex + 1 < allPies.length)
                        nextLabel_node = allPies[thisIndex + 1].querySelector('.label');

                    // console.debug(thisLabel, preLabel, nextLabel)
                    var collide = (this_node, next_node, pre_node = null) => {
                        let spacing = 8;
                        if (this_node && next_node) {
                            let a = d3.select(this_node);
                            let b = d3.select(next_node);
                            let a_textY = a.select('polyline').node().points[2].y;
                            let b_textY = b.select('polyline').node().points[2].y;
                            if (Math.abs(a_textY - b_textY) < spacing) {
                                console.log("RELAXing");
                                var circleMove = false;
                                let labelRadius = b.data()[0].labelRadius;
                                labelRadius += spacing;
                                labelMove(a, labelRadius, 200, circleMove);
                                // setTimeout(() => collide(a.node(), null, b.node()), 100)

                            }
                        }
                        else if (this_node && pre_node) {
                            let a = d3.select(this_node);
                            let b = d3.select(pre_node);
                            let a_textY = a.select('polyline').node().points[2].y;
                            let b_textY = b.select('polyline').node().points[2].y;
                            // console.debug(Math.abs(a_textY - b_textY))

                            if (Math.abs(a_textY - b_textY) < spacing) {
                                console.log("RELAXing");
                                var circleMove = false;
                                let labelRadius = b.data()[0].labelRadius;
                                labelRadius += spacing;
                                labelMove(a, labelRadius, 200, circleMove);
                            }

                        }

                    }
                    // collide(thisLabel_node, preLabel_node);
                    collide(thisLabel_node, nextLabel_node, preLabel_node);



                }

                function events() {

                    const tooltip = d3.select('#tooltip');
                    const fadeOut = 0.4;

                    var pieMove = function (pie, dir) {
                        let pieData = pie.data()[0];
                        let smallPie = isSmallPie(pieData);


                        var path = pie.select('path');
                        if (smallPie)
                            var label = pie.select('.label');
                        else
                            var text = pie.select('text');


                        switch (dir) {
                            //===0:out 1:over
                            case 0:
                                var beenClicked = false;

                                var pathInnerRadius = radius - diff;
                                var pathOuterRadius = radius;
                                var duration = 100;


                                svg.selectAll('path')
                                    .each(function () {
                                        if (this.classList.contains("clicked"))
                                            beenClicked = true;
                                    });
                                if (!beenClicked)
                                    svg.selectAll('path').attr("fill-opacity", 1);
                                else
                                    path.attr("fill-opacity", fadeOut);

                                path
                                    .transition()
                                    .duration(duration)
                                    .attr('d', arc
                                        .innerRadius(pathInnerRadius)
                                        .outerRadius(pathOuterRadius)
                                    );

                                if (smallPie) {

                                    let labelRadius = pathOuterRadius + margin / 5;

                                    // labelMove(label, labelRadius, duration);
                                    // label.call(relax);

                                    setTimeout(() => label.call(relax), labelMove(label, labelRadius, duration));
                                }
                                else
                                    text
                                        .transition()
                                        .duration(duration)
                                        .attr("transform", d => `translate(${arc.centroid(d)})`);
                                break;

                            case 1:

                                var pathInnerRadius = radius - diff + margin / 5;
                                var pathOuterRadius = (radius + margin / 5) * 1.08;
                                var duration = 250;

                                svg.selectAll('path')
                                    .attr("fill-opacity", function () {
                                        var isNotTarget = this != path.node();
                                        var isNotClicked = !this.classList.contains("clicked");
                                        // console.debug(this.classList.contains("clicked"));
                                        if (isNotTarget && isNotClicked)
                                            return fadeOut;
                                    });
                                path.transition()
                                    .duration(duration)
                                    .attr('d', arc
                                        .innerRadius(pathInnerRadius)
                                        .outerRadius(pathOuterRadius)
                                    );

                                if (smallPie) {

                                    let labelRadius = pathOuterRadius + margin / 10;

                                    // labelMove(label, labelRadius, duration);
                                    // label.call(relax);
                                    setTimeout(() => label.call(relax), labelMove(label, labelRadius, duration));
                                }
                                else
                                    text
                                        .transition()
                                        .duration(duration)
                                        .attr("transform", d => `translate(${arc.centroid(d)})`);
                                break;
                        }
                    }

                    pie
                        .on('mousemove', function (e) {
                            tooltip
                                .style("left", (e.pageX + 5) + "px")
                                .style("top", (e.pageY + 5) + "px")

                            // console.debug(e);
                        })
                        .on('mouseenter', function (e) {
                            // console.debug('mouseenter');
                            var thisPie = d3.select(this);
                            // console.log(thisPie.node());
                            var thisPieData = thisPie.data()[0];
                            // console.log(this.parentNode.parentNode.id);
                            // var tooltipTag, unit;
                            // console.debug(thisPieData);

                            var tooltipTag = dataKeyName[dataGroup].name;
                            var unit = (dataKeyName[dataGroup].unit == 'GB' ? ' GB' : '');

                            var tooltipHtml = "<font size='6'><b>" + thisPieData.data[dataKey[0]] + "</b></font><hr style='background-color:white;'>" +
                                tooltipTag + " : <b>" + thisPieData.value + "</b><font size='1'>" + unit + "</font>";


                            pieMove(thisPie, 1);

                            // d3.timeout(() => pieMove_flag = true, 150);
                            // console.log(thisPie);
                            // console.log(e);
                            // console.log(e.target.nodeName, this.nodeName);
                            // console.log(event.pageX, event.pageY);

                            tooltip
                                .html(tooltipHtml)
                                .style("display", "inline")
                                .transition().duration(200)
                                .style("opacity", .8);
                        })
                        .on('mouseleave', function (e) {
                            // console.debug('mouseleave');
                            var thisPie = d3.select(this);
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
                            var thisPie = d3.select(this);
                            var thisPath = thisPie.select('path');
                            var clicked = thisPath.classed('clicked');
                            // console.debug(clicked);
                            pieMove(thisPie, !clicked);
                            thisPath.classed('clicked', !clicked);

                        });

                }
                pie.call(events);
            }

            for (let i = 1; i < dataKey.length; i++)
                appendPie(i)

            return svg.node();
        }

        function printChart() {
            $('#charts').children().remove();
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
                let chartNode = PieSvg(d);
                // console.debug(chartNode);
                getChartMenu('A');
                $('#chart' + i).append(chartNode);
                i++;
            })
            MenuEvents();
        }

        if (!($('#form-chart').length >= 1))
            init();

        printChart();
    }
    return chart;


}
