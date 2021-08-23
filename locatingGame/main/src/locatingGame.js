function locatingGame() {
    var selector = 'body';
    // var data;
    var stringObj;

    //Append to the object constructor function so you can only make static calls
    Object.merge2 = function (obj1, obj2) {
        for (var attrname in obj2) {
            obj1[attrname] = obj2[attrname];
        }
        //Returning obj1 is optional and certainly up to your implementation
        return obj1;
    };

    game.selector = (value) => {
        selector = value;
        return game;
    };
    game.dataPath = (value) => {



        return game;
    };
    game.string = (value) => {
        stringObj = value;
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
        async function getWaveImg(station) {
            station = 'sample';
            const waveFileDir = '../data/wave/';
            const fileExtension = '.xy';
            const cannel = ['E', 'N', 'Z'];
            const fileDataKey = ['x', 'y'];

            function getData(paths) {
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
                                    var channel = filePath.substring(
                                        filePath.lastIndexOf('/') + 1,
                                        filePath.indexOf(fileExtension));
                                    var fileData = { channel: channel, data: tmpData };
                                    resolve(fileData);
                                }
                                else {
                                    reject(new Error(req))
                                }
                            }
                        }
                        rawFile.send(null);
                    });

                };

                let chaData = paths.map(path => readTextFile(path, fileDataKey));
                // console.debug(sampleData);
                let data = Promise.all(chaData).then(success => {
                    // console.debug(success);
                    return success;
                });

                return data;
            }
            function getSvgUrlArr(data) {
                var getSvgNode = (d) => {
                    // console.debug(d);
                    const data = d.data;
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
                    const height = 300;
                    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
                    const svg = d3.create("svg")
                        .attr("viewBox", [0, 0, width, height]);
                    const xAxis = svg.append("g").attr("class", "xAxis");
                    const yAxis = svg.append("g").attr("class", "yAxis");
                    const pathGroup = svg.append("g").attr('class', 'paths').attr("clip-path", "url(#clip)");

                    function updateChart() {
                        x = d3.scaleLinear()
                            .domain(d3.extent(data.map(d => d.x)))
                            .range([0, width]);

                        y = d3.scaleLinear()
                            .domain(d3.extent(data.map(d => d.y)))
                            .range([height - margin.bottom, 0]);

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
                                .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));


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


                            var line = d3.line()
                                .defined(d => !isNaN(d.x))
                                .x(d => x(d.x))
                                .y(d => y(d.y));


                            var makePaths = pathGroup => pathGroup
                                .append("path")
                                .style("mix-blend-mode", "normal")
                                .attr("fill", "none")
                                .attr("stroke-width", 1)
                                .attr("stroke-linejoin", "round")
                                .attr("stroke-linecap", "round")
                                .attr("stroke-opacity", 1)
                                .attr("stroke", 'red')
                                .attr("d", line(data))


                            pathGroup.call(makePaths);

                        };
                        // updateAxis();
                        updatePaths();
                        // refreshText();


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

                return data.map(d => getSvgUrl(getSvgNode(d)));
            };
            var paths = cannel.map(c => waveFileDir + station + fileExtension);
            var data = await getData(paths);//等data處理完才能畫圖
            var SvgUrlArr = getSvgUrlArr(data);
            // console.debug(SvgUrlArr);
            return SvgUrlArr;
        };

        function gameBehavior() {
            const gameOuterDiv = document.querySelector('#gameOuter');
            const gameDiv = gameOuterDiv.querySelector('#gameMain');
            const gameUI = document.querySelector('#gameUI');

            var mapObj;
            var stationDataArr, geoJSON;//===location data
            var timeRemain, playerStats;//===game data

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
                    Object.merge2(L.control(), {
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
                            // console.debug(d);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.error(jqXHR, textStatus, errorThrown);
                        },
                    });

                    stationDataArr.forEach((d, i) => {

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

                let gameResult;
                switch (gameMode) {
                    case 'defend':
                        let wavesSvg = await getWaveImg(stationData);
                        // console.debug(wavesSvg);


                        function defendGame(stationData, timeRemain, resolve) {
                            const data = stationData.gameData;
                            const assetsDir = '../data/assets/';
                            const width = gameBox.width, height = gameBox.height;
                            // const center = [width];
                            // console.debug();

                            var player, enemy, cursors;
                            var playerStats = {
                                movementSpeed: 500,
                                jumpingPower: 400,
                            };
                            var platforms;
                            var gameTimer = null, timeVal, timerText = null;
                            var gameOver = false,
                                gameResult = null;


                            class DefendScene extends Phaser.Scene {
                                constructor() {
                                    super({ key: 'defend' });
                                }
                                enemyDiedFlag = data.liberate;
                                preload() {
                                    const gameObjDir = assetsDir + 'gameObj/';

                                    this.load.image('sky', gameObjDir + 'sky.png');
                                    this.load.image('ground', gameObjDir + 'platform.png');
                                    this.load.image('star', gameObjDir + 'star.png');
                                    // this.load.image('bomb', gameObjDir + 'bomb.png');
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
                                        wavesSvg.forEach((svg, i) => this.load.svg('wave_' + i, svg, { scale: 1 }));
                                    };

                                    player();
                                    enemy();
                                    wave();

                                };
                                create() {
                                    var initEnvironment = () => {
                                        // console.debug(this)
                                        let bgImg = this.add.image(width * 0.5, height * 0.5, 'sky');
                                        bgImg.setScale(width / bgImg.width, height / bgImg.height);

                                        platforms = this.physics.add.staticGroup();

                                        platforms.create(width * 0.5, height * 0.95, 'ground').setScale(3).refreshBody();


                                        this.add.image(width * 0.5, height * 0.5, 'wave_0');
                                        // wave.setScale(3);
                                        // platforms.create(width * 0.5, 400, 'ground');
                                        // platforms.create(50, 250, 'ground');
                                        // platforms.create(750, 220, 'ground');
                                    };
                                    var initPlayer = () => {
                                        player = this.physics.add.sprite(100, 450, 'dude');

                                        // player.setBounce(0.2);
                                        player.setCollideWorldBounds(true);
                                        player.body.setGravityY(500);

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
                                        cursors = this.input.keyboard.addKeys('w,s,a,d');
                                    };
                                    var initEnemy = () => {
                                        if (this.enemyDiedFlag) return;

                                        const enemyScale = 2;
                                        enemy = this.physics.add.group({
                                            key: 'dog_Idle',
                                            // repeat: 2,
                                            randomFrame: true,
                                            setScale: { x: -enemyScale, y: enemyScale },
                                            setOrigin: { x: 1, y: 0 },
                                            setXY: { x: width * 0.8, y: height * 0.75, stepX: 30 },

                                            // quantity: 3,
                                            // yoyo: true,
                                            maxVelocityX: 0,
                                            // maxVelocityY: 0,
                                            // gravityX: 1000,
                                            // gravityY: 1000,
                                            // enable: false,
                                            // immovable: true,
                                        });

                                        var animsCreate = () => {
                                            this.anims.create({
                                                key: 'stand',
                                                frames: this.anims.generateFrameNumbers('dog_Idle'),
                                                frameRate: 10,
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


                                        enemy.children.iterate(function (child) {
                                            //  Give each star a slightly different bounce
                                            // child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.5));
                                            child
                                                .setCollideWorldBounds(true)
                                                .play({
                                                    key: 'stand',
                                                    repeat: -1,
                                                    repeatDelay: 500,
                                                });

                                            console.debug(child.getBounds());
                                        });
                                        // var collectStar = (player, star) => {
                                        //     star.disableBody(true, true);
                                        //     enemy = null;
                                        //     //==勝利,清除計時
                                        //     gameOver = true;

                                        // };
                                        var hitEnemy = (player, star) => {

                                        };
                                        // console.debug(stars.children.entries[0].active);
                                        this.physics.add.collider(enemy, platforms);
                                        this.physics.add.collider(player, enemy);
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
                                        }
                                        else {
                                            player.setVelocityX(0);

                                            player.anims.play('player_turn');
                                        }

                                        if (cursors.w.isDown && player.body.touching.down) {
                                            player.setVelocityY(-jump);
                                        }
                                    };
                                    var updateTimer = () => {
                                        // let text = 'TimeLeft : ' +
                                        //     ((timeRemain - gameTimer.getElapsed()) / 1000).toFixed(2) + ' s';
                                        timeVal = parseInt(timeRemain - gameTimer.getElapsed());
                                        let text = 'TimeLeft : ' + timeVal + ' ms';
                                        timerText.setText(text);
                                    };
                                    updatePlayer();
                                    updateTimer();
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
                            defendGame(stationData, timeRemain, resolve);
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
                Object.merge2(stationData.gameData, {
                    liberate: gameResult.liberate,
                });
                //=update GameState
                updateGameState(gameResult, 1000);
            };

            initMap();
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