function requestRate() {

    var selector = 'body';
    var dataPath;
    var typeNamePath;
    var data;
    var typeName;
    // var test;
    chart.selector = (vaule) => {
        selector = vaule;
        return chart;
    }
    chart.dataPath = (vaule) => {
        dataPath = vaule;
        return chart;
    }
    chart.typeNamePath = (vaule) => {
        typeNamePath = vaule;
        return chart;
    }
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
    }
    chart.typeNameObj = (vaule) => {
        typeName = vaule;
        let column = ["id", "chinese_description"]
        typeName.column = column;
        console.log(typeName);
        return chart;
    }
    function chart() {
        function init() {
            $(selector).append(`
            <form id="form-chart">
            <div class="form-group" id="chartsOptions" style="display: inline;">
            <div class="row">
                         
                <!-- ... display selector ... -->    
                <div class="form-group col-lg-4 col-md-4 col-sm-6 d-flex flex-row align-items-start">
                    <label for="displaySelectButton" class="col-form-label col-4" >Display</label>
                    <div class="btn-group btn-group-toggle col-8" role="group">
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
                <div class="form-group col-lg-4 col-md-4 col-sm-6 d-flex flex-row align-items-start">
                    <label for="showInfoButton" class="col-form-label col-4" >Show</label>
                    <div class="btn-group btn-group-toggle col-8" role="group">
                        <button id="showInfoButton" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            select
                        </button>
                        <div class="dropdown-menu" id="showInfoMenu" aria-labelledby="showInfoButton">
                            <div  id="showInfoDropDownMenu">
                                <div class="form-check col-12 ">
                                    <input class="form-check-input  col-3" type="checkbox" id="showPath" name="show" value="0" checked>
                                    <label class="form-check-label  col-12" for="showPath">request path</label>
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
                <div class="form-group col-lg-4 col-md-4 col-sm-6 d-flex flex-row align-items-start">
                    <label for="rateUnit" class="col-form-label col-4" >Rate unit</label>
                    <div class="form-group col-8">
                        <select class="form-control" id="rateUnit">
                            <option value="KB">KB/s</option>
                            <option value="MB">MB/s</option>
                            <option value="GB">GB/s</option>
                        </select>
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
            //================dropdown-menu內元素被點擊不關閉menu

            let All_dropdownMenu = $('.dropdown-menu');

            All_dropdownMenu.on("click.bs.dropdown", function (e) {
                // console.debug(this)
                // console.debug(e.target.previousSibling)
                // console.debug(e.target.tagName)
                e.stopPropagation();
                // let target = d3.select(e.target).select();
                // console.debug(target.node());
                // let checkbox = e.target.tagName == 'svg' ? e.target.previousSibling : e.target.parentNode.previousSibling;

                // if (this.id == 'displayMenu') {
                //     // console.debug(checkbox.checked);
                //     let p_count = checkbox.value;
                //     let check = checkbox.checked;
                //     checkbox.checked = !check;
                //     d3.select("#display_p" + p_count).dispatch("change");
                // }




            });
        };

        function getFileData() {
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
        }


        function RQRchart() {
            // console.debug(data);
            // console.debug(rateData);

            const width = 800;
            const height = 600;
            const margin = ({ top: 80, right: 50, bottom: 40, left: 60 });
            const getColor = (type) => {
                let color;
                switch (type) {
                    case 1:
                        color = "red";
                        break;
                    case 2:
                        color = "purple";
                        break;
                    case 3:
                        color = "blue";
                        break;
                    case 4:
                        color = "green";
                        break;
                    case 5:
                        color = "yellow";
                        break;
                    case 6:
                        color = "brown";
                        break;
                    case 7:
                        color = "orange";
                        break;
                    case 8:
                        color = "pink";
                        break;
                    default:
                        color = "steelblue";
                        break;
                }
                return color;
            }
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
                    default:
                        string = value;
                        break;
                }
                return string;
            };

            const dataKeys = data.column;
            const typeNameKeys = typeName.column;
            const rateDataKeys = ['processing_speed', 'internal_transmission_rate', 'external_transmission_rate', 'global_reaction_rate'];

            {      //刪掉不需要的type ＆ 算rateData
                const type_dont_show = [6, 7];
                // const type_dont_show = [];
                data = data.filter(d => !type_dont_show.includes(d[dataKeys[0]]));
                typeName = typeName.filter(tn => !type_dont_show.includes(tn[typeNameKeys[0]]));
                var rateData = function () {
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

            }

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

            const svg = d3.create("svg")
                .attr("viewBox", [0, 0, width, height]);
            const xAxis = svg.append("g").attr("class", "xAxis");
            const yAxis = svg.append("g").attr("class", "yAxis");
            const focusGroup = svg.append("g").attr('class', 'focus').attr("clip-path", "url(#clip)");
            const legendGroup = svg.append("g").attr('class', 'legendGroup');

            var x, y;
            var newDataObj;
            var display_timming_index = d3.range(rateDataKeys.length);

            function updateChart(trans = false) {
                const circle_r = 3;
                const rect_width = 5;
                const triangle_corner = 3, triangle_r = 3.5;
                const star_corner = 5, star_r1 = 4, star_r2 = 2;
                // const fillColor = dots.attr('stroke');
                const fillColor = 'none';
                const makeShape = (d3Selection, shapeIndex, centre, dataObj = null) => {
                    // console.debug(shapeIndex, dataIndex);
                    // console.debug(dataObj);
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
                    }
                    let shape = { 0: 'circle', 1: 'rect', 2: 'polygon', 3: 'polygon' }[shapeIndex];
                    let display_class = rateDataKeys[shapeIndex];
                    let shapeSelection = dataObj ?
                        d3Selection.selectAll("." + display_class)
                            .data([dataObj])
                            .join(shape)
                            .attr("class", display_class)
                        :
                        d3Selection.append(shape)
                            .attr("stroke", 'grey');

                    // console.debug(shapeSelection.node());
                    switch (shapeIndex) {
                        case 0:
                            // console.debug('circle');
                            shapeSelection
                                .attr("stroke-width", 1.5)
                                .attr("fill", fillColor)
                                .attr("cx", centre.x)
                                .attr("cy", centre.y)
                                .attr("r", circle_r)
                                .style('opacity', 1);
                            break;
                        case 1:
                            // console.debug('rect');
                            shapeSelection
                                .attr("stroke-width", 1.5)
                                .attr("fill", fillColor)
                                .attr("x", centre.x - rect_width * 0.5)
                                .attr("y", centre.y - rect_width * 0.5)
                                .attr("width", rect_width)
                                .attr("height", rect_width)
                                .style('opacity', 1);
                            break;
                        case 2:
                            // console.debug('triangle');
                            let triangle_points = polygonPoints(centre.x, centre.y, triangle_r, triangle_corner, false);
                            shapeSelection
                                .attr("stroke-width", 1.5)
                                .attr("fill", fillColor)
                                .attr("points", triangle_points.join(','))
                                .style('opacity', 1);
                            break;
                        case 3:
                            // console.debug('star');
                            let star_r1_points = polygonPoints(centre.x, centre.y, star_r1, star_corner, false);
                            let star_r2_points = polygonPoints(centre.x, centre.y, star_r2, star_corner, true);
                            shapeSelection
                                .attr("stroke-width", 1.5)
                                .attr("fill", fillColor)
                                .attr("points", d3.range(star_corner).map(i =>
                                    star_r1_points[i].join(',') + ' ' + star_r2_points[i].join(',')
                                ))
                                .style('opacity', 1);

                            // var star_centre = [100, 100];
                            // //弧度 = 角度 × π / 180
                            // var star_radian = d3.range(star_corner).map(i => (360 * i / star_corner) * Math.PI / 180);
                            // var star_r1_points = star_radian.map(rad => [star_centre[0] + star_r1 * Math.cos(rad), star_centre[1] + star_r1 * Math.sin(rad)]);
                            // var star_r2_points = star_radian.map(rad => [star_centre[0] + star_r2 * Math.cos(rad), star_centre[1] + star_r2 * Math.sin(rad)]);
                            // // console.debug(star_radian)    

                            break;
                    }

                }
                function init() {

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
                        .text(title);

                    //==mask
                    svg
                        .append("defs")
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

                    xAxis
                        .append('text')
                        .attr("class", "axis_name")
                        .attr("fill", "black")
                        .attr("font-weight", "bold")
                        .attr("font-size", "12")
                        .text('Date');

                    yAxis
                        .append('text')
                        .attr("class", "axis_name")
                        .attr("fill", "black")
                        .attr("font-weight", "bold")
                        .attr("font-size", "12")
                        .style("text-anchor", "middle")
                        .attr("alignment-baseline", "text-before-edge")
                        .attr("transform", "rotate(-90)")
                        .text('Rate ( KB / s )');

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
                                    .attr("x", typeLegend_rect_width / 2)
                                    .attr("y", typeLegend_rect_height + 2)
                                    .attr("fill", "currentcolor")
                                    .attr("color", "black")
                                    .attr("font-family", "sans-serif")
                                    .attr("font-size", 8)
                                    .attr("font-weight", 600)
                                    .attr("text-anchor", "middle")
                                    .attr("alignment-baseline", "before-edge")
                                    // .text(d => d[typeNameKeys[0]])
                                    .text(d => d[typeNameKeys[1]])
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
                    d3.select('#displayDropDownMenu')
                        .selectAll('div')
                        .data(rateDataKeys)
                        .join('div')
                        .attr('class', 'form-check  col-12')
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
                                    // .style("display", "block")
                                    // .style("text-indent", "30px")
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

                }
                function render() {

                    var newData = newDataObj.newData;
                    var newRateData = newDataObj.newRateData;
                    var display_DataKeys = dataKeys.slice(2).filter((key, i) => display_timming_index.includes(i));
                    var display_rateDataKeys = rateDataKeys.filter((key, i) => display_timming_index.includes(i));
                    // console.debug(display_DataKeys, display_rateDataKeys);

                    var getNiceDomain = (domain, addRate = 0.1) => {
                        let min = domain[0];
                        let max = domain[1];

                        let addRange = Math.abs(max - min) * addRate;
                        max += addRange;
                        min -= addRange;

                        return [min, max];
                    }

                    var xAxisDomain = newDataObj.xSelected_domain ?
                        newDataObj.xSelected_domain :
                        // getNiceDomain([data[0][dataKeys[2]], data[data.length - 1][dataKeys[dataKeys.length - 1]]], 0.01);
                        getNiceDomain(d3.extent([].concat(...newData.map(d => d3.extent([display_DataKeys[0], display_DataKeys[display_DataKeys.length - 1]], key => d[key])))), 0.01)
                    // getNiceDomain([data[0][display_DataKeys[0]], data[data.length - 1][display_DataKeys[display_DataKeys.length - 1]]], 0.01);
                    // console.debug(xAxisDomain);
                    // console.debug(new Date(xAxisDomain[0]).toISOString(), new Date(xAxisDomain[1]).toISOString());
                    // console.debug(dataKeys[2]);


                    var yAxisDomain = newDataObj.ySelected_domain ?
                        newDataObj.ySelected_domain :
                        (
                            display_rateDataKeys.length == 0 ?
                                d3.extent([].concat(...newRateData.map(rd => d3.extent(rateDataKeys, key => rd[key])))) :
                                getNiceDomain([0, d3.max([].concat(...newRateData.map(rd => d3.max(display_rateDataKeys, key => rd[key]))))], 0.01)
                        )
                    // console.debug(yAxisDomain);

                    x = d3.scaleUtc()
                        .domain(xAxisDomain)
                        .range([margin.left, width - margin.right])
                    // .nice();
                    // console.debug(x.domain());

                    y = d3.scaleLinear()
                        .domain(yAxisDomain)
                        .range([height - margin.bottom, margin.top]);

                    var refreshText = () => {
                        xAxis
                            .select('.axis_name')
                            .attr('x', width / 2)
                            .attr("y", margin.bottom - 10);


                        yAxis
                            .select('.axis_name')
                            .attr('x', -(height - margin.top - margin.bottom) / 2 - margin.top)
                            .attr("y", -margin.left + 2);

                        //==title
                        svg
                            .select('.title text')
                            .attr("x", width / 2)
                            .attr("y", margin.top / 2);

                    }
                    var updateAxis = () => {
                        var makeXAxis = g => g
                            .attr("transform", `translate(0,${height - margin.bottom})`)
                            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
                            .call(g => {
                                // if (xAxisScale == 'band')
                                //     g.selectAll("g.xAxis g.tick text")
                                //         .attr('x', 9)
                                //         .attr("y", 0)
                                //         .attr("dy", ".35em")
                                //         .attr("text-anchor", "start")
                                //         .attr("transform", "rotate(90)");
                            });

                        var makeYAxis = g => g
                            .attr("transform", `translate(${margin.left},0)`)
                            .call(d3.axisLeft(y)
                                .ticks(height / 30))
                            .call(g => g.select(".domain").remove())
                            .call(g => g.selectAll("g.yAxis g.tick line")
                                .attr("x2", d => width - margin.left - margin.right)
                                .attr("stroke-opacity", 0.2)
                            );

                        xAxis.call(makeXAxis);
                        yAxis.call(makeYAxis);
                    }
                    var updateFocus = () => {
                        var makeDots = focusGroup => focusGroup
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
                                    let timingArr = display_DataKeys.map(key => d[key]);
                                    let rateDataObj = newRateData[i];
                                    let rateArr = display_rateDataKeys.map(key => rateDataObj[key]);
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
                                        .attr("fill", fillColor)
                                        .attr("stroke-opacity", .5)
                                        .attr("d", line(timingArr));




                                    display_timming_index.forEach((shapeIndex, dataIndex) => {
                                        if (rateArr[dataIndex]) {
                                            let centre = { x: x(timingArr[dataIndex]), y: y(rateArr[dataIndex]) };
                                            makeShape(dots, shapeIndex, centre, d);
                                        }
                                    });


                                }));

                        focusGroup.call(makeDots);
                    }

                    refreshText();
                    updateAxis();
                    updateFocus();

                }


                if (!newDataObj) {
                    newDataObj = getNewData();
                    init();
                }
                render();



            };
            function getNewData(xSelected_domain = null, ySelected_domain = null, rateUnit = 'KB') {
                let newData, newRateData;

                var update_newData_and_newRateData = () => {
                    if (!newDataObj) {
                        newData = data;
                        newRateData = rateData;
                    }
                    else if (!xSelected_domain) {
                        newData = newDataObj.newData;
                        newRateData = newDataObj.newRateData;
                    }
                    else {
                        // let i1 = d3.bisectCenter(newDataObj.newTimeArr, xSelected_domain[0]);
                        // let i2 = d3.bisectCenter(newDataObj.newTimeArr, xSelected_domain[1]) + 1;//包含最大範圍
                        // newData = (getRateData ? newDataObj.newRateData : newDataObj.newData).slice(i1, i2);
                    }
                }

                update_newData_and_newRateData();

                let tmpObj = {
                    newData: newData,
                    newRateData: newRateData,
                    xSelected_domain: xSelected_domain,
                    ySelected_domain: ySelected_domain,
                };
                console.debug(tmpObj);
                return tmpObj;

            };
            updateChart();


            function events(svg) {
                var xSelected_domain = null, ySelected_domain = null;

                function chartEvent() {
                    const tooltip = d3.select("#charts").append("div")
                        .attr("id", "tooltip")
                        .style('position', 'absolute')
                        .style('z-index', '1')
                        .style("background-color", "#D3D3D3")
                        .style('padding', '20px 20px 20px 20px')
                        .style("opacity", " .9")
                        .style('display', 'none');

                    //====================================for mouse move==================================================

                    const mouseG = svg.append("g")
                        .attr("class", "mouse-over-effects");

                    // const lineStroke = "2px";
                    // const lineStroke2 = "0.5px";

                    // const mouseLine = mouseG.append("path") // create vertical line to follow mouse
                    //     .attr("class", "mouse-line")
                    //     .style("stroke", "#A9A9A9")
                    //     .style("stroke-width", lineStroke)
                    //     .style("opacity", "0");

                    // const mousePerLineCollection = mouseG.selectAll('.mouse-per-line')
                    //     .data(dvv_dataKey_index)
                    //     .join("g")
                    //     .attr("class", "mouse-per-line");
                    // // console.debug(mousePerLineCollection)

                    // const circleAmount = 3;
                    // mousePerLineCollection
                    //     .selectAll('circle')
                    //     .data(d3.range(circleAmount))
                    //     .join("circle")
                    //     .call(() => {
                    //         mouseG.selectAll("circle").each(function (d, i) {
                    //             // console.debug(d, i)

                    //             let circle = d3.select(this);
                    //             let mainCircle = (d % 2 != 0);

                    //             circle
                    //                 .attr("r", d + 3)
                    //                 .style("stroke", mainCircle ? getColor((i - 1) / 3) : "white")
                    //                 .style("fill", "none")
                    //                 .style("stroke-width", mainCircle ? lineStroke : lineStroke2)
                    //                 .style("opacity", "0");

                    //         });
                    //     });


                    // append a rect to catch mouse movements on canvas
                    const event_rect = mouseG
                        .append("use")
                        .attr('class', "eventRect")
                        .attr('xlink:href', "#chartRenderRange");

                    // //====================================for zoom==================================================

                    const selectionGroup = svg.append('g').attr('class', 'selectionGroup');
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
                            var rectElement = selectionGroup
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

                    const SC_width = 150, SC_height = 50;
                    const selectionController = selectionGroup
                        .append('g')
                        .attr("display", 'none');

                    selectionController
                        .append('rect')
                        .attr("width", SC_width)
                        .attr("height", SC_height)
                        .attr("fill", "#D3D3D3")
                        .attr('rx', 5)
                        .attr('ry', 5)
                        .attr('stroke', '#000000')
                        .attr("stroke-width", "1")
                        .attr('fill', '#D3D3D3')
                        .attr('opacity', .9);

                    // const SC_buttonAmount = 2;
                    // const SC_buttonText = ['zoom', 'remove'];
                    const SC_buttonAmount = 1;
                    const SC_buttonText = ['remove'];
                    const SC_buttonWidth = 60, SC_buttonHeight = 30;

                    selectionController
                        .selectAll('.buttonGroup')
                        .data(d3.range(SC_buttonAmount))
                        .join('g')
                        .attr('class', 'buttonGroup')
                        .attr('id', d => 'SC_' + SC_buttonText[d])
                        .call(buttonGroupCollection =>
                            buttonGroupCollection.each(function (i) {
                                let bg = d3.select(this);
                                let translateX = SC_width / SC_buttonAmount * i + (SC_width / SC_buttonAmount - SC_buttonWidth) * 0.5
                                let translateY = (SC_height - SC_buttonHeight) * 0.5;
                                bg.attr("transform", `translate(${translateX},${translateY})`);

                                let button = bg.append('rect')
                                    .attr("width", SC_buttonWidth)
                                    .attr("height", SC_buttonHeight)
                                    .attr('rx', 5)
                                    .attr('ry', 5)
                                    .attr('stroke', '#000000')
                                    .attr("stroke-width", "0.3")
                                    .attr('fill', '#9D9D9D');

                                let buttonText = bg.append('text')
                                    .attr("class", "axis_name")
                                    .attr("fill", "black")
                                    .attr("font-weight", "bold")
                                    .attr("font-size", "12")
                                    .style("text-anchor", "middle")
                                    .attr("alignment-baseline", "middle")
                                    .attr('x', SC_buttonWidth * 0.5)
                                    .attr('y', SC_buttonHeight * 0.5)
                                    .text(SC_buttonText[i]);


                                bg
                                    .on('click', function () {
                                        // console.debug(buttonText.text());

                                        if (buttonText.text() == 'remove') {
                                            // console.debug(removeData);
                                            removeData_backup = JSON.parse(JSON.stringify(removeData));

                                            buttonText.text('undo');
                                            // console.debug(xSelected_domain, ySelected_domain);
                                            let i1 = d3.bisectCenter(dataTimeArr, xSelected_domain[0]);
                                            let i2 = d3.bisectCenter(dataTimeArr, xSelected_domain[1]) + 1;//包含最大範圍
                                            let tmpData = data.slice(i1, i2);
                                            tmpData.forEach(d =>
                                                dvv_dataKey_index.forEach(dki => {
                                                    if (d[dataKeys[dki]] >= ySelected_domain[0] && d[dataKeys[dki]] <= ySelected_domain[1]) {
                                                        // console.debug(d[dataKeys[dki]]);
                                                        let index = d3.bisectCenter(dataTimeArr, d[dataKeys[0]]);
                                                        // console.debug(index);                                                      
                                                        if (!removeData[index])//==undefine or null 
                                                            removeData[index] = [];
                                                        if (removeData[index].indexOf(dki) == -1)//==不放入重複元素
                                                            removeData[index].push(dki);
                                                    }

                                                })
                                            );
                                            // console.debug(removeData);
                                        }
                                        else if (buttonText.text() == 'undo') {
                                            buttonText.text('remove');
                                            removeData = removeData_backup;
                                        }
                                        updateChart();
                                    })
                                    .on('mouseover', function () {
                                        // console.debug(this)
                                        button.attr('fill', '#E0E0E0');
                                    })
                                    .on('mouseout', function () {
                                        // console.debug(this)
                                        button.attr('fill', '#9D9D9D');
                                    });
                            })
                        );


                    const dragBehavior = d3.drag()
                        .on("start", () => {
                            // console.log("dragStart");
                            const p = d3.pointer(event, event_rect.node());
                            selectionRect.init(p[0], p[1]);
                            selectionRect.removePrevious();
                        })
                        .on("drag", () => {
                            // console.log("dragMove");
                            const p = d3.pointer(event, event_rect.node());
                            // console.debug(p);
                            if (p[1] < margin.top)
                                p[1] = margin.top;
                            else if (p[1] > height - margin.bottom)
                                p[1] = height - margin.bottom;

                            if (p[0] < margin.left)
                                p[0] = margin.left;
                            else if (p[0] > width - margin.right)
                                p[0] = width - margin.right;
                            selectionRect.update(p[0], p[1]);
                        })
                        .on("end", () => {
                            // console.log("dragEnd");
                            const finalAttributes = selectionRect.getCurrentAttributes();
                            // console.debug(finalAttributes);


                            let selectionRect_width = finalAttributes.x2 - finalAttributes.x1;
                            let selectionRect_height = finalAttributes.y2 - finalAttributes.y1;
                            if (selectionRect_width > 1 && selectionRect_height > 1) {
                                // console.log("range selected");
                                // range selected
                                event.preventDefault();

                                xSelected_domain = [x.invert(finalAttributes.x1), x.invert(finalAttributes.x2)];
                                ySelected_domain = [y.invert(finalAttributes.y2), y.invert(finalAttributes.y1)];
                                // console.debug(xSelected_domain, ySelected_domain);


                                let translateX = finalAttributes.x1 + (selectionRect_width - SC_width) * 0.5;
                                if (translateX + SC_width > width) translateX = width - SC_width;//超出svg右邊界
                                else if (translateX < 0) translateX = 0;//超出svg左邊界
                                let translateY = finalAttributes.y1 - SC_height - 10;

                            }
                            else {
                                //-------- reset zoom
                                // console.log("single point");
                                xSelected_domain = null;
                                ySelected_domain = null;
                                selectionController
                                    .attr("display", 'none')
                                // console.debug(removeData);
                            }
                            newDataObj = getNewData(xSelected_domain, ySelected_domain);
                            // updateChart();
                            selectionRect.remove();


                        });


                    event_rect.call(dragBehavior);

                }
                function chartOptionEvent() {
                    var updateFlag = true;

                    //=====change display
                    d3.selectAll('input[name ="display"]')
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

                    d3.select('#showPath').on('change', e =>
                        d3.selectAll('.orderPath').attr("display", e.target.checked ? 'inline' : 'none'));
                    d3.select('#showLegend').on('change', e =>
                        d3.selectAll('.legend').attr("display", e.target.checked ? 'inline' : 'none'));
                    //=====rate unit

                    d3.select('#rateUnit').on('change', e => {
                        console.debug(e.target.value)

                    });

                }
                function legendEvent() {
                    var x_fixed = 0, y_fixed = 0;
                    var legend_dragBehavior = d3.drag()
                        .on('start', function (e) {
                            // console.log('drag start');
                            let matrix = this.transform.baseVal[0].matrix;
                            x_fixed = e.x - matrix.e;
                            y_fixed = e.y - matrix.f;
                        })
                        .on('drag', function (e) {
                            d3.select(this).attr("transform", `translate(${e.x - x_fixed}, ${e.y - y_fixed})`)
                        })
                        .on('end', e => {
                            // console.log('drag end');
                        });


                    // var content = document.getElementById('FeaturedContent');
                    // var parent = content.parentNode;svg.insertBefore(l.node(), svg.firstChild)
                    // parent.insertBefore(content, parent.firstChild);
                    svg.select('.legendGroup')
                        .call(lg => lg.raise())//把legend拉到最上層(比zoom的選取框優先)
                        .selectAll('.legend')
                        .call(legend_dragBehavior);

                }
                // chartEvent();
                chartOptionEvent();
                legendEvent();
            }

            svg.call(events);

            return svg.node();
        }

        function printChart() {
            $('#charts').children().remove();
            // $('.tooltip').remove();
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

            var i = 1;
            let chartNode = RQRchart();
            // console.debug(chartNode);
            getChartMenu('A');
            $('#chart' + i).append(chartNode);
            // console.debug(i);
            MenuEvents();
        }

        if (!($('#form-chart').length >= 1)) {
            init();
            if (dataPath)
                getFileData();
        }

        printChart();
    }
    return chart;


}
