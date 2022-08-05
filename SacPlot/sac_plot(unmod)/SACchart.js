function getData(path, normalize) {
    // console.debug(normalize);
    var data = [];
    $.ajax({
        url: path,
        dataType: "text",
        async: false,
        success: function (text) {
            var rows = text.split('\n');
            rows.forEach(row => {
                if (row != '') {
                    var col = row.trim().split(/\s+/);
                    // console.debug(col);
                    // if (normalize)
                    data.push({ 'x': parseFloat(col[0]), 'y': parseFloat(col[1]) });
                    // else
                    // data.push({ 'x': parseFloat(col[0]), 'y': parseFloat(col[1]) * Math.pow(10, -7) });
                }
            });
        }
    });

    // console.debug(arraydata);
    return data;
}

function getLineColor(index) {
    switch (index % 6) {
        case 0:
            return "steelblue";
        case 1:
            return "#AE0000";
        case 2:
            return "#006030";
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

function getMargin(tickLength = 5) {
    let left;
    if (tickLength >= 10)
        left = 100;
    else if (tickLength >= 6)
        left = 75;
    else
        left = 50;
    return ({ top: 20, right: 30, bottom: 30, left: left });
}

//solve deviation from float calculate 
function floatCalculate(method, ...theArgs) {
    var result;
    function isFloat(n) {
        return n.toString().indexOf('.') >= 0;
    }

    var powerArr = [];
    theArgs.forEach(d => {
        if (isFloat(d)) {
            // console.debug(d);
            // var tmp = d.toString().split('.')[1].length;
            // if (tmp > power)
            //     power = tmp;
            powerArr.push(d.toString().split('.')[1].length);
        }
        else
            powerArr.push(0);
    });
    var maxPower = Math.max(...powerArr);
    // console.debug(maxPower);
    var newArgs = theArgs.map((d, i) => parseInt(d.toString().replace('.', '')) * Math.pow(10, (maxPower - powerArr[i])));
    // console.debug(newArgs);
    switch (method) {
        case 'add':
            result = 0;
            newArgs.forEach(d => result += d);
            result /= Math.pow(10, maxPower);
            break;
        case 'minus':
            result = newArgs[0] * 2;
            newArgs.forEach(d => result -= d);
            result /= Math.pow(10, maxPower);
            break;
        case 'times':
            result = 1;
            newArgs.forEach(d => result *= d);
            result /= Math.pow(Math.pow(10, maxPower), newArgs.length);
            break;
        case 'divide':
            result = Math.pow(newArgs[0], 2);
            newArgs.forEach((d, i) => {
                if (!(result == 0 && i == 0))
                    result /= d
            });
            // console.debug(result);
            result *= Math.pow(Math.pow(10, maxPower), newArgs.length - 2);
            break;
        default:
            result = 0;
            newArgs.forEach(d => result += d);
            result /= Math.pow(10, maxPower);
            break;
    }
    return result;
}

function toScientificNotation(number, maxIndex = undefined) {
    // console.debug(number);
    let singed, numberAbs;
    if (number < 0) {
        singed = true;
        numberAbs = Math.abs(number);
    }
    else {
        singed = false;
        numberAbs = number;
    }
    //maxIndex 轉成指定10的次方
    if (maxIndex || maxIndex == 0) {
        let index = number == 0 ? 0 : maxIndex;
        let constant = floatCalculate('divide', numberAbs, Math.pow(10, index)) * (singed ? -1 : 1);
        // let constant = numberAbs / Math.pow(10, index) * (singed ? -1 : 1);
        // console.debug(constant, index);
        return [constant, index];
    }
    else
        if (numberAbs >= 10) {
            let intLength = Math.floor(numberAbs).toString().length;
            let index = intLength - 1;
            let constant = numberAbs / Math.pow(10, index) * (singed ? -1 : 1);
            // console.debug(constant, index);
            return [constant, index];
        }
        //tickRange < 1
        else if (numberAbs > 0 && numberAbs < 1) {
            let constant = numberAbs;
            let index = 0;
            while (constant < 0.1) {
                constant *= 10;
                index--;
            }
            constant *= (singed ? -1 : 1);
            // console.debug(constant, index);
            return [constant, index];
        }
        else
            return [number, 0];

}

//ScientificNotation
// class SN {
//     constructor(number) {
//         // let singed, numberAbs;
//         if (number < 0) {
//             this.singed = true;
//             this.numberAbs = Math.abs(number);
//         }
//         else {
//             this.singed = false;
//             this.numberAbs = number;
//         }
//     }
//     toScientificNotation() {
//         if (numberAbs >= 10) {
//             number
//         }
//     }


// }
//=================================funtion for DOWNLOAD=========================================
function downloadSvg(chartID, chartName, fileType, option) {

    // var svgElementArr = document.getElementById('charts').childNodes;
    // var svgData = $("#charts svg")[0].outerHTML;
    // console.debug(chartID);
    var svgNode = $(chartID)[0];
    // console.debug(svgNode);
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

function chart(datas, normalize) {
    var extend, tick_toSN_index, origin_tick_toSN_index;
    var chartNodes = [];
    const tooltip = d3.select("#charts").append("div")
        .attr("id", "tooltip")
        .style('position', 'absolute')
        .style('z-index', '1')
        .style("background-color", "#D3D3D3")
        .style('padding', '20px 20px 20px 20px')
        .style("opacity", " .9")
        .style('display', 'none');
    function getExtent(dataArr) {
        let min = d3.min(dataArr, d => {
            return d.y ? d.y : d3.min(d.data, p => p.y)
        });
        let max = d3.max(dataArr, d => {
            return d.y ? d.y : d3.max(d.data, p => p.y)
            // return d3.max(d.data, p => p.y);
        });
        // console.debug(datas);
        let extend = [min, max];
        let range = Math.abs(max - min);
        // console.debug(range);
        let tick_toSN_index = toScientificNotation(range / 10)[1];
        // console.debug(tick_toSN_index);
        return [extend, tick_toSN_index];
    }
    function getChartNodes(index, data, title) {
        // let y_extent = d3.extent(data, d => d.y);
        // let minLenght = y_extent[0].toString().length;
        // let maxLenght = y_extent[1].toString().length;
        // let absLenght = maxLenght > minLenght ? maxLenght : minLenght;
        // console.debug(absLenght);
        var margin = getMargin();
        var width = 800;
        var height = 250;

        var line = d3.line()
            .defined(d => !isNaN(d.x))
            .x(d => x(d.x))
            .y(d => y(d.y));

        var x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.x))
            // .nice()
            .range([margin.left, width - margin.right]);
        var origin_x_domain = x.domain();

        // console.debug(extend);
        var y = d3.scaleLinear()
            .domain(extend).nice()
            .range([height - margin.bottom, margin.top]);
        var origin_y_domain = y.domain();

        // console.debug(y);
        var xAxis_g = g => g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
            .append('text')
            .attr('x', width / 2)
            .attr("y", margin.top + 6)
            .attr("fill", "black")
            .attr("font-weight", "bold")
            .text("Time (s)");

        var yAxis_g = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .attr("class", "y axis")
            .call(d3.axisLeft(y))
            .call(g => g.select(".domain").remove())
            .call(g => {
                // let indexArr = [];
                // console.debug(indexArr);
                g.selectAll(".tick text")
                    .text(d => {
                        // console.debug(d);
                        let SN = toScientificNotation(d, tick_toSN_index);
                        // console.debug(SN);
                        // indexArr.push(SN[1]);
                        // if (SN[0] != 0)
                        //     return SN[0] + ' x 10';
                        // else
                        return SN[0];
                    })
                    // .append('tspan')
                    // .attr("dy", -5)
                    // .attr("font-size", "8")
                    // .text((d, i) => {
                    //     if (indexArr[i] != 0)
                    //         return indexArr[i];
                    // })
                    ;
                //標示指數在左上角(10的0次不標)
                if (tick_toSN_index != 0)
                    g.selectAll(".tick:last-child")
                        .append('text')
                        .attr('x', 0)
                        .attr("y", -margin.top / 3)
                        .attr("fill", "black")
                        .attr("text-anchor", "start")
                        // .attr("alignment-baseline", "before-edge")
                        .text('( x 10')
                        .append('tspan')
                        .attr("dy", -5)
                        .attr("font-weight", "bold")
                        .attr("font-size", "10")
                        .text(tick_toSN_index)
                        .append('tspan')
                        .attr("dy", 5)
                        .attr("font-weight", "normal")
                        .attr("font-size", "10")
                        .text(' )');

            })
            .call(g =>
                g.selectAll("g.y.axis g.tick line")
                    // .attr("stroke-width", "1px")
                    .attr("x2", width - margin.left - margin.right)
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
                if (normalize)
                    g.text("Amplipude (count)");
                else
                    // g.text("Amplipude (cm/s")
                    //     .append('tspan')
                    //     .attr("dy", 5)
                    //     .attr("font-size", "8")
                    //     .text('2')
                    //     .append('tspan')
                    //     .attr("dy", 4)
                    //     .attr("font-size", "10")
                    //     .text(')');
                    g.text("Amplipude");
            });
        // console.debug(yAxis);

        const svg = d3.create("svg")
            .attr("viewBox", [0, 0, width, height]);

        var xAxis = svg.append("g")
            .call(xAxis_g);

        var yAxis = svg.append("g")
            .call(yAxis_g);

        // console.debug(index);

        var focus = svg.append("g")
            .attr('class', 'focus')
            .attr("clip-path", "url(#clip" + (index + 1) + ")");

        focus.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", getLineColor(index))
            .attr("stroke-width", 1)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", line);

        var renderChart = (trans = false) => {
            if (trans)
                focus.select("path")
                    .datum(data)
                    .transition().duration(500)
                    .attr("fill", "none")
                    .attr("stroke", getLineColor(index))
                    .attr("stroke-width", 1)
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("d", line);
            else
                focus.select("path")
                    .datum(data)
                    .attr("fill", "none")
                    .attr("stroke", getLineColor(index))
                    .attr("stroke-width", 1)
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("d", line);
        }

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
        //====================================events=========================================================
        function events(svg) {

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
            const mousePerLine = mouseG
                .datum(data)
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
                .style("stroke", () => getLineColor(index))
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
                .attr("id", "clip" + (index + 1))
                .append("rect")
                .attr("id", "rectRenderRange" + (index + 1))
                .attr('x', margin.left)
                .attr('y', margin.top)
                .attr('width', width - margin.right - margin.left)
                .attr('height', height - margin.top - margin.bottom)
                .attr('fill', 'none')
                .attr('pointer-events', 'all');

            // append a rect to catch mouse movements on canvas
            var event_rect =
                mouseG
                    .append("use")
                    .attr('xlink:href', "#rectRenderRange" + (index + 1))
                    // .append("rect")
                    // .attr('x', margin.left)
                    // .attr('y', margin.top)
                    // .attr('width', width - margin.right - margin.left)
                    // .attr('height', height - margin.top - margin.bottom)
                    // .attr('fill', 'none')
                    // .attr('pointer-events', 'all')
                    .on('mouseleave', function () { // on mouse out hide line, circles and text
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
                        event.preventDefault();
                        const pointer = d3.pointer(event, this);
                        // console.debug(pointer);
                        const xm = x.invert(pointer[0]);
                        const ym = y.invert(pointer[1]);
                        const datesArr = data.map(d => d.x);
                        // console.debug(datesArr);
                        const idx = d3.bisectCenter(datesArr, xm);
                        // console.debug(idx);
                        svg.selectAll(".mouse-per-line")
                            .attr("transform", d => {
                                // console.debug(d);
                                svg.select(".mouse-line")
                                    .attr("d", () => {
                                        var data = "M" + x(d[idx].x) + "," + (height - margin.bottom);
                                        data += " " + x(d[idx].x) + "," + margin.top;
                                        return data;
                                    });
                                return "translate(" + x(d[idx].x) + "," + y(d[idx].y) + ")";
                            });

                        const divHtml = "Time : <br/><font size='5'>" + datesArr[idx].toFixed(2) + "</font> s<br/>Amplipude : <br/>";
                        // console.debug(dot.offset());
                        svg.select(".mouse-line")
                            .style("opacity", "0.7");
                        svg.selectAll(".mouse-per-line circle")
                            .style("opacity", "1");
                        tooltip
                            // .transition().duration(200)
                            // .style("opacity", .9)
                            .style("display", "inline");
                        tooltip.html(divHtml)
                            .style("left", (event.pageX + 20) + "px")
                            .style("top", (event.pageY - 20) + "px")
                            .append('div')
                            .style('color', () => getLineColor(index))
                            .style('font-size', 10)
                            .html((d, i) => {
                                let y = data[idx].y;
                                // console.debug(y, tick_toSN_index);
                                let SN = toScientificNotation(y, tick_toSN_index);
                                // console.debug(SN);
                                let constant = Number.isInteger(SN[0]) ? SN[0] : (Math.round(SN[0] * 100000) / 100000);
                                let index = SN[1];
                                let SN_html = '';
                                if (index == 0)
                                    SN_html = constant;
                                else
                                    SN_html = constant + ' x 10<sup>' + index + '</sup>';
                                let html = "<font size='5'>" + SN_html + "</font>";
                                return html;
                                // return data[idx].y;
                            });
                    });





            //====================================context==================================================

            let update_Axis = (x_domain, y_domain, trans = false) => {
                x.domain(x_domain);
                y.domain(y_domain).nice();
                // y.domain([500000000, -500000000]);
                if (trans)
                    xAxis
                        .transition().duration(1000)
                        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));
                else
                    xAxis
                        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

                yAxis.selectAll('*').remove();
                yAxis.call(yAxis_g);
            }
            // // var contextData = data[lastIndex];
            // var context = svg.append("g")
            //     .attr("class", "context")
            //     .attr("transform", "translate(0, " + height + ")")
            //     .append("path")
            //     .datum(data[0])
            //     .attr("fill", "none")
            //     .attr("stroke-width", 1)
            //     .attr("stroke-linejoin", "round")
            //     .attr("stroke-linecap", "round")
            //     .attr("stroke-opacity", 1)
            //     .attr("stroke", (d, i) => getLineColor(i))
            //     .attr("d", (d, i) => {
            //         let y2 = d3.scaleLinear()
            //             .domain([
            //                 dataRangeArray[0].supMin - dataRangeArray[0].supRange,
            //                 dataRangeArray[0].supMax - dataRangeArray[0].supRange
            //             ])
            //             .range([height2 - margin.bottom, 0]);

            //         let line2 = d3.line()
            //             .defined(d => !isNaN(d.x))
            //             .x(d => x(d.x))
            //             .y(d => y2(d.y));

            //         return line2(d.data);
            //     });

            // var x2 = d3.scaleLinear()
            //     .domain(origin_x_domain)
            //     .range([margin.left, width - margin.right]);

            // svg.append("g")
            //     // .attr('class', 'context_xAxis')
            //     .attr("transform", "translate(0," + (height + height2 - margin.bottom) + ")")
            //     .call(d3.axisBottom(x2).ticks(width / 80).tickSizeOuter(0));

            // var brush = d3.brushX()
            //     .extent([[margin.left, 0], [width - margin.right, height2 - margin.bottom]])
            //     .on("brush end", brushed);

            // var brush_g = svg.append("g")
            //     .attr("class", "brush")
            //     .attr("transform", "translate(0," + (height) + ")")
            //     .call(brush)
            //     .call(brush.move, x2.range());
            // // console.debug(x.range());




            // function brushed(event) {

            //     // console.debug(!event.sourceEvent);
            //     let selection = event.selection;
            //     if (!event.sourceEvent) return; // ignore brush-by-zoom

            //     if (selection) {
            //         update_xAxis([x2.invert(selection[0]), x2.invert(selection[1])]);
            //         renderChart();
            //     }
            //     else {
            //         update_xAxis(origin_x_domain, true);
            //         renderChart(true);
            //         brush_g.call(brush.move, x2.range());
            //     }

            // }

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
                    var rectElement =
                        svg.append("rect")
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
            const timeDiff = data[1].x - data[0].x;//======for limit zooming range
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
                    console.log("dragStart");
                    const p = d3.pointer(event, event_rect.node());
                    selectionRect.init(p[0], margin.top);
                    // const xm = x.invert(p[0]);
                    // console.debug(p);
                    selectionRect.removePrevious();
                })
                .on("drag", () => {
                    console.log("dragMove");
                    const p = d3.pointer(event, event_rect.node());
                    if (p[0] < margin.left)
                        p[0] = margin.left;
                    else if (p[0] > width - margin.right)
                        p[0] = width - margin.right;
                    // console.debug(p);
                    // const xm = x.invert(p[0]);
                    selectionRect.update(p[0], height - margin.bottom);
                })
                .on("end", () => {
                    console.log("dragEnd");
                    // console.debug('end');
                    const finalAttributes = selectionRect.getCurrentAttributes();
                    // console.debug(finalAttributes);

                    if (finalAttributes.x2 - finalAttributes.x1 > 1 && finalAttributes.y2 - finalAttributes.y1 > 1) {
                        console.log("range selected");
                        // range selected
                        event.preventDefault();

                        //-------- Update x_domain
                        let x_domain = [x.invert(finalAttributes.x1), x.invert(finalAttributes.x2)];
                        if (x_domain[1] - x_domain[0] > minimum_data * timeDiff) {

                            //-------- get y_domain
                            const datesArr = data.map(d => d.x);
                            let i1 = d3.bisectCenter(datesArr, x_domain[0]);
                            let i2 = d3.bisectCenter(datesArr, x_domain[1]);
                            // console.debug(i1, i2);
                            let newData = data.filter((item, index) => { return index >= i1 && index <= i2 });
                            // console.debug(newData);
                            let newExtent = getExtent(newData);
                            // console.debug(newExtent);
                            let y_domain = newExtent[0];
                            tick_toSN_index = newExtent[1];

                            //-------- Update Axis and paths
                            update_Axis(x_domain, y_domain, true);
                            renderChart(true);
                        }
                        else {
                            //lower than minimum_data points alarm
                            alarm
                                .attr('display', 'inline');
                            alarm_rect
                                .transition().duration(500)
                                .attr('fill-opacity', 1)
                                .attr('stroke-opacity', 1)
                                .transition().duration(800)
                                .attr('fill-opacity', 0)
                                .attr('stroke-opacity', 0);
                            alarm_text
                                .transition().duration(500)
                                .attr('opacity', 1)
                                .transition().duration(800)
                                .attr('opacity', 0);

                            if (alarm_g_timeOut)
                                if (alarm_g_timeOut._time != Infinity)
                                    alarm_g_timeOut.stop();
                            alarm_g_timeOut = d3.timeout(() => alarm.attr('display', 'none'), 1300);
                            // console.debug(alarm_g_timeOut._time);
                        }

                    }
                    else {
                        //-------- reset zoom
                        console.log("single point");
                        tick_toSN_index = origin_tick_toSN_index;
                        update_Axis(origin_x_domain, origin_y_domain, true);
                        renderChart(true);
                        // brush_g.call(brush.move, x2.range());
                    }
                    selectionRect.remove();
                    // console.debug(x.domain());
                })
            event_rect.call(dragBehavior);


        }


        svg.call(events);



        return svg.node();
    }



    if (!normalize) {
        var extend_and_SNindex = getExtent(datas);
        extend = extend_and_SNindex[0];
        tick_toSN_index = extend_and_SNindex[1];
        origin_tick_toSN_index = tick_toSN_index;
    }
    else {
        extend = [-1, 1];
        tick_toSN_index = 0;
        origin_tick_toSN_index = 0;
    }

    datas.forEach((d, i) => {
        chartNodes.push(getChartNodes(i, d.data, d.fileName));
    })
    // console.debug(chartNodes);
    return chartNodes;

}


