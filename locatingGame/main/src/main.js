function locatingGame() {
    var selector = 'body';
    var data;
    // var stringObj;

    //Append to the object constructor function so you can only make static calls
    // Object.merge2 = function (obj1, obj2) {
    //     for (var attrname in obj2) {
    //         obj1[attrname] = obj2[attrname];
    //     }
    //     //Returning obj1 is optional and certainly up to your implementation
    //     return obj1;
    // };

    game.selector = (value) => {
        selector = value;
        return game;
    };
    game.dataDir = (value) => {
        const event = '2010.166';//之後能選
        const eventCatlog = (value ? value : '../data/datafile/event/') + event + '/';
        const channel = ['BHE', 'BHN', 'BHZ'];//不一定BH的話還要有檔案得到
        const fileExtension = '.xy';

        //==異步讀檔,回傳一個promise而非結果
        var readTextFile = (filePath, fileDataKey) => {
            // console.debug(fileDataKey);
            var tmpData = [];

            var pushData;
            if (fileDataKey.length > 1) {//一行有兩列以上的資料則作物件陣列
                pushData = (row) => {
                    var col = row.trim().split(/\s+/);
                    // console.debug(col);
                    let obj = {};
                    col.forEach((c, index) => obj[fileDataKey[index]] = (isNaN(c) ? c : parseFloat(c)));
                    tmpData.push(obj);
                }
            }
            else {//一行有一列直接作數值陣列
                pushData = (row) => {
                    tmpData.push(isNaN(row) ? row : parseFloat(row));
                }
            }

            return new Promise((resolve, reject) => {
                var rawFile = new XMLHttpRequest();
                rawFile.open("GET", filePath, true);
                // rawFile.open("GET", filePath, false);
                rawFile.onreadystatechange = function () {
                    if (rawFile.readyState === 4) {
                        if (rawFile.status === 200 || rawFile.status == 0) {
                            var rows = rawFile.responseText.split("\n");
                            rows.forEach(row => {
                                if (row != '') {
                                    pushData(row);
                                }
                            })
                            // var fileName = filePath.substring(
                            //     filePath.lastIndexOf('/') + 1,
                            //     filePath.indexOf(fileExtension));
                            // var fileData = { fileName: fileName, data: tmpData };
                            resolve(tmpData);
                        }
                        else {
                            // reject(new Error(req))
                        }
                    }
                }
                rawFile.send(null);
            });

        };

        var ajaxReadFile = (dataObj) => {
            return $.ajax({
                url: dataObj.url ? dataObj.url : '',
                dataType: dataObj.dataType ? dataObj.dataType : 'text',
                async: dataObj.async == undefined ? true : dataObj.async,
                // success: function (d) { },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error(jqXHR, textStatus, errorThrown);
                },
            });
        };


        //===A.讀測站資料
        let stationData = new Promise((resolve, reject) =>
            ajaxReadFile({ url: eventCatlog + "station.csv" }).then(success => {
                // console.debug(success);
                let data;
                //A-1.===得測站和經緯度資料
                data = success.split("\n").map(row => {
                    let col = row.trim().split(',');
                    let sta = col[0].replace(new RegExp("'", "g"), '');
                    let coord = [parseFloat(col[1]), parseFloat(col[2])];
                    return { station: sta, coordinate: coord };
                });

                //A-2.===依個測站名稱得個分量xy陣列
                const dir = eventCatlog + 'xy/' + event;
                const fileDataKey = ['x', 'y'];
                data.map(async (d) => {
                    d.waveData =
                        Promise.all(
                            channel.map(async (cha) => {
                                let path = dir + '.' + d.station + '.' + cha + fileExtension;
                                return { channel: cha, data: await readTextFile(path, fileDataKey) };
                            })
                        );
                    return d;
                });
                resolve(data);
            })
        );

        //===B.讀震央資料
        let epicenterData = new Promise((resolve, reject) =>
            ajaxReadFile({ url: eventCatlog + "epicenter.csv" }).then(success => {
                // console.debug(success);
                let data;
                // const datakey = ['lat', 'lng', 'depth'];
                // let tmp = {};
                // success.split(',').map((d, i) => tmp[datakey[i]] = !isNaN(d) ? parseFloat(d) : d);
                // data = {
                //     coordinate: [tmp.lat, tmp.lng],
                //     depth: tmp.depth,
                // }

                let col = success.split(',');
                data = {
                    coordinate: [parseFloat(col[0]), parseFloat(col[1])],
                    depth: parseFloat(col[2]),
                }

                resolve(data);
            })
        );


        data = Promise.all([stationData, epicenterData]).then(sucess => {
            // console.debug(sucess);
            let tmp = sucess[0];
            tmp.epicenter = sucess[1];
            return tmp;
        });

        // console.debug(data);
        return game;
    };
    game.string = (value) => {
        // stringObj = value;
        return game;
    };

    async function game() {

        const chartContainerJQ = $(selector);
        const chartContainerD3 = d3.select(selector);

        //===append map,gameDiv..etc
        function initForm() {

            chartContainerJQ.append(`
                <form id="form-game">
                <div class="form-group" id="gameUI" style="display: inline;">
                    TimeLeft : <font size="5" class='timer'>0</font> ms
                </div> 
               
                <div class="form-group row" id="gameGroup">

                  
                    <div id="bigMap" class="col-12"></div>
                  
                 
                    <div id="gameOuter"  class="row">
                        <div id="gameMain"></div>                      
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

            if (data === undefined)
                game.dataDir();
        };
        //==之後作
        async function getWaveImg(stationData, timeDomain = null) {

            let waveData = await (stationData.waveData ? stationData.waveData : data[0].waveData);
            // console.debug(waveData);

            function getSvgUrlArr(data) {
                var getSvgObj = (d, axisSvg = false) => {
                    var svgObj = {};

                    const chaData = d.data;
                    const getColor = () => {
                        let index = data.indexOf(d);
                        let color;
                        switch (index % 3) {
                            case 0:
                                color = "steelblue";
                                break;
                            case 1:
                                color = "red";
                                break;
                            case 2:
                                color = "green";
                                break;
                            default:
                                color = "steelblue";
                                break;
                        }
                        return color;
                    };
                    const width = 800;
                    const height = 300;
                    const margin = { top: 30, right: 30, bottom: 40, left: 30 };
                    const svg = d3.create("svg")
                        .attr("viewBox", [0, 0, width, height]);
                    const xAxis = svg.append("g").attr("class", "xAxis");
                    // const yAxis = svg.append("g").attr("class", "yAxis");
                    const pathGroup = svg.append("g").attr('class', 'paths');

                    function getChart() {
                        function getNewData() {
                            let timeArr = chaData.map(d => d.y);
                            let i1 = d3.bisectCenter(timeArr, yAxis_domain[0]);
                            let i2 = d3.bisectCenter(timeArr, yAxis_domain[1]) + 1;//包含最大範圍
                            newData.forEach(d => d[dataKeys[3]] = d[dataKeys[3]].slice(i1, i2));
                            newTimeArr = timeArr.slice(i1, i2);
                        };
                        function getSvgUrl(svgNode) {
                            let svgData = (new XMLSerializer()).serializeToString(svgNode);
                            let svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                            let svgUrl = URL.createObjectURL(svgBlob);
                            return svgUrl;
                        };

                        let newData = timeDomain ? getNewData(chaData) : chaData;

                        let x = d3.scaleLinear()
                            .domain(d3.extent(newData.map(d => d.x)))
                            .range([margin.right, width - margin.left]);


                        var updateAxis = () => {
                            var makeXAxis = g => g
                                // .style('font', '20px sans-serif')
                                .style('font', 'italic small-caps bold 20px/2 cursive')

                                .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
                                .call(g => g.append('text')
                                    .attr('fill', '#FBFBFF')
                                    .attr("font-weight", "bold")
                                    .attr("textLength", "150")
                                    .attr("lengthAdjust", "spacingAndGlyphs")
                                    .attr('stroke', 'grey')
                                    .attr("stroke-width", "0.5px")
                                    .attr('x', width / 2)
                                    .attr("y", margin.bottom)
                                    .text('Time(s)')
                                )
                                .call(g => g.selectAll('path,line')
                                    // .attr("stroke", "red")
                                    .attr("stroke-width", "5px")
                                    .attr("shape-rendering", "crispEdges")

                                )
                            // .call(g => g.select('text'))

                            xAxis.call(makeXAxis);



                        }
                        var updatePaths = () => {

                            let y = d3.scaleLinear()
                                .domain(d3.extent(newData.map(d => d.y)))
                                .range([height, 0]);

                            var line = d3.line()
                                .defined(d => !isNaN(d.x))
                                .x(d => x(d.x))
                                .y(d => y(d.y));


                            var makePaths = pathGroup => pathGroup
                                .append("path")
                                .style("mix-blend-mode", "luminosity")
                                .attr("fill", "none")
                                .attr("stroke-width", 2)
                                .attr("stroke-linejoin", "bevel")//arcs | bevel |miter | miter-clip | round
                                .attr("stroke-linecap", "butt")//butt,square,round
                                .attr("stroke-opacity", 0.9)
                                .attr("stroke", getColor(d))
                                .attr("d", line(newData))


                            pathGroup.call(makePaths);

                        };
                        if (axisSvg) {
                            updateAxis();
                            Object.assign(svgObj, {
                                x: x,
                                margin: margin,
                            });
                        }
                        else
                            updatePaths();

                        svgObj.svg = getSvgUrl(svg.node());

                    };

                    getChart();
                    return svgObj;
                }



                //==get ENZ channel svg
                let svgArr = data.map(d => Object.assign({ svgName: d.channel }, getSvgObj(d)));
                //==get xAxis svg
                svgArr.push(Object.assign({ svgName: 'xAxis' }, getSvgObj(data[0], true)));
                // console.debug(svgArr);
                return svgArr;
            };

            var SvgUrlArr = getSvgUrlArr(waveData);
            // console.debug(SvgUrlArr);
            return SvgUrlArr;
        };

        function gameGenerate() {
            const gameOuterDiv = document.querySelector('#gameOuter');
            const gameDiv = gameOuterDiv.querySelector('#gameMain');
            const gameUI = document.querySelector('#gameUI');

            var mapObj;
            var geoJSON;//===location data
            var GameData = null;

            var testArr;//==get markerData for debug

            function initGameData() {
                GameData = {
                    timeRemain: 500000,
                    controllCursor: [],
                    playerStats: GameObjectStats.player['mage'],

                }
            };
            function initMap() {

                function init() {
                    mapObj = L.map('bigMap', {
                        center: [23.58, 120.58],
                        zoom: 8,
                        minZoom: 7,
                        maxZoom: 10,
                        maxBounds: [[25.100523, 116.257324], [22.024546, 125.793457]],
                        zoomControl: false,
                        attributionControl: false,
                    });

                    const esriMap = {
                        attr: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
                        url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                    };

                    // esri map layer
                    L.tileLayer(esriMap.url, {
                        maxZoom: 15,
                        attribution: esriMap.attr,
                    }).addTo(mapObj);

                    // control that shows state info on hover
                    Object.assign(L.control(), {
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
                    }).addTo(mapObj);


                };
                async function addCounty() {

                    geoJSON = await $.ajax({
                        url: "../data/datafile/twCounty.json",
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
                    // console.debug(data);

                    var getRandom = (x) => {
                        return Math.floor(Math.random() * x);
                    };

                    const backgroundArr = Object.keys(BackGroundResources);
                    let markerArr = [],
                        circleArr = [];

                    data.forEach((d, i) => {
                        // console.debug(d);
                        let enemy = ['dog', 'cat'];//==之後隨機抽敵人組
                        // let enemy = ['cat'];//==之後隨機抽敵人組
                        let enemyStats = {};


                        enemy.forEach((key) => {
                            let gameObj = GameObjectStats.creature[key];
                            let tmp = Object.assign(gameObj, {
                                maxHP: gameObj.HP,
                                active: false,//=狗開始追...（爲true後永遠爲true）
                            });
                            enemyStats[key] = JSON.parse(JSON.stringify(tmp));//==深拷貝不然每個測站共用
                        });
                        // console.debug(enemyStats);

                        let background = backgroundArr[getRandom(backgroundArr.length)];
                        // console.debug(background);

                        d['stationStats'] = {
                            liberate: false,
                            enemyStats: enemyStats,
                            background: background,
                        };//==遊戲資料：liberate用來判斷是否已經贏過

                        //===station icon
                        let marker = L.marker(d['coordinate'], {
                            pane: 'markerPane',
                            data: d,
                            // bubblingMouseEvents: true,
                        }).on('click', function (e) {
                            // console.debug(d['liberate']);
                            // if (d['liberate']) return;//==已經贏過,不能在玩一次
                            gameStart('defend', marker);
                        });

                        let markerHint = "<b><font size='5'>" + d['station'] + "</font><br>";
                        marker.bindTooltip(markerHint, {
                            direction: 'top',
                            // permanent: true,
                            className: 'station-tooltip',
                        });

                        //===station circle
                        let circle = L.circle(d['coordinate'], {
                            className: 'station-circle',
                            radius: 0,
                        });

                        d['circleObj'] = circle;

                        markerArr.push(marker);
                        circleArr.push(circle);
                        updateStation(marker, { icon: 'foe' });

                        // console.debug(d);
                    });

                    L.layerGroup(markerArr, { key: 'markerGroup' }).addTo(mapObj);
                    L.layerGroup(circleArr, { key: 'circleGroup' }).addTo(mapObj);
                    // new L.layerGroup(markerArr).addTo(mapObj);
                    // let markerLayerGroupIdx = Object.keys(mapObj._layers).filter(i => mapObj._layers[i].options['key'] == 'markerGroup')[0];
                    // console.debug(mapObj._layers);
                    testArr = markerArr;

                    //＝＝test 震央
                    let size = 60;
                    L.marker(data.epicenter['coordinate'], {
                        icon: L.icon({
                            iconUrl: '../data/assets/icon/star.png',
                            iconSize: [size, size],
                            iconAnchor: [size / 2, size / 2],
                        }),
                        pane: 'markerPane',
                        data: data.epicenter,
                        // bubblingMouseEvents: true,
                    })
                        // .bindTooltip("<b><font size='5'>epicenter</font><br>", {
                        //     direction: 'top',
                        //     // permanent: true,
                        //     className: 'station-tooltip',
                        // })
                        .addTo(mapObj);
                    //＝＝test 震央

                };
                async function addUI() {

                    updateMapUI({ timeRemain: GameData.timeRemain }, 800);

                };
                init();
                addStation();
                // addCounty();
                addUI();

                mapObj.on('click', function (e) {
                    // console.debug('BBB');
                    // console.debug(this);
                    // L.popup()
                    //     .setLatLng(e.latlng)
                    //     .setContent("<b><font size='3'>" + String(e.latlng) + "</b></font>")
                    //     .openOn(mapObj);
                });

            };

            function updateStation(stationMarker, updateObj = {}) {

                const IconClass = L.Icon.extend({
                    options: {
                        tooltipAnchor: [0, -25],
                        className: 'station-icon',
                    }
                });
                const foeIconUrl = '../data/assets/icon/home.png';
                const playerIconUrl = '../data/assets/icon/playerIcon.png';
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
                    const originalIconSize = 40;
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

                liberate = false, radius = 0

                if (stationMarker) {
                    if (updateObj.icon) {
                        let icon;
                        switch (updateObj.icon) {
                            case 'foe':
                                icon = foeIconUrl;
                                break;
                            case 'player':
                                icon = playerIconUrl;
                                break;
                        };
                        iconAnime(stationMarker, icon);

                    };
                    if (!isNaN(updateObj.circleRadius)) {
                        let data = stationMarker.options.data;
                        let circleObj = data.circleObj;
                        circleAnime(circleObj, updateObj.circleRadius);
                    };

                };

            };
            function updateMapUI(gameResult, duration = 600) {
                let timeRemain = gameResult.timeRemain;
                let playerStats = gameResult.playerStats;


                GameData.timeRemain = timeRemain;
                GameData.playerStats = Object.assign(GameData.playerStats, playerStats);

                const timer = gameUI.querySelector('.timer');

                const start = parseInt(timer.innerHTML),
                    end = parseInt(timeRemain);
                const increase = start > end ? false : true;

                var timerAnime = (increase) => {
                    const delay = 10;
                    const sign = increase ? 1 : -1;
                    const step = sign * Math.abs(start - end) / (duration / delay);

                    // console.debug(step);

                    var now = start;
                    let interval = setInterval(() => {
                        if ((now - end) * sign > 0) {
                            now = end;
                            clearInterval(interval);
                        }
                        timer.innerHTML = parseInt(now);
                        now += step;
                    }, delay);

                };
                timerAnime(increase);
            };


            //===when  map clicked 
            async function gameStart(gameMode, stationMarker = null) {
                // console.debug(gameMode, stationMarker);

                var gameDisplay = (display) => {
                    let value = display ? 'inline' : 'none';
                    gameOuterDiv.style.display = value;
                };


                gameDisplay(true);
                const gameBox = gameDiv.getBoundingClientRect();
                const width = gameBox.width, height = gameBox.height;

                let gameResult;

                switch (gameMode) {
                    case 'defend':
                        let stationData = stationMarker ?
                            stationMarker.options.data :
                            testArr[0].options.data;//test

                        let waveSvgArr = await getWaveImg(stationData);
                        // console.debug(waveSvgArr);

                        gameResult = await new Promise((resolve, reject) => {
                            const config = {
                                parent: 'gameMain',
                                type: Phaser.AUTO,
                                width: width,
                                height: height,
                                physics: {
                                    default: 'arcade',
                                    arcade: {
                                        gravity: { y: 300 },
                                        debug: true,
                                    }
                                },
                                scene: new DefendScene(stationData, GameData, {
                                    waveSvgArr: waveSvgArr,
                                    getWaveImg: getWaveImg,
                                    resolve: resolve,
                                }),
                            };
                            new Phaser.Game(config);

                        });
                        gameDisplay(false);
                        console.debug(gameResult);
                        let stationInfo = gameResult.stationInfo;
                        let playerInfo = gameResult.playerInfo;

                        //===update icon
                        if (stationInfo.liberate && !stationData.stationStats.liberate)
                            updateStation(stationMarker, { icon: 'player' });
                        else if (!stationInfo.liberate)
                            updateStation(stationMarker, { icon: 'foe' });

                        //===update circle
                        let timePoint1 = stationInfo.orbStats[0].timePoint;
                        let timePoint2 = stationInfo.orbStats[1].timePoint;
                        let allOrbActived = timePoint1.isInRange && timePoint2.isInRange;


                        if (allOrbActived) {
                            let timeGap = Math.abs(timePoint1.time - timePoint2.time);

                            //距離=時間*速度(目前先用7.5),km換算成m;
                            let radius = timeGap * 7.5 * 1000;

                            //==半徑跟之前一樣不作動畫
                            let pre_radius = stationMarker.options.data.circleObj.getRadius();
                            if (radius != pre_radius)
                                updateStation(stationMarker, { circleRadius: radius });
                        }
                        else {
                            updateStation(stationMarker, { circleRadius: 0 });
                        }



                        //===更新測站情報
                        Object.assign(stationData.stationStats, stationInfo);

                        //===更新人物資料
                        updateMapUI(playerInfo, 1000);

                        break;
                    case 'dig':

                        break;
                };


            };


            initGameData();
            initMap();
            // console.debug(data);
            gameStart('defend');
        };
        //===init once

        if (!(chartContainerJQ.find('#form-game').length >= 1)) {
            initForm();
        };
        data = await data;
        console.log(data);
        gameGenerate();

    };


    return game;
};