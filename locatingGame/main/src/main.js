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
                                .style("mix-blend-mode", "normal")
                                .attr("fill", "none")
                                .attr("stroke-width", 2)
                                .attr("stroke-linejoin", "bevel")//arcs | bevel |miter | miter-clip | round
                                .attr("stroke-linecap", "butt")//butt,square,round
                                .attr("stroke-opacity", 1)
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
                        // let enemy = ['dog', 'cat'];//==之後隨機抽敵人組
                        let enemy = ['cat'];//==之後隨機抽敵人組
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

                        d['gameData'] = {
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

                // console.debug(testArr);

                const gameBox = gameDiv.getBoundingClientRect();
                const stationData = stationMarker ?
                    stationMarker.options.data :
                    testArr[0].options.data;//test


                let gameResult;
                switch (gameMode) {
                    case 'defend':

                        // console.debug(waveSvgObjs);

                        function defendGame(stationData, playerData, waveSvgObjs, resolve) {
                            // console.debug(stationData);
                            const gameData = stationData.gameData;
                            const enemyStats = gameData.enemyStats;

                            const assetsDir = '../data/assets/';
                            const width = gameBox.width, height = gameBox.height;


                            var timeRemain = playerData.timeRemain;

                            class DefendScene extends Phaser.Scene {
                                constructor(stationData, playerData, waveSvgObjs, resolve) {
                                    super({ key: 'defend' });
                                    this.aliveEnemy = Object.keys(enemyStats).filter(enemy => enemyStats[enemy].HP > 0);
                                    this.background = gameData.background;

                                    Object.assign(this, {
                                        player: null,
                                        enemy: null,
                                        cursors: null,
                                        orbGroup: null,
                                        platforms: null,
                                        gameTimer: null,
                                        waveSvgObjs: waveSvgObjs,
                                        waveGameObjs: [],
                                        gameOver: false,
                                        getTimePoint: function (waveObjWidth, x) {
                                            let xAxisObj = this.waveSvgObjs.find(svg => svg.svgName == 'xAxis');
                                            let scaleFun = xAxisObj.x;
                                            let margin = xAxisObj.margin;

                                            let xAxisRange = [
                                                (width - waveObjWidth) * 0.5 + margin.right,
                                                (width + waveObjWidth) * 0.5 - margin.left,
                                            ];
                                            scaleFun.range(xAxisRange);
                                            // console.debug(scaleFun.range());
                                            let time = scaleFun.invert(x);
                                            let isInRange = (x >= xAxisRange[0] && x <= xAxisRange[1]);

                                            return {
                                                time: time,
                                                isInRange: isInRange,
                                            };

                                        },

                                    });
                                    console.debug(this);
                                }


                                preload() {
                                    const gameObjDir = assetsDir + 'gameObj/';
                                    var environment = () => {
                                        const envDir = gameObjDir + 'environment/';
                                        var station = () => {
                                            const dir = envDir + 'station/';
                                            this.load.image('station', dir + 'station.png');
                                            this.load.image('title', dir + 'title.png');

                                        }
                                        var platform = () => {
                                            const dir = envDir + 'platform/';
                                            this.load.image('ground', dir + 'platform.png');
                                        }
                                        var background = () => {

                                            const dir = envDir + 'background/' + this.background + '/';

                                            let resources = BackGroundResources[this.background];
                                            resources.static.concat(resources.dynamic).forEach(res => {
                                                this.load.image(res, dir + res);
                                            });


                                        }
                                        var instrument = () => {
                                            const dir = envDir + 'instrument/';
                                            this.load.spritesheet('instrument',
                                                dir + 'instrument.png',
                                                { frameWidth: 256, frameHeight: 256 }
                                            );
                                            this.load.spritesheet('laser',
                                                dir + 'laser.png',
                                                { frameWidth: 512, frameHeight: 682.6 }
                                            );

                                        }
                                        background();
                                        platform();
                                        station();
                                        instrument();
                                    };
                                    var player = () => {
                                        this.load.spritesheet('dude',
                                            gameObjDir + 'dude.png',
                                            { frameWidth: 32, frameHeight: 48 }
                                        );

                                    };
                                    var enemy = () => {
                                        if (gameData.liberate) return;
                                        // console.debug(this.aliveEnemy);
                                        this.aliveEnemy.forEach(enemy => {
                                            const dir = gameObjDir + enemy + '/';
                                            const frameObj = { frameWidth: 48, frameHeight: 48 };
                                            this.load.spritesheet(enemy + '_Attack', dir + 'Attack.png', frameObj);
                                            this.load.spritesheet(enemy + '_Death', dir + 'Death.png', frameObj);
                                            this.load.spritesheet(enemy + '_Hurt', dir + 'Hurt.png', frameObj);
                                            this.load.spritesheet(enemy + '_Idle', dir + 'Idle.png', frameObj);
                                            this.load.spritesheet(enemy + '_Walk', dir + 'Walk.png', frameObj);

                                        });


                                    };
                                    var wave = () => {
                                        this.waveSvgObjs.forEach(d => this.load.svg('wave_' + d.svgName, d.svg, { scale: 1 }));
                                    };
                                    environment();
                                    player();
                                    enemy();
                                    wave();

                                };
                                create() {


                                    /*
                                    Depth:
                                        0-4(background)
                                        5(wave)
                                        6(orbs)
                                        9(enemy)
                                        10(player,laser)
                                        11(orb pickUp)
                                        15(bullet)
                                        20(UI:HP bar...)
                                    */
                                    var initEnvironment = () => {
                                        // console.debug()
                                        var station = () => {
                                            let station = stationData.station;
                                            this.add.image(width * 0.92, height * 0.53, 'station')
                                                .setScale(1, 0.63)
                                                .setDepth(4);
                                            // this.add.image(width * 0.12, height * 0.53, 'title')
                                            //     .setScale(0.1, 0.15).setRotation(0.1).setPosition(width * 0.12, height * 0.53, 100, 100);
                                            this.add.text(width * 0.88, height * 0.46, station, { fontSize: '32px', fill: '#000' })
                                                .setRotation(-0.1).setOrigin(0.5, 0.5).setDepth(4);

                                            this.waveGameObjs = this.waveSvgObjs.map((d, i) => {

                                                let y;
                                                if (d.svgName != 'xAxis')
                                                    y = height * (0.15 + 0.25 * i);
                                                else
                                                    y = height * 1.15;

                                                return this.add.image(width * 0.5, y, 'wave_' + d.svgName).setDepth(5);
                                            });

                                            // this.add.image(width * 0.5, height * 0.5, 'wave_0')
                                            // this.add.image(width * 0.5, height * 0.3, 'wave_1')
                                            // this.add.image(width * 0.5, height * 0.1, 'wave_2')
                                        }
                                        var platform = () => {
                                            this.platforms = this.physics.add.staticGroup();
                                            this.platforms.create(width * 0.5, height * 0.95, 'ground')
                                                .setScale(3, 0.5).refreshBody().setOffset(30)
                                                .setDepth(3)
                                                .setName('platform');
                                        }
                                        var background = () => {

                                            let resources = BackGroundResources[this.background];
                                            resources.static.forEach((res, i) => {
                                                let img = this.add.image(width * 0.5, height * 0.5, res);
                                                img
                                                    .setScale(width / img.width, height / img.height)
                                                    .setDepth(resources.depth.static[i]);
                                            });

                                            let clouds = this.add.group();
                                            resources.dynamic.forEach((res, i) => {
                                                let cloud = clouds.create(width * 0.5, height * 0.5, res);
                                                cloud
                                                    .setScale(width / cloud.width, height / cloud.height)
                                                    .setDepth(resources.depth.dynamic[i]);
                                                //==custom
                                                cloud.firstLoop = true;
                                                cloud.targetIndex = i;
                                                cloud.movingDuration = Phaser.Math.Between(5, 20) * 1000;//==第一次移動5到20秒

                                            });
                                            // console.debug(clouds);  

                                            this.tweens.add({
                                                targets: clouds.getChildren(),
                                                repeat: -1,
                                                ease: 'Linear',
                                                duration: (target) => target.movingDuration,
                                                x: { start: width * 0.5, to: width * 1.5 },
                                                onRepeat: (tween, target) => {
                                                    if (target.firstLoop) {
                                                        Object.assign(tween.data[target.targetIndex], {
                                                            duration: target.movingDuration * 2,
                                                            start: -width * 0.5,
                                                        });
                                                        target.firstLoop = false;
                                                    }
                                                },
                                            });
                                        }
                                        var instrument = () => {
                                            // let instrument = this.physics.add.sprite(width * 0.1, height * 0.8, 'instrument')
                                            //     .setScale(0.3);
                                            const orbScale = 0.25;

                                            this.orbGroup = this.physics.add.group({
                                                key: 'instrument',
                                                repeat: 1,
                                                randomFrame: true,
                                                setScale: { x: orbScale, y: orbScale },
                                                setDepth: { value: 6 },
                                                // maxVelocityY: 0,
                                                // gravityX: 1000,
                                                // gravityY: -50,

                                            });
                                            // console.debug(orbGroup);
                                            var animsCreate = () => {
                                                this.anims.create({
                                                    key: 'orb_inactive',
                                                    frames: this.anims.generateFrameNumbers('instrument', { start: 1, end: 4 }),
                                                    frameRate: 5,
                                                    repeat: -1,
                                                    // repeatDelay: 500,
                                                });
                                                this.anims.create({
                                                    key: 'orb_holded',
                                                    frames: this.anims.generateFrameNumbers('instrument', { frames: [8, 9, 12] }),
                                                    frameRate: 5,
                                                    repeat: -1,
                                                    // repeatDelay: 500,
                                                });
                                                this.anims.create({
                                                    key: 'orb_activate',
                                                    frames: this.anims.generateFrameNumbers('instrument', { frames: [10, 11, 5, 6, 7] }),
                                                    frameRate: 5,
                                                    repeat: -1,
                                                    // repeatDelay: 500,
                                                });
                                                this.anims.create({
                                                    key: 'orb_laser',
                                                    frames: this.anims.generateFrameNumbers('laser'),
                                                    frameRate: 5,
                                                    repeat: -1,
                                                    // repeatDelay: 500,
                                                });

                                            };
                                            animsCreate();

                                            let orbStats = gameData.orbStats;
                                            // console.debug(orbStats);
                                            this.orbGroup.children.iterate((child, i) => {

                                                let activate, orbPosition;
                                                if (orbStats) {
                                                    activate = orbStats[i].timePoint.isInRange;
                                                    orbPosition = orbStats[i].postition;
                                                }
                                                else {
                                                    activate = false;
                                                    orbPosition = 875 + i * 15;
                                                }

                                                child.setPosition(orbPosition, height * 0.8);
                                                child.body.setSize(100, 100, true);
                                                child.play(activate ? 'orb_activate' : 'orb_inactive');

                                                //=====custom
                                                child.activateFlag = activate;
                                                child.statusHadler = function (pickUp, activate = true) {
                                                    // console.debug(this);
                                                    let newPlayerStats;

                                                    if (pickUp) {//pick up                         
                                                        this.body.setMaxVelocityY(0);
                                                        this.setDepth(11);
                                                        this.player.pickUpObj.anims.play('orb_holded', true);

                                                        //==撿起後角色屬性改變
                                                        newPlayerStats = {
                                                            movementSpeed: 300,
                                                            jumpingPower: 300,
                                                        };

                                                    }
                                                    else {//put down
                                                        this.body.setMaxVelocityY(1000);
                                                        this.setDepth(6);
                                                        this.player.pickUpObj.anims.play(activate ? 'orb_activate' : 'orb_inactive', true);

                                                        //==放下後角色屬性恢復
                                                        newPlayerStats = {
                                                            movementSpeed: playerData.playerStats.movementSpeed,
                                                            jumpingPower: playerData.playerStats.jumpingPower,
                                                        };
                                                    }

                                                    this.player.stats = Object.assign(this.player.stats, newPlayerStats);


                                                    this.activateFlag = activate;

                                                    // console.debug(playerStats);
                                                };
                                                //=laser
                                                child.laserObj =
                                                    this.physics.add.sprite(child.x, child.y + 20, 'laser')
                                                        .setAlpha(0.8)
                                                        .setScale(0.3, 1)
                                                        .setOrigin(0.5, 1)
                                                        .setDepth(10)
                                                        .setVisible(false);
                                                // console.debug(child.laserObj);

                                                child.laserObj.body
                                                    .setMaxVelocityY(0)
                                                    .setSize(50);

                                                //=time
                                                child.timeText = this.add.text(0, 0, '',
                                                    {
                                                        fontSize: '20px',
                                                        fill: '#A8FF24',
                                                    })
                                                    .setOrigin(0.5);



                                                //=====custom

                                                // console.debug(child.laserObj)
                                            });

                                            this.physics.add.collider(this.orbGroup, this.platforms);

                                        }
                                        background();
                                        platform();
                                        station();
                                        instrument();
                                    };

                                    var initPlayer = () => {

                                        var animsCreate = () => {
                                            this.anims.create({
                                                key: 'player_left',
                                                frames: this.anims.generateFrameNumbers('dude', { frames: [0, 1, 2, 3, 0] }),
                                                frameRate: 30,
                                                repeat: 0,
                                            });

                                            this.anims.create({
                                                key: 'player_turn',
                                                frames: [{ key: 'dude', frame: 4 }],
                                                frameRate: 20
                                            });

                                            this.anims.create({
                                                key: 'player_right',
                                                frames: this.anims.generateFrameNumbers('dude', { frames: [5, 6, 7, 8, 5] }),
                                                frameRate: 30,
                                                repeat: 0,
                                            });
                                        };
                                        animsCreate();

                                        this.player = this.physics.add.sprite(100, 450, 'dude');
                                        // player.setBounce(0.2);
                                        // player.setBounce(100, 0);
                                        this.player
                                            .setCollideWorldBounds(true)
                                            .setPushable(false)
                                            .setDepth(10)
                                            .setName('player')
                                            .play('player_turn');
                                        this.player.body
                                            .setGravityY(500);


                                        this.physics.add.collider(this.player, this.platforms);
                                        // cursors = this.input.keyboard.createCursorKeys();

                                        //===init cursors
                                        this.cursors = this.input.keyboard.addKeys('w,s,a,d,space,p,q,e');

                                        //===init attack
                                        var bullets = this.physics.add.group({
                                            classType: Bullet,
                                            maxSize: 10,
                                            runChildUpdate: true,
                                            maxVelocityY: 0,
                                        });

                                        //======custom
                                        Object.assign(this.player, {
                                            stats: Object.assign({}, playerData.playerStats),
                                            stopCursorsFlag: false,
                                            invincibleFlag: false,//無敵時間
                                            playerTurnLeft: false,//==判斷子彈方向

                                            //==HP/MP                
                                            hpText: this.add.text(16, 50, '', { fontSize: '32px', fill: '#000' }).setDepth(20),
                                            mpText: this.add.text(16, 80, '', { fontSize: '32px', fill: '#000' }).setDepth(20),

                                            playerAttack: (bullet, enemy) => {
                                                // console.debug(bullet, enemy);
                                                let playerStats = this.player.stats;
                                                bullet.disableBody(true, true);
                                                enemy.body.setVelocityX(playerStats.knockBackSpeed * (bullet.x < enemy.x ? 1 : -1));

                                                enemy.behavior = 'hurt';
                                                enemy.statsChangeHandler({ HP: enemy.stats.HP -= playerStats.attackPower }, this);
                                            },

                                            //==移動
                                            movingHadler: function (scene) {
                                                if (this.stopCursorsFlag) return;

                                                let cursors = scene.cursors;

                                                if (cursors.a.isDown) {
                                                    this.setVelocityX(-this.stats.movementSpeed);
                                                    this.anims.play('player_left', true);
                                                    this.playerTurnLeft = true;
                                                }
                                                else if (cursors.d.isDown) {
                                                    this.setVelocityX(this.stats.movementSpeed);
                                                    this.anims.play('player_right', true);
                                                    this.playerTurnLeft = false;
                                                }
                                                else {
                                                    this.setVelocityX(0);
                                                    // this.anims.play('player_turn');
                                                };

                                                //==跳
                                                if (cursors.w.isDown && this.body.touching.down) {
                                                    this.setVelocityY(-this.stats.jumpingPower);
                                                };

                                            },
                                            //==撿起
                                            pickingHadler: function (scene) {

                                                if (Phaser.Input.Keyboard.JustDown(scene.cursors.s)) {

                                                    // console.debug(orbStats);
                                                    if (this.pickUpObj) {  //==put down

                                                        // console.debug(this.pickUpObj.laserObj.body);
                                                        // console.debug(timePoint.isInRange);
                                                        let timePoint = getTimePoint(scene.waveGameObjs[0].width, this.pickUpObj.x);
                                                        this.pickUpObj.statusHadler(false, timePoint.isInRange);
                                                        this.pickUpObj = null;

                                                    }
                                                    else {  //==pick up
                                                        const piclUpDistance = 40;
                                                        console.debug(this.pickUpObj);
                                                        let colsestOrb;
                                                        scene.orbGroup.children.iterate(child => {
                                                            if (Phaser.Math.Distance.BetweenPoints(this, child) <= piclUpDistance)
                                                                if (colsestOrb)
                                                                    colsestOrb =
                                                                        Phaser.Math.Distance.BetweenPoints(this, child) <
                                                                            Phaser.Math.Distance.BetweenPoints(this, colsestOrb) ?
                                                                            child : colsestOrb;
                                                                else
                                                                    colsestOrb = child;

                                                        });
                                                        if (colsestOrb) {
                                                            this.pickUpObj = colsestOrb;
                                                            this.pickUpObj.statusHadler(true);

                                                        };
                                                    }

                                                };

                                            },
                                            //==攻擊
                                            attackHandler: function (scene) {

                                                if (Phaser.Input.Keyboard.JustDown(scene.cursors.space)) {
                                                    if (this.stats.MP < this.stats.manaCost) return;

                                                    var bullet = bullets.get();
                                                    // console.debug(bullet);
                                                    if (bullet) {
                                                        bullet.fire(this.x, this.y, this.stats.attackSpeed * (this.playerTurnLeft ? -1 : 1));
                                                        bullet.anims.play(this.playerTurnLeft ? 'player_left' : 'player_right', true);
                                                        // bullet.setMass(1);
                                                        bullet.body.setSize(30, 40);
                                                        this.statsChangeHandler({ MP: this.stats.MP -= this.stats.manaCost }, this);
                                                        // console.debug(this.stats);
                                                    }
                                                };
                                            },
                                            //==HP/MP
                                            statsChangeHandler: function (statsObj) {
                                                if ('HP' in statsObj) {
                                                    let hpString = 'HP : ' + parseInt(statsObj.HP) + ' / ' + this.stats.maxHP;
                                                    this.hpText.setText(hpString);
                                                };
                                                if ('MP' in statsObj) {
                                                    let mpString = 'MP : ' + parseInt(statsObj.MP) + ' / ' + this.stats.maxMP;
                                                    this.mpText.setText(mpString);
                                                };

                                                this.stats = Object.assign(this.stats, statsObj);

                                            },
                                        });




                                        this.player.statsChangeHandler({ HP: this.player.stats.HP, MP: this.player.stats.MP }, this);

                                        // console.debug(player);




                                        //==敵人玩家相關碰撞
                                        if (!gameData.liberate) {
                                            this.physics.add.collider(bullets, this.enemy, this.player.playerAttack, null, this);
                                            this.physics.add.overlap(this.enemy, this.player, this.enemy.enemyAttack, null, this);
                                        }


                                    };
                                    var initEnemy = () => {
                                        if (gameData.liberate) return;

                                        this.enemy = this.physics.add.group({
                                            classType: Enemy,
                                            maxSize: this.aliveEnemy.length,
                                            // key: 'enemy',
                                            // maxVelocityY: 0,
                                            collideWorldBounds: true,
                                            // bounceX: 0.1,
                                            mass: 100,
                                            // immovable: true,
                                        });
                                        console.debug(this.enemy);
                                        this.aliveEnemy.forEach((key, i) => {
                                            let child = this.enemy.get(key, i, enemyStats[key]);
                                            //=轉向左邊(素材一開始向右)
                                            child.filpHandler(true);
                                            // child.setCollideWorldBounds(true)
                                            // console.debug(child.body);
                                        });


                                        this.enemy.enemyAttack = (player, foe) => {
                                            // console.debug(player, foe);
                                            // console.debug(player.body);
                                            // console.debug('player hurt');
                                            const invincibleDuration = 800;
                                            const knockBackDuration = 200;
                                            const knockBackSpeed = 300;

                                            if (!player.invincibleFlag) {
                                                player.invincibleFlag = true;
                                                // player.setTint(0xff0000);

                                                player.body.setVelocityX(knockBackSpeed * (foe.x < player.x ? 1 : -1));


                                                //==暫停人物操作(一直往前走不會有擊退效果)
                                                player.stopCursorsFlag = true;
                                                this.time.delayedCall(knockBackDuration, () => {
                                                    // player.setTint(0xffffff);
                                                    player.body.reset(player.x, player.y);//==停下
                                                    player.stopCursorsFlag = false;
                                                }, [], this);

                                                this.tweens.add({
                                                    targets: player,
                                                    alpha: 0.5,
                                                    duration: invincibleDuration / 20,//==   20=repeat(10)*yoyo(=2)
                                                    yoyo: true,
                                                    repeat: 10,
                                                    ease: 'Sine.easeInOut',
                                                    // props: {
                                                    //     alpha: {
                                                    //         duration: 100,
                                                    //         yoyo: true,
                                                    //         repeat: 10,
                                                    //         ease: 'Sine.easeInOut',
                                                    //         value: '0.5',
                                                    //     },
                                                    // },
                                                    onComplete: () => player.invincibleFlag = false,
                                                });

                                                player.statsChangeHandler({ HP: player.stats.HP -= foe.stats.attackPower }, this);

                                            }


                                            // foe.anims.play('dog_Attack', true);
                                        };

                                        // console.debug(stars.children.entries[0].active);
                                        this.physics.add.collider(this.enemy, this.platforms);


                                    };
                                    var initTimer = () => {
                                        //==計時,時間到進入結算
                                        this.gameTimer = this.time.delayedCall(timeRemain, () => this.gameOver = true, [], this);
                                        this.gameTimer.timerText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#000' }).setDepth(20);


                                    };
                                    var initPauseMenu = () => {

                                        // Create a label to use as a button
                                        let pauseButton = this.add.text(width - 100, 20, 'Pause', { font: '24px Arial', fill: '#fff' }).setDepth(20);

                                        // let pauseMenu = new UIScene('pauseMenu');
                                        pauseButton.setInteractive()
                                            .on('pointerdown', () => {
                                                // =When the pause button is pressed, we pause the game
                                                this.scene.pause();
                                                this.gameTimer.paused = true;
                                                //==create pause menu
                                                this.scene.add(null, new UIScene('pauseMenu'), true);
                                            });


                                        //==custom for keyboard pause
                                        pauseButton.key = 'pause';


                                    };

                                    initEnvironment();
                                    initEnemy();
                                    initPlayer();
                                    initTimer();
                                    initPauseMenu();



                                };
                                update() {
                                    // return;



                                    var updatePlayer = () => {

                                        this.player.movingHadler(this);
                                        this.player.pickingHadler(this);
                                        this.player.attackHandler(this);

                                        let cursors = this.cursors;
                                        let playerStats = this.player.stats;
                                        if (playerStats.MP < playerStats.maxMP)
                                            this.player.statsChangeHandler({ MP: playerStats.MP += playerStats.manaRegen }, this);//自然回魔

                                        //==暫停
                                        if (Phaser.Input.Keyboard.JustDown(cursors.p)) {
                                            // console.debug(this);
                                            let pauseButton = this.add.displayList.list.find(obj => obj.key == 'pause');
                                            pauseButton.emit('pointerdown');
                                        };
                                        //===test
                                        if (Phaser.Input.Keyboard.JustDown(cursors.q)) {

                                            let waveData = data[0].waveData;
                                            getWaveImg(waveData).then(success => {
                                                console.debug(success);
                                                let aaa = this.load.svg('wave_BHZ', success[0], { scale: 1 })
                                                console.debug(aaa);
                                                this.add.image(width * 0.5, height * 0.8, 'wave_BHZ')
                                            });

                                        }
                                        else if (Phaser.Input.Keyboard.JustDown(cursors.e)) {

                                            // let waveSvgObjs = getWaveImg(stationData);
                                            console.debug(this.textures);
                                        };
                                    };
                                    var updateOrb = () => {

                                        if (this.player.pickUpObj)
                                            this.player.pickUpObj.setPosition(this.player.x, this.player.y + 10);

                                        this.orbGroup.children.iterate(child => {

                                            let laserObj = child.laserObj;
                                            if (child.activateFlag) {
                                                laserObj.enableBody(false, 0, 0, true, true);
                                                laserObj.setPosition(child.x, child.y + 20);
                                                laserObj.anims.play('orb_laser', true);

                                                child.timeText
                                                    .setPosition(child.x, 650)
                                                    .setVisible(true)
                                                    .setText(getTimePoint(child.x).time.toFixed(2));

                                            }
                                            else {
                                                laserObj.disableBody(true, true);
                                                child.timeText.setVisible(false);
                                                // console.debug(child.timeText);
                                            }

                                        });

                                    }
                                    var updateTimer = () => {

                                        let gameTimer = this.gameTimer;
                                        let timeVal = parseInt(timeRemain - gameTimer.getElapsed());
                                        let text = 'TimeLeft : ' + timeVal + ' ms';
                                        gameTimer.timeVal = timeVal;
                                        gameTimer.timerText.setText(text);
                                    };
                                    var updateEnemy = () => {
                                        if (gameData.liberate) return;
                                        //===對話完??
                                        this.enemy.children.iterate((child) => {
                                            if (child.behavior == 'Death') return;
                                            // console.debug('alive');
                                            // console.debug(child.behaviorHandler);
                                            child.behaviorHandler(this.player, this);
                                            child.lifeBar.setPosition(child.x, child.y - 20);
                                        });

                                        // player.body
                                        // enemy.anims.play('dog_Attack');
                                    };

                                    updatePlayer();
                                    updateOrb();
                                    updateTimer();
                                    updateEnemy();
                                    // console.debug(gameTimer.getOverallProgress());
                                    // console.debug(enemy.children.entries);

                                    if (this.gameOver) {
                                        //===time remove
                                        this.gameTimer.remove();

                                        //===get gameResult 
                                        let orbStats = this.orbGroup.getChildren().map(orb =>
                                            new Object({
                                                postition: orb.x,
                                                timePoint: getTimePoint(orb.x),
                                            })
                                        );


                                        let gameResult = {
                                            //==更新角色資料(剩餘時間、能力值...)
                                            playerInfo: {
                                                timeRemain: this.gameTimer.timeVal,
                                                playerStats: this.player.stats,
                                            },
                                            //==更新測站資料(半徑情報....)
                                            stationInfo: {
                                                orbStats: orbStats,
                                                enemyStats: enemyStats,
                                                liberate: !(Object.keys(enemyStats).filter(enemy => enemyStats[enemy].HP > 0).length > 0),
                                            },
                                        };

                                        game.destroy(true, false);
                                        resolve(gameResult);
                                    }
                                };

                            };
                            class UIScene extends Phaser.Scene {

                                constructor(key) {
                                    super({ key: key });
                                    // console.debug(this);
                                }
                                preload() {
                                    const uiDir = assetsDir + 'ui/';
                                    this.load.image('menuButton', uiDir + 'menuButton.png');
                                };
                                create() {
                                    // =Then add the menu
                                    this.buttonObj = {};
                                    const buttons = ['resume', 'tutorial', 'exit'];
                                    const menuMargin = height / 4;
                                    const buttonGap = 110;
                                    buttons.forEach((button, i) => {
                                        let x = width * 0.5;
                                        // let y = height  / (buttons.length + 1) * (i + 1) ;
                                        let y = menuMargin + buttonGap * i;
                                        let menuButton = this.add.image(x, y, 'menuButton');
                                        let buttonText = this.add.text(x, y, button, { font: '40px Arial', fill: '#fff' }).setOrigin(0.5, 0.6);
                                        menuButton
                                            .setScale(width / 4 / menuButton.width)
                                            .setInteractive()
                                            .on('pointerdown', (pointer) => {
                                                switch (button) {

                                                    case 'resume':
                                                        this.scene.resume('defend');
                                                        this.scene.remove();
                                                        gameTimer.paused = false;
                                                        break;

                                                    case 'tutorial':

                                                        break;
                                                    case 'exit':
                                                        this.gameOver = true;
                                                        this.scene.resume('defend');
                                                        this.scene.remove();
                                                        break;
                                                }
                                            });

                                        this.buttonObj[button] = menuButton;
                                    });

                                    //= And a label to illustrate which menu item was chosen. (This is not necessary)
                                    // let choiseLabel = this.add.text(width / 2, height - 150, 'Click outside menu to continue', { font: '30px Arial', fill: '#fff' });
                                    this.hotkeys = this.input.keyboard.addKeys('p');
                                };
                                update() {
                                    if (Phaser.Input.Keyboard.JustDown(this.hotkeys.p))
                                        this.buttonObj.resume.emit('pointerdown');

                                };
                            };

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
                                scene: new DefendScene(stationData, playerData, waveSvgObjs, resolve),
                            };
                            const game = new Phaser.Game(config);
                        };
                        let waveSvgObjs = await getWaveImg(stationData);
                        gameResult = await new Promise((resolve, reject) => {
                            let playerData = {
                                playerStats: GameData.playerStats,
                                controllCursor: GameData.controllCursor,
                                timeRemain: GameData.timeRemain,
                            }
                            defendGame(stationData, playerData, waveSvgObjs, resolve);
                        });
                        gameDisplay(false);
                        console.debug(gameResult);
                        let stationInfo = gameResult.stationInfo;
                        let playerInfo = gameResult.playerInfo;

                        //===update icon
                        if (stationInfo.liberate && !stationData.gameData.liberate)
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
                        Object.assign(stationData.gameData, stationInfo);

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