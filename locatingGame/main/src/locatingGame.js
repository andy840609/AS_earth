function locatingGame() {
    var selector = 'body';
    var data;
    var stringObj;

    game.selector = (value) => {
        selector = value;
        return game;
    }
    game.dataPath = (value) => {



        return game;
    }
    game.string = (value) => {
        stringObj = value;
        return game;
    }

    function game() {

        const chartContainerJQ = $(selector);
        const chartContainerD3 = d3.select(selector);

        //===append map,gameDiv..etc
        function initForm() {

            chartContainerJQ.append(`
                <form id="form-game">
                <div class="form-group" id="gameOptions" style="display: inline;">
                    <div class="row">
                    </div> 
               
                <div class="form-group row" id="gameGroup">

                  
                    <div id="bigMap" class="col-12"></div>
                  
                 
                    <div id="gameOuter"  class="row">
                        <div id="gameMain"  class="col-12"></div>                      
                    </div>

                    <div id='loading'  style="display:none;">
                        <div class="spinner-border"role="status">
                            <span class="sr-only" >Loading...</span>
                        </div>
                        Loading...
                    </div>

                </div> 
                </form>
                `);
            //================dropdown-menu內元素被點擊不關閉menu

            let All_dropdownMenu = chartContainerJQ.find('.dropdown-menu');

            All_dropdownMenu
                .on("click.bs.dropdown", function (e) {
                    // console.debug(e.target);
                    e.stopPropagation();
                })
            // .on("shown.bs.dropdown", function (e) {
            //     console.debug(e.target);
            // })

            $(window)
                //==用來關閉dropdown menu
                .on('click', e => All_dropdownMenu.removeClass('show'));

            //================



        };

        //==之後作
        function chart() {
            function WD_Charts() {
                console.debug(data);
                // console.debug(xAxisName)
                var colorPalette = {};//to fixed color for each station
                const dataKeys = data.column;//0: "network", 1: "station", 2: "channel", 3: "data", 4: "dist", 5:"az"
                // console.debug(dataKeys);

                //＝＝按channelGroups組別分好資料(要分開network)
                const channelGroups = ['Z', 'N/1', 'E/2'];//用來 1.getNewData()原始資料分類 2.init()時產生cha選擇框
                const networkKey = data.dataNet.column;
                const groupData = {};
                networkKey.forEach(net => {
                    let tmp = channelGroups.map(string =>
                        [].concat(...string.split('/').map(cha => data.dataNet[net][cha] ? data.dataNet[net][cha] : [])));
                    groupData[net] = tmp;
                });
                const timeArr = data.timeArr;
                console.debug(groupData);

                // console.debug(timeArr);
                var referenceTime = '2000-01-01T00:00:00', title = referenceTime;
                if (stringObj) {
                    referenceTime = stringObj.referenceTime ? stringObj.referenceTime : referenceTime;
                    title = stringObj.title ?
                        stringObj.title :
                        (referenceTime.includes('.') ?
                            referenceTime.substring(0, referenceTime.lastIndexOf('.')) : referenceTime) + " (UTC)";
                };

                const getMargin = (yAxisDomain = null) => {
                    // console.debug(yAxisDomain);
                    var top = 30, right = 30, bottom = 70, left = 50;
                    if (yAxisDomain) {
                        let yAxisMaxTick = parseInt(Math.max(...yAxisDomain.map(domain => Math.abs(domain))));
                        let tickLength = yAxisMaxTick.toString().length;
                        // console.debug(tickLength);
                        left = tickLength >= 7 ? 60 : tickLength >= 5 ? 50 : 45;
                    }
                    return { top: top, right: right, bottom: bottom, left: left };
                };
                const getColor = (key) => {
                    var color;
                    if (colorPalette[key])
                        color = colorPalette[key];
                    else {
                        let data = newDataObj.newData;
                        let index = undefined;
                        for (i = 0; i < data.length; i++)
                            if (data[i][dataKeys[1]] == key) {
                                index = i;
                                break;
                            }

                        switch (index % 6) {
                            case 0:
                                color = "#AE0000";
                                break;
                            case 1:
                                color = "#006030";
                                break;
                            case 2:
                                color = "steelblue";
                                break;
                            case 3:
                                color = "#EA7500";
                                break;
                            case 4:
                                color = "#4B0091";
                                break;
                            case 5:
                                color = "#272727";
                                break;
                            default:
                                color = "steelblue";
                                break;
                        }
                        colorPalette[key] = color;
                    }
                    // console.debug(colorPalette);
                    return color;
                };
                const getString = (key) => {
                    let keyName, keyUnit = '';
                    switch (key) {
                        case 'dist':
                            keyName = 'Distance(km)';
                            keyUnit = 'km';
                            break;
                        case 'az':
                            keyName = 'Azimuth(°)';
                            keyUnit = '°';
                            break;
                        case 'time':
                            keyName = 'Time(s)';
                            keyUnit = 's';
                            break;
                        case 'station':
                            keyName = 'Station';
                            break;
                        default:
                            keyName = key;
                            break;
                    }
                    return { keyName: keyName, keyUnit: keyUnit };
                };

                const width = 800;
                const height = 500;
                const svg = d3.create("svg")
                    .attr("viewBox", [0, 0, width, height]);
                const xAxis = svg.append("g").attr("class", "xAxis");
                const yAxis = svg.append("g").attr("class", "yAxis");
                const pathGroup = svg.append("g").attr('class', 'paths').attr("clip-path", "url(#clip)");
                const loadingGroup = chartContainerD3.selectAll('#loading');
                // console.debug(loadingGroup);

                var margin, x, y, path_x;
                var newDataObj;

                //===for range
                var distRange_slider, azRange_slider;//for event control slider
                var dist_domain, az_domain;//range選擇範圍


                //===for station select
                var unselected_band = [];
                const unselected_color = 'grey', unselected_opacity = .3;
                const staionDropDownMenu = chartContainerD3.selectAll('#displayDropDownMenu');

                var staionSelectPage = 0;//當前頁數
                var updateStaionDropDownMenu = () => {

                    // console.debug(xAxisName);
                    let sortingKey = xAxisName;
                    let data = newDataObj.newData.sort((a, b) => a[sortingKey] - b[sortingKey]);

                    //===分頁
                    const NumOfEachPage = 10;//一頁顯示筆數
                    var totalPages = Math.ceil(data.length / NumOfEachPage) - 1;

                    // //頁數超出範圍要修正
                    if (staionSelectPage > totalPages) staionSelectPage = totalPages;
                    else if (staionSelectPage < 0 && totalPages >= 0) staionSelectPage = 0;

                    var startIndex = staionSelectPage * NumOfEachPage;
                    var endIndex = startIndex + NumOfEachPage - 1;
                    // console.debug(startIndex, endIndex);
                    //===分頁
                    // console.debug(staionSelectPage + '/' + totalPages);

                    var stationsDiv = staionDropDownMenu.select('.stations')
                        .selectAll('div')
                        .data(data)
                        .join('div')
                        .attr('class', 'form-check col-6')
                        .style("text-align", "left")
                        .call(menu => {
                            // console.debug(div.nodes());
                            menu.each(function (d, i) {
                                // console.debug(d, i);
                                let div = d3.select(this);
                                //==分頁顯示
                                let display = (i >= startIndex && i <= endIndex);
                                div.style("display", display ? 'inline' : 'none');
                                // if (!display) return;

                                let stationName = d[dataKeys[1]];
                                div
                                    .selectAll("input")
                                    .data([d])
                                    .join("input")
                                    .attr('class', 'form-check-input  col-4')
                                    .attr('type', 'checkbox')
                                    .attr('id', 'display_' + stationName)
                                    .attr('name', 'display')
                                    .attr('value', stationName)
                                    .property('checked', !unselected_band.includes(stationName));

                                div
                                    .selectAll("label")
                                    .data([d])
                                    .join("label")
                                    .attr('class', '  col-8')
                                    .attr('for', 'display_' + stationName)
                                    .style("display", "block")
                                    .style("text-indent", "-5px")
                                    .text(stationName);

                            });


                        });

                    staionDropDownMenu.select('.pageController')
                        .call(div => {
                            div.select('.currentPage')
                                .property('value', staionSelectPage + 1);
                            div.select('.totalPage')
                                .text('/ ' + (totalPages + 1))
                                .attr('value', totalPages + 1);
                        });


                    //===所有checkbox監聽點擊事件
                    stationsDiv.selectAll('input[name ="display"]')
                        .on('change', e => {
                            let check = e.target.checked;
                            let check_station = e.target.value;

                            if (check) unselected_band = unselected_band.filter(d => d != check_station);
                            else unselected_band.push(check_station);

                            // console.debug(unselected_band);

                            let pathGCollection = pathGroup.selectAll('g').nodes();
                            pathGCollection.forEach(pathG => {
                                let path_station = pathG.__data__[dataKeys[1]];
                                if (path_station == check_station) {

                                    let color = !check ? unselected_color : getColor(path_station);
                                    let opacity = !check ? unselected_opacity : 1;

                                    let g = d3.select(pathG);
                                    g.select('path')
                                        .attr("stroke-opacity", opacity)
                                        .attr("stroke", color);

                                    g.select('text')
                                        .attr("fill", color)
                                        .attr("fill-opacity", opacity);

                                }
                            });

                        });
                };
                //==================

                function getNewData(controlObj = {}) {
                    // console.debug(controlObj);
                    let normalize = controlObj.hasOwnProperty('normalize') ? controlObj.normalize : false,
                        yAxis_domain = controlObj.hasOwnProperty('yAxis_domain') ? controlObj.yAxis_domain : null,
                        xAxis_domainObj = controlObj.hasOwnProperty('xAxis_domainObj') ? controlObj.xAxis_domainObj : {},
                        network_selectArr = controlObj.hasOwnProperty('network_selectArr') ? controlObj.network_selectArr : newDataObj.network_selectArr,
                        channel_selectGroup = controlObj.hasOwnProperty('channel_selectGroup') ? controlObj.channel_selectGroup : newDataObj.channel_selectGroup;

                    var newData, newTimeArr;
                    // console.debug(xAxis_domainObj);

                    var newData_normalize = (newData) => {
                        // console.debug('***normalize...***');
                        newData.forEach(d => {
                            let originData = groupData[d[dataKeys[0]]][channel_selectGroup].find(od => od[dataKeys[1]] == d[dataKeys[1]]);
                            let domain = d3.extent(originData.data);
                            let normalize = d3.scaleLinear()
                                .domain(domain)
                                .range([-1, 1]);
                            let tmpArr = d.data.map(amp => !isNaN(amp) ? normalize(amp) : amp);
                            d.data = tmpArr;
                        })

                    };
                    var getArr_of_channel_select = (channel_selectGroup) => {
                        return isNaN(channel_selectGroup) ?
                            [] : [].concat(...network_selectArr.map(net => groupData[net][channel_selectGroup].map(d => ({ ...d }))));
                    };

                    var dataBeenReset = false;
                    var get_newData = (xAxis_domainObj) => {

                        let newData = getArr_of_channel_select(channel_selectGroup);

                        if (Object.keys(xAxis_domainObj).length !== 0) {
                            let dist_key = dataKeys[4];
                            let az_key = dataKeys[5];

                            newData = newData.filter(d => {
                                let inDistRange = true, inAzRange = true;

                                if (xAxis_domainObj[dist_key]) {
                                    let min = xAxis_domainObj[dist_key][0];
                                    let max = xAxis_domainObj[dist_key][1];
                                    // console.debug(min, max);
                                    inDistRange = (d[dist_key] >= min && d[dist_key] <= max);
                                    // console.debug(d[dist_key] >= min && d[dist_key] <= max);
                                }
                                if (xAxis_domainObj[az_key]) {
                                    let min = xAxis_domainObj[[az_key]][0];
                                    let max = xAxis_domainObj[[az_key]][1];
                                    inAzRange = (d[az_key] >= min && d[az_key] <= max);
                                }

                                // console.debug(inDistRange, inAzRange);

                                if (inDistRange && inAzRange)
                                    return true;
                            });
                        };
                        dataBeenReset = true;
                        // console.debug(newData);
                        return newData;
                    }
                    var get_newTimeArr_and_update_newData = (yAxis_domain) => {
                        let newTimeArr;

                        //3.根據y軸的時間選擇範圍重新選擇newData陣列裡各物件的data數值陣列
                        if (yAxis_domain) {
                            let i1 = d3.bisectCenter(timeArr, yAxis_domain[0]);
                            let i2 = d3.bisectCenter(timeArr, yAxis_domain[1]) + 1;//包含最大範圍
                            newData.forEach(d => d[dataKeys[3]] = d[dataKeys[3]].slice(i1, i2));
                            newTimeArr = timeArr.slice(i1, i2);
                        }
                        else {
                            if (newDataObj && (newDataObj.newTimeArr.length < timeArr.length)) {
                                // console.debug('2-2 data reset');
                                newData.forEach(d => {
                                    //===原data裡找sta跟cha都一樣的資料來複製amp陣列
                                    let originData = groupData[d[dataKeys[0]]][channel_selectGroup].find(od => od[dataKeys[1]] == d[dataKeys[1]]);
                                    d[dataKeys[3]] = originData[dataKeys[3]];
                                });
                                dataBeenReset = true;
                            }
                            newTimeArr = timeArr;

                        }
                        return newTimeArr;
                    }

                    newData = get_newData(xAxis_domainObj);
                    newTimeArr = get_newTimeArr_and_update_newData(yAxis_domain);

                    //＝＝資料從data重新取得時或者開關normalize時
                    if ((dataBeenReset && normalize) || (normalize && !newDataObj.normalize))
                        newData_normalize(newData);
                    // console.debug(newData);
                    // console.debug(newTimeArr);
                    return {
                        newData: newData,
                        newTimeArr: newTimeArr,
                        normalize: normalize,
                        yAxis_domain: yAxis_domain,
                        xAxis_domainObj: xAxis_domainObj,
                        network_selectArr: network_selectArr,
                        channel_selectGroup: channel_selectGroup,
                    };

                };
                function updateChart(trans = false) {

                    function init() {

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

                        xAxis
                            .append('text')
                            .attr("class", "axis_name")
                            .attr("fill", "black")
                            .attr("font-weight", "bold")
                            .attr('x', width / 2);
                        yAxis
                            .append('text')
                            .attr("class", "axis_name")
                            .attr("fill", "black")
                            .attr("font-weight", "bold")
                            .attr("font-size", "10")
                            .style("text-anchor", "start")
                            .attr("alignment-baseline", "text-before-edge")
                            .attr("transform", "rotate(-90)")
                            .attr('x', -height / 2)
                            .call(g => g.text(getString(data.yAxisName).keyName));


                        //===create networkDropDownMenu   
                        let network_selectArr = newDataObj.network_selectArr;
                        chartContainerD3.selectAll('#networkDropDownMenu')
                            .selectAll('div')
                            .data(networkKey)
                            .join('div')
                            .attr('class', 'form-check col-12')
                            .style("text-align", "center")
                            .call(menu => menu.each(function (d, i) {
                                let div = d3.select(this);

                                div
                                    .append("input")
                                    .attr('class', 'form-check-input  col-4')
                                    .attr('type', 'checkbox')
                                    .attr('id', 'network_' + d)
                                    .attr('name', 'network')
                                    .attr('value', d)
                                    .property('checked', network_selectArr.includes(d));

                                div
                                    .append("label")
                                    .attr('class', 'col-8')
                                    .attr('for', 'network_' + d)
                                    .text(d);
                            }));

                        chartContainerD3.selectAll('#networkSelectButton').text(
                            network_selectArr.length == networkKey.length ?
                                'All' : network_selectArr.join(' '));

                        //====================channel 產生各組選項

                        let channel_selectGroup = newDataObj.channel_selectGroup;
                        chartContainerD3.selectAll('#channelDropDownMenu')
                            .selectAll('div')
                            .data(channelGroups)
                            .join('div')
                            .attr('class', 'form-check col-4')
                            .style("text-align", "center")
                            .call(menu => menu.each(function (d, i) {
                                let div = d3.select(this);

                                div
                                    .append("input")
                                    .attr('class', 'form-check-input col-3')
                                    .attr('type', 'checkbox')
                                    .attr('id', 'channel_group' + i)
                                    .attr('name', 'channel')
                                    .attr('value', i)
                                    .property('checked', i == channel_selectGroup);

                                div
                                    .append("label")
                                    .attr('for', 'channel_group' + i)
                                    .text(d);
                            }));

                        chartContainerD3.selectAll('#channelSelectButton').text(channelGroups[channel_selectGroup]);

                        //===create StaionDropDownMenu
                        updateStaionDropDownMenu();

                        // console.debug(groupData);
                        var rangeInit = function () {
                            var get_niceDomain = (domain) => {
                                return d3.scaleLinear().domain(domain).nice().domain();
                            };

                            //===dist是所有分量裡最大的
                            dist_domain = get_niceDomain([0,
                                d3.max([].concat(...networkKey.map(net => [].concat(...groupData[net].map(d => d)))
                                ), d => d[dataKeys[4]])]);
                            az_domain = [0, 360];//方位角最大360

                            // console.debug(newData)
                            // console.debug(dist_domain, az_domain)

                            distRange_slider = new Slider('#distRange', {
                                id: "distRange_slider",
                                min: dist_domain[0],
                                max: dist_domain[1],
                                value: dist_domain,
                                tooltip: 'hide',
                            });
                            azRange_slider = new Slider('#azRange', {
                                id: "azRange_slider",
                                min: az_domain[0],
                                max: az_domain[1],
                                value: az_domain,
                                tooltip: 'hide',
                            });
                            chartContainerD3.selectAll('#distRange_min').property('value', dist_domain[0]);
                            chartContainerD3.selectAll('#distRange_max').property('value', dist_domain[1]);
                            chartContainerD3.selectAll('#azRange_min').property('value', az_domain[0])
                            chartContainerD3.selectAll('#azRange_max').property('value', az_domain[1]);
                        }();


                    };
                    function render() {
                        // console.debug(newDataObj);
                        //==物件依照xAxisName的值由小排到大
                        const sort_newData = (data, sortingKey) => {
                            // console.debug(data, sortingKey)
                            data.sort((a, b) => {
                                return a[sortingKey] - b[sortingKey];
                            });
                            // data.forEach(d => console.debug(d[sortingKey]))
                            return data;
                        };
                        const newData = sort_newData(newDataObj.newData, xAxisName);
                        const newTimeArr = newDataObj.newTimeArr;
                        const xAxis_domainObj = newDataObj.xAxis_domainObj;
                        const normalize = newDataObj.normalize;
                        const network_selectArr = newDataObj.network_selectArr;
                        const channel_selectGroup = newDataObj.channel_selectGroup;

                        const xAxisDomain = xAxis_domainObj[xAxisName] ?
                            xAxis_domainObj[xAxisName] :
                            (xAxisName == 'az' ? az_domain : dist_domain);

                        const yAxisDomain = d3.extent(newTimeArr, d => d);
                        margin = getMargin(yAxisDomain); //== 由y軸tick字串長度來決定左邊預留空間

                        // let data = isNaN(channel_selectGroup) ? [] : [].concat(...network_selectArr.map(net => groupData[net][channel_selectGroup]));
                        let data = isNaN(channel_selectGroup) ? [] : [].concat(...networkKey.map(net => groupData[net][channel_selectGroup]));

                        const xScale = { band: 'scaleBand', linear: 'scaleLinear' }[xAxisScale];
                        x = d3[xScale]()
                            .domain({
                                band: newData.map(d => (d[dataKeys[1]])),
                                linear: xAxisDomain,
                            }[xAxisScale])
                            .range([margin.left, width - margin.right]);
                        if (xScale == 'scaleLinear' && Object.keys(xAxis_domainObj).length === 0 && xAxisName != 'az')//方位角最大360
                            x.nice();

                        y = d3.scaleLinear()
                            .domain(yAxisDomain)
                            // .nice()
                            .range([height - margin.bottom, margin.top]);
                        // console.debug(x.domain())
                        var refreshText = () => {
                            xAxis
                                .select('.axis_name')
                                .attr("y", margin.bottom - 20)
                                .text({ band: getString(dataKeys[1]), linear: getString(xAxisName) }[xAxisScale].keyName);

                            yAxis
                                .select('.axis_name')
                                .attr("y", -margin.left + 8)
                                .attr("opacity", function (d, i) {
                                    let tickLength = d3.select(this.parentNode).select(".tick>text").text().length;
                                    return tickLength > 3 ? 0.3 : 1;
                                });

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
                                    if (xAxisScale == 'band')
                                        g.selectAll("g.xAxis g.tick text")
                                            .attr('x', 9)
                                            .attr("y", 0)
                                            .attr("dy", ".35em")
                                            .attr("text-anchor", "start")
                                            .attr("transform", "rotate(90)");
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
                        var updatePaths = () => {

                            // var transitionDuration = 500;
                            var dataDomain = {
                                true: [-1, 1],
                                false: d3.extent([].concat(...data.map(d => d3.extent(d.data)))),
                            }[normalize];
                            var dataDomainMean = (dataDomain[1] + dataDomain[0]) * 0.5;//linear時將第一點移至正中間             
                            var xAxisLength = x.range()[1] - x.range()[0];

                            const eachDataGap = xAxisLength / data.length;

                            if (normalize) {
                                let textBoxValue = chartContainerD3.selectAll('#normalizeScale').node().value;
                                var normalizeScale = (textBoxValue == '') ? 1 : textBoxValue;
                            }
                            var dataRange = {
                                true: [-0.5 * eachDataGap * normalizeScale, 0.5 * eachDataGap * normalizeScale],
                                false: [-0.5 * eachDataGap, 0.5 * eachDataGap],
                            }[normalize];


                            path_x = d3.scaleLinear()
                                .domain(dataDomain)
                                .range(dataRange);

                            var line = (data, gapPath = false) => {
                                var pathAttr;

                                let segmentLine = d3.line()
                                    .defined(d => !isNaN(d))
                                    .x(d => path_x(d))
                                    .y((d, i) => y(newTimeArr[i]));


                                if (gapPath) {
                                    let livingTimeIndex = [];
                                    let filteredData = data.filter((d, i) => {
                                        if (segmentLine.defined()(d)) {
                                            livingTimeIndex.push(i);
                                            return d;
                                        }
                                    });
                                    let gapLine = d3.line()
                                        .x((d, i) => path_x(d))
                                        .y((d, i) => y(newTimeArr[livingTimeIndex[i]]));

                                    // console.debug(livingTimeIndex);
                                    // console.debug(filteredData);
                                    pathAttr = gapLine(filteredData);
                                }
                                else
                                    pathAttr = segmentLine(data);

                                return pathAttr;
                            }

                            var makePaths = pathGroup => pathGroup
                                .selectAll("g")
                                .data(newData)
                                .join("g")
                                .call(() =>
                                    pathGroup.selectAll("g").each(function (d, i) {
                                        // console.debug(this, d, i);
                                        // console.debug(d[dataKeys[1]]);
                                        let isUnselected = unselected_band.includes(d[dataKeys[1]]);

                                        let g = d3.select(this);
                                        let color = isUnselected ? unselected_color : getColor(d[dataKeys[1]]);
                                        let opacity = isUnselected ? unselected_opacity : 1;

                                        //波形移到x軸位置(1.dist/az 2.波形第一點離中心點偏移位置修正)
                                        var getTransX = () => {
                                            // console.debug('getTransX');
                                            let getDataFirstPointIndex = () => {
                                                let firstPointIndex = 0;
                                                while (isNaN(d.data[firstPointIndex]))
                                                    firstPointIndex++;
                                                return firstPointIndex;
                                            }

                                            //===1.
                                            let translate_x = {
                                                // band: (i + 0.5) * eachDataGap + margin.left,
                                                band: (i + 0.5) * (xAxisLength / newData.length) + margin.left,
                                                linear: x(newData[i][xAxisName])
                                            }[xAxisScale];

                                            //===2.
                                            let shiftMean = path_x(dataDomainMean) - path_x(d.data[getDataFirstPointIndex()]);
                                            // console.debug(shiftMean);

                                            return translate_x + shiftMean;
                                        }

                                        g.attr("transform", `translate(${getTransX()},${0})`);

                                        g
                                            .selectAll("path")
                                            .data([d])
                                            .join("path")
                                            .style("mix-blend-mode", "normal")
                                            .attr("fill", "none")
                                            .attr("stroke-width", 1)
                                            .attr("stroke-linejoin", "round")
                                            .attr("stroke-linecap", "round")
                                            .attr("stroke-opacity", opacity)
                                            .attr("stroke", color)
                                            .attr("d", line(d.data))
                                        // .attr("transform", `translate(${translate_x},0)`);
                                        // .attr("stroke-linecap", 'round')

                                        g
                                            .selectAll("text")
                                            .data([d])
                                            .join("text")
                                            .attr("text-anchor", "start")
                                            .attr('alignment-baseline', 'after-edge')
                                            .attr("fill", color)
                                            .attr("fill-opacity", opacity)
                                            .attr("font-size", "10")
                                            .attr("transform", `translate(${path_x(d.data[d.data.length - 1])},${margin.top}) rotate(90)`)
                                            .text({
                                                band: parseFloat(newData[i][xAxisName].toFixed(2)) + (xAxisName == 'az' ? '' : ' ') + getString(xAxisName).keyUnit,
                                                linear: newData[i][dataKeys[1]]
                                            }[xAxisScale]
                                            );



                                    })
                                );

                            pathGroup.call(makePaths);
                        }
                        updateAxis();
                        updatePaths();
                        refreshText();
                    };

                    if (!newDataObj) {

                        //===預設選項
                        newDataObj = getNewData({
                            normalize: true,
                            yAxis_domain: null,
                            xAxis_domainObj: {},
                            network_selectArr: [networkKey[0]],
                            channel_selectGroup: 0,
                        });
                        init();
                    };
                    render();
                    loadingEffect('hide');

                    return render;
                };

                let hideLoading_flag = true;
                let hideLoading_timeOut = null;

                function loadingEffect(action = 'hide') {
                    const transitionDuration = 200;

                    if (!hideLoading_flag)
                        hideLoading_timeOut.stop();

                    switch (action) {
                        case 'show':
                            d3.timeout(() => {
                                loadingGroup
                                    .style('opacity', 1)
                                    .style('display', 'inline');
                            }, 0);
                            break;
                        case 'hide':

                            hideLoading_timeOut = d3.timeout(() => {
                                loadingGroup
                                    .transition().duration(transitionDuration)
                                    .style('opacity', 0);
                                d3.timeout(() => loadingGroup.style('display', 'none'), transitionDuration);
                                hideLoading_flag = true;
                            }, transitionDuration);

                            hideLoading_flag = false;
                            break;
                    }

                };
                updateChart();

                function events() {
                    var yAxis_domain = null,
                        normalize = chartContainerD3.selectAll('#normalize').property("checked"),
                        normalizeScale = chartContainerD3.selectAll('#normalizeScale').property("value"),
                        xAxis_domainObj = {};

                    //===分開updateObj讓圖表更新不受到mousemove...事件影響
                    var chartUpdateObj = { updateFlag: true, updateTimeOut: null, updateDelay: 10 };

                    var updateHandler = (action, updateObj = chartUpdateObj, parameter = null, mustDone = false) => {
                        // console.debug(parameter)
                        // console.debug(chartUpdateObj.updateFlag);

                        if (!updateObj.updateFlag)
                            updateObj.updateTimeOut.stop();

                        updateObj.updateTimeOut = d3.timeout(() => {
                            parameter ? action(...parameter) : action();
                            updateObj.updateFlag = true;
                        }, updateObj.updateDelay);

                        updateObj.updateFlag = mustDone;

                    };

                    //===event eles
                    const eventRect = svg.append("g").attr("class", "eventRect");
                    const defs = svg.append("defs");
                    //====================================tooltip==================================================
                    const tooltip = chartContainerD3.selectAll("#charts")
                        .append("div")
                        // .attr("class", "container-sm")
                        .attr("id", "tooltip")
                        .style('position', 'absolute')
                        // .style("top", '100px')
                        .style('z-index', '999')
                        .style("background-color", "#D3D3D3")
                        .style('padding', '20px 20px 20px 20px')
                        .style("opacity", " .9")
                        // .style("width", "300px")
                        .style('display', 'none');

                    //== tooltip init 分區好控制css
                    tooltip.call(div => {
                        div
                            .append('div')
                            .attr("class", "timeArea")
                            .html("Time : <font size='5'></font> s<br />");

                        div
                            .append('div')
                            .attr("class", "stationArea d-flex flex-row justify-content-around");

                        //===page hint col-lg-3 col-md-4 col-sm-6 d-flex flex-row align-items-start
                        div
                            .append('div')
                            .attr("class", "pageArea")
                            .style('color', 'black')
                            .style('min-width', '150px')
                            .call(div => {
                                let textAlign = ['text-left', 'text-center', 'text-right'];
                                let text = ['↼ 🄰', '', '🄳 ⇀'];

                                div
                                    .append('div')
                                    .attr('class', 'd-flex flex-nowrap')
                                    .append('text')
                                    .style('font-size', '18px')
                                    .attr('class', 'col-12 text-center')
                                    .text('Page');

                                div
                                    .append('div')
                                    .attr('class', 'd-flex flex-nowrap')
                                    // .style('display', 'inline-block')
                                    .selectAll('text')
                                    .data(d3.range(3))
                                    .join('text')
                                    .style('white-space', 'nowrap')
                                    .style('font-size', '18px')
                                    .style('padding', '0 0px')
                                    .attr('class', d => 'col-4 align-bottom ' + textAlign[d])
                                    // .style("text-anchor", "middle")
                                    .text(d => text[d]);

                            });

                    })

                    //===tooltip分頁控制
                    const NumOfEachPage = 4;//一頁顯示筆數
                    var totalPages, currentPage = 0;//當前頁數
                    var startIndex, endIndex, pageData;//當前頁的i1,i2和資料(用來畫mousemove的圈圈)
                    var mouseOnIdx = 0;//資料陣列的索引(滑鼠移動控制)
                    const chart_edgeV = [x.range()[0], x.range()[1]];
                    const chart_edgeH = [y.range()[1], y.range()[0]];
                    const chart_center = [//用來判斷tooltip應該在滑鼠哪邊
                        (chart_edgeV[1] - chart_edgeV[0]) * 0.5,
                        (chart_edgeH[1] - chart_edgeH[0]) * 0.5];
                    const tooltipMouseGap = 50;//tooltip與滑鼠距離

                    // console.debug(chart_edgeV, chart_edgeH)

                    var tooltipUpdateObj = { updateFlag: true, updateTimeOut: null, updateDelay: 10 };
                    //===更新tooltip和圓圈
                    var updateTooltip = () => {
                        var newTimeArr = newDataObj.newTimeArr;
                        var newData = newDataObj.newData;
                        var network_selectArr = newDataObj.network_selectArr;
                        var channel_selectGroup = newDataObj.channel_selectGroup;

                        //==沒選中的挑掉不顯示資料
                        var selectedData = newData.filter(d => !unselected_band.includes(d[dataKeys[1]]));
                        // console.debug(selectedData);
                        // console.debug(newData);
                        var floatShorter = (val, digit) => parseFloat(val.toFixed(digit));//小數後幾位四捨五入

                        var getCurrentPageData = function () {

                            totalPages = Math.ceil(selectedData.length / NumOfEachPage) - 1;
                            // console.debug(currentPage + '/' + totalPages)
                            // //頁數超出範圍要修正
                            if (currentPage < 0 && currentPage != totalPages) currentPage = 0;
                            else if (currentPage > totalPages) currentPage = totalPages;

                            startIndex = currentPage * NumOfEachPage;
                            endIndex = startIndex + NumOfEachPage;
                            pageData = selectedData.slice(startIndex, endIndex);
                        }();

                        let timming = newTimeArr[mouseOnIdx];

                        tooltip.call(tooltip => {

                            tooltip.select('.timeArea>font')
                                .text(timming);

                            tooltip.select('.pageArea text:nth-child(2)')
                                .text((currentPage + 1) + ' / ' + (totalPages + 1));

                            // console.debug(pageData);
                            tooltip.select('.stationArea')
                                .selectAll('div')
                                .data(pageData)
                                .join('div')
                                .style('margin-left', (d, i) => (i == 0) ? '0px' : '5px')
                                .style('padding', '10px')
                                .style('color', 'white')
                                .style('background-color', (d, i) => getColor(d[dataKeys[1]]))//getColor(sortedIndex[i])
                                .style('font-size', 10)
                                .html((d, i) => {
                                    let sta = d[dataKeys[1]];
                                    let dist = floatShorter(d[dataKeys[4]], 2);
                                    let az = floatShorter(d[dataKeys[5]], 2);
                                    // let ampN = floatShorter(d.data[mouseOnIdx], 5);

                                    //====振幅改顯示原值(要從原data裡找資料,由時間點找到原資料的索引值)
                                    let cha = d[dataKeys[2]];
                                    let originData = groupData[d[dataKeys[0]]][channel_selectGroup].find(od => od[dataKeys[1]] == d[dataKeys[1]]);
                                    // console.debug(originData);
                                    let indexOf_originData = d3.bisectCenter(timeArr, timming);
                                    let amp = floatShorter(originData.data[indexOf_originData], 1);

                                    let html =
                                        `<text style="font-size:23px;">${sta}</text><br>
                                        <text style='font-size:13px;white-space:nowrap;'>${dist} km / ${az}°</text><br>
                                        <text style='font-size:25px;'> ${(isNaN(amp) ? 'no data' : amp)}</text>`;

                                    return html;
                                });


                        });


                        //===更新圓圈

                        const lineStroke = "2px";
                        const lineStroke2 = "0.5px";

                        //==用來取得dist/az和第一點偏差的位移值,挑掉未選的
                        var pathGCollection = pathGroup.selectAll('g').nodes().filter(g =>
                            !unselected_band.includes(g.__data__[dataKeys[1]]));
                        // console.debug(pathGCollection)

                        eventRect.select('.mouse-over-effects')
                            .selectAll('.mouse-per-line')
                            .data(pageData)
                            .join("g")
                            .attr("transform", d => {

                                //( let indexOf_newData = startIndex + i;)不能用index判斷了

                                //==select mode造成pathGCollection順序沒規則,所以比對站名資料
                                //===如果不只一個比對cha
                                let pathG = pathGCollection.filter(g => d[dataKeys[1]] == g.__data__[dataKeys[1]]);
                                pathG = pathG.length > 1 ? pathG.filter(g => d[dataKeys[2]] == g.__data__[dataKeys[2]]) : pathG[0];
                                // console.debug(pathG)
                                //==取得該條path_g的transform x
                                let transX = pathG.transform.baseVal[0].matrix.e;
                                let transY = y(newTimeArr[mouseOnIdx]);
                                return `translate(${transX},${transY})`;
                            })
                            .attr("class", "mouse-per-line")
                            .call(gCollection => {
                                gCollection.each(function (d, i) {
                                    // console.debug(this);

                                    const circleAmount = 3;
                                    let g = d3.select(this);
                                    let station = d[dataKeys[1]];

                                    let circleTransX = path_x(d.data[mouseOnIdx]);
                                    // console.debug(d.data[mouseOnIdx]);
                                    // console.debug(path_x.domain(), path_x.range());
                                    g
                                        .selectAll('circle')
                                        .data(d3.range(circleAmount))
                                        .join("circle")
                                        .attr("transform", `translate(${circleTransX},0)`)
                                        .call(circlesCollection =>
                                            circlesCollection.each(function (d) {
                                                let circle = d3.select(this);
                                                let mainCircle = (d % 2 != 0);

                                                circle
                                                    .attr("r", d + 3)
                                                    .style("stroke", mainCircle ? getColor(station) : "white")
                                                    .style("fill", "none")
                                                    .style("stroke-width", mainCircle ? lineStroke : lineStroke2)
                                                    .style("opacity", "1");
                                            })
                                        );
                                })


                            })

                    };

                    //===select Mode controll
                    var dragBehavior, mouseMoveBehavior;


                    function pathEvent() {

                        //===遮罩讓path和事件不超出邊界
                        defs
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

                        eventRect.append("use").attr('xlink:href', "#chartRenderRange");

                        //====================================mouse move==================================================
                        function mouseMove() {

                            const mouseG = eventRect.append("g").attr("class", "mouse-over-effects");

                            const mouseLine = mouseG.append("path") // create vertical line to follow mouse
                                .attr("class", "mouse-line")
                                .style("stroke", "#A9A9A9")
                                .style("stroke-width", "2px")
                                .style("opacity", "0.7");


                            mouseMoveBehavior = use => use
                                .on('mouseleave', e => { // on mouse out hide line, circles and text
                                    // console.log('mouseleave');
                                    // console.debug(e);
                                    var action = () => {
                                        mouseG.style("display", "none");
                                        tooltip.style("display", "none");
                                    }
                                    updateHandler(action, tooltipUpdateObj, null, !e.isTrusted);

                                })
                                .on('mousemove', function (e) { // update tooltip content, line, circles and text when mouse moves
                                    // console.debug(e.target);
                                    // console.debug(e);
                                    var action = () => {
                                        e.preventDefault();

                                        var newTimeArr = newDataObj.newTimeArr;
                                        const pointer = d3.pointer(e, this);
                                        const ym = y.invert(pointer[1]);
                                        mouseOnIdx = d3.bisectCenter(newTimeArr, ym);

                                        mouseLine
                                            .attr("d", () => {
                                                // let yPos = y(newTimeArr[mouseOnIdx]);
                                                let yPos = pointer[1];
                                                let p1 = chart_edgeV[1] + "," + yPos;
                                                let p2 = chart_edgeV[0] + "," + yPos;
                                                let d = "M" + p1 + " L" + p2;
                                                return d;
                                            });

                                        let mouseX = e.offsetX, mouseY = e.offsetY;
                                        let fullWidth = svg.property('clientWidth');

                                        tooltip
                                            .style("display", "inline")
                                            .call(tooltip => {
                                                //tooltip換邊
                                                let left, right, top;

                                                if (pointer[0] < chart_center[0]) {//滑鼠未過半,tooltip在右
                                                    left = (mouseX + tooltipMouseGap) + 'px';
                                                    right = null;
                                                } else {//tooltip在左
                                                    left = null;
                                                    right = (fullWidth - mouseX + tooltipMouseGap) + 'px';
                                                }

                                                if (pointer[1] < chart_center[1]) //tooltip在下
                                                    top = (mouseY + tooltipMouseGap) + 'px';
                                                else //tooltip在上
                                                    top = (mouseY - tooltip.property('clientHeight') - tooltipMouseGap) + 'px';

                                                tooltip
                                                    .style("top", top)
                                                    .style("left", left)
                                                    .style("right", right);
                                            });

                                        updateTooltip();
                                        mouseG.style("display", "inline");
                                    }

                                    updateHandler(action, tooltipUpdateObj);


                                });
                            eventRect.call(mouseMoveBehavior);

                        }
                        // //====================================zoom==================================================
                        function mouseDrag() {
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
                            dragBehavior = d3.drag()
                                .on("start", e => {
                                    // console.log("dragStart");
                                    const p = d3.pointer(e, eventRect.node());
                                    selectionRect.init(margin.left, p[1]);
                                    // const xm = x.invert(p[0]);
                                    // console.debug(p);
                                    selectionRect.removePrevious();
                                    d3.select(window).dispatch("click");//關閉dropdown
                                    eventRect.dispatch('mouseleave');//tooltip取消
                                })
                                .on("drag", e => {
                                    // console.log("dragMove");
                                    var action = () => {
                                        const p = d3.pointer(e, eventRect.node());
                                        // console.debug(p);
                                        if (p[1] < margin.top)
                                            p[1] = margin.top;
                                        else if (p[1] > height - margin.bottom)
                                            p[1] = height - margin.bottom;
                                        // console.debug(p);
                                        // const xm = x.invert(p[0]);
                                        selectionRect.update(width - margin.right, p[1]);
                                    }
                                    updateHandler(action, tooltipUpdateObj);

                                })
                                .on("end", e => {
                                    loadingEffect('show');
                                    // console.log("dragEnd");
                                    // console.debug('end');

                                    const finalAttributes = selectionRect.getCurrentAttributes();
                                    // console.debug(finalAttributes);

                                    if (finalAttributes.y2 - finalAttributes.y1 > 1 && finalAttributes.y2 - finalAttributes.y1 > 1) {
                                        // console.log("range selected");
                                        // range selected
                                        // e.preventDefault();
                                        yAxis_domain = [y.invert(finalAttributes.y2), y.invert(finalAttributes.y1)];
                                        // console.debug(yAxis_domain);
                                    }
                                    else {
                                        //-------- reset zoom
                                        // console.log("single point");
                                        yAxis_domain = null;
                                    }

                                    newDataObj = getNewData({ normalize: normalize, xAxis_domainObj: xAxis_domainObj, yAxis_domain: yAxis_domain });
                                    updateChart();
                                    selectionRect.remove();
                                })
                            eventRect.call(dragBehavior);
                        }
                        mouseMove();
                        mouseDrag();
                    };
                    function chartOptionEvent() {

                        //===製造path的陰影
                        defs
                            .append("filter")
                            .attr("id", "pathShadow")
                            .attr("x", "0")
                            .attr("y", "0")
                            .call(filter => {
                                filter
                                    .append("feOffset")
                                    .attr("result", "offOut")
                                    .attr("in", "SourceAlpha")
                                    .attr("dx", "0")
                                    .attr("dy", "0");

                                filter
                                    .append("feGaussianBlur")
                                    .attr("result", "blurOut")
                                    .attr("in", "offOut")
                                    .attr("stdDeviation", "2")

                                filter
                                    .append("feBlend")
                                    .attr("in", "SourceGraphic")
                                    .attr("in2", "blurOut")
                                    .attr("mode", "normal");

                            });


                        //=====select network
                        let network = chartContainerD3.selectAll('input[name ="network"]');
                        let networkText = chartContainerD3.selectAll('#networkSelectButton');
                        network
                            .on('click', function (e) {
                                loadingEffect('show');

                                let network_selectArr = [];

                                // 多選,所有選中network放入陣列中
                                network.nodes().forEach(chkbox =>
                                    chkbox.checked ? network_selectArr.push(chkbox.value) : false);

                                // ===改變按鈕text
                                let text = network_selectArr.length == networkKey.length ?
                                    'All' : network_selectArr == 0 ? 'select' : network_selectArr.join(' ');
                                networkText.text(text);

                                // console.debug(network_selectArr);
                                newDataObj = getNewData({
                                    normalize: normalize,
                                    xAxis_domainObj: xAxis_domainObj,
                                    network_selectArr: network_selectArr
                                });
                                updateChart();
                                updateStaionDropDownMenu();


                            });


                        //=====select station
                        let displayText = chartContainerD3.selectAll('#displaySelectButton');
                        staionDropDownMenu
                            .select('.controller')
                            .call(controllerDiv => {
                                //==A-1.select mode
                                controllerDiv.select('#staionSelectMode')
                                    .on('change', e => {
                                        let check = e.target.checked;
                                        // console.debug(check);
                                        let mousemoveEventOff = (g) => {
                                            g.on('mousemove', null);
                                            g
                                                .dispatch('mouseleave')//恢復上個模式mousemove造成的改變
                                                .on('mouseleave', null);

                                            //==dispatch('mouseleave')的timeout可能被下個模式的mousemove取消
                                            //造成上個模式的東西留在畫面上(tooltip.圓圈.mouseline.path陰影淡出等)
                                            //所以 updateFlag = true保證dispatch('mouseleave')的timeout不取消
                                            // updateFlag = true; 改成傳參數給updateHandler()控制

                                        };
                                        let buttonText;
                                        //勾選時取消mousedrag和mouseMove
                                        if (check) {
                                            buttonText = 'select mode on';

                                            eventRect
                                                .on('mousedown.drag', null)
                                                .call(mousemoveEventOff);

                                            //selcet mode事件
                                            pathGroup.raise();
                                            pathGroup
                                                .on('mousemove', e => {
                                                    updateHandler(hover, tooltipUpdateObj, [e.target]);
                                                })
                                                .on('mouseleave', e => {
                                                    // console.debug(e);
                                                    updateHandler(leave, tooltipUpdateObj, null, !e.isTrusted);
                                                })
                                                .on('click', e => {

                                                    var action = () => {
                                                        let thisG = e.target.parentNode;
                                                        let thisStation = thisG.__data__[dataKeys[1]];

                                                        let show;
                                                        //===不在未選名單中則隱藏波形並列入名單
                                                        if (!unselected_band.includes(thisStation)) {
                                                            show = false;
                                                            unselected_band.push(thisStation);
                                                            leave();
                                                        }
                                                        else {
                                                            show = true;
                                                            unselected_band = unselected_band.filter(d => d != thisStation);
                                                            hover(e.target);
                                                        };


                                                        d3.select(thisG).call(thisG => {

                                                            let color = !show ? unselected_color : getColor(thisStation);
                                                            let opacity = !show ? unselected_opacity : 1;

                                                            thisG.select('path')
                                                                .attr("stroke-opacity", opacity)
                                                                .attr("stroke", color);

                                                            thisG.select('text')
                                                                .attr("fill", color)
                                                                .attr("fill-opacity", opacity);
                                                        })

                                                        //===同步ckb
                                                        let stationCheckbox = staionDropDownMenu.selectAll(`input[value =${thisStation}]`);
                                                        stationCheckbox.property('checked', show);
                                                    }
                                                    updateHandler(action);
                                                });


                                            var hover = (target) => {
                                                let thisG = target.parentNode;
                                                let thisStation = thisG.__data__[dataKeys[1]];
                                                if (unselected_band.includes(thisStation)) return;//未選的不用處理

                                                //==改變其他path透明度
                                                pathGroup.selectAll('g')
                                                    //==未選的濾掉
                                                    .filter(d => !unselected_band.includes(d[dataKeys[1]]))
                                                    .call(g =>
                                                        g.each(function (d, i) {
                                                            let g = d3.select(this);
                                                            let station = d[dataKeys[1]];
                                                            let hover = (station == thisStation);
                                                            let opacity = hover ? 1 : .5;

                                                            g.select('path').attr("stroke-opacity", opacity);
                                                            g.select('text').attr("fill-opacity", opacity);

                                                            //===加陰影和上移圖層
                                                            if (hover)
                                                                g.attr("filter", "url(#pathShadow)").raise();
                                                        })
                                                    );
                                            }

                                            var leave = () => {
                                                //==恢復所有除了未選中path透明度
                                                pathGroup.selectAll('g')

                                                    .attr("filter", null)//所有包含隱藏的path陰影都取消
                                                    //==未選的濾掉不條透明度
                                                    .filter(d => !unselected_band.includes(d[dataKeys[1]]))
                                                    .call(g => {
                                                        g.select('path').attr("stroke-opacity", 1);
                                                        g.select('text').attr("fill-opacity", 1);

                                                    });
                                            }

                                        }
                                        else {
                                            buttonText = 'select';

                                            pathGroup
                                                .on('click', null)
                                                .call(mousemoveEventOff);

                                            eventRect.raise();
                                            eventRect
                                                .call(dragBehavior)
                                                .call(mouseMoveBehavior);
                                        }

                                        //===改變按鈕text
                                        displayText.text(buttonText);

                                    });


                                //==A-2.reset
                                controllerDiv.select('#staionReset')
                                    .on('click', e => {
                                        let stationCheckboxs = staionDropDownMenu.selectAll('input[name ="display"]');
                                        stationCheckboxs.property('checked', true);
                                        stationCheckboxs.dispatch('change');
                                        unselected_band = [];//==沒在圖表上的站也要reset
                                    });

                            })

                        //==B.分頁控制
                        staionDropDownMenu.select('.pageController')
                            .call(pageController => {
                                // console.debug(pageController)
                                let pageInput = pageController.select('.currentPage')
                                    .on('input', e => {
                                        let inputVal = e.target.value;
                                        let totalPage = pageController.select('.totalPage').attr('value');
                                        // console.debug(inputVal)
                                        //======textBox空值或超過限制範圍處理
                                        if (inputVal < 1 || isNaN(inputVal) || inputVal == '')
                                            e.target.value = 1;
                                        else if (inputVal > parseInt(totalPage))
                                            e.target.value = totalPage;

                                        staionSelectPage = e.target.value - 1;
                                        updateStaionDropDownMenu();


                                    });

                                pageController.select('.prePage')
                                    .on('click', e => {
                                        let inputVal = parseInt(pageInput.property('value'));
                                        // console.debug(inputVal)
                                        pageInput.property('value', inputVal - 1);
                                        pageInput.dispatch('input');
                                    });

                                pageController.select('.nextPage')
                                    .on('click', e => {
                                        let inputVal = parseInt(pageInput.property('value'));
                                        // console.debug(inputVal)
                                        pageInput.property('value', inputVal + 1);
                                        pageInput.dispatch('input');
                                    });
                            });

                        //=====change channel
                        let channel = chartContainerD3.selectAll('input[name ="channel"]');
                        let channelText = chartContainerD3.selectAll('#channelSelectButton');
                        channel
                            .on('click', function (e) {
                                loadingEffect('show');

                                let value = e.target.value;
                                let checked = e.target.checked;
                                //＝＝＝單選,其他勾拿掉
                                channel.nodes().filter(chkbox => chkbox !== e.target).forEach(chkbox => chkbox.checked = false);

                                let text = checked ? channelGroups[value] : 'select';

                                //===改變按鈕text
                                channelText.text(text);

                                newDataObj = getNewData({
                                    normalize: normalize,
                                    xAxis_domainObj: xAxis_domainObj,
                                    channel_selectGroup: checked ? value : undefined
                                });
                                updateChart();
                                updateStaionDropDownMenu();


                            });
                        //=====change sortBy dist/az

                        // console.debug(chartContainerD3.selectAll('input[name ="xAxisName"]'))
                        chartContainerD3.selectAll('input[name ="xAxisName"]')
                            .on('click', e => {
                                loadingEffect('show');
                                xAxisName = e.target.value;
                                updateChart();
                                updateStaionDropDownMenu();
                            });
                        chartContainerD3.selectAll('input[name ="xAxisScale"]')
                            .on('click', e => {
                                loadingEffect('show');
                                xAxisScale = e.target.value;
                                updateChart();

                            });


                        //====change xAxisRange
                        chartContainerD3.selectAll('#xAxisName_radioGroup')
                            .call(xAxisName_radioGroup => {
                                const rangeObj = { 'dist': dist_domain, 'az': az_domain };

                                // console.debug(dist_domain, az_domain);

                                // range drag
                                xAxisName_radioGroup.selectAll('input[name ="xAxisRange"]')
                                    .on('input', e => {
                                        if (chartUpdateObj.updateFlag)
                                            loadingEffect('show');
                                        // console.debug(e.target);
                                        //==========================target vaule check=================================
                                        let eleID = (e.target.id).split('_');
                                        let name = eleID[0];
                                        let rangeIndex = eleID[1] == 'min' ? 0 : 1;
                                        let key = name.substring(0, name.indexOf('Range'));
                                        let rangeData = rangeObj[key];
                                        let rangeMin = rangeData[0];
                                        let rangeMax = rangeData[1];

                                        //======textBox空值或超過限制範圍處理
                                        if (isNaN(e.target.value) || e.target.value == '')
                                            e.target.value = xAxis_domainObj[key] ? xAxis_domainObj[key][rangeIndex] : [rangeMin, rangeMax][rangeIndex];
                                        // else if ([e.target.value < rangeMin, e.target.value > rangeMax][rangeIndex])
                                        else if (e.target.value < rangeMin || e.target.value > rangeMax)
                                            e.target.value = [rangeMin, rangeMax][rangeIndex];

                                        //======textBox最小最大輸入相反處理===================================
                                        let parentNode = e.target.parentNode;
                                        let minRange = parentNode.querySelector('#' + name + '_min').value;
                                        let maxRange = parentNode.querySelector('#' + name + '_max').value;
                                        // console.debug(minRange, maxRange);

                                        minRange = parseFloat(minRange);
                                        maxRange = parseFloat(maxRange);

                                        if (minRange > maxRange) {
                                            let tmp = minRange;
                                            minRange = maxRange;
                                            maxRange = tmp;
                                        }

                                        //==========================同步slider=================================
                                        let domain = [minRange, maxRange];


                                        switch (name) {
                                            case 'distRange':
                                                distRange_slider.setValue(domain);
                                                break;
                                            case 'azRange':
                                                azRange_slider.setValue(domain);
                                                break;
                                        }

                                        let inRangeMin = (minRange == rangeMin);
                                        let inRangeMax = (maxRange == rangeMax);


                                        // if (inRangeMin && inRangeMax)
                                        //     delete xAxis_domainObj[key];
                                        // else
                                        xAxis_domainObj[key] = domain;


                                        //==========================更新按鈕文字=================================                             
                                        let sub = xAxisName_radioGroup.select(`sub[class =${key}]`);
                                        //在最大範圍時不顯示文字
                                        let text = (inRangeMin && inRangeMax) ?
                                            '' : `( ${minRange} - ${maxRange} )`;
                                        sub.text(text);


                                        //避免更新太頻繁LAG
                                        var action = () => {
                                            newDataObj = getNewData({ normalize: normalize, yAxis_domain: yAxis_domain, xAxis_domainObj: xAxis_domainObj });
                                            updateChart();
                                            updateStaionDropDownMenu();
                                        }
                                        updateHandler(action);

                                    });
                                // reset button
                                xAxisName_radioGroup.selectAll('button[name ="rangeReset"]')
                                    .on('click', e => {
                                        // console.debug(e.target.parentNode);
                                        // distRange_slider.setValue([10, 100]);
                                        let key = e.target.value;
                                        let rangeData = rangeObj[key];
                                        let parentNode = e.target.parentNode;

                                        parentNode.querySelector('#' + key + 'Range_min').value = rangeData[0];
                                        parentNode.querySelector('#' + key + 'Range_max').value = rangeData[1];
                                        chartContainerD3.selectAll('#' + key + 'Range_min').dispatch("input");

                                    })
                            })


                        //=====change normalize
                        chartContainerD3.selectAll('#normalize')
                            .on('change', e => {
                                loadingEffect('show');
                                // console.debug(e.target.checked);
                                normalize = e.target.checked;
                                newDataObj = getNewData({ normalize: normalize, yAxis_domain: yAxis_domain, xAxis_domainObj: xAxis_domainObj });
                                // console.debug(xAxis_domainObj);

                                updateChart();

                            });
                        chartContainerD3.selectAll('#normalizeScale')
                            .on('input', e => {

                                // console.debug(e.target);
                                if (!isNaN(e.target.value)) {

                                    loadingEffect('show');
                                    var action = () => {
                                        normalizeScale = e.target.value;
                                        updateChart();
                                    }
                                    updateHandler(action);
                                }
                                else
                                    e.target.value = normalizeScale;


                            });



                    };
                    function keyboardEvent() {
                        let hotkeyPressFlag = true;//avoid from trigger event too often

                        let staionMenu = chartContainerD3.selectAll('#displayMenu');//for check display

                        d3.select(window)
                            .on("keydown", (e) => {
                                if (!hotkeyPressFlag) return;
                                // console.debug(e.code)

                                //==翻頁快捷鍵
                                if (e.code == 'KeyA' || e.code == 'KeyD') {
                                    let tooltipIsShow = tooltip.style('display') == 'inline';
                                    let staionMenuIsShow = staionMenu.classed('show');
                                    // console.debug(staionMenuIsShow)

                                    let updatePage;
                                    if (tooltipIsShow) {
                                        updatePage = (nextPage) => {
                                            //頁數超出範圍要修正,否則刷新tooltip
                                            currentPage = nextPage ? currentPage + 1 : currentPage - 1;
                                            if (currentPage < 0) currentPage = 0;
                                            else if (currentPage > totalPages) currentPage = totalPages;
                                            else updateTooltip();
                                        }
                                    }
                                    else if (staionMenuIsShow) {
                                        let pageController = staionDropDownMenu.select('.pageController');
                                        updatePage = (nextPage) => {
                                            let button = nextPage ? '.nextPage' : '.prePage';
                                            pageController.select(button).dispatch('click');

                                        }
                                    }
                                    else return;//都沒顯示不作分頁控制

                                    switch (e.code) {
                                        case 'KeyA'://press a
                                            updatePage(false);
                                            break;
                                        case 'KeyD'://press d
                                            updatePage(true);
                                            break;
                                    }


                                }
                                //== selectMode 開關
                                else if (e.code == 'KeyS') {
                                    let selectMode_ckb = chartContainerD3.selectAll("#staionSelectMode");
                                    let selectMode_checked = selectMode_ckb.property('checked');
                                    selectMode_ckb.property('checked', !selectMode_checked);
                                    selectMode_ckb.dispatch("change");
                                }


                                hotkeyPressFlag = false;
                                d3.timeout(() => hotkeyPressFlag = true, 10);
                            })

                    };

                    chartOptionEvent();
                    pathEvent();
                    keyboardEvent();
                };
                svg.call(events);


                return svg.node();
            }
            async function printChart() {
                chartContainerJQ.find('#distRange_slider').remove();
                chartContainerJQ.find('#azRange_slider').remove();
                chartContainerJQ.find('#displayDropDownMenu>.stations').children().remove();
                chartContainerJQ.find('#normalize').prop("checked", true);
                chartContainerJQ.find('#normalizeScale').prop('disabled', false);
                chartContainerJQ.find('#charts').children().remove();

                var i = 1;

                var getChartMenu = () => {
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
                            let svgArr = [];
                            let svg = chartContainerJQ.find("#" + $(e.target).parents('.chart')[0].id).children('svg')[0];
                            svgArr.push(svg);
                            let xAxisName = document.querySelector('input[name ="xAxisName"]:checked').value;
                            let xAxisScale = document.querySelector('input[name ="xAxisScale"]:checked').value;
                            let referenceTime = stringObj.referenceTime;
                            let fileName = 'WF_by_' + xAxisName + (xAxisScale == 'band' ? '-sta' : '') + '_' + referenceTime + 'Z';
                            downloadSvg(svgArr, fileName, option);
                        });

                        li.append(item);
                        ul.append(li);
                    });
                    document.querySelector('#charts').append(div);
                    document.querySelector('#chart' + i).append(nav);
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

                    chartContainerJQ.find('.toggle-nav').off('click');
                    chartContainerJQ.find('.toggle-nav').click(function (e) {
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
                    // console.debug(chartContainerJQ.find(".toggle-nav"));
                    $('body').off('click');
                    $('body').click(function (e) {
                        chartContainerJQ.find(".toggle-nav").each((i, d) => {
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
                var downloadSvg = (svgArr, fileName, option) => {

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

                        var svgWidth = svgArr[0].viewBox.baseVal.width;
                        var svgHeight = svgArr[0].viewBox.baseVal.height * svgArr.length;
                        var canvasWidth, canvasHeight;
                        //檢視時縮放,下載時放大
                        if (resize) {
                            var windowW = window.innerWidth;//获取当前窗口宽度 
                            var windowH = window.innerHeight;//获取当前窗口高度 

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
                        // $('#bigimg').attr("src", img);//设置#bigimg元素的src属性 
                        // $('#gameOuter').fadeIn("fast");//淡入显示#outerdiv及.pimg 
                        // $('#gameOuter').off('click');
                        // $('#gameOuter').click(function () {//再次点击淡出消失弹出层 
                        //     $(this).fadeOut("fast");
                        // });
                        let gameOuter = $('#gameOuter');

                        gameOuter.fadeIn("fast");//淡入显示#outerdiv及.pimg 
                        gameOuter.off('click');
                        gameOuter.click(function (e) {//再次点击淡出消失弹出层 
                            if (e.target.id != 'gameOuter') return;
                            $(this).fadeOut("fast");
                            $(originParent).children('svg').remove();
                            originSvg.removeAttribute('width');
                            originSvg.removeAttribute('height');
                            originParent.append(originSvg);
                        });

                        let originSvg = svgArr[0];
                        let originParent = originSvg.parentNode;
                        let cloneSvg = originSvg.cloneNode(true);
                        originSvg.setAttribute('width', width);
                        originSvg.setAttribute('height', height);
                        document.querySelector('#innerdiv').append(originSvg);
                        originParent.append(cloneSvg);

                    }


                    if (option == 'svg') {
                        //==============merge svg
                        var newSvg = document.createElement('svg');


                        svgArr.forEach(queryStr => {
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
                        var imageHeight = canvas.height / svgArr.length;


                        svgArr.forEach((queryStr, index) => {
                            var svgNode = $(queryStr)[0];
                            var svgUrl = getSvgUrl(svgNode);
                            var image = new Image();
                            image.src = svgUrl;
                            image.onload = () => {
                                context.drawImage(image, 0, index * imageHeight, imageWidth, imageHeight);

                                //done drawing and output
                                if (index == svgArr.length - 1) {
                                    var imgUrl;
                                    if (option == 'bigimg') {
                                        show(imageWidth, imageHeight);
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
                let xAxisName = document.querySelector('input[name ="xAxisName"]:checked').value;
                let xAxisScale = document.querySelector('input[name ="xAxisScale"]:checked').value;

                // console.debug(xAxisName, xAxisScale)
                getChartMenu();

                data = await data;//等data處理完才能畫圖
                chartContainerJQ.find('#chart' + i).append(WD_Charts(xAxisScale, xAxisName));
                MenuEvents();
            };
        }

        var mapObj;
        var stationDataArr, geoJSON;//==data

        function initMap() {
            //Append to the object constructor function so you can only make static calls
            Object.merge2 = function (obj1, obj2) {
                for (var attrname in obj2) {
                    obj1[attrname] = obj2[attrname];
                }
                //Returning obj1 is optional and certainly up to your implementation
                return obj1;
            };


            const esriMap = {
                attr: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
                url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            };
            const esriObj = L.tileLayer(esriMap.url, {
                maxZoom: 15,
                attribution: esriMap.attr,
            });

            // control that shows state info on hover
            const infoObj = Object.merge2(L.control(), {
                onAdd: function (mapObj) {
                    this._div = L.DomUtil.create('div', 'info');
                    this._div.id = 'cityName';
                    this.update();
                    return this._div;
                },
                update: function (props) {
                    this._div.innerHTML = (props ?
                        '<b>' + props.name + '</b><br />'
                        : 'Hover over a city or county');
                }
            });
            mapObj = L.map('bigMap', {
                center: [23.58, 120.58],
                zoom: 8,
                minZoom: 7,
                maxZoom: 10,
                maxBounds: [[25.100523, 116.257324], [22.024546, 125.793457]],
                zoomControl: false,
                attributionControl: false,
            });

            // console.debug(L.control['layers']());
            esriObj.addTo(mapObj);
            infoObj.addTo(mapObj);
            async function addCounty() {

                geoJSON = await $.ajax({
                    url: "../data/json/twCounty.json",
                    dataType: "json",
                    async: true,
                    // success: function (d) { console.debug(d); },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error(jqXHR, textStatus, errorThrown);
                    },
                });
                const countyObj = L.geoJSON(geoJSON, {
                    fillColor: '#006000',
                    weight: 1,
                    opacity: 10,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.3,
                    // onEachFeature: onEachFeature,
                    pane: 'overlayPane',
                })
                countyObj.addTo(mapObj);

                // console.debug(geoJSON);


            };
            async function addStation() {
                stationDataArr = await $.ajax({
                    url: "../src/php/getStation.php",
                    data: { whereStr: 1 },
                    method: 'POST',
                    dataType: 'json',
                    async: true,
                    success: function (d) {
                        console.debug(d);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error(jqXHR, textStatus, errorThrown);
                    },
                });

                stationDataArr.forEach((d, i) => {

                    d['liberate'] = false;//==用來判斷是否已經贏過

                    let marker = L.marker(d['coordinate'], {
                        pane: 'markerPane',
                        data: d,
                        // bubblingMouseEvents: true,
                    }).on('click', function (e) {
                        // console.debug(d['liberate']);
                        if (d['liberate']) return;//==已經贏過,不能在玩一次
                        gameStart('defend', marker);
                    });

                    let markerHint = "<b><font size='5'>" + d['station'] + "</font><br>";
                    marker.bindTooltip(markerHint, {
                        direction: 'top',
                        // permanent: true,
                        className: 'station-tooltip',
                    });

                    updateStation(marker);
                    marker.addTo(mapObj);
                });

            }

            addStation();
            // addCounty();


            mapObj.on('click', function (e) {
                // console.debug('BBB');
                // console.debug(this);
                // L.popup()
                //     .setLatLng(e.latlng)
                //     .setContent("<b><font size='3'>" + String(e.latlng) + "</b></font>")
                //     .openOn(mapObj);
            });

        };

        function updateStation(stationMarker, liberate = false, radius = 0) {

            const IconClass = L.Icon.extend({
                options: {
                    tooltipAnchor: [0, -25],
                    className: 'station-icon',
                }
            });
            var foeIconUrl = '../data/pic/foeIcon.png';
            var playerIconUrl = '../data/pic/playerIcon.png';
            var circleAnime = (circleObj, originalRadius, duration = 500) => {
                // console.debug(circleObj, originalRadius);
                const delay = 10;
                const animePart = 3;//3個步驟：變大>變小>原來大小
                const eachPartStep = parseInt((duration / animePart) / delay);
                const radiusChange = originalRadius / eachPartStep;

                let radius = 0, step = 0;
                let interval = setInterval(() => {

                    let part = parseInt(step / eachPartStep);

                    switch (part) {
                        case 0:
                            radius += radiusChange;
                            break;
                        case 1:
                            radius -= (radiusChange * 0.5);
                            break;
                        case 2:
                            radius += (radiusChange * 0.5);
                            break;
                        case 3://＝＝＝回復原來大小並停止
                            radius = originalRadius;
                            clearInterval(interval);
                            break;
                    }
                    circleObj.setRadius(radius);
                    step++;

                }, delay);

            };
            var iconAnime = (marker, iconUrl, duration = 600) => {
                const delay = 10;
                const originalIconSize = 60;
                const animePart = 2;//2個步驟：變大>原來大小
                const eachPartStep = parseInt((duration / animePart) / delay);
                const sizeChange = originalIconSize / eachPartStep * animePart;

                let size = 0, step = 0;
                let interval = setInterval(() => {

                    let part = parseInt(step / eachPartStep);

                    switch (part) {
                        case 0:
                            size += sizeChange;
                            break;
                        case 1:
                            size -= (sizeChange * 0.5);
                            break;
                        case 2://＝＝＝回復原來大小並停止
                            size = originalIconSize;
                            clearInterval(interval);
                            break;
                    };

                    marker.setIcon(new IconClass({
                        iconUrl: iconUrl,
                        iconSize: [size, size],
                        iconAnchor: [size / 2, size / 2],
                    }));
                    step++;

                }, delay);

            };
            // console.debug(stationMarker.options.data);

            if (liberate) {
                let data = stationMarker.options.data;
                let circleObj = L.circle(data['coordinate'], {
                    className: 'station-circle',
                }).addTo(mapObj);

                iconAnime(stationMarker, playerIconUrl);
                circleAnime(circleObj, radius);
            }
            else
                iconAnime(stationMarker, foeIconUrl);



        };



        //===when  map clicked 
        async function gameStart(gameMode, stationMarker = null) {
            // console.debug(gameMode, stationMarker);
            const gameOuterDiv = document.querySelector('#gameOuter');
            const gameDiv = gameOuterDiv.querySelector('#gameMain');
            var gameDisplay = (display) => {
                let value = display ? 'inline' : 'none';
                gameOuterDiv.style.display = value;
            }
            gameDisplay(true);

            const gameBox = gameDiv.getBoundingClientRect();
            const stationData = stationMarker.options.data;
            switch (gameMode) {
                case 'defend':

                    function defendGame(station, timeRemain = 5000, resolve) {
                        // console.debug(station)
                        const assetsDir = '../data/assets/';
                        const width = gameBox.width, height = gameBox.height;
                        // const center = [width];

                        var config = {
                            parent: 'gameMain',
                            type: Phaser.AUTO,
                            width: width,
                            height: height,
                            physics: {
                                default: 'arcade',
                                arcade: {
                                    gravity: { y: 300 },
                                    debug: false
                                }
                            },
                            scene: {
                                preload: preload,
                                create: create,
                                update: update
                            }
                        };

                        var game = new Phaser.Game(config);
                        var player, stars, cursors;
                        var playerStats = {
                            movementSpeed: 500,
                            jumpingPower: 400,
                        };

                        var platforms;
                        var gameOver = false, gameResult = {},
                            gameTimer = null, timerText = null;



                        function preload() {
                            this.load.image('sky', assetsDir + 'sky.png');
                            this.load.image('ground', assetsDir + 'platform.png');
                            this.load.image('star', assetsDir + 'star.png');
                            this.load.image('bomb', assetsDir + 'bomb.png');
                            this.load.spritesheet('dude',
                                assetsDir + 'dude.png',
                                { frameWidth: 32, frameHeight: 48 }
                            );

                        };

                        function create() {
                            var initEnvironment = () => {

                                let bgImg = this.add.image(width * 0.5, height * 0.5, 'sky');
                                bgImg.setScale(width / bgImg.width, height / bgImg.height);



                                platforms = this.physics.add.staticGroup();

                                platforms.create(width * 0.5, height * 0.95, 'ground').setScale(3).refreshBody();

                                // platforms.create(width * 0.5, 400, 'ground');
                                // platforms.create(50, 250, 'ground');
                                // platforms.create(750, 220, 'ground');
                            };
                            var initPlayer = () => {
                                player = this.physics.add.sprite(100, 450, 'dude');

                                // player.setBounce(0.2);
                                player.setCollideWorldBounds(true);
                                player.body.setGravityY(500);

                                this.anims.create({
                                    key: 'left',
                                    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
                                    frameRate: 10,
                                    repeat: -1
                                });

                                this.anims.create({
                                    key: 'turn',
                                    frames: [{ key: 'dude', frame: 4 }],
                                    frameRate: 20
                                });

                                this.anims.create({
                                    key: 'right',
                                    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
                                    frameRate: 10,
                                    repeat: -1
                                });
                            };
                            var initStars = () => {
                                stars = this.physics.add.group({
                                    key: 'star',
                                    repeat: 0,
                                    setXY: { x: width * 0.9, y: 0, stepX: 70 }
                                });

                                stars.children.iterate(function (child) {
                                    //  Give each star a slightly different bounce
                                    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.5));
                                });

                                // console.debug(stars);
                            };
                            var initTimer = () => {
                                timerText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#000' });
                            }
                            initEnvironment();
                            initPlayer();
                            initStars();
                            initTimer();

                            var collectStar = (player, star) => {
                                star.disableBody(true, true);

                                //==勝利,清除計時
                                gameOver = true;
                                gameTimer.remove();
                                gameResult.liberate = true;
                            };
                            //collider
                            this.physics.add.collider(player, platforms);
                            this.physics.add.collider(stars, platforms);
                            this.physics.add.overlap(player, stars, collectStar, null, this);


                            // cursors = this.input.keyboard.createCursorKeys();
                            cursors = this.input.keyboard.addKeys('w,s,a,d');

                            //==計時,時間到則失敗
                            gameTimer = this.time.delayedCall(timeRemain, () => {
                                gameOver = true;
                                gameResult.liberate = false;
                            }, [], this);
                        };

                        function update() {


                            var updatePlayer = () => {
                                let speed = playerStats.movementSpeed;
                                let jump = playerStats.jumpingPower;

                                if (cursors.a.isDown) {
                                    player.setVelocityX(-speed);

                                    player.anims.play('left', true);
                                }
                                else if (cursors.d.isDown) {
                                    player.setVelocityX(speed);

                                    player.anims.play('right', true);
                                }
                                else {
                                    player.setVelocityX(0);

                                    player.anims.play('turn');
                                }

                                if (cursors.w.isDown && player.body.touching.down) {
                                    player.setVelocityY(-jump);
                                }
                            };
                            var updateTimer = () => {
                                let text = 'TimeLeft : ' +
                                    ((timeRemain - gameTimer.getElapsed()) / 1000).toFixed(2) + ' s';
                                timerText.setText(text);
                            };
                            updatePlayer();
                            updateTimer();
                            // console.debug(gameTimer.getOverallProgress());


                            if (gameOver) {
                                game.destroy(true, false);
                                gameDisplay(false);
                                resolve(gameResult);
                            }
                        };


                    }

                    let gameResult = await new Promise((resolve, reject) => {
                        defendGame(stationMarker, 5000, resolve);
                    });

                    console.debug(gameResult);

                    // let gameResult = false;
                    if (gameResult.liberate) {
                        stationData['liberate'] = true;
                        radius = (stationDataArr.indexOf(stationData) + 1) * 30000;
                        updateStation(stationMarker, true, radius);
                    }
                    else {
                        updateStation(stationMarker);
                    }



                    break;
                case 'dig':

                    break;
            };




        }



        //===init once

        if (!(chartContainerJQ.find('#form-game').length >= 1)) {
            initForm();
        };
        initMap();
        // gameStart('defend');
    }
    return game;
}