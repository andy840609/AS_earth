function DatexDVV() {

    var selector = 'body';
    var dataPath = "../data/";
    var data = [];

    chart.selector = (vaule) => {
        selector = vaule;
        return chart;
    }

    function chart() {
        const remove_col_value = -999;//這個數值：1.讀檔時當成undefine,2.去除的點之輸出值

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
                                    <label class="form-check-label  col-12" for="showRemove">removed points</label>
                                </div>

                                <div class="form-check d-flex flex-row flex-wrap " style="text-align: ;">
                                    <input class="form-check-input  col-4" type="checkbox" id="showLegend" name="show" value="0" checked>
                                    <label class="form-check-label  col-12" for="showLegend">legend(L)</label>
                                </div>

                                <div class="form-check d-flex flex-row flex-wrap " style="text-align: ;">
                                    <input class="form-check-input  col-4" type="checkbox" id="showOverview" name="show" value="0" checked>
                                    <label class="form-check-label  col-12" for="showOverview">overview(O)</label>
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
                            edit mode(E)
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
                        <button type="button" id="checkBtn"  class="btn btn-secondary col-5">check</button>  
                        <button type="button" id="saveBtn"  class="btn btn-secondary col-5">save</button>  
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
                    console.error(jqXHR);
                    console.error(textStatus);
                    console.error(errorThrown);
                    console.debug(jqXHR);
                    console.debug(jqXHR.responseText);
                    console.debug(textStatus);
                    console.debug(errorThrown);
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
                                                if (!isNaN(c)) {
                                                    let julianDay = c;
                                                    let dateInMs = Date.UTC(year, 0, 1) + ((julianDay - 1) * 24 * 60 * 60 * 1000);
                                                    // obj[fileDataKey[0]] = new Date(dateInMs).toISOString();
                                                    obj[fileDataKey[0]] = dateInMs;
                                                }
                                                else//這個程式輸出的日期為ISO string
                                                {
                                                    let dateArr = c.split('-');
                                                    obj[fileDataKey[0]] = Date.UTC(dateArr[0], dateArr[1] - 1, dateArr[2]);
                                                }
                                            }
                                            else
                                                obj[fileDataKey[index]] = (isNaN(c) ? c : (c == remove_col_value ? undefined : parseFloat(c)));
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
            };
            const dataKeys = data.columns;
            const dvv_dataKey_index = [1, 3, 5];
            const dataTimeArr = data.map(d => d[dataKeys[0]]);
            // console.debug(dataTimeArr);

            const svg = d3.create("svg")
                .attr("viewBox", [0, 0, width, height]);
            const xAxis = svg.append("g").attr("class", "xAxis");
            const yAxis = svg.append("g").attr("class", "yAxis");
            const focusGroup = svg.append("g").attr('class', 'focus').attr("clip-path", "url(#clip)");
            const overviewGroup = svg.append("g").attr('class', 'overview');

            var x, y;
            var newDataObj;
            var removeData;
            var showRemove = d3.select('#showRemove').property('checked');
            var overview_x, overview_y;

            function makeDots(dotsGroup, newData, attrObj) {
                let x = attrObj.x,
                    y = attrObj.y,
                    width = attrObj.width,
                    strokeWidth = attrObj.strokeWidth;

                dotsGroup
                    .selectAll("g")
                    .data(dvv_dataKey_index)
                    .join("g")
                    .attr("id", (d, i) => 'p' + (i + 1) + 'Group')
                    .attr("class", "dots")
                    .attr("stroke", (d, i) => getColor(i))
                    .call(() =>
                        dotsGroup.selectAll(".dots").each(function (dki) {
                            // console.debug( i)
                            let dots = d3.select(this);
                            let timeKey = dataKeys[0];
                            let dvvKey = dataKeys[dki];
                            // console.debug(dvvKey);

                            dots
                                .selectAll("rect")
                                .data(newData)
                                .join("rect")
                                .attr("stroke-width", strokeWidth)
                                .attr("fill", "none")
                                .attr("x", d => isNaN(d[dvvKey]) ? undefined : x(d[timeKey]) - width / 2)
                                .attr("y", d => isNaN(d[dvvKey]) ? undefined : y(d[dvvKey]) - width / 2)
                                // .transition().duration(transitionDuration)
                                .attr("width", width)
                                .attr("height", width)
                                .style('opacity', 1)
                                .attr("stroke", function (d) {
                                    if (!removeData) //第一次畫圖不用判斷移除點
                                        return;

                                    let rm_idx = d3.bisectCenter(dataTimeArr, d[timeKey]);
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
            }
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
                    //===Legend
                    let shapeLegend_eachShape_width = 50;
                    let shapeLegend_eachShape_height = 30;
                    let shapeLegend_rect_interval = shapeLegend_eachShape_height * 0.5;

                    svg.append("g")
                        .attr("class", "legend")
                        .attr("display", d3.select('#showLegend').property('checked') ? 'inline' : 'none')
                        .call(g => g.append("rect")
                            .attr("width", shapeLegend_eachShape_width * dvv_dataKey_index.length)
                            .attr("height", shapeLegend_eachShape_height)
                            .attr("fill", "#D3D3D3")
                            .attr("opacity", .5)
                            .attr("stroke-width", "1")
                            .attr("stroke", "black")
                            .attr("stroke-opacity", .8)
                        )
                        .attr("transform", `translate(${margin.left}, ${margin.top * 0.3})`)
                        .selectAll("g")
                        .data(dvv_dataKey_index)
                        .join("g")
                        .attr("transform", (d, i) => `translate(${i * shapeLegend_eachShape_width}, 0)`)
                        .call(g_collection =>
                            g_collection.each(function (d, i) {
                                // console.debug(this);
                                let g = d3.select(this);

                                let rect_width = 5;
                                g.append("rect")
                                    .style('opacity', 1)
                                    .attr("stroke", getColor(i))
                                    .attr("stroke-width", 1.5)
                                    .attr("fill", "none")
                                    .attr("x", shapeLegend_rect_interval - rect_width * 0.5)
                                    .attr("y", shapeLegend_rect_interval - rect_width * 0.5)
                                    // .transition().duration(transitionDuration)
                                    .attr("width", rect_width)
                                    .attr("height", rect_width);

                                g.append("text")
                                    .attr("x", shapeLegend_eachShape_width * 0.5)
                                    .attr("y", shapeLegend_rect_interval)
                                    .attr("fill", "currentcolor")
                                    .attr("color", "black")
                                    .attr("font-family", "sans-serif")
                                    .attr("font-size", 12)
                                    .attr("font-weight", 600)
                                    .attr("alignment-baseline", "central")
                                    .text('p' + (i + 1))
                            })

                        );

                    //===overview
                    let scale = 0.25;
                    let OV_width = width * scale;
                    let OV_height = height * scale;
                    let OV_toolbar_height = 20;

                    overviewGroup
                        .attr("transform", `translate(${width - OV_width - 30}, ${margin.top * 0.3 + OV_toolbar_height})`)
                        .attr("display", d3.select('#showOverview').property('checked') ? 'inline' : 'none')
                        .call(overviewGroup => {

                            let overviewRect_interval = 6;

                            //功能列
                            overviewGroup
                                .append('g')
                                .attr("transform", `translate(0, ${-OV_toolbar_height})`)
                                .attr('id', 'overviewToolbar')
                                .call(tool_g => {

                                    let strokeWidth = 2;
                                    let toolRect_dasharray = `${OV_width + OV_toolbar_height * 0.6}, ${OV_width}`;
                                    tool_g
                                        .append("rect")
                                        .style('opacity', .8)
                                        .attr("fill", "#D3D3D3")
                                        .attr("stroke", 'black')
                                        .attr("stroke-width", strokeWidth)
                                        .attr("stroke-opacity", .6)
                                        .attr("stroke-dasharray", toolRect_dasharray)
                                        .attr('rx', 5)
                                        .attr('ry', 5)
                                        .attr("width", OV_width)
                                        .attr("height", OV_toolbar_height + strokeWidth);

                                    tool_g
                                        .append("text")
                                        .attr("transform", `translate(${overviewRect_interval}, ${OV_toolbar_height * 0.5})`)
                                        .attr("fill", "currentcolor")
                                        .attr("color", "black")
                                        // .attr("font-family", "sans-serif")
                                        .attr("font-size", 15)
                                        .attr("font-weight", 600)
                                        .attr("text-anchor", "start")
                                        .attr("alignment-baseline", "central")
                                        .text('overview')

                                    //overviewToolbar_button
                                    let OT_buttonText = ['‒', 'x'];
                                    let OT_buttonAmount = OT_buttonText.length;
                                    let OT_buttonWidth = 11, OT_buttonInterval = 5;
                                    let OT_buttonAction = (buttonIndex) => {
                                        switch (buttonIndex) {//0:‒,1:x
                                            case 0:
                                                let displayAttr = ['none', 'inline'];
                                                let displayFlag = !displayAttr.indexOf(overviewFocus.attr('display'));
                                                // console.debug(displayFlag)
                                                overviewFocus.attr('display', displayAttr[+displayFlag]);
                                                tool_g.select("rect")
                                                    .attr("stroke-dasharray", displayFlag ? toolRect_dasharray : null);
                                                overviewToolbarController.selectAll('text').filter(d => d === OT_buttonText[0])
                                                    .text(displayFlag ? "‒" : "□");

                                                if (displayFlag) {//放大時可能超出下邊界
                                                    // console.debug(overviewGroup.node().getBBox())
                                                    let matrix = overviewGroup.node().transform.baseVal[0].matrix;
                                                    let translateX = matrix.e;
                                                    let translateY = matrix.f;
                                                    let yRangeMax = height - (OV_toolbar_height + OV_height) + 5;

                                                    if (translateY > yRangeMax)
                                                        overviewGroup.attr('transform', `translate(${translateX},${yRangeMax})`);
                                                }

                                                break;

                                            case 1:
                                                overviewGroup.attr("display", 'none');
                                                d3.select('#showOverview').property('checked', false);
                                                break;
                                        }
                                    }
                                    let overviewToolbarController =
                                        tool_g
                                            .append('g')
                                            // .attr('id', 'overviewToolbarButtons')
                                            .selectAll("g")
                                            .data(OT_buttonText)
                                            .join("g")
                                            .call(buttons_g => buttons_g.each(function (text, i) {

                                                let bg = d3.select(this);
                                                // console.debug(text, i)

                                                bg.attr("transform", `translate(${OV_width - (OT_buttonWidth + OT_buttonInterval) * (OT_buttonAmount - i)}, ${(OV_toolbar_height - OT_buttonWidth) * 0.5})`);

                                                let button = bg.append('rect')
                                                    .style('opacity', .8)
                                                    .attr("fill", "#9D9D9D")
                                                    .attr("stroke", '#000000')
                                                    .attr("stroke-width", 1)
                                                    .attr("width", OT_buttonWidth)
                                                    .attr("height", OT_buttonWidth);

                                                bg.append('text')
                                                    .attr("fill", "black")
                                                    .attr("font-weight", 900)
                                                    .attr("font-size", "12")
                                                    .style("text-anchor", "middle")
                                                    .attr("alignment-baseline", "middle")
                                                    .attr('x', OT_buttonWidth * 0.5)
                                                    .attr('y', OT_buttonWidth * 0.5)
                                                    .text(text);

                                                bg
                                                    .attr("cursor", 'pointer')
                                                    .on('click', function (e) {
                                                        // console.debug(bg.attr("mode"));
                                                        // console.debug(e);
                                                        // if (selectionController.attr('display') != 'inline')
                                                        //     return;
                                                        OT_buttonAction(i);
                                                    })
                                                    .on('mouseover', () => button.attr('fill', '#E0E0E0'))
                                                    .on('mouseout', () => button.attr('fill', '#9D9D9D'))
                                                    .on('mousedown', e => e.stopPropagation())//選取區取消drag事件

                                            }))

                                })

                            //主體
                            let overviewFocus = overviewGroup
                                .append('g')
                                .attr('id', 'overviewFocus')
                                .attr('display', 'inline')
                                .call(overviewFocus => {
                                    //外框
                                    overviewFocus
                                        .append("rect")
                                        .style('opacity', .8)
                                        .attr("fill", "#D3D3D3")
                                        .attr("stroke", 'black')
                                        .attr("stroke-width", 2)
                                        .attr("stroke-opacity", .6)
                                        .attr("width", OV_width)
                                        .attr("height", OV_height);

                                    //內框
                                    overviewFocus
                                        .append("rect")
                                        .attr("transform", `translate(${overviewRect_interval * 0.5}, ${overviewRect_interval * 0.5})`)
                                        .attr('id', 'overviewRect')
                                        .attr("fill", "none")
                                        .attr("width", OV_width - overviewRect_interval)
                                        .attr("height", OV_height - overviewRect_interval);

                                    //資料點的g
                                    overviewFocus
                                        .append('g')
                                        .attr("transform", `translate(${overviewRect_interval * 0.5}, ${overviewRect_interval * 0.5})`)
                                        .attr('id', 'overviewDots');

                                    //範圍選取框
                                    overviewFocus
                                        .append('g')
                                        .attr("transform", `translate(${overviewRect_interval * 0.5}, ${overviewRect_interval * 0.5})`)
                                        .attr('id', 'overviewSelectionGroup')
                                    // .attr("width", OV_width - overviewRect_interval)
                                    // .attr("height", OV_height - overviewRect_interval);
                                })



                        });



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
                            .attr("transform", `translate(0, ${height - margin.bottom})`)
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
                            .attr("transform", `translate(${margin.left}, 0)`)
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
                        var dataRect_strokeWidth = 1.5;
                        makeDots(focusGroup, newData, { x: x, y: y, width: dataRect_width, strokeWidth: dataRect_strokeWidth });


                    }
                    var updateOverview = () => {

                        let overviewDots = overviewGroup.select('#overviewDots');

                        if (overviewDots.node().childNodes.length == 0) {//init rects
                            let overviewRect = overviewGroup.select('#overviewRect');
                            let width = parseInt(overviewRect.attr('width'));
                            let height = parseInt(overviewRect.attr('height'));

                            overview_x = d3.scaleUtc()
                                .domain(x.domain())
                                .range([0, width])
                            overview_y = d3.scaleLinear()
                                .domain(y.domain())
                                .range([height, 0]);

                            let dataRect_width = 2.5;
                            let dataRect_strokeWidth = 0.5;

                            makeDots(overviewDots, newData, { x: overview_x, y: overview_y, width: dataRect_width, strokeWidth: dataRect_strokeWidth });

                        }
                        else {//update rects
                            overviewGroup.selectAll(".dots").each(function (dki) {
                                let dots = d3.select(this);
                                // console.debug(this, dki)
                                dots
                                    .selectAll("rect")
                                    .attr("stroke", function (d) {
                                        // console.debug(d)
                                        let rm_idx = d3.bisectCenter(dataTimeArr, d[dataKeys[0]]);
                                        // console.debug(idx)
                                        let rd = removeData[rm_idx];

                                        if (rd) {
                                            if (rd.indexOf(dki) != -1)
                                                this.style.opacity = 0;
                                        }
                                        else
                                            this.style.opacity = 1;

                                    });
                            })

                        }
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
                    updateOverview();

                    // updateOverview();
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
                        let i1 = d3.bisectCenter(dataTimeArr, xSelected_domain[0]);
                        let i2 = d3.bisectCenter(dataTimeArr, xSelected_domain[1]) + 1;//包含最大範圍
                        newData = data.slice(i1, i2);
                        // newTimeArr = newDataObj.newTimeArr.slice(i1, i2);
                    }
                    return newData;
                }
                var get_newTimeArr = () => {
                    let newTimeArr = data.map(d => d[dataKeys[0]]);
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
                removeData = new Array(data.length);
                var removeData_backup;//for undo
                // console.debug(removeData);

                function chartEvent() {
                    //====================================for mouse move==================================================
                    const tooltip = d3.select("#charts").append("div")
                        .attr("id", "tooltip")
                        .style('position', 'absolute')
                        .style('z-index', '1')
                        .style("background-color", "#D3D3D3")
                        .style('padding', '20px 20px 20px 20px')
                        .style("opacity", " .9")
                        .style('display', 'none');

                    const mouseG = svg.append("g").attr("class", "mouse-over-effects");

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
                    const selectionController = selectionGroup.append('g').attr("display", 'none');
                    const SC_width = 150, SC_height = 50;
                    const SC_buttonText = ['Zoom', 'Delete'];
                    //====================================for overview==================================================
                    const overviewSelectionGroup = overviewGroup.select('#overviewSelectionGroup');
                    var brushBehavior;

                    var modeControl = (mode = 'read') => {
                        if (selectionRect.element) {
                            selectionRect.remove();
                            xSelected_domain = null;
                            ySelected_domain = null;
                        }
                        selectionController.attr("display", 'none');

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
                                }
                                else {
                                    //-------- reset zoom
                                    // console.log("single point");
                                    xSelected_domain = null;
                                    ySelected_domain = null;
                                    selectionController.attr("display", 'none');

                                }
                                // console.debug(selectionRect);
                                if (mode == 'read') {
                                    newDataObj = getNewData(xSelected_domain, ySelected_domain);
                                    updateChart();
                                    // console.debug(overview_x.range(), overview_y.range());
                                    let overview_xRange = xSelected_domain ?
                                        [overview_x(xSelected_domain[0]), overview_x(xSelected_domain[1])] :
                                        [0, overview_x.range()[1]];
                                    let overview_yRange = ySelected_domain ?
                                        [overview_y(ySelected_domain[0]), overview_y(ySelected_domain[1])] :
                                        [overview_y.range()[0], 0];
                                    overviewSelectionGroup.call(brushBehavior.move, [[overview_xRange[0], overview_yRange[1]], [overview_xRange[1], overview_yRange[0]]]);

                                    selectionRect.remove();
                                } else if (mode == 'edit') {
                                    if (xSelected_domain && ySelected_domain) {//xSelected_domain 和 ySelected_domain !=null
                                        let translateX = finalAttributes.x1 + (selectionRect_width - SC_width) * 0.5;
                                        if (translateX + SC_width > width) translateX = width - SC_width;//超出svg右邊界
                                        else if (translateX < 0) translateX = 0;//超出svg左邊界
                                        let translateY = finalAttributes.y1 - SC_height - 10;

                                        selectionController
                                            .attr("display", 'inline')
                                            .attr("transform", `translate(${translateX}, ${translateY})`)
                                            .select('#SC_' + SC_buttonText[1])
                                            .attr('act', SC_buttonText[1])
                                            .select('text')
                                            .text(SC_buttonText[1] + '(' + SC_buttonText[1][0] + ')');
                                    }

                                }

                            });

                        switch (mode) {
                            case 'read':
                                let mousemoveFlag = true;//avoid from trigger event too often
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
                                        if (!mousemoveFlag)
                                            return;
                                        event.preventDefault();
                                        // let data = newDataObj.newData;
                                        // let dataTimeArr = newDataObj.newTimeArr;

                                        const ySelected_domain = newDataObj.ySelected_domain;

                                        const pointer = d3.pointer(event, this);
                                        const xm = x.invert(pointer[0]);
                                        const idx = d3.bisectCenter(dataTimeArr, xm);

                                        function getNew_dvvDataKeyIndex() {

                                            //1. 挑出ySelected_domain內的P點組別
                                            let inChart_dvv_dataKey_index = ySelected_domain ?
                                                dvv_dataKey_index.filter(i => {
                                                    let dvv = data[idx][dataKeys[i]];
                                                    // console.debug(dvv);
                                                    if (dvv >= ySelected_domain[0] && dvv <= ySelected_domain[1])
                                                        return i;
                                                }) :
                                                [...dvv_dataKey_index];//改變到原本dvv_dataKey_index圖表update顏色順序會錯
                                            //2.undisplay的刪掉,removeData裡的也刪掉
                                            inChart_dvv_dataKey_index = inChart_dvv_dataKey_index.filter(i => {
                                                let isUndisplay = undisplay_dataKeys_index.includes(i);
                                                let isRemove = removeData[idx] ? removeData[idx].includes(i) : false;
                                                return !isUndisplay && !isRemove;
                                            });
                                            // console.debug(data[idx][dataKeys[0]]);

                                            //3.根據資料值排序(大到小)
                                            for (let i = 0; i < inChart_dvv_dataKey_index.length - 1; i++)
                                                for (let j = 0; j < inChart_dvv_dataKey_index.length - 1 - i; j++)
                                                    // console.debug(data[idx][dataKeys[inChart_dvv_dataKey_index[sortedIndex[j]]]]);
                                                    if (data[idx][dataKeys[inChart_dvv_dataKey_index[j]]] < data[idx][dataKeys[inChart_dvv_dataKey_index[j + 1]]]) {
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
                                                    let xPos = x(dataTimeArr[idx]);
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
                                                    let hasValue = !isNaN(data[idx][dataKeys[d]]);
                                                    let pointInChart = inChart_dvv_dataKey_index.includes(d);

                                                    // console.debug(d3.select(this).node())
                                                    if (hasValue && pointInChart) {
                                                        mousePerLine.selectAll('circle').style("opacity", "1");
                                                        translate = `translate(${x(dataTimeArr[idx])}, ${y(data[idx][dataKeys[d]])})`;
                                                    }
                                                    else
                                                        mousePerLine.selectAll('circle').style("opacity", "0")
                                                    return translate;
                                                });
                                        }
                                        function updateTooltip() {
                                            let timeStr = new Date(dataTimeArr[idx]).toISOString();
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
                                                    let y = data[idx][dataKeys[d]];
                                                    let html = "<font size='5'>" + (isNaN(y) ? '' : y) + "</font>";
                                                    return html;
                                                });
                                        }

                                        const inChart_dvv_dataKey_index = getNew_dvvDataKeyIndex();
                                        // console.debug(inChart_dvv_dataKey_index);
                                        updateMouseLine();
                                        updateTooltip();

                                        mousemoveFlag = false;
                                        d3.timeout(() => mousemoveFlag = true, 20);

                                    });
                                break;
                            case 'edit':
                                event_rect.dispatch('mouseleave');
                                event_rect
                                    .on('mouseleave', null)
                                    .on('mousemove', null);
                                break;
                        }
                        event_rect.call(dragBehavior);
                        // console.debug(event_rect._groups[0][0].__on);
                    };
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

                                d3.selectAll('#p' + p_count + 'Group').attr("display", display);
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
                        d3.select('#showLegend').on('change', e =>
                            d3.selectAll('.legend').attr("display", e.target.checked ? 'inline' : 'none'));

                        d3.select('#showOverview').on('change', e =>
                            overviewGroup.attr("display", e.target.checked ? 'inline' : 'none'));

                        //=====save
                        d3.select('#checkBtn')
                            .on('click', e => {
                                console.debug(data);
                                console.debug(removeData);
                                console.debug(dataKeys);
                                function BrowseFolder() {
                                    try {
                                        var Message = "Please select the folder path.";  //选择框提示信息
                                        var Shell = new ActiveXObject("Shell.Application");
                                        var Folder = Shell.BrowseForFolder(0, Message, 0x0040, 0x11); //起始目录为：我的电脑
                                        //var Folder = Shell.BrowseForFolder(0,Message,0); //起始目录为：桌面
                                        if (Folder != null) {
                                            Folder = Folder.items();  // 返回 FolderItems 对象
                                            Folder = Folder.item();  // 返回 Folderitem 对象
                                            Folder = Folder.Path;   // 返回路径
                                            if (Folder.charAt(Folder.length - 1) != "\\") {
                                                Folder = Folder + "\\";
                                            }
                                            return Folder;
                                        }
                                    } catch (e) {
                                        alert(e.message);
                                    }
                                }

                                BrowseFolder();
                            });
                        d3.select('#saveBtn')
                            .on('click', e => {
                                // console.debug(removeData);

                                var createOutputData = () => {
                                    // let outputData = dataKeys.join(' ') + '\n';// header

                                    let outputData = '';

                                    data.forEach((d, i) => {
                                        let remove_indexArr = removeData[i] ? removeData[i] : [];
                                        dataKeys.forEach((key, dki) => {
                                            let col = (dki == 0 ?
                                                new Date(d[key]).toISOString().substring(0, 10) :
                                                remove_indexArr.includes(dki) ? remove_col_value : (!isNaN(d[key]) ? d[key].toExponential() : remove_col_value));
                                            outputData += col + (dki == dataKeys.length - 1 ? '' : ' ');
                                        });
                                        outputData += (i == data.length - 1 ? '' : '\n');
                                    });
                                    return outputData;
                                }
                                var outputData = createOutputData();
                                let fileName = data.title + '.tsv';
                                let blob = new Blob([outputData], {
                                    type: "application/octet-stream",
                                });
                                var href = URL.createObjectURL(blob);
                                // 從 Blob 取出資料
                                var link = document.createElement("a");
                                document.body.appendChild(link);
                                link.href = href;
                                link.download = fileName;
                                link.click();

                            });
                        // svg.on('click', e => console.debug(e.target));//test
                    };
                    var selectionButtonEvent = () => {

                        const SC_buttonWidth = 65, SC_buttonHeight = 30;
                        const SC_buttonAction = (buttonIndex) => {
                            let text = SC_buttonText[buttonIndex];
                            let buttonGroup = d3.select('#SC_' + text);
                            let buttonText = buttonGroup.select('text');
                            // console.debug(text);

                            switch (buttonIndex) {//0:zoom,1:remove
                                case 0:
                                    var zoomAreaDisplay = () => {
                                        // editZoomAreaUse.raise();
                                        editZoomArea.raise();
                                        editZoomAreaController.raise();
                                        // let displayAttr = ['none', 'inline'];
                                        // let displayFlag = !displayAttr.indexOf(editZoomArea.attr('display'));
                                        // console.debug(displayFlag)
                                        // selectionController.attr('display', displayAttr[+!displayFlag]);
                                        // selectionGroup.attr('display', 'none');
                                        selectionController.attr('display', 'none');
                                        editZoomArea.attr('display', 'inline');
                                        editZoomAreaController.attr('display', 'inline');

                                        editZoomArea
                                            .select('#EZA_inner')
                                            .attr('width', 0)
                                            .attr('height', 0)
                                            .attr('fill', '#D3D3D3')
                                            .attr('opacity', .3)
                                            .transition().duration(500)
                                            .attr('width', EZA_width)
                                            .attr('height', EZA_height)
                                            .attr('fill', '#D3D3D3')
                                            .attr('opacity', 1)

                                        // selectionController.attr('display', displayAttr[+displayFlag]);
                                    }
                                    zoomAreaDisplay();

                                    break;
                                case 1:
                                    // console.debug(buttonGroup.attr("act"));
                                    let hotkeyString = '(' + text[0] + ')';
                                    if (buttonGroup.attr("act") == text) {
                                        // console.debug(removeData);
                                        removeData_backup = JSON.parse(JSON.stringify(removeData));
                                        buttonGroup.attr("act", 'Undo');
                                        buttonText.text('Undo' + hotkeyString);
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
                                    else if (buttonGroup.attr("act") == 'Undo') {
                                        buttonGroup.attr("act", text);
                                        buttonText.text(text + hotkeyString);
                                        removeData = removeData_backup;
                                    }
                                    updateChart();
                                    break;

                            }

                        };
                        const makeButtonGroup = (g, attrObj) => {

                            let outerWidth = attrObj.outerWidth;
                            let outerHeight = attrObj.outerHeight;
                            let buttonWidth = attrObj.buttonWidth;
                            let buttonHeight = attrObj.buttonHeight;
                            let buttonId = attrObj.buttonId ? attrObj.buttonId : 'Btn_';
                            let buttonTextArr = attrObj.buttonTextArr;
                            let buttonAction = attrObj.buttonAction;
                            let buttonAmount = buttonTextArr.length;


                            g.append('rect')
                                .attr("width", outerWidth)
                                .attr("height", outerHeight)
                                .attr("fill", "#D3D3D3")
                                .attr('rx', 5)
                                .attr('ry', 5)
                                .attr('stroke', '#000000')
                                .attr("stroke-width", "1")
                                .attr('fill', '#D3D3D3')
                                .attr('opacity', .9);

                            g.selectAll('.buttonGroup')
                                .data(d3.range(buttonAmount))
                                .join('g')
                                .attr('class', 'buttonGroup')
                                .attr('id', d => buttonId + buttonTextArr[d])
                                .call(buttonGroupCollection => buttonGroupCollection.each(function (i) {
                                    // console.debug(this);

                                    let bg = d3.select(this);
                                    let translateX = outerWidth / buttonAmount * i + (outerWidth / buttonAmount - buttonWidth) * 0.5
                                    let translateY = (outerHeight - buttonHeight) * 0.5;

                                    bg
                                        .attr("transform", `translate(${translateX}, ${translateY})`)
                                        .attr('act', 'none');

                                    let button = bg.append('rect')
                                        .attr("width", buttonWidth)
                                        .attr("height", buttonHeight)
                                        .attr('rx', 5)
                                        .attr('ry', 5)
                                        .attr('stroke', '#000000')
                                        .attr("stroke-width", "0.3")
                                        .attr('fill', '#9D9D9D');

                                    bg.append('text')
                                        .attr("fill", "black")
                                        .attr("font-weight", "bold")
                                        .attr("font-size", "12")
                                        .style("text-anchor", "middle")
                                        .attr("alignment-baseline", "middle")
                                        .attr('x', buttonWidth * 0.5)
                                        .attr('y', buttonHeight * 0.5)
                                        .text(buttonTextArr[i] + '(' + buttonTextArr[i][0] + ')');


                                    bg
                                        .attr("cursor", 'pointer')
                                        .on('click', function (e) {
                                            // console.debug(g.attr('display'));
                                            if (g.attr('display') != 'inline')
                                                return;

                                            // console.debug('click');
                                            buttonAction(i);
                                        })
                                        .on('mouseenter', function (e) {
                                            // console.debug(e.target);
                                            // console.debug('mouseover');
                                            button.attr('fill', '#E0E0E0');
                                        })
                                        .on('mouseleave', function (e) {
                                            // console.debug(this);
                                            // console.debug('mouseout');
                                            button.attr('fill', '#9D9D9D');
                                        });
                                }))

                        }

                        let SC_attrObj = {
                            outerWidth: SC_width,
                            outerHeight: SC_height,
                            buttonWidth: SC_buttonWidth,
                            buttonHeight: SC_buttonHeight,
                            buttonId: 'SC_',
                            buttonTextArr: SC_buttonText,
                            buttonAction: SC_buttonAction,
                        }
                        selectionController.call(g => makeButtonGroup(g, SC_attrObj));

                        const editZoomArea = svg.append('g').attr('id', 'editZoomArea');
                        const editZoomAreaController = editZoomArea.append('g');

                        const EZA_width = width * 0.8, EZA_height = height * 0.7;
                        editZoomArea
                            .attr('display', 'none')
                            .call(editZoomArea => {
                                //外框
                                editZoomArea
                                    .append('rect')
                                    .attr('id', 'EZA_outer')
                                    .attr('x', 0)
                                    .attr('y', 0)
                                    .attr('width', width)
                                    .attr('height', height)
                                    .attr('fill', '#D3D3D3')
                                    .attr('opacity', .3);

                                //內框
                                editZoomArea
                                    .append('rect')
                                    .attr("transform", `translate(${(width - EZA_width) * 0.5}, ${(height - EZA_height) * 0.5})`)
                                    .attr('id', 'EZA_inner')
                                    .attr('width', EZA_width)
                                    .attr('height', EZA_height)
                                    .attr('fill', '#D3D3D3')
                                // .attr('fill', 'black')
                                // .attr('pointer-events', 'all');



                                const EZA_buttonGroup_width = EZA_width * 0.4;
                                const EZA_buttonGroup_height = 50;
                                const EZA_buttonWidth = 65, EZA_buttonHeight = 30;
                                const EZA_buttonText = ['Done', 'Cancel'];
                                const EZA_buttonAction = (buttonIndex) => {
                                    // console.debug('AAA')
                                    switch (buttonIndex) {//0:zoom,1:remove
                                        case 0:

                                        // break;
                                        case 1:
                                            // selectionGroup.attr('display', 'inline');
                                            selectionController.attr('display', 'inline');
                                            editZoomArea.attr('display', 'none');
                                            editZoomAreaController.attr('display', 'none');
                                            break;
                                    }
                                }


                                const EZA_attrObj = {
                                    outerWidth: EZA_buttonGroup_width,
                                    outerHeight: EZA_buttonGroup_height,
                                    buttonWidth: EZA_buttonWidth,
                                    buttonHeight: EZA_buttonHeight,
                                    buttonId: 'EZA_',
                                    buttonTextArr: EZA_buttonText,
                                    buttonAction: EZA_buttonAction,
                                }

                                editZoomAreaController
                                    .attr('display', 'inline')
                                    .attr("transform", `translate(${(width - EZA_buttonGroup_width) * 0.5}, ${(height + EZA_height) * 0.5 + 10})`)
                                    .call(g => makeButtonGroup(g, EZA_attrObj));
                            })

                        // const editZoomAreaUse = editZoomArea.append('cicrle');
                        // const editZoomAreaUse =
                        //     svg
                        //         .append('use')
                        //         .attr('xlink:href', "#editZoomArea")
                        //         .attr('pointer-events', 'all');;

                    };
                    var overviewEvent = () => {

                        // const overviewSelectionGroup = overviewGroup.select('#overviewSelectionGroup');
                        let width = overview_x.range()[1];
                        let height = overview_y.range()[0];
                        // console.debug(overview_x.range());
                        // console.debug(overview_y.range());
                        const updateDelay = 10;
                        let brushFlag = true;
                        let pre_updateTimeout = null;

                        brushBehavior = d3.brush()
                            .extent([[0, 0], [width, height]])
                            .on('start', e => {
                                // selectionGroup
                                //     .append('g')
                                //     .attr("display", 'none');

                                d3.select('.selectionGroup')
                                    .call(selectionGroup => {
                                        selectionGroup.select('g').attr("display", 'none');
                                        selectionGroup.selectChild('rect').remove();
                                    })

                            })
                            .on("brush end", e => {
                                // console.debug('end');
                                // console.debug(e.type, brushFlag);
                                if (!e.sourceEvent) return;
                                let selection = e.selection;
                                if (!selection) {
                                    // console.debug('no selection');
                                    newDataObj = getNewData();
                                    updateChart();
                                    overviewSelectionGroup.call(brushBehavior.move, [[0, 0], [width, height]]);
                                    return;
                                }
                                if (!brushFlag)
                                    pre_updateTimeout.stop();

                                pre_updateTimeout = d3.timeout(() => {
                                    // brushFlag = true
                                    xSelected_domain = [overview_x.invert(selection[0][0]), overview_x.invert(selection[1][0])];
                                    ySelected_domain = [overview_y.invert(selection[1][1]), overview_y.invert(selection[0][1])];
                                    // console.debug(xSelected_domain, ySelected_domain);
                                    newDataObj = getNewData(xSelected_domain, ySelected_domain);
                                    // console.debug(newDataObj);
                                    updateChart();
                                    brushFlag = true;
                                }, updateDelay);

                                brushFlag = false;

                            });

                        overviewSelectionGroup
                            .on('mousedown', e => e.stopPropagation())//選取區取消drag事件
                            .call(brushBehavior)
                            .call(brushBehavior.move, [[0, 0], [width, height]]);


                    };
                    modeControl('read');
                    chartOptionEvent();
                    overviewEvent();
                    selectionButtonEvent();
                }
                function infoBoxDragEvent() {
                    var raiseAndDrag = (d3_selection) => {
                        let x_fixed = 0, y_fixed = 0;
                        let legend_dragBehavior = d3.drag()
                            .on('start', function (e) {
                                // console.log('drag start');
                                let matrix = this.transform.baseVal[0].matrix;
                                x_fixed = e.x - matrix.e;
                                y_fixed = e.y - matrix.f;
                            })
                            .on('drag end', function (e) {
                                // console.log('drag');
                                let translateX = e.x - x_fixed;
                                let translateY = e.y - y_fixed;

                                let targetSVGRect = this.getBBox();
                                let targetWidth = targetSVGRect.width;
                                let targetHeight = targetSVGRect.height;
                                let targetFix = this.classList.contains('overview') ? 20 : 0;//overview要算上toolbar高

                                // console.debug(targetSVGRect);
                                let range_margin = 5;
                                let xRange = [0 + range_margin, width - targetWidth - range_margin];
                                let yRange = [targetFix + range_margin, height - targetHeight + targetFix - range_margin];
                                //不能拉出svg範圍

                                if (translateX < xRange[0])
                                    translateX = xRange[0];
                                else if (translateX > xRange[1])
                                    translateX = xRange[1];
                                // console.debug(width)
                                if (translateY < yRange[0])
                                    translateY = yRange[0];
                                else if (translateY > yRange[1])
                                    translateY = yRange[1];

                                d3.select(this).attr("transform", `translate(${translateX}, ${translateY})`);
                            })
                        // .on('', e => {
                        //     console.log('drag end');
                        // });

                        d3_selection
                            .attr("cursor", 'grab')
                            .call(g => g.raise())//把選中元素拉到最上層(比zoom的選取框優先)
                            .call(legend_dragBehavior);

                    }

                    // var content = document.getElementById('FeaturedContent');
                    // var parent = content.parentNode;svg.insertBefore(l.node(), svg.firstChild)
                    // parent.insertBefore(content, parent.firstChild);

                    svg.select('.legend').call(raiseAndDrag);
                    overviewGroup.call(raiseAndDrag);

                }
                function keyboardEvent() {
                    let hotkeyPressFlag = true;//avoid from trigger event too often

                    d3.select("body")
                        .on("keydown", (e) => {
                            // console.debug(e);
                            if (!hotkeyPressFlag) return;

                            // console.debug(checked);
                            switch (e.key) {
                                case 'e'://press e
                                    let editMode_ckb = d3.select("#editMode");
                                    let editMode_checked = editMode_ckb.property('checked');
                                    editMode_ckb.property('checked', !editMode_checked);
                                    editMode_ckb.dispatch("change");
                                    break;
                                case 'd'://press d
                                    d3.select("#SC_Delete").dispatch("click");
                                    d3.select("#EZA_Done").dispatch("click");
                                    break;
                                case 'z'://press z
                                    d3.select("#SC_Zoom").dispatch("click");
                                    break;
                                case 'c'://press c
                                    d3.select("#EZA_Cancel").dispatch("click");
                                    break;
                                case 'l'://press l
                                    let showLegend = d3.select("#showLegend");
                                    let showLegend_checked = showLegend.property('checked');
                                    showLegend.property('checked', !showLegend_checked);
                                    showLegend.dispatch("change");
                                    break;
                                case 'o'://press o
                                    let showOverview = d3.select("#showOverview");
                                    let showOverview_checked = showOverview.property('checked');
                                    showOverview.property('checked', !showOverview_checked);
                                    showOverview.dispatch("change");
                                    break;
                            }
                            hotkeyPressFlag = false;
                            d3.timeout(() => hotkeyPressFlag = true, 10);
                        })
                }
                chartEvent();
                infoBoxDragEvent();
                keyboardEvent();



            }

            svg.call(events);

            return svg.node();
        }

        function printChart() {
            $('#editMode').prop("checked", false);
            $('#displayDropDownMenu').children().remove();
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
                        console.log(chartIDArr);
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
