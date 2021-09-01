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

        //1.===得測站和經緯度資料
        $.ajax({
            url: eventCatlog + "station.csv",
            dataType: 'text',
            async: false,
            success: function (d) {
                // console.debug(d);
                data = d.split("\n").map(row => {
                    let col = row.trim().split(',');
                    let sta = col[0].replace(new RegExp("'", "g"), '');
                    let coord = [parseFloat(col[1]), parseFloat(col[2])];
                    return { station: sta, coordinate: coord };
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error(jqXHR, textStatus, errorThrown);
            },
        });
        // console.debug(data);

        //2.===依個測站名稱得個分量xy陣列
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
        })
        console.log(data);

        return game;
    };
    game.string = (value) => {
        // stringObj = value;
        return game;
    };

    function game() {

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

            if (data === undefined)
                game.dataDir();
        };
        //==之後作
        async function getWaveImg(stationData, timeDomain = null) {

            let waveData = await (stationData.waveData ? stationData.waveData : data[0].waveData);
            // console.debug(waveData);

            function getSvgUrlArr(data) {
                var getSvgNode = (d, axisSvg = false) => {

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

                    function updateChart() {
                        function getNewData() {
                            let timeArr = chaData.map(d => d.y);
                            let i1 = d3.bisectCenter(timeArr, yAxis_domain[0]);
                            let i2 = d3.bisectCenter(timeArr, yAxis_domain[1]) + 1;//包含最大範圍
                            newData.forEach(d => d[dataKeys[3]] = d[dataKeys[3]].slice(i1, i2));
                            newTimeArr = timeArr.slice(i1, i2);
                        }
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
                        axisSvg ? updateAxis() : updatePaths();

                    };
                    updateChart();
                    return svg.node();
                }
                var getSvgUrl = (svgNode) => {
                    let svgData = (new XMLSerializer()).serializeToString(svgNode);
                    let svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                    let svgUrl = URL.createObjectURL(svgBlob);
                    return svgUrl;
                }

                let svgArr = data.map((d, i) => new Object({
                    svgName: d.channel,
                    svg: getSvgUrl(getSvgNode(d)),
                }));


                //==get xAxis svg
                svgArr.push({
                    svgName: 'xAxis',
                    svg: getSvgUrl(getSvgNode(data[0], true)),
                });
                // console.debug(svgArr);
                return svgArr;
            };

            var SvgUrlArr = getSvgUrlArr(waveData);
            // console.debug(SvgUrlArr);
            return SvgUrlArr;
        };

        function gameBehavior() {
            const gameOuterDiv = document.querySelector('#gameOuter');
            const gameDiv = gameOuterDiv.querySelector('#gameMain');
            const gameUI = document.querySelector('#gameUI');

            var mapObj;
            var stationDataArr, geoJSON;//===location data
            var timeRemain,//===game data
                playerStats = {
                    movementSpeed: 500,
                    jumpingPower: 400,
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

                    data.forEach((d, i) => {
                        // console.debug(d);
                        d['gameData'] = { liberate: false };//==遊戲資料：liberate用來判斷是否已經贏過

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

                        updateStation(marker, { icon: 'foe' });

                        //===station circle
                        let circle = L.circle(d['coordinate'], {
                            className: 'station-circle',
                        });

                        d['circleObj'] = circle;

                        // console.debug(d);
                        marker.addTo(mapObj);
                        circle.addTo(mapObj);
                    });

                };
                async function addUI() {

                    updateGameState({ timeRemain: 500000 }, 800);

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
                const foeIconUrl = '../data/assets/icon/foeIcon.png';
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
            function updateGameState(gameResult, duration = 600) {
                timeRemain = gameResult.timeRemain;
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
                const stationData = stationMarker ? stationMarker.options.data : { gameData: {} };
                // console.debug(stationData);
                let gameResult;
                switch (gameMode) {
                    case 'defend':
                        let wavesSvg = await getWaveImg(stationData);
                        // console.debug(wavesSvg);

                        function defendGame(stationData, playerData, resolve) {
                            const gameData = stationData.gameData;
                            const assetsDir = '../data/assets/';
                            const width = gameBox.width, height = gameBox.height;
                            // const center = [width];
                            // console.debug();
                            var playerStats = Object.assign({}, playerData.playerStats);
                            var timeRemain = playerData.timeRemain;


                            var player, enemy, cursors;
                            var orb, bullets;
                            var platforms;
                            var gameTimer = null, timeVal, timerText = null;
                            var gameOver = false,
                                gameResult = null;

                            var pickUpObj = null;

                            class DefendScene extends Phaser.Scene {
                                constructor() {
                                    super({ key: 'defend' });
                                }
                                enemyDiedFlag = gameData.liberate;
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
                                        if (this.enemyDiedFlag) return;
                                        const dir = gameObjDir + 'dog/';
                                        const frameObj = { frameWidth: 48, frameHeight: 48 };
                                        this.load.spritesheet('dog_Attack', dir + 'Attack.png', frameObj);
                                        this.load.spritesheet('dog_Death', dir + 'Death.png', frameObj);
                                        this.load.spritesheet('dog_Hurt', dir + 'Hurt.png', frameObj);
                                        this.load.spritesheet('dog_Idle', dir + 'Idle.png', frameObj);
                                        this.load.spritesheet('dog_Walk', dir + 'Walk.png', frameObj);

                                    };
                                    var wave = () => {
                                        wavesSvg.forEach(d => this.load.svg('wave_' + d.svgName, d.svg, { scale: 1 }));
                                    };


                                    environment();
                                    player();
                                    enemy();
                                    wave();

                                };
                                create() {
                                    var initEnvironment = () => {
                                        // console.debug()
                                        var station = () => {
                                            let station = stationData.station ? stationData.station : '???';
                                            this.add.image(width * 0.91, height * 0.53, 'station')
                                                .setScale(1, 0.63);
                                            // this.add.image(width * 0.12, height * 0.53, 'title')
                                            //     .setScale(0.1, 0.15).setRotation(0.1).setPosition(width * 0.12, height * 0.53, 100, 100);
                                            this.add.text(width * 0.87, height * 0.46, station, { fontSize: '32px', fill: '#000' })
                                                .setRotation(-0.1).setOrigin(0.5, 0.5);

                                            wavesSvg.forEach((d, i) => {
                                                console.debug()
                                                let y;
                                                if (d.svgName != 'xAxis')
                                                    y = height * (0.15 + 0.25 * i);
                                                else
                                                    y = height * 1.15;

                                                this.add.image(width * 0.5, y, 'wave_' + d.svgName);
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
                                            orb = this.physics.add.group({
                                                key: 'instrument',
                                                repeat: 1,
                                                randomFrame: true,
                                                setScale: { x: orbScale, y: orbScale },
                                                setXY: { x: width * 0.86, y: height * 0.8, stepX: 15 },
                                                // maxVelocityY: 0,
                                                // gravityX: 1000,
                                                // gravityY: -50,
                                            });


                                            var animsCreate = () => {
                                                this.anims.create({
                                                    key: 'orb_shine',
                                                    frames: this.anims.generateFrameNumbers('instrument', { start: 1, end: 4 }),
                                                    frameRate: 5,
                                                    repeat: -1,
                                                    // repeatDelay: 500,
                                                });
                                                this.anims.create({
                                                    key: 'orb_activate',
                                                    frames: this.anims.generateFrameNumbers('instrument', { frames: [8, 9, 12] }),
                                                    frameRate: 5,
                                                    repeat: -1,
                                                    // repeatDelay: 500,
                                                });
                                                this.anims.create({
                                                    key: 'orb_left',
                                                    frames: this.anims.generateFrameNumbers('instrument', { frames: [10, 11, 5, 6, 7] }),
                                                    frameRate: 5,
                                                    repeat: -1,
                                                    // repeatDelay: 500,
                                                });
                                            };
                                            animsCreate();

                                            orb.children.iterate(child => {
                                                child.play('orb_shine');
                                                child.body.setSize(100, 100, true);

                                                //==custom
                                                child.activateFlag = false;
                                                child.pickUpHadler = function (pickUp) {
                                                    // console.debug(this);
                                                    let newPlayerStats = playerData.playerStats;

                                                    if (pickUp) {//pick up                         
                                                        this.body.setMaxVelocityY(0);
                                                        this.setDepth(2);
                                                        pickUpObj.anims.play('orb_activate', true);

                                                        newPlayerStats = {
                                                            movementSpeed: 300,
                                                            jumpingPower: 300,
                                                        };

                                                    }
                                                    else {//put down
                                                        this.body.setMaxVelocityY(1000);
                                                        this.setDepth(0);
                                                        pickUpObj.anims.play('orb_left', true);
                                                    }

                                                    playerStats = Object.assign(playerStats, newPlayerStats);

                                                    if (!this.activateFlag)
                                                        this.activateFlag = true;

                                                    // console.debug(playerStats);
                                                };
                                            });
                                            // instrument.play('orb_shine');
                                            this.physics.add.collider(orb, platforms);

                                            var Bullet = new Phaser.Class({

                                                Extends: Phaser.GameObjects.Image,

                                                initialize:

                                                    function Bullet(scene) {
                                                        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'instrument');

                                                        this.speed = Phaser.Math.GetSpeed(600, 1);
                                                    },

                                                fire: function (x, y) {
                                                    this.setPosition(x, y);

                                                    this.setActive(true);
                                                    this.setVisible(true);
                                                },

                                                update: function (time, delta) {
                                                    // console.debug(time, delta)
                                                    this.x += this.speed * delta;

                                                    if (this.x > 820) {
                                                        this.setActive(false);
                                                        this.setVisible(false);
                                                    }
                                                }

                                            });

                                            bullets = this.add.group({
                                                classType: Bullet,
                                                maxSize: 30,
                                                runChildUpdate: true
                                            });
                                            // console.debug(Bullet, bullets)
                                        }
                                        background();
                                        platform();
                                        station();
                                        instrument();
                                    };

                                    var initPlayer = () => {
                                        player = this.physics.add.sprite(100, 450, 'dude');

                                        // player.setBounce(0.2);
                                        // player.setBounce(100, 0);
                                        player.setCollideWorldBounds(true)
                                            .setPushable(false)
                                            .setDepth(1);
                                        player.body
                                            .setGravityY(500)


                                        var animsCreate = () => {
                                            this.anims.create({
                                                key: 'player_left',
                                                frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
                                                frameRate: 10,
                                                repeat: -1
                                            });

                                            this.anims.create({
                                                key: 'player_turn',
                                                frames: [{ key: 'dude', frame: 4 }],
                                                frameRate: 20
                                            });

                                            this.anims.create({
                                                key: 'player_right',
                                                frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
                                                frameRate: 10,
                                                repeat: -1
                                            });
                                        };
                                        animsCreate();

                                        this.physics.add.collider(player, platforms);
                                        // cursors = this.input.keyboard.createCursorKeys();
                                        cursors = this.input.keyboard.addKeys('w,s,a,d,space,p,q,e');
                                    };
                                    var initEnemy = () => {
                                        if (this.enemyDiedFlag) return;

                                        const enemyScale = 2;
                                        enemy = this.physics.add.group({
                                            key: 'enemy',
                                            // repeat: 2,
                                            randomFrame: true,
                                            setScale: { x: enemyScale, y: enemyScale },
                                            setOrigin: { x: 0.4, y: 0.4 },
                                            setXY: { x: width * 0.8, y: height * 0.7, stepX: 30 },

                                            // quantity: 3,
                                            // yoyo: true,
                                            // maxVelocityX: 0,
                                            // maxVelocityY: 0,
                                            // gravityX: 1000,
                                            // gravityY: 0,
                                            // enable: false,
                                            // immovable: true,
                                        });
                                        // enemy.rotateAroundDistance([0, 0], 1, 0.1);

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
                                                frameRate: 10,
                                                repeat: -1,
                                                repeatDelay: 500,
                                            });
                                            this.anims.create({
                                                key: 'dog_Hurt',
                                                frames: this.anims.generateFrameNumbers('dog_Hurt'),
                                                frameRate: 10,
                                                repeat: -1,
                                                repeatDelay: 500,
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
                                        // enemy.play({ key: 'stand', repeat: 7 });

                                        // this.tweens.add({
                                        //     targets: dog,
                                        //     x: 750,
                                        //     duration: 8800,
                                        //     ease: 'Linear'
                                        // });


                                        enemy.children.iterate(child => {
                                            //  Give each star a slightly different bounce
                                            // child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.5));
                                            child
                                                .setCollideWorldBounds(true)
                                                .setBounce(0)
                                                .setPushable(false)
                                                // .setImmovable(true)
                                                .setMass(3)
                                                .play('dog_Idle');


                                            child.body.setSize(25, 18, true);

                                            //==========custom attr

                                            //=處理轉向
                                            child.filpFlag = false;
                                            child.filpHandler = function (filp) {
                                                // console.debug(this);
                                                let scale = Math.abs(this.scaleX);
                                                if (filp) {
                                                    this.scaleX = -scale;
                                                    this.body.setOffset(30, 30);
                                                    this.filpFlag = true;
                                                }
                                                else {
                                                    this.scaleX = scale;
                                                    this.body.setOffset(5, 30);
                                                    this.filpFlag = false;
                                                }
                                            };
                                            //=判斷進入攻擊範圍
                                            child.startAttack = false;
                                            //=判斷是否休息(追一段時間要休息)
                                            child.restFlag = false;

                                            //=轉向左邊(素材一開始向右)
                                            child.filpHandler(true);

                                            //==========custom attr



                                            // console.debug(child);
                                            // console.debug(child.getBounds());
                                        });


                                        var enemyAttack = (player, enemy) => {
                                            // console.debug(player, enemy);
                                            // console.debug(player.body);
                                            // console.debug(enemy);

                                            player.setTint(0xff0000);
                                            setTimeout(() => {
                                                player.setTint(0xffffff);

                                            }, 100);

                                            // enemy.anims.play('dog_Attack', true);
                                        };
                                        // console.debug(stars.children.entries[0].active);
                                        this.physics.add.collider(enemy, platforms);
                                        this.physics.add.collider(enemy, player, enemyAttack, null, this);

                                    };
                                    var initTimer = () => {
                                        timerText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#000' });
                                        //==計時,時間到進入結算
                                        gameTimer = this.time.delayedCall(timeRemain, () => gameOver = true, [], this);
                                    };
                                    var initPauseMenu = () => {

                                        // Create a label to use as a button
                                        let pause_label = this.add.text(width - 100, 20, 'Pause', { font: '24px Arial', fill: '#fff' });

                                        // let pauseMenu = new UIScene('pauseMenu');
                                        pause_label.setInteractive()
                                            .on('pointerdown', (pointer) => {
                                                // =When the paus button is pressed, we pause the game
                                                this.scene.pause();
                                                gameTimer.paused = true;
                                                //==create pause menu
                                                this.scene.add(null, new UIScene('pauseMenu'), true);
                                                // console.debug(this.scene.manager);

                                            });

                                    };

                                    initEnvironment();
                                    initPlayer();
                                    initEnemy();
                                    initTimer();
                                    initPauseMenu();
                                };
                                update() {

                                    var updatePlayer = () => {
                                        let speed = playerStats.movementSpeed;
                                        let jump = playerStats.jumpingPower;

                                        if (cursors.a.isDown) {
                                            player.setVelocityX(-speed);

                                            player.anims.play('player_left', true);
                                        }
                                        else if (cursors.d.isDown) {
                                            player.setVelocityX(speed);
                                            player.anims.play('player_right', true);
                                            // console.debug(enemy.children.entries[0])
                                            // console.debug(Phaser.Math.Distance.BetweenPoints(player, enemy.children.entries[0]));

                                        }
                                        else {
                                            player.setVelocityX(0);

                                            player.anims.play('player_turn');
                                        };

                                        if (cursors.w.isDown && player.body.touching.down) {
                                            player.setVelocityY(-jump);
                                        };

                                        if (Phaser.Input.Keyboard.JustDown(cursors.space)) {

                                            if (pickUpObj) {  //==put down
                                                pickUpObj.pickUpHadler(false);
                                                pickUpObj = null;
                                            }
                                            else {  //==pick up
                                                const piclUpDistance = 40;
                                                let colsestOrb;
                                                orb.children.iterate(child => {
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
                                                    pickUpObj.pickUpHadler(true);
                                                    // console.debug(pickUpObj);
                                                };
                                            }

                                            var bullet = bullets.get();
                                            if (bullet) {
                                                bullet.fire(player.x, player.y);
                                            }
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

                                            // let wavesSvg = getWaveImg(stationData);
                                            console.debug(this.textures);
                                        }
                                    };
                                    var updateOrb = () => {

                                        if (pickUpObj) {
                                            pickUpObj.setPosition(player.x, player.y + 10);

                                            // pickUpObj.x = player.x;
                                            // pickUpObj.y = player.y;
                                            // pickUpObj.anims.play('orb_activate', true);
                                            // console.debug(bullets)
                                        }


                                    }
                                    var updateTimer = () => {
                                        // let text = 'TimeLeft : ' +
                                        //     ((timeRemain - gameTimer.getElapsed()) / 1000).toFixed(2) + ' s';
                                        timeVal = parseInt(timeRemain - gameTimer.getElapsed());
                                        let text = 'TimeLeft : ' + timeVal + ' ms';
                                        timerText.setText(text);
                                    };
                                    var enemyBehavior = () => {

                                        var chasingBehavior = (child) => {
                                            const chasingDuration = 3000;//追擊多久後休息

                                            let dist = Phaser.Math.Distance.BetweenPoints(player, child);

                                            //===進入敵人的攻擊範圍才啟動追擊
                                            if (!child.startAttack)
                                                if (dist < 300) child.startAttack = true;
                                                else return;
                                            //===開始追擊行為
                                            else
                                                //===不在休息時就追擊
                                                if (!child.restFlag) {
                                                    this.physics.accelerateToObject(child, player, 500, 500, 0);
                                                    // this.physics.moveToObject(child, player, 500, chasingDuration);
                                                    child.anims.play('dog_Walk', true);

                                                    //==時間到後休息restFlag= true
                                                    this.time.delayedCall(chasingDuration, () => {
                                                        child.restFlag = true;
                                                        child.body.reset(child.x, child.y);//==停下
                                                    }, [], this);
                                                }
                                                //===休息時間到就繼續追
                                                else {
                                                    //==休息隨機0~3秒

                                                    let restingDuration = Phaser.Math.Between(0, 3) * 1000;
                                                    this.time.delayedCall(restingDuration, (a, b, c, d) => {
                                                        console.debug(a, b, c, d);
                                                        child.restFlag = false;
                                                    }, [], this);
                                                }


                                            if (dist < 80) {
                                                child.anims.play('dog_Attack', true);
                                                // child.body.reset(child.x, child.y);
                                                // console.debug();
                                            }

                                        };
                                        var filping = (child, filpDir) => {
                                            // console.debug('filping');
                                            child.filpHandler(filpDir);
                                        };

                                        enemy.children.iterate(child => {


                                            chasingBehavior(child);


                                            //===判斷player相對狗的位子來轉向
                                            let filpDir = player.x < child.x;
                                            if (child.filpFlag != filpDir)
                                                filping(child, filpDir);







                                            // console.debug(Math.abs(player.x - child.x));
                                            // child.anims.play('dog_Attack', true);
                                            // this.physics.moveToObject(child, player, 500, 800, 1000);
                                        });

                                        // player.body
                                        // enemy.anims.play('dog_Attack');
                                    };


                                    updatePlayer();
                                    updateOrb();
                                    updateTimer();
                                    enemyBehavior();
                                    // console.debug(gameTimer.getOverallProgress());


                                    if (gameOver) {
                                        //===time remove
                                        gameTimer.remove();
                                        game.destroy(true, false);

                                        //===get gameResult                                 
                                        gameResult = {
                                            liberate: !enemy ? true : false,
                                            timeRemain: timeVal,
                                        };



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

                                    });

                                    //= And a label to illustrate which menu item was chosen. (This is not necessary)
                                    // let choiseLabel = this.add.text(width / 2, height - 150, 'Click outside menu to continue', { font: '30px Arial', fill: '#fff' });

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
                                scene: [DefendScene],
                            };
                            const game = new Phaser.Game(config);
                        };



                        gameResult = await new Promise((resolve, reject) => {
                            let playerData = { playerStats: playerStats, timeRemain: timeRemain }
                            defendGame(stationData, playerData, resolve);
                        });
                        gameDisplay(false);
                        console.debug(gameResult);


                        //===update icon
                        if (gameResult.liberate && !stationData.gameData.liberate)
                            updateStation(stationMarker, { icon: 'player' });
                        else if (!gameResult.liberate)
                            updateStation(stationMarker, { icon: 'foe' });

                        //===update circle
                        if (true) {
                            let radius = (Math.floor(Math.random() * 3) + 1) * 30000;
                            updateStation(stationMarker, { circleRadius: radius });
                        }



                        break;
                    case 'dig':

                        break;
                };


                //===set new game data
                Object.assign(stationData.gameData, {
                    liberate: gameResult.liberate,
                });
                //=update GameState
                updateGameState(gameResult, 1000);
            };

            initMap();

            // console.debug(data);
            gameStart('defend');
        };
        //===init once

        if (!(chartContainerJQ.find('#form-game').length >= 1)) {
            initForm();
        };
        gameBehavior();

    };


    return game;
};