function windowChart(data, normalize) {

    let lastIndex = data.length - 1;
    // data.forEach(d => { console.debug(d.data[0]); console.debug(d.data[d.data.length - 1]) })

    var width = 800;
    var height = 500;
    var height2 = 100;//for context
    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height + height2]);

    function getDataRange(data, assign_tickRange = undefined) {
        console.debug('==new chart============');
        //get datas max,min and range
        let dataRangeArray = [];
        data.forEach((d, i) => {
            let max = d3.max(d.data, d => d.y);
            let min = d3.min(d.data, d => d.y);
            let range = Math.abs(max - min);
            dataRangeArray.push({ min: min, max: max, range: range });
        });



        let getTickRange = () => {
            var tickRange;
            var ranges = 0;
            dataRangeArray.forEach((d) => { ranges += d.range });
            // console.debug(ranges);
            var range = ranges / 20;
            // console.debug(range);

            if (range < 1) {
                let power = 0;
                while (range < 1) {
                    range *= 10;
                    power++;
                }
                // tickRange = Math.floor(range) / Math.pow(10, power);
                tickRange = Math.ceil(range) / Math.pow(10, power);
            }
            else {
                let pre_tickRange = Math.ceil(range);
                // console.debug(pre_tickRange);
                let rangesLength = pre_tickRange.toString().length;
                tickRange = Math.ceil(pre_tickRange / Math.pow(10, rangesLength - 1)) * Math.pow(10, rangesLength - 1);
                // console.debug(tickRange);
            }
            console.debug('tickRange= ' + tickRange);
            return tickRange;
        }
        // let tickRange = normalize ? 1 : getTickRange();
        let tickRange = assign_tickRange ? assign_tickRange : getTickRange();

        //for tick values look better
        let niceRange = (range, floor = false) => {
            if (range == 0)
                return 0;
            else {
                let n = range / tickRange;
                let nice_n = floor ? Math.floor(n) : Math.ceil(n);
                // var niceRange;
                // if (tickRange < 1)
                //     niceRange = (nice_n * (tickRange * Math.pow(10, toIntPower))) / Math.pow(10, toIntPower);
                // // niceRange = nice_n * tickRange;
                // else
                // var niceRange = nice_n * tickRange;
                var niceRange = floatCalculate('times', nice_n, tickRange);

                // console.debug((floor ? Math.floor(n) : Math.ceil(n)) + '*' + tickRange + '=' + niceRange);
                return niceRange;
            }
        }

        //counting data sup range
        dataRangeArray.forEach((d, i) => {
            let max = d.max;
            let min = d.min;
            let range = d.range;
            let supRange = 0, supMin = 0, supMax = 0;
            if (i == 0) {
                supRange = 0;
                supMin = niceRange(min, true);
                supMax = niceRange(max, false);
            }
            else {
                // supRange = niceRange(Math.abs(dataRangeArray[i - 1].max) + Math.abs(min) + dataRangeArray[i - 1].supRange, false);
                supRange = niceRange(dataRangeArray[i - 1].max - min + dataRangeArray[i - 1].supRange, false);
                supMin = dataRangeArray[i - 1].supMax;
                if (supRange - supMin < Math.abs(min))
                    supRange = floatCalculate('add', supRange, tickRange)//supRange += tickRange;
                supMax = floatCalculate('add', supRange, niceRange(max, false)); // supMax = supRange + niceRange(max, false);
            }
            dataRangeArray[i].supRange = supRange;
            dataRangeArray[i].supMin = supMin;
            dataRangeArray[i].supMax = supMax;
        });

        console.debug('dataRangeArray=');
        console.debug(dataRangeArray);

        let dataRangeArrayANDtickRange = [];
        dataRangeArrayANDtickRange.push(dataRangeArray, tickRange);
        // console.debug(dataRangeArrayANDtickRange);
        return dataRangeArrayANDtickRange;
    }

    var lineSup = (data, index) => {
        // console.debug('HI ' + index);
        let supRange = dataRangeArray[index].supRange;
        // console.debug('supRange=' + supRange);
        let line = d3.line()
            .defined(d => !isNaN(d.x))
            .x(d => x(d.x))
            .y(d => y(d.y + supRange));
        return line(data);
    }
    const dataRangeArrayANDtickRange = getDataRange(data, (normalize ? 0.2 : undefined));
    var dataRangeArray = dataRangeArrayANDtickRange[0];
    var tickRange = dataRangeArrayANDtickRange[1];
    var tick_toSN_index = toScientificNotation(tickRange)[1];
    // console.debug(tick_toSN_index);

    // //longest tick lenght to get margin left
    // let maxLenght = d3.max(dataRangeArray, d => d.max).toString().length;
    // let minLenght = d3.min(dataRangeArray, d => d.min).toString().length;
    // let absLenght = maxLenght > minLenght ? maxLenght : minLenght;
    var margin = getMargin();



    var x = d3.scaleLinear()
        .domain([
            d3.min(data, d => d3.min(d.data, d => d.x)),
            d3.max(data, d => d3.max(d.data, d => d.x))
        ])
        // .nice()
        .range([margin.left, width - margin.right]);
    var origin_x_domain = x.domain();


    var y = d3.scaleLinear()
        .domain([dataRangeArray[0].supMin, dataRangeArray[dataRangeArray.length - 1].supMax])
        .range([height - margin.bottom, margin.top]);

    // var origin_y_domain = y.domain();

    var xAxis_g = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
        .append('text')
        .attr('x', width / 2)
        .attr("y", margin.top + 6)
        .attr("fill", "black")
        .attr("font-weight", "bold")
        .text("Time (s)");

    var line_tick_index, tick_SN_Arr;
    // console.debug(y.domain());
    var getTickValues = (minRange, maxRange, tickRange) => {
        var tickValues = [];
        var tickValue = minRange;
        while (tickValue < maxRange + (tickRange / 10)) {
            tickValues.push(tickValue);
            tickValue = floatCalculate('add', tickValue, tickRange);// tickValue += tickRange;
        }
        // console.debug('tickValues = ');
        // console.debug(tickValues);
        return tickValues;
    }
    var yAxis_g = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .attr("class", "yAxis")
        .call(d3.axisLeft(y)
            // .tickValues(d3.range(y.domain()[0], y.domain()[1] + (tickRange / 10), tickRange))
            .tickValues(getTickValues(y.domain()[0], y.domain()[1] + (tickRange / 10), tickRange))
            .ticks(height / 40))
        .call(g => g.select(".domain").remove())
        //＝＝＝＝＝＝＝＝＝＝tick扣掉各資料的上移量並轉科學記號
        .call(g => {
            line_tick_index = [];
            g.selectAll(".tick text")
                // g.selectAll(".tick_text")
                .text((d, i) => {
                    let j = 0;
                    // console.debug(d);
                    while (d > dataRangeArray[j].supMax)
                        j++;
                    // console.debug(j);
                    //分界線的tick
                    if (d == dataRangeArray[j].supMax) {
                        line_tick_index.push(i);
                        //最後一個分界線不需複製tick
                        if (j != (dataRangeArray.length - 1)) {

                            let current_g_obj = $(g.selectAll(".tick")._groups[0][i]);
                            let current_g_text_obj = current_g_obj.children('text');

                            current_g_text_obj
                                .attr("y", -5);
                            let new_g_text_obj = current_g_text_obj.clone()
                                .attr("y", 5)
                                .attr("class", "clone_text")
                                .attr("color", getLineColor(lastIndex - j))
                                .attr("font-weight", "bold")
                                .text(floatCalculate('minus', d, dataRangeArray[j].supRange));// .text((d - dataRangeArray[j].supRange));
                            // console.debug(d - dataRangeArray[j].supRange);
                            // console.debug(new_g_text_obj[0]);
                            // console.debug(g.selectAll(".tick text"));

                            current_g_obj.append(new_g_text_obj);
                            return floatCalculate('minus', d, dataRangeArray[j + 1].supRange); // return d - dataRangeArray[j + 1].supRange;
                        }
                        else
                            return floatCalculate('minus', d, dataRangeArray[j].supRange);// return d - dataRangeArray[j].supRange;
                    }
                    else
                        return floatCalculate('minus', d, dataRangeArray[j].supRange);// return d - dataRangeArray[j].supRange;
                })
                .attr("font-weight", "bold")
                .attr("color", (d, i) => {
                    let j = 0;
                    // console.debug(d);
                    while (i >= line_tick_index[j]) {
                        j++;
                        if (j > (line_tick_index.length - 1))
                            break;
                    }
                    return getLineColor(lastIndex - j);
                });

            //刻度轉成科學記號的常數
            tick_SN_Arr = [];
            // console.debug(tick_SN_Arr);
            g.selectAll(".tick text")._groups[0].forEach(d => {
                // console.debug(d.textContent);
                let SN = toScientificNotation(d.textContent, tick_toSN_index);
                // tick_SN_Arr.push({ constant: SN[0], index: SN[1] });
                tick_SN_Arr.push({ constant: SN[0] });
            });
            // console.debug(tick_SN_Arr);
            g.selectAll(".tick text")
                .text((d, i) => {
                    // if (tick_SN_Arr[i].constant != 0 && !normalize)
                    //     return tick_SN_Arr[i].constant + ' x 10';
                    // else
                    return tick_SN_Arr[i].constant;
                })
                // .append('tspan')
                // .attr("dy", -5)
                // .attr("font-size", "8")
                // .text((d, i) => {
                //     if (tick_SN_Arr[i].index != 0)
                //         return tick_SN_Arr[i].index;
                // })
                ;
            //標示指數在左上角(10的0次不標)
            if (tick_toSN_index != 0)
                g.selectAll(".tick:last-child")
                    .append('text')
                    .attr('x', 0)
                    .attr("y", -margin.top / 3)
                    .attr("fill", "black")
                    .attr("text-anchor", "start")
                    // .attr("alignment-baseline", "before-edge")              
                    .text('( x 10')
                    .append('tspan')
                    .attr("dy", -5)
                    .attr("font-weight", "bold")
                    .attr("font-size", "10")
                    .text(tick_toSN_index)
                    .append('tspan')
                    .attr("dy", 5)
                    .attr("font-weight", "normal")
                    .attr("font-size", "10")
                    .text(' )');


        })
        //＝＝＝＝＝＝＝＝＝＝資料分隔線與tick虛線
        .call(g => {
            g.selectAll("g.yAxis g.tick line")
                // .attr("stroke-width", "1px")
                .attr("x2", d => {
                    // let block = dataRangeArray.map(d => d.supMax);
                    // console.debug(block);
                    // if (block.includes(d))
                    return width - margin.left - margin.right;
                    // else
                    //     return -6;
                })
                .attr("stroke-opacity", d => {
                    let block = dataRangeArray.map(d => d.supMax);
                    // console.debug(block);
                    // console.debug(d);
                    if (block.includes(d))
                        return 1;
                    else
                        return 0.2;
                });
        })
        //＝＝＝＝＝＝＝＝＝＝資料標題
        .call(g => {
            for (let i = 0; i < line_tick_index.length; i++) {
                let trans_line = g.selectAll('g.tick:nth-child(' + (line_tick_index[i] + 1) + ')');
                // console.debug(trans_line);
                trans_line
                    .append('text')
                    .attr("x", width - margin.right - margin.left)
                    // .attr("align", "center")
                    // .attr("y", 0)
                    .attr("fill", "currentColor")
                    .attr("text-anchor", "end")
                    .attr("alignment-baseline", "before-edge")
                    .attr("font-weight", "bold")
                    .attr("font-size", "13")
                    .text(data[i].fileName);
            }
        })
        //＝＝＝＝＝＝＝＝＝＝資料標題
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
            if (normalize)
                g.text("Amplipude (count)");
            else
                // g.text("Amplipude (cm/s")
                //     .append('tspan')
                //     .attr("dy", 5)
                //     .attr("font-size", "8")
                //     .text('2')
                //     .append('tspan')
                //     .attr("dy", 4)
                //     .attr("font-size", "10")
                //     .text(')');
                g.text("Amplipude");
        });


    var xAxis = svg.append("g")
        .call(xAxis_g);

    // console.debug(xAxis);

    var yAxis = svg.append("g")
        .call(yAxis_g);


    const focus = svg.append("g")
        .attr('class', 'focus')
        .attr("clip-path", "url(#clip)");


    var renderChart = (trans = false) => {
        if (trans)
            focus
                .selectAll("path")
                .data(data)
                .join("path")
                .transition().duration(500)
                .style("mix-blend-mode", "normal")
                .attr("fill", "none")
                .attr("stroke-width", 1)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-opacity", 1)
                .attr("stroke", (d, i) => getLineColor(lastIndex - i))
                .attr("d", (d, i) => lineSup(d.data, i));
        else
            focus
                .selectAll("path")
                .data(data)
                .join("path")
                .style("mix-blend-mode", "normal")
                .attr("fill", "none")
                .attr("stroke-width", 1)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-opacity", 1)
                .attr("stroke", (d, i) => getLineColor(lastIndex - i))
                .attr("d", (d, i) => lineSup(d.data, i));
    }
    renderChart();


    //====================================events=========================================================
    function events(svg, focus) {

        const lineStroke = "2px";
        const lineStroke2 = "0.5px";

        const tooltip = d3.select("#charts").append("div")
            .attr("id", "tooltip")
            .style('position', 'absolute')
            .style("background-color", "#D3D3D3")
            .style('padding', '20px 20px 20px 20px')
            .style("opacity", " .9")
            .style('display', 'none');

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
            .data(data)
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
            .style("stroke", (d, i) => getLineColor(lastIndex - i))
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
        var event_rect =
            mouseG
                .append("use")
                .attr('xlink:href', "#rectRenderRange")
                .on('mouseleave', function () { // on mouse out hide line, circles and text
                    d3.select(".mouse-line")
                        .style("opacity", "0");
                    d3.selectAll(".mouse-per-line circle")
                        .style("opacity", "0");
                    d3.selectAll(".mouse-per-line text")
                        .style("opacity", "0");
                    tooltip
                        // .transition().duration(500)
                        // .style("opacity", 0)
                        .style("display", "none");

                })
                .on('mousemove', function (event) { // update tooltip content, line, circles and text when mouse moves
                    event.preventDefault();
                    const pointer = d3.pointer(event, this);
                    const xm = x.invert(pointer[0]);
                    const ym = y.invert(pointer[1]);
                    const datesArr = data[0].data.map(obj => obj.x);
                    // console.debug(datesArr);
                    const idx = d3.bisectCenter(datesArr, xm);
                    // console.debug(i);
                    d3.selectAll(".mouse-per-line")
                        .attr("transform", function (d, i) {
                            // console.debug(d);
                            d3.select(".mouse-line")
                                .attr("d", function () {
                                    var data = "M" + x(d.data[idx].x) + "," + (height - margin.bottom);
                                    data += " " + x(d.data[idx].x) + "," + margin.top;
                                    return data;
                                });
                            let supRange = dataRangeArray[i].supRange;
                            // console.debug(d.data[idx].y);
                            return "translate(" + x(d.data[idx].x) + "," + y(d.data[idx].y + supRange) + ")";
                        });

                    const divHtml = "Time : <br/><font size='5'>" + datesArr[idx].toFixed(2) + "</font> s<br/>Amplipude : <br/>";
                    // console.debug(dot.offset());
                    d3.select(".mouse-line")
                        .style("opacity", "0.7");
                    d3.selectAll(".mouse-per-line circle")
                        .style("opacity", "1");
                    tooltip
                        // .transition().duration(200)
                        // .style("opacity", .9)
                        .style("display", "inline");
                    tooltip.html(divHtml)
                        .style("left", (event.pageX + 20) + "px")
                        .style("top", (event.pageY - 20) + "px")
                        .selectAll()
                        .data(data).enter()
                        .append('div')
                        .style('color', (d, i) => getLineColor(i))
                        .style('font-size', 10)
                        .html((d, i) => {
                            let y = data[lastIndex - i].data[idx].y;
                            let SN = toScientificNotation(y, tick_toSN_index);
                            let constant = Number.isInteger(SN[0]) ? SN[0] : (Math.round(SN[0] * 100000) / 100000);
                            let index = SN[1];
                            let SN_html = '';
                            if (index == 0)
                                SN_html = constant;
                            else
                                SN_html = constant + ' x 10<sup>' + index + '</sup>';
                            let html = "<font size='5'>" + SN_html + "</font>";


                            // if (normalize)
                            return html;
                            // else {
                            //     return html + ' cm/s<sup>2</sup>';
                            // }
                        });
                });

        //====================================context==================================================

        let update_xAxis = (x_domain, trans = false) => {
            x.domain(x_domain);
            if (trans)
                xAxis
                    .transition().duration(1000)
                    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

            else
                xAxis
                    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));
        }
        let update_yAxis = (origin = true, x_domain = undefined) => {
            if (origin) {
                dataRangeArray = dataRangeArrayANDtickRange[0];
                tickRange = dataRangeArrayANDtickRange[1];
                tick_toSN_index = toScientificNotation(tickRange)[1];
            }
            else {
                const datesArr = data[0].data.map(obj => obj.x);
                let i1 = d3.bisectCenter(datesArr, x_domain[0]);
                let i2 = d3.bisectCenter(datesArr, x_domain[1]);
                // console.debug(i1, i2);
                let newData = [];
                data.forEach(d => {
                    newData.push({ data: d.data.filter((item, index) => { return index >= i1 && index <= i2 }) });
                });
                // console.debug(newData);
                let newDataRange = getDataRange(newData);
                dataRangeArray = newDataRange[0];
                tickRange = newDataRange[1];
                tick_toSN_index = toScientificNotation(tickRange)[1];
            }
            y.domain([dataRangeArray[0].supMin, dataRangeArray[dataRangeArray.length - 1].supMax]);

            yAxis.selectAll('*').remove();
            yAxis.call(yAxis_g);

        }
        // var contextData = data[lastIndex];
        var context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(0, " + height + ")")
            .append("path")
            .datum(data[0])
            .attr("fill", "none")
            .attr("stroke-width", 1)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-opacity", 1)
            .attr("stroke", (d, i) => getLineColor(lastIndex - i))
            .attr("d", (d, i) => {
                let y2 = d3.scaleLinear()
                    .domain([
                        dataRangeArray[0].supMin - dataRangeArray[0].supRange,
                        dataRangeArray[0].supMax - dataRangeArray[0].supRange
                    ])
                    .range([height2 - margin.bottom, 0]);

                let line2 = d3.line()
                    .defined(d => !isNaN(d.x))
                    .x(d => x(d.x))
                    .y(d => y2(d.y));

                return line2(d.data);
            });

        var x2 = d3.scaleLinear()
            .domain(origin_x_domain)
            .range([margin.left, width - margin.right]);

        svg.append("g")
            .attr('class', 'context_xAxis')
            .attr("transform", "translate(0," + (height + height2 - margin.bottom) + ")")
            .call(d3.axisBottom(x2).ticks(width / 80).tickSizeOuter(0));


        var pre_selection = x2.range();
        var brush = d3.brushX()
            .extent([[margin.left, 0], [width - margin.right, height2 - margin.bottom]])
            .on("start", event => {
                if (!event.sourceEvent) return;
                // console.log("brush start");
                update_yAxis(true);
                renderChart(true);
            })
            .on("brush", event => {
                if (!event.sourceEvent) return; // ignore brush-by-zoom
                // console.log("brushing");
                let selection = event.selection;
                // console.debug(selection);
                // console.debug('pre=' + pre_selection);


                if (selection) {

                    let x_domain = [x2.invert(selection[0]), x2.invert(selection[1])];

                    if (x_domain[1] - x_domain[0] > 40 * timeDiff) {
                        update_xAxis(x_domain);
                        renderChart();
                    }
                    else {
                        // console.log(selection);
                        // console.log('pre=' + pre_selection);
                        // if (selection[1] == pre_selection[0]) {
                        //     console.log('switch to left');
                        //     brush_g.call(brush.move, [x2(x_domain[1] - 40 * timeDiff), selection[1]]);
                        // }
                        // else if (selection[0] == pre_selection[1]) {
                        //     console.log('switch to right');
                        //     brush_g.call(brush.move, [selection[0], x2(x_domain[0] + 40 * timeDiff)]);
                        // }
                        // else
                        if (selection[0] == pre_selection[0]) {
                            // console.log('brush rihgt');
                            brush_g.call(brush.move, [selection[0], x2(x_domain[0] + 40 * timeDiff)]);
                        }
                        else if (selection[1] == pre_selection[1]) {
                            // console.log('brush left');
                            brush_g.call(brush.move, [x2(x_domain[1] - 40 * timeDiff), selection[1]]);
                        }
                        else {
                            // console.log('brush clear');
                            brush_g.call(brush.clear);
                        }
                    }
                }
                pre_selection = selection;
            })
            .on("end", event => {
                if (!event.sourceEvent) return; // ignore brush-by-zoom
                // console.log("brush end");
                let selection = event.selection;

                if (selection) {
                    let x_domain = [x2.invert(selection[0]), x2.invert(selection[1])];
                    update_xAxis(x_domain, true);
                    update_yAxis(false, x_domain);
                    renderChart(true);
                }
                else {
                    update_xAxis(origin_x_domain, true);
                    update_yAxis(true);
                    renderChart(true);
                    brush_g.call(brush.move, x2.range());
                }

            });

        var brush_g = svg.append("g")
            .attr("class", "brush")
            .attr("transform", "translate(0," + (height) + ")")
            .call(brush)
            .call(brush.move, x2.range());

        // console.debug(x.range());

        //***********TEST************
        // let TEST_x_domain = [95.12, 95.40];
        // brush_g.call(brush.move, [x2(TEST_x_domain[0]), x2(TEST_x_domain[1])]);
        // update_xAxis(TEST_x_domain, true);
        // update_yAxis(false, TEST_x_domain);
        // renderChart(true);
        //***********TEST************
        //====================================zoom==================================================
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
        const timeDiff = data[0].data[1].x - data[0].data[0].x;//======for limit zooming range
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
                const p = d3.pointer(event, event_rect.node());
                selectionRect.init(p[0], margin.top);
                // const xm = x.invert(p[0]);
                // console.debug(p);
                selectionRect.removePrevious();
            })
            .on("drag", () => {
                // console.log("dragMove");
                const p = d3.pointer(event, event_rect.node());
                if (p[0] < margin.left)
                    p[0] = margin.left;
                else if (p[0] > width - margin.right)
                    p[0] = width - margin.right;
                // console.debug(p);
                // const xm = x.invert(p[0]);
                selectionRect.update(p[0], height - margin.bottom);
            })
            .on("end", () => {
                // console.log("dragEnd");
                // console.debug('end');
                const finalAttributes = selectionRect.getCurrentAttributes();
                // console.debug(finalAttributes);

                if (finalAttributes.x2 - finalAttributes.x1 > 1 && finalAttributes.y2 - finalAttributes.y1 > 1) {
                    // console.log("range selected");
                    // range selected
                    event.preventDefault();

                    //-------- Update x_domain
                    let x_domain = [x.invert(finalAttributes.x1), x.invert(finalAttributes.x2)];
                    // console.debug(x_domain);
                    //-------- Update Axis and paths(at less minimum_data  points)
                    if (x_domain[1] - x_domain[0] > minimum_data * timeDiff) {
                        update_xAxis(x_domain, true);
                        update_yAxis(false, x_domain);
                        renderChart(true);
                        brush_g.call(brush.move, [x2(x_domain[0]), x2(x_domain[1])]);
                    }
                    else {
                        //lower than minimum_data points alarm
                        alarm
                            .attr('display', 'inline');
                        alarm_rect
                            .transition().duration(500)
                            .attr('fill-opacity', 1)
                            .attr('stroke-opacity', 1)
                            .transition().duration(800)
                            .attr('fill-opacity', 0)
                            .attr('stroke-opacity', 0);
                        alarm_text
                            .transition().duration(500)
                            .attr('opacity', 1)
                            .transition().duration(800)
                            .attr('opacity', 0);

                        if (alarm_g_timeOut)
                            if (alarm_g_timeOut._time != Infinity)
                                alarm_g_timeOut.stop();
                        alarm_g_timeOut = d3.timeout(() => alarm.attr('display', 'none'), 1300);
                        // console.debug(alarm_g_timeOut._time);
                    }



                }
                else {
                    //-------- reset zoom
                    // console.log("single point");
                    update_xAxis(origin_x_domain, true);
                    update_yAxis(true);
                    renderChart(true);
                    brush_g.call(brush.move, x2.range());
                }
                selectionRect.remove();
            })
        event_rect.call(dragBehavior);


    }


    svg.call(events, focus);

    return svg.node();
}


