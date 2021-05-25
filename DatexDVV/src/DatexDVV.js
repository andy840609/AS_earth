function DatexDVV() {

    var selector = 'body';
    var dataPath = "../data/";
    var data = [];

    chart.selector = (vaule) => {
        selector = vaule;
        return chart;
    }

    function chart() {
        function init() {
            $(selector).append(`
            <form id="form-chart">
            <div class="form-group" id="chartsOptions" style="display: inline;">
            <div class="row">
            
                <!-- ... catalog ... -->
                
                    <div class="form-group col-lg-4 col-md-4 col-sm-6 d-flex flex-row align-items-start">
                        <label for="catalog" class="col-form-label col-4" >Catalog</label>
                        <div class="form-group col-8">
                            <select class="form-control" id="catalog">
                        
                            </select>
                        </div>
                    </div>
            

                <!-- ... display selector ... -->    
                <div class="form-group col-lg-4 col-md-4 col-sm-6 d-flex flex-row align-items-start">
                    <label for="displaySelectButton" class="col-form-label col-4" >Display</label>
                    <div class="btn-group btn-group-toggle col-8" role="group">
                        <button id="displaySelectButton" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            select
                        </button>
                        <div class="dropdown-menu" id="displayMenu" aria-labelledby="displaySelectButton">
                            <div class="d-flex flex-row  flex-wrap" id="displayDropDownMenu">

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
                                <div class="form-check d-flex flex-row flex-wrap " style="text-align: ;">
                                    <input class="form-check-input  col-4" type="checkbox" id="showRemove" name="show" value="0">
                                    <label class="form-check-label  col-12" for="showRemove">remove points</label>
                                </div>

                                <div class="form-check d-flex flex-row flex-wrap " style="text-align: ;">
                                    <input class="form-check-input  col-4" type="checkbox" id="showLegend" name="show" value="0">
                                    <label class="form-check-label  col-12" for="showLegend">legend</label>
                                </div>


                            </div>
                        </div>
                    </div>
                </div>  


                <!-- ... edit mode ...  --> 
                <div
                class="form-group col-lg-4 col-md-4 col-sm-6 d-flex justify-content-start  align-items-center flex-row flex-nowrap">               
                    <div id="editMode-group" class="form-check" >
                        <input class="form-check-input  col-4" type="checkbox" id="editMode" name="editMode">
                        <label class="form-check  col-12" for="editMode" data-lang="">
                            edit mode
                        </label>                        
                    </div>                         
                </div>

                <!-- ... blank ...  --> 
                <div
                class="form-group col-lg-4 col-md-4 col-sm-6 d-flex justify-content-start  align-items-center flex-row flex-nowrap">               
                </div>

                <!-- ...check and save...  --> 
                <div
                class="form-group col-lg-4 col-md-4 col-sm-6 d-flex justify-content-end  align-items-center flex-row">                   
                    <div id="output-group" class="col-8 d-flex  justify-content-around" >                
                        <button type="button" class="btn btn-secondary col-5">check</button>  
                        <button type="button" class="btn btn-secondary col-5">save</button>  
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
                if (e.target.tagName == 'svg' || e.target.tagName == 'rect') {
                    let checkbox = e.target.tagName == 'svg' ? e.target.previousSibling : e.target.parentNode.previousSibling;
                    // console.debug(checkbox);
                    if (this.id == 'displayMenu') {
                        // console.debug(checkbox.checked);
                        let p_count = checkbox.value;
                        let check = checkbox.checked;
                        checkbox.checked = !check;
                        d3.select("#display_p" + p_count).dispatch("change");
                    }

                }


            });
        };

        function getFileData() {
            //===get floder name(catalog) to make option
            var catalogArr;
            var title;
            $.ajax({
                url: "../src/php/getFile.php",
                data: { path: dataPath },
                method: 'POST',
                dataType: 'json',
                async: false,
                success: function (result) {
                    catalogArr = result;
                    console.log("catlog = ");
                    console.log(catalogArr);
                    catalogArr.forEach((r, i) => {
                        // let catalog = Object.keys(r)[0];
                        let catalog = r.catalog;
                        // console.debug(catalog);
                        $("#catalog").append($("<option></option>").attr("value", i).text(catalog));
                    });
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error(jqXHR.responseText);

                },
            });

            var getPaths = (optionValue) => {
                let obj = catalogArr[optionValue];
                let catalog = obj.catalog;
                title = catalog;
                // console.debug(catalog);

                let file = obj.file;
                let filePathArr = file.map(file => dataPath + catalog + "/" + file);

                // console.debug(filePathArr);
                return filePathArr;
            }

            var readData = (paths) => {
                var readTextFile_and_merge = (file, fileDataKey) => {

                    var rawFile = new XMLHttpRequest();
                    // rawFile.open("GET", file, true);
                    rawFile.open("GET", file, false);
                    rawFile.onreadystatechange = function () {
                        if (rawFile.readyState === 4) {
                            if (rawFile.status === 200 || rawFile.status == 0) {
                                const startStr = '/';
                                const yearIndex = 1;
                                let startIndex = file.lastIndexOf(startStr) + startStr.length;
                                let fileName = file.substring(startIndex);
                                let year = fileName.split('.')[yearIndex];


                                var rows = rawFile.responseText.split("\n");
                                // console.debug(rows);
                                rows.forEach(row => {
                                    if (row != '') {
                                        var col = row.trim().split(/\s+/);
                                        // console.debug(col);
                                        let obj = {};
                                        col.forEach((c, index) => {
                                            if (index == 0) {
                                                let julianDay = c;
                                                let dateInMs = Date.UTC(year, 0, 1) + ((julianDay - 1) * 24 * 60 * 60 * 1000);
                                                // obj[fileDataKey[0]] = new Date(dateInMs).toISOString();
                                                obj[fileDataKey[0]] = dateInMs;
                                            }
                                            else
                                                obj[fileDataKey[index]] = (isNaN(c) ? c : parseFloat(c));
                                        });
                                        data.push(obj);
                                    }

                                })
                            }
                        }
                    }
                    rawFile.send(null);
                }
                //==get fileData
                const fileDataKey = ['date', 'p1_dvv', 'p1_ccc', 'p2_dvv', 'p2_ccc', 'p3_dvv', 'p3_ccc'];

                data.length = 0;
                paths.forEach(path => readTextFile_and_merge(path, fileDataKey));
                data.columns = fileDataKey;
                data.title = title;
                console.log("data = ");
                console.log(data);
            }

            $('#catalog').change(e => {
                // console.debug(e.target.value);
                let paths = getPaths(e.target.value);
                readData(paths);
                printChart();
            });
            //===show first data charts when onload
            // $(document).ready(() => $('#catalog').change());
            let catalogSelectValue = 0;
            $('#catalog').val(catalogSelectValue);
            readData(getPaths(catalogSelectValue));
        }

        function DVVchart() {
            console.debug(data);

            const width = 800;
            const height = 600;
            const margin = ({ top: 80, right: 50, bottom: 40, left: 50 });
            const getColor = (index) => {
                let color;
                switch (index % 3) {
                    case 0:
                        color = "red";
                        break;
                    case 1:
                        color = "green";
                        break;
                    case 2:
                        color = "blue";
                        break;
                    default:
                        color = "steelblue";
                        break;
                }
                return color;
            }
            const dataKeys = data.columns;
            const dvv_dataKey_index = [1, 3, 5];
            const dataTimeArr = data.map(d => d[dataKeys[0]]);
            // console.debug(dataTimeArr);

            const svg = d3.create("svg")
                .attr("viewBox", [0, 0, width, height]);
            const xAxis = svg.append("g").attr("class", "xAxis");
            const yAxis = svg.append("g").attr("class", "yAxis");
            const focusGroup = svg.append("g").attr('class', 'focus').attr("clip-path", "url(#clip)");

            var x, y;
            var newDataObj;
            var removeData = new Array(data.length);
            var showRemove = false;
            function updateChart(trans = false) {

                function init() {

                    let title = data.title;

                    svg
                        .append("g")
                        .attr("class", "title")
                        .append('text')
                        .attr("fill", "currentColor")
                        // .attr("align", "center")
                        .attr("text-anchor", "middle")
                        .attr("alignment-baseline", "middle")
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
                        .text(dataKeys[0]);

                    yAxis
                        .append('text')
                        .attr("class", "axis_name")
                        .attr("fill", "black")
                        .attr("font-weight", "bold")
                        .attr("font-size", "10")
                        .style("text-anchor", "end")
                        .attr("alignment-baseline", "text-before-edge")
                        .attr("transform", "rotate(-90)")
                        .text('dvv');

                    //===create display dropdown option
                    d3.select('#displayDropDownMenu')
                        .selectAll('div')
                        .data(dvv_dataKey_index)
                        .join('div')
                        .attr('class', 'form-check col-4 ')
                        // .style("padding-left", '30px')
                        .style("position", 'static')
                        .call(menu => {
                            // console.debug(div.nodes());
                            menu.each(function (d, i) {
                                // console.debug(d);
                                let div = d3.select(this);
                                let p_count = i + 1;
                                div
                                    .append('input')
                                    .attr('class', 'form-check-input  col-3')
                                    .attr('type', 'checkbox')
                                    .attr('id', 'display_p' + p_count)
                                    .attr('name', 'display')
                                    .attr('value', p_count)
                                    .property('checked', true);
                                // div
                                //     .append('label')
                                //     .attr('class', 'col-8')
                                //     .attr('for', 'display_p' + (i + 1))
                                //     .style("display", "block")
                                //     .style("text-indent", "-10px")
                                //     .text(i);

                                let rect_width = 5;
                                div.append('svg')
                                    .attr("viewBox", [0, 0, rect_width * 2, rect_width * 2])
                                    .style("position", 'relative')
                                    .style("left", '6px')
                                    .append("rect")
                                    .style('opacity', 1)
                                    .attr("stroke", getColor(i))
                                    .attr("stroke-width", 1.5)
                                    .attr("fill", "none")
                                    .attr("x", rect_width * 0.5)
                                    .attr("y", 1.5)
                                    // .transition().duration(transitionDuration)
                                    .attr("width", rect_width)
                                    .attr("height", rect_width);
                            });


                        })


                }
                function render() {
                    // console.debug(newDataObj);
                    var newData = newDataObj.newData;
                    var newTimeArr = newDataObj.newTimeArr;

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
                        getNiceDomain([newTimeArr[0], newTimeArr[newTimeArr.length - 1]], 0.01);

                    var yAxisDomain = newDataObj.ySelected_domain ?
                        newDataObj.ySelected_domain :
                        getNiceDomain(d3.extent([].concat(...newData.map(d => d3.extent(dvv_dataKey_index, i => d[dataKeys[i]])))));
                    // console.debug(yAxisDomain);

                    x = d3.scaleUtc()
                        .domain(xAxisDomain)
                        .range([margin.left, width - margin.right])
                    // .nice();

                    y = d3.scaleLinear()
                        .domain(yAxisDomain)
                        .range([height - margin.bottom, margin.top]);

                    var refreshText = () => {
                        xAxis
                            .select('.axis_name')
                            .attr('x', width / 2)
                            .attr("y", margin.bottom - 15);


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
                        var dataRect_width = 5;
                        // var transitionDuration = 500;         
                        var makeDots = focusGroup => focusGroup
                            .selectAll("g")
                            .data(dvv_dataKey_index)
                            .join("g")
                            .attr("id", (d, i) => 'p' + (i + 1) + 'Group')
                            .attr("class", "dots")
                            .attr("stroke", (d, i) => getColor(i))
                            .call(() =>
                                focusGroup.selectAll(".dots").each(function (dki) {
                                    // console.debug( i)
                                    let dots = d3.select(this);
                                    let dataKey = dataKeys[dki];
                                    // console.debug(dataKey);

                                    let rm_idx;
                                    dots
                                        .selectAll("rect")
                                        .data(newData)
                                        .join("rect")
                                        .attr("stroke-width", 1.5)
                                        .attr("fill", "none")
                                        .attr("x", d => x(d[dataKeys[0]]) - dataRect_width / 2)
                                        .attr("y", d => isNaN(d[dataKey]) ? undefined : y(d[dataKey]) - dataRect_width / 2)
                                        // .transition().duration(transitionDuration)
                                        .attr("width", dataRect_width)
                                        .attr("height", dataRect_width)
                                        .style('opacity', 1)

                                        .attr("stroke", function (d) {
                                            rm_idx = d3.bisectCenter(dataTimeArr, d[dataKeys[0]]);
                                            // console.debug(idx)
                                            let rd = removeData[rm_idx];
                                            if (rd)
                                                if (rd.indexOf(dki) != -1) {
                                                    if (!showRemove)
                                                        this.style.opacity = 0;
                                                    return 'grey';
                                                }
                                        });

                                }));

                        focusGroup.call(makeDots);
                    }
                    var removeDots = () => {

                        let p1Group = d3.select('#p1Group').selectAll('rect');
                        let p2Group = d3.select('#p2Group').selectAll('rect');
                        let p3Group = d3.select('#p3Group').selectAll('rect');

                        removeData.forEach((rd, index) => {
                            if (rd)
                                rd.forEach(dki => {
                                    let group_count = dvv_dataKey_index.indexOf(dki) + 1;
                                    let rectCollection = { 1: p1Group, 2: p2Group, 3: p3Group }[group_count];
                                    let rect = d3.select(rectCollection.nodes()[index]);
                                    // console.debug(rect);
                                    rect.attr("stroke", 'grey');

                                });
                        })
                        // if (remove) {
                        // console.debug(dots)
                        // dots
                        //     .call(rects =>
                        //         rects.each(function (rect, i) {
                        //             if (i == 0)
                        //                 console.debug(this)
                        //         })
                        //     );
                        // .attr("stroke", (d, i) => {
                        //     let idx = d3.bisectCenter(dataTimeArr, d[dataKeys[0]]);
                        //     // console.debug(idx)
                        //     let rd = removeData[idx];
                        //     if (rd)
                        //         if (rd.indexOf(dki) != -1)
                        //             return 'grey';
                        // })
                        // }

                    }
                    refreshText();
                    updateAxis();
                    updateFocus();
                    // if (remove) removeDots();太慢

                }

                if (!newDataObj) {
                    newDataObj = getNewData();
                    init();
                }
                render();
            };
            function getNewData(xSelected_domain = null, ySelected_domain = null) {
                let newData, newTimeArr;
                var get_newData = () => {
                    let newData;
                    if (!xSelected_domain)
                        newData = data;
                    else {
                        let i1 = d3.bisectCenter(newDataObj.newTimeArr, xSelected_domain[0]);
                        let i2 = d3.bisectCenter(newDataObj.newTimeArr, xSelected_domain[1]) + 1;//包含最大範圍
                        newData = newDataObj.newData.slice(i1, i2);
                        // newTimeArr = newDataObj.newTimeArr.slice(i1, i2);
                    }
                    return newData;
                }
                var get_newTimeArr = () => {
                    let newTimeArr = newData.map(d => d[dataKeys[0]]);
                    return newTimeArr;
                }
                newData = get_newData();
                newTimeArr = get_newTimeArr();

                // newDataObj = data;
                return {
                    newData: newData,
                    newTimeArr: newTimeArr,
                    xSelected_domain: xSelected_domain,
                    ySelected_domain: ySelected_domain,
                };
            }
            updateChart();


            function events(svg) {
                var undisplay_dataKeys_index = [];
                var xSelected_domain = null, ySelected_domain = null;
                // var removeData = new Array(data.length);
                var removeData_backup;//for undo
                // console.debug(removeData);

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

                    const lineStroke = "2px";
                    const lineStroke2 = "0.5px";

                    const mouseLine = mouseG.append("path") // create vertical line to follow mouse
                        .attr("class", "mouse-line")
                        .style("stroke", "#A9A9A9")
                        .style("stroke-width", lineStroke)
                        .style("opacity", "0");

                    const mousePerLineCollection = mouseG.selectAll('.mouse-per-line')
                        .data(dvv_dataKey_index)
                        .join("g")
                        .attr("class", "mouse-per-line");
                    // console.debug(mousePerLineCollection)

                    const circleAmount = 3;
                    mousePerLineCollection
                        .selectAll('circle')
                        .data(d3.range(circleAmount))
                        .join("circle")
                        .call(() => {
                            mouseG.selectAll("circle").each(function (d, i) {
                                // console.debug(d, i)

                                let circle = d3.select(this);
                                let mainCircle = (d % 2 != 0);

                                circle
                                    .attr("r", d + 3)
                                    .style("stroke", mainCircle ? getColor((i - 1) / 3) : "white")
                                    .style("fill", "none")
                                    .style("stroke-width", mainCircle ? lineStroke : lineStroke2)
                                    .style("opacity", "0");

                            });
                        });


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
                                                    let in_xSelected = d[dataKeys[0]] >= xSelected_domain[0] && d[dataKeys[0]] <= xSelected_domain[1];
                                                    let in_ySelected = d[dataKeys[dki]] >= ySelected_domain[0] && d[dataKeys[dki]] <= ySelected_domain[1];
                                                    if (in_xSelected && in_ySelected) {
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

                    var modeControl = (mode = 'read') => {
                        if (selectionRect.element)
                            selectionRect.remove();
                        selectionController
                            .attr("display", 'none')

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

                                    xSelected_domain = [x.invert(finalAttributes.x1).getTime(), x.invert(finalAttributes.x2).getTime()];
                                    ySelected_domain = [y.invert(finalAttributes.y2), y.invert(finalAttributes.y1)];
                                    // console.debug(xSelected_domain, ySelected_domain);

                                    if (mode == 'edit') {
                                        let translateX = finalAttributes.x1 + (selectionRect_width - SC_width) * 0.5;
                                        if (translateX + SC_width > width) translateX = width - SC_width;//超出svg右邊界
                                        else if (translateX < 0) translateX = 0;//超出svg左邊界
                                        let translateY = finalAttributes.y1 - SC_height - 10;

                                        selectionController
                                            .attr("display", 'inline')
                                            .attr("transform", `translate(${translateX},${translateY})`);
                                        selectionController.select('#SC_remove text')
                                            .text('remove');
                                    }
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
                                // console.debug(selectionRect);
                                if (mode == 'read') {
                                    newDataObj = getNewData(xSelected_domain, ySelected_domain);
                                    updateChart();
                                    selectionRect.remove();
                                }

                            });
                        switch (mode) {
                            case 'read':
                                event_rect
                                    .on('mouseleave', function () { // on mouse out hide line, circles and text
                                        // console.log('mouseleave');
                                        mouseLine
                                            .style("opacity", "0");
                                        mousePerLineCollection.selectAll("circle")
                                            .style("opacity", "0");
                                        tooltip
                                            .style("display", "none");
                                    })
                                    .on('mousemove', function (event) { // update tooltip content, line, circles and text when mouse moves
                                        // console.log(event);
                                        event.preventDefault();
                                        const newData = newDataObj.newData;
                                        const newTimeArr = newDataObj.newTimeArr;
                                        const ySelected_domain = newDataObj.ySelected_domain;

                                        const pointer = d3.pointer(event, this);
                                        const xm = x.invert(pointer[0]);
                                        const idx = d3.bisectCenter(newTimeArr, xm);

                                        function getNew_dvvDataKeyIndex() {

                                            //1. 挑出ySelected_domain內的P點組別
                                            let inChart_dvv_dataKey_index = ySelected_domain ?
                                                dvv_dataKey_index.filter(i => {
                                                    let dvv = newData[idx][dataKeys[i]];
                                                    // console.debug(dvv);
                                                    if (dvv >= ySelected_domain[0] && dvv <= ySelected_domain[1])
                                                        return i;
                                                }) :
                                                [...dvv_dataKey_index];//改變到原本dvv_dataKey_index圖表update顏色順序會錯
                                            //2.undisplay的刪掉
                                            inChart_dvv_dataKey_index = inChart_dvv_dataKey_index.filter(i => !undisplay_dataKeys_index.includes(i));

                                            //3.根據資料值排序(大到小)
                                            for (let i = 0; i < inChart_dvv_dataKey_index.length - 1; i++)
                                                for (let j = 0; j < inChart_dvv_dataKey_index.length - 1 - i; j++)
                                                    // console.debug(newData[idx][dataKeys[inChart_dvv_dataKey_index[sortedIndex[j]]]]);
                                                    if (newData[idx][dataKeys[inChart_dvv_dataKey_index[j]]] < newData[idx][dataKeys[inChart_dvv_dataKey_index[j + 1]]]) {
                                                        let tmp = inChart_dvv_dataKey_index[j];
                                                        inChart_dvv_dataKey_index[j] = inChart_dvv_dataKey_index[j + 1];
                                                        inChart_dvv_dataKey_index[j + 1] = tmp;
                                                    }
                                            return inChart_dvv_dataKey_index;
                                        }
                                        function updateMouseLine() {
                                            //==move mouseLine
                                            mouseLine
                                                .attr("d", function () {
                                                    let xPos = x(newTimeArr[idx]);
                                                    let p1 = xPos + "," + (height - margin.bottom);
                                                    let p2 = xPos + "," + margin.top;
                                                    let d = "M" + p1 + " L" + p2;
                                                    return d;
                                                })
                                                .style("opacity", "0.7");

                                            //==make circle on each point

                                            mousePerLineCollection
                                                .attr("transform", function (d, i) {
                                                    // console.debug(d, i)
                                                    let translate = null;
                                                    let mousePerLine = d3.select(this);
                                                    let hasValue = !isNaN(newData[idx][dataKeys[d]]);
                                                    let pointInChart = inChart_dvv_dataKey_index.includes(d);

                                                    // console.debug(d3.select(this).node())
                                                    if (hasValue && pointInChart) {
                                                        mousePerLine.selectAll('circle').style("opacity", "1");
                                                        translate = `translate(${x(newTimeArr[idx])},${y(newData[idx][dataKeys[d]])})`;
                                                    }
                                                    else
                                                        mousePerLine.selectAll('circle').style("opacity", "0")
                                                    return translate;
                                                });
                                        }
                                        function updateTooltip() {
                                            let timeStr = new Date(newTimeArr[idx]).toISOString();
                                            // console.debug(timeStr)
                                            const divHtml = "Date : <br/><font size='5'>" + timeStr.substring(0, timeStr.indexOf('T')) + "</font><br/>dvv : <br/>";

                                            tooltip
                                                .style("display", "inline")
                                                .style("left", (event.pageX + 20) + "px")
                                                .style("top", (event.pageY - 20) + "px")
                                                .html(divHtml)
                                                .selectAll()
                                                .data(inChart_dvv_dataKey_index).enter()
                                                .append('div')
                                                .style('color', (d, i) => getColor(dvv_dataKey_index.indexOf(d)))
                                                .style('font-size', 10)
                                                .html((d, i) => {
                                                    // console.debug(d, i);
                                                    let y = newData[idx][dataKeys[d]];
                                                    let html = "<font size='5'>" + (isNaN(y) ? 'no data' : y) + "</font>";
                                                    return html;
                                                });
                                        }

                                        const inChart_dvv_dataKey_index = getNew_dvvDataKeyIndex();
                                        // console.debug(inChart_dvv_dataKey_index);
                                        updateMouseLine();
                                        updateTooltip();

                                    });
                                break;
                            case 'edit':
                                event_rect
                                    .on('mouseleave', null)
                                    .on('mousemove', null);
                                break;
                        }
                        event_rect.call(dragBehavior);
                        // console.debug(event_rect);
                    }

                    var chartOptionEvent = () => {
                        var updateFlag = true;

                        //=====change display
                        d3.selectAll('input[name ="display"]')
                            .on('change', e => {
                                let p_count = e.target.value;
                                // console.debug(p_count);
                                let check = e.target.checked;
                                let dataKey_index = (parseInt(p_count) - 1) * 2 + 1;
                                let display;
                                if (check) {
                                    display = 'inline';
                                    undisplay_dataKeys_index = undisplay_dataKeys_index.filter(i => i != dataKey_index);
                                }
                                else {
                                    display = 'none';
                                    undisplay_dataKeys_index.push(dataKey_index);
                                }

                                d3.select('#p' + p_count + 'Group').attr("display", display);
                                // console.debug(undisplay_dataKeys_index);
                            });
                        //=====editMode
                        d3.select('#editMode')
                            .on('change', e => {
                                let check = e.target.checked;
                                modeControl(check ? 'edit' : 'read');
                            });
                        //=====shows
                        d3.select('#showRemove')
                            .on('change', e => {
                                let check = e.target.checked;
                                showRemove = check;
                                updateChart();
                            });


                        // svg.on('click', e => console.debug(e.target));//test
                    }
                    modeControl('read');
                    chartOptionEvent();
                }
                chartEvent();


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
            let chartNode = DVVchart();
            // console.debug(chartNode);
            getChartMenu('A');
            $('#chart' + i).append(chartNode);
            // console.debug(i);
            MenuEvents();
        }

        if (!($('#form-chart').length >= 1)) {
            init();
            getFileData();
        }

        printChart();
    }
    return chart;


}
