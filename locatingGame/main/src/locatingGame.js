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
            var stationDataArr, geoJSON;//===location data
            var GameData = null;

            function initGameData() {
                GameData = {
                    timeRemain: 500000,
                    controllCursor: [],
                    playerStats: {
                        movementSpeed: 500,
                        jumpingPower: 400,
                        attackSpeed: 800,
                        attackPower: 100,
                        manaCost: 10,
                        manaRegen: 1,//per 10 ms(game update per 10ms)0.05
                        HP: 100,
                        maxHP: 100,
                        MP: 100,
                        maxMP: 100,
                    },

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

                    let markerArr = [],
                        circleArr = [];

                    let enemy = ['dog'];//==之後隨機抽敵人組

                    data.forEach((d, i) => {
                        // console.debug(d);
                        d['gameData'] = {
                            liberate: false,
                            enemyStats: {
                                dog: {
                                    HP: 1000,
                                    active: false,
                                },


                            },
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
                const stationData = stationMarker ?
                    stationMarker.options.data :
                    mapObj._layers['58']._layers['52'].options.data;//test

                // console.debug(mapObj);
                let gameResult;
                switch (gameMode) {
                    case 'defend':
                        let waveSvgObjs = await getWaveImg(stationData);
                        // console.debug(waveSvgObjs);

                        function defendGame(stationData, playerData, resolve) {
                            // console.debug(stationData);
                            const gameData = stationData.gameData;
                            const assetsDir = '../data/assets/';
                            const width = gameBox.width, height = gameBox.height;
                            const getTimePoint = (x) => {
                                let xAxisObj = waveSvgObjs.find(svg => svg.svgName == 'xAxis');
                                let scaleFun = xAxisObj.x;
                                let margin = xAxisObj.margin;

                                let xAxisRange = [
                                    (width - waveGameObjs[0].width) * 0.5 + margin.right,
                                    (width + waveGameObjs[0].width) * 0.5 - margin.left,
                                ];
                                scaleFun.range(xAxisRange);
                                // console.debug(scaleFun.range());
                                let time = scaleFun.invert(x);
                                let isInRange = (x >= xAxisRange[0] && x <= xAxisRange[1]);

                                return {
                                    time: time,
                                    isInRange: isInRange,
                                };

                            };


                            var timeRemain = playerData.timeRemain;

                            var player, enemy, cursors;
                            var orbGroup;
                            var platforms;

                            var gameTimer = null, timeVal, timerText = null;
                            var gameOver = false;


                            var pickUpObj = null;
                            var waveGameObjs = [];

                            class DefendScene extends Phaser.Scene {
                                constructor() {
                                    super({ key: 'defend' });
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
                                            const dir = envDir + 'background/forest/game_background_1/';
                                            this.load.image('background', dir + 'game_background_1.png');
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
                                        const dir = gameObjDir + 'dog/';
                                        const frameObj = { frameWidth: 48, frameHeight: 48 };
                                        this.load.spritesheet('dog_Attack', dir + 'Attack.png', frameObj);
                                        this.load.spritesheet('dog_Death', dir + 'Death.png', frameObj);
                                        this.load.spritesheet('dog_Hurt', dir + 'Hurt.png', frameObj);
                                        this.load.spritesheet('dog_Idle', dir + 'Idle.png', frameObj);
                                        this.load.spritesheet('dog_Walk', dir + 'Walk.png', frameObj);

                                    };
                                    var wave = () => {
                                        waveSvgObjs.forEach(d => this.load.svg('wave_' + d.svgName, d.svg, { scale: 1 }));
                                    };


                                    environment();
                                    player();
                                    enemy();
                                    wave();

                                };
                                create() {

                                    const Bullet = new Phaser.Class({

                                        Extends: Phaser.Physics.Arcade.Sprite,

                                        initialize:
                                            function Bullet(scene) {
                                                Phaser.Physics.Arcade.Sprite.call(this, scene, 0, 0, 'instrument');
                                                // console.debug(this.body)
                                                // scene.physics.world.enableBody(this, 0);

                                            },

                                        fire: function (x, y, speed) {
                                            this.setPosition(x, y);
                                            this.setActive(true);
                                            this.setVisible(true);
                                            this.speed = Phaser.Math.GetSpeed(speed, 1);
                                        },

                                        update: function (time, delta) {
                                            // console.debug(time, delta)
                                            this.x += this.speed * delta;

                                            // let outOfWindow =
                                            //     this.x > width + this.width || this.x < 0 - this.width ||
                                            //     this.y > height + this.height || this.y < 0 - this.height;

                                            let outOfWindow = !this.scene.cameras.main.worldView.contains(this.x, this.y);
                                            if (outOfWindow) {
                                                this.setActive(false);
                                                this.setVisible(false);
                                            }
                                        }

                                    });

                                    var initEnvironment = () => {
                                        // console.debug()
                                        var station = () => {
                                            let station = stationData.station ? stationData.station : '???';
                                            this.add.image(width * 0.92, height * 0.53, 'station')
                                                .setScale(1, 0.63);
                                            // this.add.image(width * 0.12, height * 0.53, 'title')
                                            //     .setScale(0.1, 0.15).setRotation(0.1).setPosition(width * 0.12, height * 0.53, 100, 100);
                                            this.add.text(width * 0.88, height * 0.46, station, { fontSize: '32px', fill: '#000' })
                                                .setRotation(-0.1).setOrigin(0.5, 0.5);

                                            waveGameObjs = waveSvgObjs.map((d, i) => {

                                                let y;
                                                if (d.svgName != 'xAxis')
                                                    y = height * (0.15 + 0.25 * i);
                                                else
                                                    y = height * 1.15;

                                                return this.add.image(width * 0.5, y, 'wave_' + d.svgName);
                                            });

                                            // this.add.image(width * 0.5, height * 0.5, 'wave_0')
                                            // this.add.image(width * 0.5, height * 0.3, 'wave_1')
                                            // this.add.image(width * 0.5, height * 0.1, 'wave_2')
                                        }
                                        var platform = () => {
                                            platforms = this.physics.add.staticGroup();
                                            platforms.create(width * 0.5, height * 0.95, 'ground')
                                                .setScale(3, 0.5).refreshBody().setOffset(30);
                                        }
                                        var background = () => {
                                            let bgImg = this.add.image(width * 0.5, height * 0.5, 'background');
                                            bgImg.setScale(width / bgImg.width, height / bgImg.height);
                                        }
                                        var instrument = () => {
                                            // let instrument = this.physics.add.sprite(width * 0.1, height * 0.8, 'instrument')
                                            //     .setScale(0.3);
                                            const orbScale = 0.25;

                                            orbGroup = this.physics.add.group({
                                                key: 'instrument',
                                                repeat: 1,
                                                randomFrame: true,
                                                setScale: { x: orbScale, y: orbScale },
                                                // setXY: { x: width * 0.86, y: height * 0.8, stepX: 15 },
                                                // maxVelocityY: 0,
                                                // gravityX: 1000,
                                                // gravityY: -50,

                                            });

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
                                            orbGroup.children.iterate((child, i) => {

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
                                                        this.setDepth(2);
                                                        pickUpObj.anims.play('orb_holded', true);

                                                        //==撿起後角色屬性改變
                                                        newPlayerStats = {
                                                            movementSpeed: 300,
                                                            jumpingPower: 300,
                                                        };

                                                    }
                                                    else {//put down
                                                        this.body.setMaxVelocityY(1000);
                                                        this.setDepth(0);
                                                        pickUpObj.anims.play(activate ? 'orb_activate' : 'orb_inactive', true);

                                                        //==放下後角色屬性恢復
                                                        newPlayerStats = {
                                                            movementSpeed: playerData.playerStats.movementSpeed,
                                                            jumpingPower: playerData.playerStats.jumpingPower,
                                                        };
                                                    }

                                                    player.stats = Object.assign(player.stats, newPlayerStats);


                                                    this.activateFlag = activate;

                                                    // console.debug(playerStats);
                                                };
                                                //=laser
                                                child.laserObj =
                                                    this.physics.add.sprite(child.x, child.y + 20, 'laser')
                                                        .setAlpha(0.8)
                                                        .setScale(0.3, 1)
                                                        .setOrigin(0.5, 1)
                                                        .setDepth(0)
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

                                            this.physics.add.collider(orbGroup, platforms);

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

                                        player = this.physics.add.sprite(100, 450, 'dude');
                                        // player.setBounce(0.2);
                                        // player.setBounce(100, 0);
                                        player.setCollideWorldBounds(true)
                                            .setPushable(false)
                                            .setDepth(1)
                                            .play('player_turn');
                                        player.body
                                            .setGravityY(500);


                                        this.physics.add.collider(player, platforms);
                                        // cursors = this.input.keyboard.createCursorKeys();

                                        //===init cursors
                                        cursors = this.input.keyboard.addKeys('w,s,a,d,space,p,q,e');

                                        //===init attack
                                        var bullets = this.physics.add.group({
                                            classType: Bullet,
                                            maxSize: 10,
                                            runChildUpdate: true,
                                            maxVelocityY: 0,
                                        });
                                        player.playerAttack = (bullet, enemy) => {
                                            // console.debug(bullet, enemy);
                                            bullet.disableBody(true, true);
                                            let knockBackDir = bullet.x < enemy.x ? 1 : -1;
                                            enemy.body.reset(enemy.x, enemy.y);//==停下
                                            this.physics.accelerateTo(enemy, enemy.x + 10 * knockBackDir, enemy.y, 500, 500, 0);
                                            enemy.behavior = 'hurt';
                                            // console.debug(enemy.stats.HP, player.stats.attackPower);
                                            enemy.statsChangeHandler({ HP: enemy.stats.HP -= player.stats.attackPower });
                                        };

                                        //======custom
                                        player.stats = Object.assign({}, playerData.playerStats);
                                        // console.debug(player.stats);
                                        let playerTurnLeft = false;//==判斷子彈方向
                                        //==移動
                                        player.movingHadler = function () {

                                            if (cursors.a.isDown) {
                                                player.setVelocityX(-this.stats.movementSpeed);
                                                player.anims.play('player_left', true);
                                                playerTurnLeft = true;
                                            }
                                            else if (cursors.d.isDown) {
                                                player.setVelocityX(this.stats.movementSpeed);
                                                player.anims.play('player_right', true);
                                                playerTurnLeft = false;
                                            }
                                            else {
                                                player.setVelocityX(0);
                                                // player.anims.play('player_turn');
                                            };

                                            //==跳
                                            if (cursors.w.isDown && player.body.touching.down) {
                                                player.setVelocityY(-this.stats.jumpingPower);
                                            };

                                        };
                                        //==撿起
                                        player.pickingHadler = function () {

                                            if (Phaser.Input.Keyboard.JustDown(cursors.s)) {

                                                // console.debug(orbStats);
                                                if (pickUpObj) {  //==put down

                                                    // console.debug(pickUpObj.laserObj.body);
                                                    // console.debug(timePoint.isInRange);
                                                    let timePoint = getTimePoint(pickUpObj.x);
                                                    pickUpObj.statusHadler(false, timePoint.isInRange);
                                                    pickUpObj = null;

                                                }
                                                else {  //==pick up
                                                    const piclUpDistance = 40;
                                                    let colsestOrb;
                                                    orbGroup.children.iterate(child => {
                                                        if (Phaser.Math.Distance.BetweenPoints(player, child) <= piclUpDistance)
                                                            if (colsestOrb)
                                                                colsestOrb =
                                                                    Phaser.Math.Distance.BetweenPoints(player, child) <
                                                                        Phaser.Math.Distance.BetweenPoints(player, colsestOrb) ?
                                                                        child : colsestOrb;
                                                            else
                                                                colsestOrb = child;

                                                    });
                                                    if (colsestOrb) {
                                                        pickUpObj = colsestOrb;
                                                        pickUpObj.statusHadler(true);
                                                        // console.debug(pickUpObj);
                                                    };
                                                }

                                            };

                                        };
                                        //==攻擊
                                        player.attackHandler = function () {

                                            if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
                                                if (this.stats.MP < this.stats.manaCost) return;

                                                var bullet = bullets.get();
                                                // console.debug(bullet);
                                                if (bullet) {
                                                    bullet.enableBody(false, 0, 0, true, true);

                                                    // console.debug(Phaser.Physics.Arcade.Body());


                                                    bullet.fire(player.x, player.y, this.stats.attackSpeed * (playerTurnLeft ? -1 : 1));
                                                    bullet.anims.play(playerTurnLeft ? 'player_left' : 'player_right', true);


                                                    bullet.body.setSize(30, 40);
                                                    player.statsChangeHandler({ MP: this.stats.MP -= this.stats.manaCost });
                                                    // console.debug(this.stats);
                                                }
                                            };
                                        };
                                        //==HP/MP
                                        const maxHPVal = player.stats.maxHP;
                                        const maxMPVal = player.stats.maxMP;
                                        let hpText = this.add.text(16, 50, '', { fontSize: '32px', fill: '#000' });
                                        let mpText = this.add.text(16, 80, '', { fontSize: '32px', fill: '#000' });

                                        player.statsChangeHandler = function (statsObj) {
                                            if ('HP' in statsObj) {
                                                let hpString = 'HP : ' + parseInt(statsObj.HP) + ' / ' + maxHPVal;
                                                hpText.setText(hpString);
                                            };
                                            if ('MP' in statsObj) {
                                                let mpString = 'MP : ' + parseInt(statsObj.MP) + ' / ' + maxMPVal;
                                                mpText.setText(mpString);
                                            };

                                            this.stats = Object.assign(this.stats, statsObj);

                                        };
                                        player.statsChangeHandler({ HP: player.stats.HP, MP: player.stats.MP });

                                        // console.debug(player);

                                        //======custom


                                        //==敵人玩家相關碰撞
                                        if (!gameData.liberate) {
                                            this.physics.add.overlap(bullets, enemy, player.playerAttack, null, this);
                                            this.physics.add.collider(enemy, player, enemy.enemyAttack, null, this);
                                        }


                                    };
                                    var initEnemy = () => {
                                        if (gameData.liberate) return;

                                        // const enemyType = ['dog', 'cat', 'bird'];
                                        // const enemyType = ['dog'];
                                        const enemyAttackRange = 80;
                                        const enemyScale = 2;

                                        const enemyStats = gameData.enemyStats;
                                        const aliveEnemy = enemyStats
                                            .filter(enemy => enemy.HP > 0)
                                            .map(enemy => enemy.type);
                                        // console.debug(aliveEnemy);


                                        enemy = this.physics.add.group({
                                            classType: Enemy,
                                            key: 'enemy',
                                            randomFrame: true,
                                            setScale: { x: enemyScale, y: enemyScale },
                                            setOrigin: { x: 0.4, y: 0.4 },
                                            setXY: { x: width * 0.8, y: height * 0.8, stepX: 30 },
                                            gravityY: 300,
                                            repeat: aliveEnemy.length - 1,
                                            // repeat: 2,
                                            // quantity: 1,
                                            // yoyo: true,
                                            // maxVelocityX: 0,
                                            // maxVelocityY: 0,
                                            // gravityX: 1000,

                                            // enable: false,
                                            // immovable: true,
                                        });
                                        // enemy.rotateAroundDistance([0, 0], 1, 0.1);

                                        // console.debug(enemy);


                                        // enemy.get(100, 200);
                                        enemy.children.iterate((child, i) => {
                                            // console.debug(child);
                                            // let enemyStats = enemyStats;
                                            // let enemyType = enemyStats
                                            console.debug(enemyStats);

                                            var animsCreate = () => {

                                                this.anims.create({
                                                    key: 'dog_Idle',
                                                    frames: this.anims.generateFrameNumbers('dog_Idle'),
                                                    frameRate: 10,
                                                    repeat: -1,
                                                    repeatDelay: 500,
                                                });
                                                this.anims.create({
                                                    key: 'dog_Death',
                                                    frames: this.anims.generateFrameNumbers('dog_Death'),
                                                    frameRate: 5,
                                                    repeat: 0,
                                                    // repeatDelay: 500,
                                                });
                                                this.anims.create({
                                                    key: 'dog_Hurt',
                                                    frames: this.anims.generateFrameNumbers('dog_Hurt'),
                                                    frameRate: 200,
                                                    repeat: -1,
                                                    // repeatDelay: 500,
                                                });
                                                this.anims.create({
                                                    key: 'dog_Walk',
                                                    frames: this.anims.generateFrameNumbers('dog_Walk'),
                                                    frameRate: 10,
                                                    repeat: -1,
                                                    // repeatDelay: 500,
                                                });
                                                this.anims.create({
                                                    key: 'dog_Attack',
                                                    frames: this.anims.generateFrameNumbers('dog_Attack'),
                                                    frameRate: 10,
                                                    repeat: -1,
                                                    // repeatDelay: 500,
                                                });
                                            };
                                            animsCreate();

                                            child
                                                .setCollideWorldBounds(true)
                                                .setBounce(0)
                                                .setPushable(false)
                                                // .setImmovable(true)
                                                .setMass(3)
                                                .play('dog_Idle');


                                            child.body.setSize(25, 18, true);

                                            //==========custom attr

                                            //=stats
                                            child.enemyType = aliveEnemy[i];
                                            child.stats = {
                                                attackPower: 10,
                                                HP: enemyStats.HP,
                                                maxHP: 1000,
                                            };


                                            child.statsChangeCallback = null;//==為了計時器不重複註冊多個
                                            child.statsChangeHandler = (statsObj) => {
                                                if ('HP' in statsObj) {
                                                    let hpString = parseInt(statsObj.HP) + ' / ' + child.stats.maxHP;

                                                    child.lifeBar
                                                        .setText(hpString)
                                                        .setVisible(true);

                                                    if (child.statsChangeCallback) child.statsChangeCallback.remove();
                                                    child.statsChangeCallback = this.time.delayedCall(1500, () => child.lifeBar.setVisible(false), [], this);

                                                };
                                                child.stats = Object.assign(child.stats, statsObj);
                                            };
                                            //=狗開始追...（爲true後永遠爲true）
                                            child.startBehaviorFlag = enemyStats ? enemyStats.enemyActive : false;
                                            child.behavior = null;
                                            child.behaviorCallback = null;//==為了計時器不重複註冊多個
                                            child.knockBackCallback = null;//==擊退計時
                                            child.behaviorHandler = function (scene) {

                                                let dist = Phaser.Math.Distance.BetweenPoints(player, this);
                                                // console.debug(dist);
                                                //===人物攻擊或進入領域則啟動追擊
                                                if (!this.startBehaviorFlag)
                                                    if (dist < 300 || this.behavior == 'hurt') {
                                                        this.startBehaviorFlag = true;
                                                        if (!this.behavior) this.behavior = 'chase';
                                                    }
                                                    else return;
                                                //===開始行爲模式(0.受傷 1.攻擊 2.追擊 3.休息 )
                                                else {
                                                    if (!this.behavior) this.behavior = 'chase';
                                                    if (dist < enemyAttackRange && !(this.behavior == 'hurt' || this.behavior == 'rest'))
                                                        this.behavior = 'attack';

                                                    var isCollided = scene.physics.world.overlap(player, platforms);
                                                    // console.debug(isCollided);

                                                    // console.debug(this.behavior);
                                                    switch (this.behavior) {
                                                        case 'hurt':
                                                            this.anims.play('dog_Hurt', true);
                                                            const knockBackDuration = 200;

                                                            if (this.behaviorCallback) {
                                                                this.behaviorCallback.remove();
                                                                this.behaviorCallback = null;
                                                            };

                                                            if (!this.knockBackCallback)
                                                                this.knockBackCallback = scene.time.delayedCall(knockBackDuration, () => {
                                                                    this.behavior = 'chase';
                                                                    this.knockBackCallback = null;
                                                                }, [], scene);

                                                            break;
                                                        case 'attack':
                                                            this.anims.play('dog_Attack', true);
                                                            this.body.reset(this.x, this.y);//==停下
                                                            if (dist > enemyAttackRange && this.behavior != 'rest')
                                                                this.behavior = 'chase';
                                                            break;
                                                        case 'chase':
                                                            // ==== accelerateToObject(gameObject, destination, acceleration, xSpeedMax, ySpeedMax);
                                                            scene.physics.accelerateToObject(this, player, 500, 500, 500);
                                                            // this.physics.moveToObject(this, player, 500, chasingDuration);
                                                            this.anims.play('dog_Walk', true);

                                                            //==時間到後休息restFlag= true        


                                                            if (!this.behaviorCallback) {
                                                                const chasingDuration = Phaser.Math.FloatBetween(5, 6) * 1000;//追擊隨機x秒後休息
                                                                // console.debug('追擊時間：' + chasingDuration);
                                                                this.behaviorCallback = scene.time.delayedCall(chasingDuration, () => {
                                                                    this.behavior = 'rest';
                                                                    this.body.reset(this.x, this.y);//==停下
                                                                    this.behaviorCallback = null;
                                                                    // console.debug('休息');
                                                                }, [], scene);
                                                            }
                                                            // this.behaviorCallback.remove();
                                                            // console.debug(this.behaviorCallback);
                                                            break;
                                                        default:
                                                        case 'rest':
                                                            this.anims.play('dog_Idle', true);
                                                            if (!this.behaviorCallback) {
                                                                const restingDuration = Phaser.Math.FloatBetween(1.5, 2) * 1000;//==休息隨機x秒
                                                                // console.debug('休息時間：' + restingDuration);
                                                                this.behaviorCallback = scene.time.delayedCall(restingDuration, () => {
                                                                    this.behavior = 'chase';
                                                                    this.behaviorCallback = null;
                                                                    // console.debug('追擊');
                                                                }, [], scene);
                                                            }
                                                            break;
                                                    }


                                                    //===判斷player相對敵人的位子來轉向(轉向時停下)
                                                    let filpDir = player.x < this.x;
                                                    if (this.filpFlag != filpDir) {
                                                        this.filpHandler(filpDir);
                                                        this.body.reset(this.x, this.y);
                                                    }

                                                }
                                                // console.debug();
                                                //==死亡
                                                if (this.stats.HP <= 0) {
                                                    // console.debug('dog_Death');
                                                    this.knockBackCallback.remove();
                                                    this.behavior = 'Death';
                                                    this.body.reset(this.x, this.y);
                                                    this.body.enable = false;
                                                    this.anims.play('dog_Death', true);

                                                }

                                            };

                                            //=轉向左邊(素材一開始向右)
                                            child.filpHandler(true);

                                            //==========custom attr



                                            // console.debug(child);
                                            // console.debug(child.getBounds());
                                        });
                                        // enemy.children.iterate((child, i) => {
                                        //     console.debug(child);
                                        //     var animsCreate = () => {

                                        //         this.anims.create({
                                        //             key: 'dog_Idle',
                                        //             frames: this.anims.generateFrameNumbers('dog_Idle'),
                                        //             frameRate: 10,
                                        //             repeat: -1,
                                        //             repeatDelay: 500,
                                        //         });
                                        //         this.anims.create({
                                        //             key: 'dog_Death',
                                        //             frames: this.anims.generateFrameNumbers('dog_Death'),
                                        //             frameRate: 5,
                                        //             repeat: 0,
                                        //             // repeatDelay: 500,
                                        //         });
                                        //         this.anims.create({
                                        //             key: 'dog_Hurt',
                                        //             frames: this.anims.generateFrameNumbers('dog_Hurt'),
                                        //             frameRate: 200,
                                        //             repeat: -1,
                                        //             // repeatDelay: 500,
                                        //         });
                                        //         this.anims.create({
                                        //             key: 'dog_Walk',
                                        //             frames: this.anims.generateFrameNumbers('dog_Walk'),
                                        //             frameRate: 10,
                                        //             repeat: -1,
                                        //             // repeatDelay: 500,
                                        //         });
                                        //         this.anims.create({
                                        //             key: 'dog_Attack',
                                        //             frames: this.anims.generateFrameNumbers('dog_Attack'),
                                        //             frameRate: 10,
                                        //             repeat: -1,
                                        //             // repeatDelay: 500,
                                        //         });
                                        //     };
                                        //     animsCreate();

                                        //     child
                                        //         .setCollideWorldBounds(true)
                                        //         .setBounce(0)
                                        //         .setPushable(false)
                                        //         // .setImmovable(true)
                                        //         .setMass(3)
                                        //         .play('dog_Idle');


                                        //     child.body.setSize(25, 18, true);

                                        //     //==========custom attr

                                        //     //=處理轉向
                                        //     child.filpFlag = false;
                                        //     child.filpHandler = function (filp) {
                                        //         // console.debug(this);
                                        //         let scale = Math.abs(this.scaleX);
                                        //         if (filp) {
                                        //             this.scaleX = -scale;
                                        //             this.body.setOffset(30, 30);
                                        //             this.filpFlag = true;
                                        //         }
                                        //         else {
                                        //             this.scaleX = scale;
                                        //             this.body.setOffset(5, 30);
                                        //             this.filpFlag = false;
                                        //         }
                                        //     };

                                        //     //=stats
                                        //     child.enemyType = aliveEnemy[i];
                                        //     child.stats = {
                                        //         attackPower: 10,
                                        //         HP: enemyStats ? enemyStats.enemyHP[i] : 1000,
                                        //         maxHP: 1000,
                                        //     };

                                        //     //==HP

                                        //     child.lifeBar = this.add.text(0, 0, '', { fontSize: '25px', fill: 'red' })
                                        //         .setOrigin(0.5)
                                        //         .setVisible(false);

                                        //     child.statsChangeCallback = null;//==為了計時器不重複註冊多個
                                        //     child.statsChangeHandler = (statsObj) => {
                                        //         if ('HP' in statsObj) {
                                        //             let hpString = parseInt(statsObj.HP) + ' / ' + child.stats.maxHP;

                                        //             child.lifeBar
                                        //                 .setText(hpString)
                                        //                 .setVisible(true);

                                        //             if (child.statsChangeCallback) child.statsChangeCallback.remove();
                                        //             child.statsChangeCallback = this.time.delayedCall(1500, () => child.lifeBar.setVisible(false), [], this);

                                        //         };
                                        //         child.stats = Object.assign(child.stats, statsObj);
                                        //     };

                                        //     child.behavior = null;
                                        //     child.behaviorCallback = null;//==為了計時器不重複註冊多個
                                        //     child.knockBackCallback = null;//==擊退計時
                                        //     child.behaviorHandler = function (scene) {

                                        //         let dist = Phaser.Math.Distance.BetweenPoints(player, this);
                                        //         // console.debug(dist);
                                        //         //===人物攻擊或進入領域則啟動追擊
                                        //         if (!enemy.startBehaviorFlag)
                                        //             if (dist < 300 || this.behavior == 'hurt') {
                                        //                 enemy.startBehaviorFlag = true;
                                        //                 if (!this.behavior) this.behavior = 'chase';
                                        //             }
                                        //             else return;
                                        //         //===開始行爲模式(0.受傷 1.攻擊 2.追擊 3.休息 )
                                        //         else {
                                        //             if (!this.behavior) this.behavior = 'chase';
                                        //             if (dist < enemyAttackRange && !(this.behavior == 'hurt' || this.behavior == 'rest'))
                                        //                 this.behavior = 'attack';

                                        //             var isCollided = scene.physics.world.overlap(player, platforms);
                                        //             // console.debug(isCollided);

                                        //             // console.debug(this.behavior);
                                        //             switch (this.behavior) {
                                        //                 case 'hurt':
                                        //                     this.anims.play('dog_Hurt', true);
                                        //                     const knockBackDuration = 200;

                                        //                     if (this.behaviorCallback) {
                                        //                         this.behaviorCallback.remove();
                                        //                         this.behaviorCallback = null;
                                        //                     };

                                        //                     if (!this.knockBackCallback)
                                        //                         this.knockBackCallback = scene.time.delayedCall(knockBackDuration, () => {
                                        //                             this.behavior = 'chase';
                                        //                             this.knockBackCallback = null;
                                        //                         }, [], scene);

                                        //                     break;
                                        //                 case 'attack':
                                        //                     this.anims.play('dog_Attack', true);
                                        //                     this.body.reset(this.x, this.y);//==停下
                                        //                     if (dist > enemyAttackRange && this.behavior != 'rest')
                                        //                         this.behavior = 'chase';
                                        //                     break;
                                        //                 case 'chase':
                                        //                     // ==== accelerateToObject(gameObject, destination, acceleration, xSpeedMax, ySpeedMax);
                                        //                     scene.physics.accelerateToObject(this, player, 500, 500, 500);
                                        //                     // this.physics.moveToObject(this, player, 500, chasingDuration);
                                        //                     this.anims.play('dog_Walk', true);

                                        //                     //==時間到後休息restFlag= true        


                                        //                     if (!this.behaviorCallback) {
                                        //                         const chasingDuration = Phaser.Math.FloatBetween(5, 6) * 1000;//追擊隨機x秒後休息
                                        //                         // console.debug('追擊時間：' + chasingDuration);
                                        //                         this.behaviorCallback = scene.time.delayedCall(chasingDuration, () => {
                                        //                             this.behavior = 'rest';
                                        //                             this.body.reset(this.x, this.y);//==停下
                                        //                             this.behaviorCallback = null;
                                        //                             // console.debug('休息');
                                        //                         }, [], scene);
                                        //                     }
                                        //                     // this.behaviorCallback.remove();
                                        //                     // console.debug(this.behaviorCallback);
                                        //                     break;
                                        //                 default:
                                        //                 case 'rest':
                                        //                     this.anims.play('dog_Idle', true);
                                        //                     if (!this.behaviorCallback) {
                                        //                         const restingDuration = Phaser.Math.FloatBetween(1.5, 2) * 1000;//==休息隨機x秒
                                        //                         // console.debug('休息時間：' + restingDuration);
                                        //                         this.behaviorCallback = scene.time.delayedCall(restingDuration, () => {
                                        //                             this.behavior = 'chase';
                                        //                             this.behaviorCallback = null;
                                        //                             // console.debug('追擊');
                                        //                         }, [], scene);
                                        //                     }
                                        //                     break;
                                        //             }


                                        //             //===判斷player相對敵人的位子來轉向(轉向時停下)
                                        //             let filpDir = player.x < this.x;
                                        //             if (this.filpFlag != filpDir) {
                                        //                 this.filpHandler(filpDir);
                                        //                 this.body.reset(this.x, this.y);
                                        //             }

                                        //         }
                                        //         // console.debug();
                                        //         //==死亡
                                        //         if (this.stats.HP <= 0) {
                                        //             // console.debug('dog_Death');
                                        //             this.knockBackCallback.remove();
                                        //             this.behavior = 'Death';
                                        //             this.body.reset(this.x, this.y);
                                        //             this.body.enable = false;
                                        //             this.anims.play('dog_Death', true);

                                        //         }

                                        //     };

                                        //     //=轉向左邊(素材一開始向右)
                                        //     child.filpHandler(true);

                                        //     //==========custom attr



                                        //     // console.debug(child);
                                        //     // console.debug(child.getBounds());
                                        // });


                                        enemy.enemyAttack = (player, enemy) => {
                                            // console.debug(player, enemy);
                                            // console.debug(player.body);
                                            // console.debug(enemy);

                                            player.setTint(0xff0000);
                                            setTimeout(() => {
                                                player.setTint(0xffffff);
                                            }, 100);

                                            player.statsChangeHandler({ HP: player.stats.HP -= enemy.stats.attackPower });
                                            // enemy.anims.play('dog_Attack', true);
                                        };

                                        // console.debug(stars.children.entries[0].active);
                                        this.physics.add.collider(enemy, platforms);


                                    };
                                    var initTimer = () => {
                                        timerText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#000' });
                                        //==計時,時間到進入結算
                                        gameTimer = this.time.delayedCall(timeRemain, () => gameOver = true, [], this);
                                    };
                                    var initPauseMenu = () => {

                                        // Create a label to use as a button
                                        let pauseButton = this.add.text(width - 100, 20, 'Pause', { font: '24px Arial', fill: '#fff' });

                                        // let pauseMenu = new UIScene('pauseMenu');
                                        pauseButton.setInteractive()
                                            .on('pointerdown', () => {
                                                // =When the pause button is pressed, we pause the game
                                                this.scene.pause();
                                                gameTimer.paused = true;
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

                                        player.movingHadler();
                                        player.pickingHadler();
                                        player.attackHandler();

                                        if (player.stats.MP < player.stats.maxMP)
                                            player.statsChangeHandler({ MP: player.stats.MP += player.stats.manaRegen });//自然回魔

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

                                        if (pickUpObj)
                                            pickUpObj.setPosition(player.x, player.y + 10);

                                        orbGroup.children.iterate(child => {

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
                                        // let text = 'TimeLeft : ' +
                                        //     ((timeRemain - gameTimer.getElapsed()) / 1000).toFixed(2) + ' s';
                                        timeVal = parseInt(timeRemain - gameTimer.getElapsed());
                                        let text = 'TimeLeft : ' + timeVal + ' ms';
                                        timerText.setText(text);
                                    };
                                    var updateEnemy = () => {
                                        if (gameData.liberate) return;
                                        //===對話完??
                                        enemy.children.iterate((child) => {
                                            if (child.behavior == 'Death') return;
                                            // console.debug('alive');
                                            child.behaviorHandler(this);
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

                                    if (gameOver) {
                                        //===time remove
                                        gameTimer.remove();

                                        //===get gameResult 
                                        let orbStats = orbGroup.children.entries.map(orb =>
                                            new Object({
                                                postition: orb.x,
                                                timePoint: getTimePoint(orb.x),
                                            })
                                        );
                                        let enemyStats = gameData.liberate ?
                                            gameData.enemyStats : {
                                                enemyActive: enemy.startBehaviorFlag,
                                                enemyHP: enemy.children.entries.map(child => child.stats.HP),
                                            };
                                        let liberate = gameData.liberate ?
                                            gameData.liberate : !(enemyStats.enemyHP.filter(hp => hp > 0).length > 0);


                                        let gameResult = {
                                            //==更新角色資料(剩餘時間、能力值...)
                                            playerInfo: {
                                                timeRemain: timeVal,
                                                playerStats: player.stats,
                                            },
                                            //==更新測站資料(半徑情報....)
                                            stationInfo: {
                                                orbStats: orbStats,
                                                enemyStats: enemyStats,
                                                liberate: liberate,
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
                                                        gameOver = true;
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
                                scene: DefendScene,
                            };
                            const game = new Phaser.Game(config);
                        };

                        gameResult = await new Promise((resolve, reject) => {
                            let playerData = {
                                playerStats: GameData.playerStats,
                                controllCursor: GameData.controllCursor,
                                timeRemain: GameData.timeRemain,
                            }
                            defendGame(stationData, playerData, resolve);
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