function overlayChart(data, normalize) {

    let lastIndex = data.length - 1;
    // data.forEach(d => { console.debug(d.data[0]); console.debug(d.data[d.data.length - 1]) })

    var width = 800;
    var height = 500;
    var height2 = 100;//for context
    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height + height2]);


    let line = d3.line()
        .defined(d => !isNaN(d.x))
        .x(d => x(d.x))
        .y(d => y(d.y));

    var margin = getMargin();

    var x = d3.scaleLinear()
        .domain([
            d3.min(data, d => d3.min(d.data, d => d.x)),
            d3.max(data, d => d3.max(d.data, d => d.x))
        ])
        // .nice()
        .range([margin.left, width - margin.right]);
    var origin_x_domain = x.domain();


    var y = d3.scaleLinear()
        .domain([
            d3.min(data, d => d3.min(d.data, d => d.y)),
            d3.max(data, d => d3.max(d.data, d => d.y))
        ]).nice()
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
        .text("Time (s)");

    var tick_toSN_index, tick_SN_Arr;
    // console.debug(y.domain());
    var getTickValues = (minRange, maxRange, tickRange) => {
        var tickValues = [];
        var tickValue = minRange;
        while (tickValue < maxRange + (tickRange / 10)) {
            tickValues.push(tickValue);
            tickValue = floatCalculate('add', tickValue, tickRange);// tickValue += tickRange;
        }
        // console.debug('tickValues = ');
        // console.debug(tickValues);
        return tickValues;
    }
    var yAxis_g = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .attr("class", "yAxis")
        .call(d3.axisLeft(y)
            // .tickValues(d3.range(y.domain()[0], y.domain()[1] + (tickRange / 10), tickRange))
            // .tickValues(getTickValues(y.domain()[0], y.domain()[1] + (tickRange / 10), tickRange))
            .ticks(height / 40))
        .call(g => g.select(".domain").remove())

        // //＝＝＝＝＝＝＝＝＝＝tick轉科學記號
        // //刻度轉成科學記號的常數
        .call(g => {
            // var tick_toSN_index = toScientificNotation(tickRange)[1];
            // g.selectAll(".tick text")._groups[0].forEach(d => {
            //     console.debug(d.textContent);
            // });
            let ticks = g.selectAll(".tick text")._groups[0];
            let tickRange = ticks[1].__data__ - ticks[0].__data__;
            tick_toSN_index = toScientificNotation(tickRange)[1];

            // console.debug(tick_toSN_index);
            tick_SN_Arr = [];
            // console.debug(tick_SN_Arr);

            g.selectAll(".tick text")._groups[0].forEach(d => {
                // console.debug(d.__data__);
                let SN = toScientificNotation(d.__data__, tick_toSN_index);
                // tick_SN_Arr.push({ constant: SN[0], index: SN[1] });
                tick_SN_Arr.push({ constant: SN[0] });
            });
            // console.debug(tick_SN_Arr);
            g.selectAll(".tick text")
                .text((d, i) => tick_SN_Arr[i].constant);
            //標示指數在左上角(10的0次不標)
            if (tick_toSN_index != 0)
                g.selectAll(".tick:last-child")
                    .append('text')
                    .attr('x', 0)
                    .attr("y", -margin.top / 3)
                    .attr("fill", "black")
                    .attr("text-anchor", "start")
                    // .attr("alignment-baseline", "before-edge")              
                    .text('( x 10')
                    .append('tspan')
                    .attr("dy", -5)
                    .attr("font-weight", "bold")
                    .attr("font-size", "10")
                    .text(tick_toSN_index)
                    .append('tspan')
                    .attr("dy", 5)
                    .attr("font-weight", "normal")
                    .attr("font-size", "10")
                    .text(' )');
        })
        //＝＝＝＝＝＝＝＝＝＝資料分隔線與tick虛線
        .call(g => {
            let lastTickIndex = g.selectAll("g.yAxis g.tick")._groups[0].length - 1;
            g.selectAll("g.yAxis g.tick line")
                // .attr("stroke-width", "1px")
                .attr("x2", d => width - margin.left - margin.right)
                .attr("stroke-opacity", (d, i) => {
                    // console.debug(lastTick);
                    if (i == lastTickIndex)
                        return 1;
                    else
                        return 0.2;
                });
        })
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
            if (normalize)
                g.text("Amplipude (count)");
            else
                // g.text("Amplipude (cm/s")
                //     .append('tspan')
                //     .attr("dy", 5)
                //     .attr("font-size", "8")
                //     .text('2')
                //     .append('tspan')
                //     .attr("dy", 4)
                //     .attr("font-size", "10")
                //     .text(')');
                g.text("Amplipude");
        });


    var xAxis = svg.append("g")
        .call(xAxis_g);

    // console.debug(xAxis);

    var yAxis = svg.append("g")
        .call(yAxis_g);


    const focus = svg.append("g")
        .attr('class', 'focus')
        .attr("clip-path", "url(#clip)");


    var renderChart = (trans = false) => {
        if (trans)
            focus
                .selectAll("path")
                .data(data)
                .join("path")
                .transition().duration(500)
                .style("mix-blend-mode", "normal")
                .attr("fill", "none")
                .attr("stroke-width", 1)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-opacity", .8)
                .attr("stroke", (d, i) => getLineColor(lastIndex - i))
                .attr("d", (d, i) => line(d.data, i));
        else
            focus
                .selectAll("path")
                .data(data)
                .join("path")
                .style("mix-blend-mode", "normal")
                .attr("fill", "none")
                .attr("stroke-width", 1)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-opacity", .8)
                .attr("stroke", (d, i) => getLineColor(lastIndex - i))
                .attr("d", (d, i) => line(d.data, i));
    }
    renderChart();
    //====================================legend=========================================================

    const legend_x = (width - margin.right) / 2;
    const legend_y = margin.top + 10;

    const path_width = 50;
    const path_interval = 50;
    const path_margin_horizontal = 10;
    const path_margin_vertical = 5;

    const legend_width = (path_width + path_interval) * data.length + path_margin_horizontal * 2;
    const legend_height = 50;

    const legend = svg.append("g")
        .attr("class", "legend")
        .style("font-size", "12px");

    legend.append("rect")
        .attr("x", legend_x)
        .attr("y", legend_y)
        .attr("height", legend_height)
        .attr("width", legend_width)
        .attr("fill", "#D3D3D3")
        .attr("opacity", .5)
        .attr("stroke-width", "1")
        .attr("stroke", "black")
        .attr("stroke-opacity", .8);

    // var context = svg.append("g")
    //     .attr("class", "context")
    //     .attr("transform", "translate(0, " + height + ")")
    legend
        .selectAll("path")
        .data(data)
        .join("path")
        .style("mix-blend-mode", "normal")
        .attr("fill", "none")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-opacity", 1)
        .attr("stroke", (d, i) => getLineColor(lastIndex - i))
        .attr("d", (d, i) => {
            // console.debug(i);

            let lx = d3.scaleLinear()
                .domain(origin_x_domain)
                .range([legend_x + path_width * i + path_margin_horizontal, legend_x + path_width * (i + 1) + path_margin_horizontal]);

            let ly = d3.scaleLinear()
                .domain(origin_y_domain)
                .range([legend_y + legend_height - path_margin_vertical, legend_y + path_margin_vertical]);

            let legend_line = d3.line()
                .defined(d => !isNaN(d.x))
                .x(d => lx(d.x) + path_interval * i)
                .y(d => ly(d.y));

            return legend_line(d.data);
        });

    legend
        .selectAll('text')
        .data(data)
        .enter()
        .append('text')
        .attr("font-weight", "bold")
        .style("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("transform", `translate( ${legend_x}, ${legend_y}  )`)
        .attr('x', (d, i) => i * (path_width + path_interval) + path_width + path_interval / 2 + path_margin_horizontal)
        .attr('y', legend_height / 2)
        .text(d => d.fileName.split('.')[3]);
    //====================================legend=========================================================


    //====================================events=========================================================
    function events(svg, focus) {

        const lineStroke = "2px";
        const lineStroke2 = "0.5px";

        const tooltip = d3.select("#charts").append("div")
            .attr("id", "tooltip")
            .style('position', 'absolute')
            .style("background-color", "#D3D3D3")
            .style('padding', '20px 20px 20px 20px')
            .style("opacity", " .9")
            .style('display', 'none');

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
            .data(data)
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
            .style("stroke", (d, i) => getLineColor(lastIndex - i))
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
        var event_rect =
            mouseG
                .append("use")
                .attr('xlink:href', "#rectRenderRange")
                .on('mouseleave', function () { // on mouse out hide line, circles and text
                    d3.select(".mouse-line")
                        .style("opacity", "0");
                    d3.selectAll(".mouse-per-line circle")
                        .style("opacity", "0");
                    d3.selectAll(".mouse-per-line text")
                        .style("opacity", "0");
                    tooltip
                        // .transition().duration(500)
                        // .style("opacity", 0)
                        .style("display", "none");

                })
                .on('mousemove', function (event) { // update tooltip content, line, circles and text when mouse moves
                    event.preventDefault();
                    const pointer = d3.pointer(event, this);
                    const xm = x.invert(pointer[0]);
                    const ym = y.invert(pointer[1]);
                    const datesArr = data[0].data.map(obj => obj.x);
                    // console.debug(datesArr);
                    const idx = d3.bisectCenter(datesArr, xm);
                    const sortedIndex = d3.range(data.length);
                    // console.debug('start' + sortedIndex);
                    d3.selectAll(".mouse-per-line")
                        .attr("transform", function (d, i) {
                            // console.debug(d);
                            d3.select(".mouse-line")
                                .attr("d", function () {
                                    var data = "M" + x(d.data[idx].x) + "," + (height - margin.bottom);
                                    data += " " + x(d.data[idx].x) + "," + margin.top;
                                    return data;
                                });

                            // console.debug(d.data[idx].y);
                            return "translate(" + x(d.data[idx].x) + "," + y(d.data[idx].y) + ")";
                        });

                    const divHtml = "Time : <br/><font size='5'>" + datesArr[idx].toFixed(2) + "</font> s<br/>Amplipude : <br/>";
                    // console.debug(dot.offset());
                    d3.select(".mouse-line")
                        .style("opacity", "0.7");
                    d3.selectAll(".mouse-per-line circle")
                        .style("opacity", "1");
                    tooltip
                        // .transition().duration(200)
                        // .style("opacity", .9)
                        .style("display", "inline");
                    tooltip.html(divHtml)
                        .style("left", (event.pageX + 20) + "px")
                        .style("top", (event.pageY - 20) + "px")
                        .selectAll()
                        .data(data).enter()
                        .append('div')
                        .call(() => {
                            // console.debug('=============');
                            for (let i = 0; i < data.length - 1; i++)
                                for (let j = 0; j < data.length - 1 - i; j++)
                                    // console.debug(data[lastIndex - sortedIndex[j]].data[idx].y, data[lastIndex - sortedIndex[j + 1]].data[idx].y);
                                    if (data[lastIndex - sortedIndex[j]].data[idx].y < data[lastIndex - sortedIndex[j + 1]].data[idx].y) {
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
                            let y = data[lastIndex - sortedIndex[i]].data[idx].y;
                            let SN = toScientificNotation(y, tick_toSN_index);
                            let constant = Number.isInteger(SN[0]) ? SN[0] : (Math.round(SN[0] * 100000) / 100000);
                            let index = SN[1];
                            let SN_html = '';
                            if (index == 0)
                                SN_html = constant;
                            else
                                SN_html = constant + ' x 10<sup>' + index + '</sup>';
                            let html = "<font size='5'>" + SN_html + "</font>";
                            // if (normalize)
                            return html;
                            // else {
                            //     return html + ' cm/s<sup>2</sup>';
                            // }
                        });
                });

        //====================================context==================================================

        let update_xAxis = (x_domain, trans = false) => {
            x.domain(x_domain);
            if (trans)
                xAxis
                    .transition().duration(1000)
                    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

            else
                xAxis
                    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));
        }
        let update_yAxis = (origin = true, x_domain = undefined) => {
            if (origin)
                y.domain(origin_y_domain);
            else {
                const datesArr = data[0].data.map(obj => obj.x);
                let i1 = d3.bisectCenter(datesArr, x_domain[0]);
                let i2 = d3.bisectCenter(datesArr, x_domain[1]);
                // console.debug(i1, i2);
                let newData = [];
                data.forEach(d => {
                    newData.push({ data: d.data.filter((item, index) => { return index >= i1 && index <= i2 }) });
                });
                // console.debug(newData);
                y.domain([
                    d3.min(newData, d => d3.min(d.data, d => d.y)),
                    d3.max(newData, d => d3.max(d.data, d => d.y))
                ]).nice();
            }
            yAxis.selectAll('*').remove();
            yAxis.call(yAxis_g);
        }
        // var contextData = data[lastIndex];
        var context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(0, " + height + ")")
            .selectAll("path")
            .data(data)
            .join("path")
            .style("mix-blend-mode", "normal")
            .attr("fill", "none")
            .attr("stroke-width", 1)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-opacity", 1)
            .attr("stroke", (d, i) => getLineColor(lastIndex - i))
            .attr("d", (d, i) => {
                let y2 = d3.scaleLinear()
                    .domain(origin_y_domain)
                    .range([height2 - margin.bottom, 0]);

                let line2 = d3.line()
                    .defined(d => !isNaN(d.x))
                    .x(d => x(d.x))
                    .y(d => y2(d.y));

                return line2(d.data);
            });


        var x2 = d3.scaleLinear()
            .domain(origin_x_domain)
            .range([margin.left, width - margin.right]);

        svg.append("g")
            .attr('class', 'context_xAxis')
            .attr("transform", "translate(0," + (height + height2 - margin.bottom) + ")")
            .call(d3.axisBottom(x2).ticks(width / 80).tickSizeOuter(0));


        var pre_selection = x2.range();
        var brush = d3.brushX()
            .extent([[margin.left, 0], [width - margin.right, height2 - margin.bottom]])
            .on("start", event => {
                if (!event.sourceEvent) return;
                // console.log("brush start");
                update_yAxis(true);
                renderChart(true);
            })
            .on("brush", event => {
                if (!event.sourceEvent) return; // ignore brush-by-zoom
                // console.log("brushing");
                let selection = event.selection;
                // console.debug(selection);
                // console.debug('pre=' + pre_selection);


                if (selection) {

                    let x_domain = [x2.invert(selection[0]), x2.invert(selection[1])];

                    if (x_domain[1] - x_domain[0] > 40 * timeDiff) {
                        update_xAxis(x_domain);
                        renderChart();
                    }
                    else {
                        // console.log(selection);
                        // console.log('pre=' + pre_selection);
                        // if (selection[1] == pre_selection[0]) {
                        //     console.log('switch to left');
                        //     brush_g.call(brush.move, [x2(x_domain[1] - 40 * timeDiff), selection[1]]);
                        // }
                        // else if (selection[0] == pre_selection[1]) {
                        //     console.log('switch to right');
                        //     brush_g.call(brush.move, [selection[0], x2(x_domain[0] + 40 * timeDiff)]);
                        // }
                        // else
                        if (selection[0] == pre_selection[0]) {
                            // console.log('brush rihgt');
                            brush_g.call(brush.move, [selection[0], x2(x_domain[0] + 40 * timeDiff)]);
                        }
                        else if (selection[1] == pre_selection[1]) {
                            // console.log('brush left');
                            brush_g.call(brush.move, [x2(x_domain[1] - 40 * timeDiff), selection[1]]);
                        }
                        else {
                            // console.log('brush clear');
                            brush_g.call(brush.clear);
                        }
                    }
                }
                pre_selection = selection;
            })
            .on("end", event => {
                if (!event.sourceEvent) return; // ignore brush-by-zoom
                // console.log("brush end");
                let selection = event.selection;

                if (selection) {
                    let x_domain = [x2.invert(selection[0]), x2.invert(selection[1])];
                    update_xAxis(x_domain, true);
                    update_yAxis(false, x_domain);
                    renderChart(true);
                }
                else {
                    update_xAxis(origin_x_domain, true);
                    update_yAxis(true);
                    renderChart(true);
                    brush_g.call(brush.move, x2.range());
                }

            });

        var brush_g = svg.append("g")
            .attr("class", "brush")
            .attr("transform", "translate(0," + (height) + ")")
            .call(brush)
            .call(brush.move, x2.range());

        // console.debug(x.range());

        //***********TEST************
        // let TEST_x_domain = [95.12, 95.40];
        // brush_g.call(brush.move, [x2(TEST_x_domain[0]), x2(TEST_x_domain[1])]);
        // update_xAxis(TEST_x_domain, true);
        // update_yAxis(false, TEST_x_domain);
        // renderChart(true);
        //***********TEST************
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
        const timeDiff = data[0].data[1].x - data[0].data[0].x;//======for limit zooming range
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
                const p = d3.pointer(event, event_rect.node());
                selectionRect.init(p[0], margin.top);
                // const xm = x.invert(p[0]);
                // console.debug(p);
                selectionRect.removePrevious();
            })
            .on("drag", () => {
                // console.log("dragMove");
                const p = d3.pointer(event, event_rect.node());
                if (p[0] < margin.left)
                    p[0] = margin.left;
                else if (p[0] > width - margin.right)
                    p[0] = width - margin.right;
                // console.debug(p);
                // const xm = x.invert(p[0]);
                selectionRect.update(p[0], height - margin.bottom);
            })
            .on("end", () => {
                // console.log("dragEnd");
                // console.debug('end');
                const finalAttributes = selectionRect.getCurrentAttributes();
                // console.debug(finalAttributes);

                if (finalAttributes.x2 - finalAttributes.x1 > 1 && finalAttributes.y2 - finalAttributes.y1 > 1) {
                    // console.log("range selected");
                    // range selected
                    event.preventDefault();

                    //-------- Update x_domain
                    let x_domain = [x.invert(finalAttributes.x1), x.invert(finalAttributes.x2)];
                    // console.debug(x_domain);
                    //-------- Update Axis and paths(at less minimum_data  points)
                    if (x_domain[1] - x_domain[0] > minimum_data * timeDiff) {
                        update_xAxis(x_domain, true);
                        update_yAxis(false, x_domain);
                        renderChart(true);
                        brush_g.call(brush.move, [x2(x_domain[0]), x2(x_domain[1])]);
                    }
                    else {
                        //lower than minimum_data points alarm
                        alarm
                            .attr('display', 'inline');
                        alarm_rect
                            .transition().duration(500)
                            .attr('fill-opacity', 1)
                            .attr('stroke-opacity', 1)
                            .transition().duration(800)
                            .attr('fill-opacity', 0)
                            .attr('stroke-opacity', 0);
                        alarm_text
                            .transition().duration(500)
                            .attr('opacity', 1)
                            .transition().duration(800)
                            .attr('opacity', 0);

                        if (alarm_g_timeOut)
                            if (alarm_g_timeOut._time != Infinity)
                                alarm_g_timeOut.stop();
                        alarm_g_timeOut = d3.timeout(() => alarm.attr('display', 'none'), 1300);
                        // console.debug(alarm_g_timeOut._time);
                    }



                }
                else {
                    //-------- reset zoom
                    // console.log("single point");
                    update_xAxis(origin_x_domain, true);
                    update_yAxis(true);
                    renderChart(true);
                    brush_g.call(brush.move, x2.range());
                }
                selectionRect.remove();
            })
        event_rect.call(dragBehavior);


    }


    svg.call(events, focus);

    return svg.node();
}