function locatingGame() {
    var selector = 'body';
    var data;
    var GameData = null;

    //Append to the object constructor function so you can only make static calls
    // Object.merge2 = function (obj1, obj2) {
    //     for (var attrname in obj2) {
    //         obj1[attrname] = obj2[attrname];
    //     }
    //     //Returning obj1 is optional and certainly up to your implementation
    //     return obj1;
    // };
    var getRandom = (x) => {
        return Math.floor(Math.random() * x);
    };
    var distanceByLnglat = (coordinate1, coordinate2) => {
        const Rad = (d) => d * Math.PI / 180.0;

        let lng1 = coordinate1[1], lat1 = coordinate1[0],
            lng2 = coordinate2[1], lat2 = coordinate2[0];

        var radLat1 = Rad(lat1);
        var radLat2 = Rad(lat2);
        var a = radLat1 - radLat2;
        var b = Rad(lng1) - Rad(lng2);
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * 6378137.0;// 取WGS84標準參考橢球中的地球長半徑(單位:m)
        s = Math.round(s * 10000) / 10000;
        // console.debug(s);
        return s / 1000;//==km
    };

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

    async function game() {

        const chartContainerJQ = $(selector);

        //===append map,gameInnerDiv..etc
        function initForm() {

            chartContainerJQ.append(`
                <form id="form-game">

                <div class="form-group row" id="gameGroup">

                  
                    <div id="bigMap" class="col-12"></div>
                  
                 
                    <div id="gameOuter"  class="row">
                        <div id="gameMain"></div>                      
                    </div>
   
                    <div class="form-group" id="gameUI"></div>

                </div> 
                </form>
                `);

            if (data === undefined)
                game.dataDir();
        };
        function gameGenerate() {
            const gameOuterDiv = chartContainerJQ.find('#gameOuter');
            const gameUI = chartContainerJQ.find('#gameUI');
            const bigMap = document.querySelector('#bigMap');//==一些畫面位置計算用到
            const width = window.innerWidth, height = window.innerHeight;

            var mapObj;
            var geoJSON;//===location data
            var assumedEpicenter;

            var gameDisplay = (display) => {

                if (display) {
                    gameOuterDiv.fadeIn();

                    //==遊戲開始UI關閉
                    gameUI.find('.UIicon').toggleClass('clicked', false);
                    gameUI.find('.UI').hide();

                }
                else
                    gameOuterDiv.fadeOut();
            };

            function initGameData() {
                let playerRole = 'mage';//==之後能選其他

                GameData = {
                    timeRemain: 5 * 60000,//1min=60000ms           
                    // timeRemain: 0.01 * 60000,//1min=60000ms
                    timeMultiplier: 300,//real 1 ms = game x ms;
                    velocity: 7.5,//==速度參數預設7.5
                    playerEpicenter: null,
                    velocityChartUnlock: false,
                    controllCursor: {
                        up: 'w',
                        down: 's',
                        left: 'a',
                        right: 'd',
                        attack: 'space',
                        //==UI controll
                        pause: 'p',
                        backpack: 'i',
                        detector: 'o',
                        shiftLeft: 'q',
                        shiftRight: 'e',
                        functionKey: 'c',
                        reset: 'r',
                        exit: 'esc',
                    },
                    language: 'zh-TW',
                    playerRole: playerRole,
                    playerStats: GameObjectStats.player[playerRole],
                };
            };
            function initStartScene() {

                var getLanguageJSON = () => {
                    return $.ajax({
                        url: "../data/language/" + GameData.language + ".json",
                        dataType: "json",
                        async: false,
                        success: function (d) { console.debug(d); },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.error(jqXHR, textStatus, errorThrown);
                        },
                    });
                };

                var startScene = async () => {


                    GameData.languageJSON = await getLanguageJSON();
                    // gameDisplay(true);

                    // let newGameData = await new Promise((resolve, reject) => {
                    //     const config = {
                    //         parent: 'gameMain',
                    //         type: Phaser.AUTO,
                    //         width: width,
                    //         height: height,
                    //         physics: {
                    //             default: 'arcade',
                    //             arcade: {
                    //                 gravity: { y: 300 },
                    //                 debug: true,
                    //             }
                    //         },
                    //         scene: new StartScene(GameData, resolve),
                    //     };
                    //     new Phaser.Game(config);
                    // });
                    // if (GameData.language != newGameData.language)
                    //     GameData.languageJSON = await getLanguageJSON();
                    // Object.assign(GameData, newGameData);
                    // gameDisplay(false);
                    // initMap();


                    //==test
                    initMap();
                    // gameStart('defend');
                    gameStart('dig');

                    //==test
                };

                startScene();

            };
            function initGameOverScene() {

                var gameOverScene = async () => {
                    gameDisplay(true);

                    let newGameData = await new Promise((resolve, reject) => {
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
                            scene: new GameOverScene(GameData, resolve),
                        };
                        new Phaser.Game(config);
                    });

                    // Object.assign(GameData, newGameData);
                    gameDisplay(false);
                    updateMapUI({ timeRemain: 80000 }, 800);
                    data.forEach(d => updateStation(d.markerObj, { icon: 'default' }));
                };
                gameOverScene();

            };
            function initMap() {

                const fadeInDuration = 300;
                const fadeOutDuration = 100;

                //==confirmWindow沒關閉又再次點擊會無法產生打字特效,所以用這方法
                var requestTypingAnim = () => {
                    let typingText = gameUI.find('.confirmWindow>text');

                    typingText
                        .removeClass('typingText')
                        .css({ "visibility": "hidden" });

                    window.requestAnimationFrame(function (time) {
                        window.requestAnimationFrame(function (time) {
                            typingText
                                .addClass('typingText')
                                .css({ "visibility": "visible" });
                        });
                    });
                };

                function init() {
                    const movableRange = 10;

                    let coordinateArr = data.map(d => d.coordinate);
                    let latDomain = d3.extent(coordinateArr, d => d[0]),
                        lngDomain = d3.extent(coordinateArr, d => d[1]);

                    mapObj = L.map('bigMap', {
                        center: [23.58, 120.58],
                        zoom: 8,
                        minZoom: 7,
                        maxZoom: 10,
                        //==地圖move範圍
                        maxBounds: [
                            [latDomain[0] - movableRange, lngDomain[0] - movableRange],
                            [latDomain[1] + movableRange, lngDomain[1] + movableRange]
                        ],
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


                    // control that shows state info on hover
                    // Object.assign(L.control(), {
                    //     onAdd: function (mapObj) {
                    //         this._div = L.DomUtil.create('div', 'info');
                    //         this._div.id = 'cityName';
                    //         this.update();
                    //         return this._div;
                    //     },
                    //     update: function (props) {
                    //         this._div.innerHTML = (props ?
                    //             '<b>' + props.name + '</b><br />'
                    //             : 'Hover over a city or county');
                    //     }
                    // }).addTo(mapObj);

                    // console.debug(geoJSON);
                };
                async function addStation() {
                    // console.debug(data);
                    const backgroundArr = Object.keys(BackGroundResources.defend);
                    let markerArr = [],
                        circleArr = [];

                    data.forEach((d, i) => {
                        // console.debug(d);
                        // let enemy = ['dog', 'cat'];//==之後隨機抽敵人組
                        let enemy = [];//==之後隨機抽敵人組
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
                        // let background = 'candy_4';
                        // console.debug(background);

                        d['stationStats'] = {
                            liberate: false,//==敵人死亡
                            clear: false,//==寶珠移動過
                            enemyStats: enemyStats,
                            background: background,
                        };//==遊戲資料：liberate用來判斷是否已經贏過

                        //===station icon
                        let marker = L.marker(d['coordinate'], {
                            pane: 'markerPane',
                            data: d,
                            // bubblingMouseEvents: true,
                        })
                            .on('mouseover', (e) => {
                                updateStation(marker, { mouseEvent: 1 });
                            })
                            .on('mouseout', (e) => {
                                updateStation(marker, { mouseEvent: 0 });
                            })
                            .on('click', function (e) {
                                if (GameData.timeRemain == 0) return;
                                requestTypingAnim();

                                gameUI.find('.confirmWindow')
                                    .fadeIn(fadeInDuration)
                                    .find('.placeStr')
                                    .text(`${d['station']}${GameData.languageJSON.Tip['station']}`)
                                    .data('gameStartParameters', ['defend', marker]);

                            });

                        marker.bindTooltip(d['station'], {
                            direction: 'top',
                            // permanent: true,
                            className: 'station-tooltip',
                        });

                        //===station circle
                        let circle = L.circle(d['coordinate'], {
                            className: 'station-circle',
                            radius: 0,
                            opacity: 0,
                        });

                        Object.assign(d, {
                            markerObj: marker,
                            circleObj: circle,
                        });



                        markerArr.push(marker);
                        circleArr.push(circle);
                        updateStation(marker, { icon: 'default' });
                    });

                    L.layerGroup(markerArr, { key: 'markerGroup' }).addTo(mapObj);
                    L.layerGroup(circleArr, { key: 'circleGroup' }).addTo(mapObj);


                    //＝＝test 震央
                    let size = 40;
                    L.marker(data.epicenter['coordinate'], {
                        icon: L.icon({
                            iconUrl: '../data/assets/icon/star.png',
                            iconSize: [size, size],
                            iconAnchor: [size / 2, size / 2],
                        }),
                        pane: 'markerPane',
                        data: data.epicenter,
                    }).addTo(mapObj);
                    //＝＝test 震央

                    assumedEpicenter = L.marker(data.epicenter['coordinate'], {
                        icon: L.icon({
                            iconUrl: '../data/assets/icon/star2.png',
                            iconSize: [size, size],
                            iconAnchor: [size / 2, size / 2],
                        }),
                        pane: 'markerPane',
                        data: data.epicenter,
                    }).bindTooltip('', {
                        direction: 'top',
                        className: 'station-tooltip',
                    })
                        .on('mouseover', e => {
                            updateStation(e.target, { mouseEvent: 1 });
                        })
                        .on('mouseout', e => {
                            updateStation(e.target, { mouseEvent: 0 });
                        }).on('click', function (e) {
                            //==觸發畫面位置點擊(要在假設點上座標才對)
                            let bigMapDOMRect = bigMap.getBoundingClientRect();
                            const event = new MouseEvent('click', {
                                'view': window,
                                'bubbles': true,
                                'cancelable': true,
                                'clientX': e.containerPoint.x + bigMapDOMRect.x,
                                'clientY': e.containerPoint.y + bigMapDOMRect.y,
                            });
                            bigMap.dispatchEvent(event);

                        }).addTo(mapObj);
                    assumedEpicenter.getElement().style.display = 'none';

                };
                async function addUI() {
                    const ctrlDir = assetsDir + 'ui/controller/';

                    //===UIBar
                    const UIbuttons = ['playerStats', 'velocityChart'];

                    //===UItooltip
                    const UItooltip = gameUI
                        .append(`<div class="UItooltip"><div class="tooltipText"></div></div>`)
                        .find('.UItooltip');

                    //===UIhint
                    const UIhint = gameUI
                        .append(`<div class="UIhint"><div class="tooltipText"></div></div>`)
                        .find('.UIhint');

                    function updateTooltip(target) {
                        let bigMapDOMRect = bigMap.getBoundingClientRect();
                        let targetDOMRect = target.getBoundingClientRect();
                        let imgNode = target.children[0];

                        UItooltip.show()//==先show才能得到寬高
                            .children('.tooltipText')
                            .text(GameData.languageJSON.UI[target.id]);

                        // UItooltip
                        let top = targetDOMRect.top - bigMapDOMRect.top - imgNode.offsetHeight * 0.7,
                            left = targetDOMRect.left - bigMapDOMRect.left - 0.5 * (UItooltip.get(0).offsetWidth - imgNode.offsetWidth);

                        UItooltip.css({ top: top, left: left, });


                        if (!GameData.velocityChartUnlock && target.id == UIbuttons[1]) {


                            UIhint
                                .animate({ "opacity": "show" }, 500)
                                .children('.tooltipText')
                                .text(GameData.languageJSON.Tip[`${target.id}Lock`]);

                            let top = targetDOMRect.top,
                                left = targetDOMRect.left - bigMapDOMRect.left + imgNode.offsetWidth + 10;

                            UIhint.css({ top: top, left: left });

                        };
                    };
                    function updateUI(target, show) {
                        // console.debug(target, show);
                        let id = target.id;
                        let UI = gameUI.find(`#${id}UI`);

                        if (show) {
                            gameUI.append(UI);//==bring to top
                            UI.show();

                            let bigMapDOMRect = bigMap.getBoundingClientRect();
                            let targetDOMRect = target.getBoundingClientRect();

                            let top = targetDOMRect.top - bigMapDOMRect.top,
                                left = targetDOMRect.left - bigMapDOMRect.left + 80;

                            UI.css({ top: top, left: left, });

                            //==速度參數圖表更新
                            if (id == UIbuttons[1])
                                d3.select(`#${UIbuttons[1]}UI>svg`).dispatch('updateEvt');
                        }
                        else UI.hide();

                    };

                    var timeRemain = () => {
                        gameUI.append(`
                        <div class="timeRemain">${GameData.languageJSON.UI['timeRemain']} : 
                            <div class='timer' value='0'>
                                &nbsp;<font size="5" >0</font>&nbsp;${GameData.languageJSON.UI['DAYS']}
                                &nbsp;<font size="5" >0</font>&nbsp;${GameData.languageJSON.UI['HRS']}
                                &nbsp;<font size="5" >0</font>&nbsp;${GameData.languageJSON.UI['MINS']}
                            </div>
                        </div>             
                        `);

                        updateMapUI({ timeRemain: GameData.timeRemain }, 800);
                    };
                    var UIbar = () => {
                        const eachButtonH = 100;
                        const UIbarH = eachButtonH * UIbuttons.length,
                            UIbarW = 60;
                        const interval = UIbarH / (UIbuttons.length + 1);
                        const iconW = 50;

                        var init = () => {
                            gameUI
                                .append(`<div class="UIbar"></div>`)
                                .find('.UIbar')
                                .width(UIbarW)
                                .height(UIbarH);

                        };
                        var addIcons = () => {
                            const left = (UIbarW - iconW) * 0.5;

                            let iconsHtml = UIbuttons.map((btn, i) => `
                            <div class="UIicon" id="${btn}" style="top:${interval * (i + 1) - iconW * 0.5}px; left:${left}px">
                                <img src="${assetsDir}icon/${btn}.png" width="${iconW}px" height="${iconW}px">
                            </div>
                            `);
                            gameUI.find('.UIbar').append(iconsHtml);


                            //===UI
                            UIbuttons.forEach(btn => {
                                let UI = gameUI
                                    .append(`<div class="UI" id="${btn}UI"></div>`)
                                    .find(`#${btn}UI`);

                                switch (btn) {
                                    case 'playerStats':
                                        UI
                                            .width(height * 0.5)
                                            .height(height * 0.5);

                                        break;
                                    case 'velocityChart':
                                        //==lock gif
                                        gameUI.find('#velocityChart').append(`
                                            <img id="velocityChartLock" src="${ctrlDir}unlock.gif" width="${iconW}px" height="${iconW}px">
                                        `);

                                        UI
                                            .append(`
                                            <div  style="white-space: nowrap;text-align:center;">
                                                <h2>${GameData.languageJSON.UI['velocityStr']}：
                                                    <b id="velocityStr" style="color:Tomato;font-size:60px;">${GameData.velocity.toFixed(2)}</b> km/s
                                                </h2>
                                            </div>
                                            `)
                                            .append(getVelocityChart())
                                            .find('svg')
                                            .width(height * 0.5)
                                            .height(height * 0.5);

                                        break;

                                };

                            });

                        };
                        var iconEvent = () => {
                            const iconW2 = iconW * 1.5;

                            const duration = 50;
                            const delay = 10;
                            const eachPartStep = parseInt(duration / delay);
                            const WChange = (iconW2 - iconW) / eachPartStep;

                            let interval;
                            gameUI.find('.UIicon')
                                .on('mouseover', (e) => {
                                    // console.debug('mouseenter');

                                    let newIconW = iconW, step = 0;
                                    if (interval) clearInterval(interval);
                                    interval = setInterval(() => {

                                        let part = parseInt(step / eachPartStep);

                                        switch (part) {
                                            case 0:
                                                newIconW += WChange;
                                                break;
                                            case 1:
                                                newIconW = iconW2;
                                                clearInterval(interval);
                                                break;
                                        };

                                        //==改變長寬
                                        Object.assign(e.target, {
                                            width: newIconW,
                                            height: newIconW,
                                        });

                                        //==至中
                                        Object.assign(e.target.style, {
                                            top: 0.5 * (iconW - newIconW) + 'px',
                                            left: 0.5 * (iconW - newIconW) + 'px',
                                        });
                                        step++;
                                    }, delay);

                                    updateTooltip(e.target.parentNode);
                                })
                                .on('mouseout', (e) => {
                                    if (interval) clearInterval(interval);
                                    Object.assign(e.target, {
                                        width: iconW,
                                        height: iconW,
                                    });
                                    Object.assign(e.target.style, {
                                        top: '0px',
                                        left: '0px',
                                    });

                                    UItooltip.hide();
                                    if (!GameData.velocityChartUnlock && e.target.parentNode.id == UIbuttons[1])
                                        UIhint.hide();
                                })
                                .on('click', function (e) {
                                    //==速度參數要完成兩站才能調整
                                    if (this.id == UIbuttons[1] && !GameData.velocityChartUnlock) return;

                                    let button = $(this);
                                    let ckick = button.hasClass('clicked');
                                    button.toggleClass('clicked', !ckick);

                                    updateUI(this, !ckick);
                                });

                        };
                        init();
                        addIcons();
                        iconEvent();
                        //==test
                        // $(`#velocityChart`).trigger('click');
                    };
                    var confirmWindow = () => {
                        let imgW = 10;
                        let confirmWindow = gameUI.append(`
                        <div class="confirmWindow">
                            <text>${GameData.languageJSON.Tip['mapClickConfirm1']} 
                                <b class="placeStr"></b>
                             ${GameData.languageJSON.Tip['mapClickConfirm2']}
                            </text>
                            <div class="d-flex justify-content-around" >
                                <text name="confirm" value="yes">
                                    <img name="confirmImg" src="${ctrlDir}triangle_left.png" width="${imgW}px" height="${imgW}px">
                                    ${GameData.languageJSON.Tip['yes']}
                                    <img name="confirmImg" src="${ctrlDir}triangle_right.png" width="${imgW}px" height="${imgW}px">
                                </text>

                                <text name="confirm" value="no">
                                    <img name="confirmImg" src="${ctrlDir}triangle_left.png" width="${imgW}px" height="${imgW}px">
                                    ${GameData.languageJSON.Tip['no']}
                                    <img name="confirmImg" src="${ctrlDir}triangle_right.png" width="${imgW}px" height="${imgW}px">
                                </text>
                                
                            </div>
                        <div>
                        `).find('.confirmWindow');

                        let placeStr = confirmWindow.find('.placeStr');

                        confirmWindow.find('text[name = "confirm"]')
                            .css('cursor', 'pointer')
                            .on('mouseover', (e) => {
                                $(e.target).children().css({ "visibility": "visible" });

                            })
                            .on('mouseout', (e) => {
                                $(e.target).children().css({ "visibility": "hidden" });
                            })
                            .on('click', (e) => {
                                let yes = $(e.target).attr('value') == 'yes';
                                if (yes) {
                                    let gameStartParameters = placeStr.data('gameStartParameters');
                                    gameStart(...gameStartParameters);
                                };
                                confirmWindow.hide();

                            });

                    };

                    timeRemain();
                    UIbar();
                    confirmWindow();

                };
                function addMapEvent() {
                    const allowedErro = 10;//==容許與震央相差距離(km)
                    let bingo;//==找到震央布林值
                    let confirmWindow = gameUI.find('.confirmWindow');

                    mapObj
                        .on('click', function (e) {
                            if (GameData.timeRemain == 0) return;
                            let lat = e.latlng.lat;
                            let lng = e.latlng.lng;

                            let distToEpicenter = distanceByLnglat([lat, lng], data.epicenter.coordinate);
                            console.debug(distToEpicenter);
                            bingo = distToEpicenter <= allowedErro;

                            requestTypingAnim();

                            confirmWindow.fadeIn(fadeInDuration)
                                .find('.placeStr')
                                .text(`${lat.toFixed(2)} , ${lng.toFixed(2)}`)
                                .data('gameStartParameters', ['dig', bingo ? data.epicenter : { coordinate: [lat, lng] }]);

                        })
                        .on('move', function (e) {
                            confirmWindow.fadeOut(fadeOutDuration);
                        });

                };
                init();
                addStation();
                // addCounty();
                addUI();
                addMapEvent();

            };
            function updateStation(stationMarker, updateObj = {}) {

                const originalIconSize = 40;
                const IconClass = L.Icon.extend({
                    options: {
                        tooltipAnchor: [0, -25],
                        className: 'station-icon',
                    }
                });
                const defaultIconUrl = assetsDir + 'icon/home.png';
                const clearIconUrl = assetsDir + 'icon/home_clear.png';

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

                    circleObj.setStyle({ opacity: 1 });//==一開始不顯示
                };

                let interval;
                var iconUpDownAnime = (marker, iconUrl, duration = 600) => {
                    const delay = 10;

                    const animePart = 2;//2個步驟：變大>原來大小
                    const eachPartStep = parseInt((duration / animePart) / delay);
                    const sizeChange = originalIconSize / eachPartStep * animePart;

                    let size = 0, step = 0;
                    interval = setInterval(() => {

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
                var iconTriggerAnime = (marker, trigger = true, duration = 50) => {
                    if (interval) return;
                    const iconScale = 1.5;
                    const
                        iconSize1 = trigger ? originalIconSize : originalIconSize * iconScale,
                        iconSize2 = trigger ? originalIconSize * iconScale : originalIconSize;
                    const iconUrl = marker.getIcon().options.iconUrl;

                    const delay = 10;
                    const totalStep = parseInt(duration / delay);
                    const sizeChange = (iconSize2 - iconSize1) / totalStep;

                    let size = iconSize1, step = 0;
                    interval = setInterval(() => {

                        let part = parseInt(step / totalStep);

                        switch (part) {
                            case 0:
                                size += sizeChange;
                                break;
                            case 1:
                                size = iconSize2;
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
                var iconBrokenAnime = (marker, duration = 500) => {
                    const
                        iconUrl1 = marker.getIcon().options.iconUrl,
                        iconUrl2 = '../data/assets/icon/home_broken.png',
                        iconUrl3 = '../data/assets/icon/home_destruction.png';

                    const totalStep = 2;//==依序換2次圖
                    const delay = parseInt(duration / totalStep);

                    let url = iconUrl1, step = 1;
                    interval = setInterval(() => {

                        let part = parseInt(step / totalStep);

                        switch (part) {
                            case 0:
                                url = iconUrl2;
                                break;
                            case 1:
                                url = iconUrl3;
                                clearInterval(interval);
                                break;
                        };


                        marker.setIcon(new IconClass({
                            iconUrl: url,
                            // iconSize: [size, size],
                            // iconAnchor: [size / 2, size / 2],
                        }));
                        step++;
                    }, delay);
                };

                if (stationMarker) {
                    //==完成測站動畫
                    if (updateObj.icon) {
                        let icon;
                        switch (updateObj.icon) {
                            case 'default':
                                icon = defaultIconUrl;
                                break;
                            case 'clear':
                                icon = clearIconUrl;
                                break;
                        };
                        iconUpDownAnime(stationMarker, icon);

                    };
                    //==delta更新動畫
                    if (!isNaN(updateObj.circleRadius)) {
                        let data = stationMarker.options.data;
                        let circleObj = data.circleObj;
                        circleAnime(circleObj, updateObj.circleRadius);
                    };
                    //==mousehover動畫
                    if (updateObj.hasOwnProperty('mouseEvent')) {
                        updateObj.mouseEvent ?
                            iconTriggerAnime(stationMarker) :
                            iconTriggerAnime(stationMarker, false);

                    };
                    //==gameover動畫
                    if (updateObj.hasOwnProperty('gameOver')) {
                        iconBrokenAnime(stationMarker, updateObj.duration);
                    };

                };

            };
            function updateMapUI(gameResult, duration = 600) {
                let timeRemain = gameResult.timeRemain;
                let playerStats = gameResult.playerStats;
                let controllCursor = gameResult.controllCursor;

                //==timerAnime
                const timer = document.querySelector('#gameUI .timer');
                const timerTexts = timer.children;
                const
                    start = parseInt(timer.getAttribute('value')) * GameData.timeMultiplier,
                    end = timeRemain * GameData.timeMultiplier;
                const increase = start > end ? false : true;

                // console.debug(start);

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
                        };

                        let notEnoughForDays = now % 86400000;

                        timerTexts[0].innerHTML = parseInt(now / 86400000);
                        timerTexts[1].innerHTML = parseInt(notEnoughForDays / 3600000);
                        timerTexts[2].innerHTML = parseInt(notEnoughForDays % 3600000 / 60000);

                        now += step;
                    }, delay);

                };
                timerAnime(increase);
                timer.setAttribute('value', timeRemain);

                //==update GameData
                GameData.timeRemain = timeRemain;
                GameData.playerStats = Object.assign(GameData.playerStats, playerStats);
                if (controllCursor) GameData.controllCursor = controllCursor;

                if (!GameData.velocityChartUnlock)
                    if (data.filter(d => d.stationStats.clear).length >= 2) {
                        GameData.velocityChartUnlock = true;

                        //==延遲後移除lock.gif
                        const lock = gameUI.find('#velocityChartLock');
                        var lockAnime = () => {
                            const delay = 10;
                            const step = 1 / (duration * 1.5 / delay);//==opacity預設1

                            var opacity = 1;
                            let interval = setInterval(() => {
                                if (opacity <= 0) {
                                    opacity = 0;
                                    clearInterval(interval);
                                    lock.remove();
                                }
                                else {
                                    lock.css('opacity', opacity);
                                    opacity -= step;
                                };
                            }, delay);
                        };
                        lockAnime();
                    };

                //==gameover
                if (GameData.timeRemain == 0) {
                    var apocalypse = () => {
                        const bigMapJQ = $(bigMap);

                        const delay = 50;
                        const step = duration * 0.5 / delay;
                        // console.debug(duration)
                        let distance = 3, nowStep = 0;
                        let interval = setInterval(() => {
                            if (nowStep >= step) {
                                clearInterval(interval);
                            };

                            bigMapJQ.effect("shake", {
                                distance: distance += nowStep,
                                times: 1,
                            });

                            nowStep += 1;
                        }, delay);

                        //==房子倒塌動畫
                        data.forEach(d => updateStation(d.markerObj, {
                            gameOver: true,
                            duration: duration * 3,
                        }));
                    };

                    setTimeout(() => apocalypse(), duration * 1);
                    setTimeout(() => initGameOverScene(), duration * 5);
                };


            };

            //===when  map clicked 
            async function gameStart(gameMode, siteData = null) {
                // console.debug(gameMode, siteData);

                gameDisplay(true);

                let gameResult;
                if (gameMode == 'defend') {
                    let stationData = siteData ?
                        siteData.options.data :
                        data[0].markerObj.options.data;//test

                    gameResult = await new Promise((resolve, reject) => {
                        const config = {
                            parent: 'gameMain',
                            type: Phaser.AUTO,
                            width: width * 0.9,
                            height: height * 0.95,
                            physics: {
                                default: 'arcade',
                                arcade: {
                                    gravity: { y: 300 },
                                    // debug: true,
                                },
                            },
                            scene: new DefendScene(stationData, GameData, {
                                getWaveImg: getWaveImg,
                                resolve: resolve,
                            }),
                        };
                        new Phaser.Game(config);

                    });
                    console.debug(gameResult);
                    let stationInfo = gameResult.stationInfo;
                    let playerInfo = gameResult.playerInfo;

                    //===update icon
                    // console.debug(stationInfo.clear, !stationData.stationStats.clear)
                    if (stationInfo.clear && !stationData.stationStats.clear)
                        updateStation(siteData, { icon: 'clear' });

                    //===update circle
                    if (stationInfo.clear) {

                        let timeGap = Math.abs(stationInfo.orbStats.reduce((acc, cur) => acc.time - cur.time))

                        //距離=時間*速度,km換算成m;
                        let radius = timeGap * GameData.velocity * 1000;

                        //==半徑跟之前相差大於1不作動畫
                        let pre_radius = siteData.options.data.circleObj.getRadius();
                        if (Math.abs(radius - pre_radius) > 1)
                            updateStation(siteData, { circleRadius: radius });

                    };

                    //===更新測站情報
                    Object.assign(stationData.stationStats, stationInfo);

                    //===更新人物資料
                    updateMapUI(playerInfo, 1000);
                }
                else if (gameMode == 'dig') {
                    // console.debug(siteData);
                    // {
                    //     const backgroundArr = Object.keys(BackGroundResources.dig);

                    //     let coordinate = siteData.coordinate;
                    //     // let background = 'halloween_4';//==之後經緯度判斷？
                    //     let background = backgroundArr[getRandom(backgroundArr.length)];
                    //     let mineBGindex = 0;//==之後經緯度判斷？

                    //     let placeData = {
                    //         coordinate: coordinate,
                    //         background: background,
                    //         mineBGindex: mineBGindex,
                    //         depth: siteData.depth ? siteData.depth : null,
                    //     };

                    //     //==顯示假設點
                    //     assumedEpicenter
                    //         .setLatLng(coordinate)
                    //         .getTooltip()
                    //         .setContent(`${GameData.languageJSON.Tip['assumedEpicenter']} : ${coordinate.map(d => d.toFixed(2)).join(' , ')}`)
                    //     assumedEpicenter.getElement().style.display = 'inline';

                    //     GameData.playerEpicenter = coordinate;

                    //     gameResult = await new Promise((resolve, reject) => {
                    //         const config = {
                    //             parent: 'gameMain',
                    //             type: Phaser.AUTO,
                    //             width: width * 0.9,
                    //             height: height * 0.95,
                    //             physics: {
                    //                 default: 'arcade',
                    //                 arcade: {
                    //                     gravity: { y: 300 },
                    //                     debug: true,
                    //                 },
                    //             },
                    //             scene: new DigScene(placeData, GameData, {
                    //                 resolve: resolve,
                    //             }),
                    //         };
                    //         new Phaser.Game(config);
                    //     });

                    //     console.debug(gameResult);
                    //     let playerInfo = gameResult.playerInfo;

                    //     //===更新人物資料
                    //     updateMapUI(playerInfo, 1000);
                    // }
                    // if (!gameResult.bossRoom) return;

                    //===進王關

                    const backgroundArr = Object.keys(BackGroundResources.boss);
                    let background = backgroundArr[getRandom(backgroundArr.length)];

                    gameResult = await new Promise((resolve, reject) => {
                        const config = {
                            parent: 'gameMain',
                            type: Phaser.AUTO,
                            width: width * 0.9,
                            height: height * 0.95,
                            physics: {
                                default: 'arcade',
                                arcade: {
                                    gravity: { y: 300 },
                                    debug: true,
                                },
                            },
                            scene: new BossScene(GameData, background, {
                                resolve: resolve,
                            }),
                        };
                        new Phaser.Game(config);
                    });
                    console.debug(gameResult);
                    let playerInfo = gameResult.playerInfo;

                    //===更新人物資料
                    updateMapUI(playerInfo, 1000);

                };
                gameDisplay(false);

            };

            initGameData();
            initStartScene();

        };
        //===init once
        if (!(chartContainerJQ.find('#form-game').length >= 1)) {
            initForm();
        };
        data = await data;
        console.log(data);
        gameGenerate();

    };


    //==================d3 chart================================================

    //==取得波形svg圖
    async function getWaveImg(stationData, timeDomain = null) {

        let waveData = await (stationData.waveData ? stationData.waveData : data[0].waveData);
        // console.debug(waveData);

        function getSvgUrlArr(data) {
            //==max min要一樣起始點才會落在同位置(避免波形間隔看起來不同)
            const xAxisDomain = timeDomain ? timeDomain : d3.extent(data[0].data.map(d => d.x));
            const yAxisDomain = d3.extent([].concat(...data.map(d => d3.extent(d.data, d => d.y))));
            // console.debug(xAxisDomain, yAxisDomain);

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

                //==陰影
                ~function initShadowDefs() {
                    svg.append("defs")
                        .append("filter")
                        .attr("id", "pathShadow")
                        .attr("x", "-0.5")
                        .attr("y", "-0.5")
                        .attr("width", "300%")
                        .attr("height", "300%")
                        .call(filter => {
                            filter
                                .append("feOffset")
                                .attr("result", "offOut")
                                .attr("in", "SourceAlpha")
                                .attr("dx", "1")
                                .attr("dy", "1");

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

                }();

                function getChart() {
                    function getNewData(timeDomain) {
                        let timeArr = chaData.map(d => d.x);
                        let i1 = d3.bisectCenter(timeArr, timeDomain[0]);
                        let i2 = d3.bisectCenter(timeArr, timeDomain[1]) + 1;//包含最大範圍
                        let newData = chaData.slice(i1, i2);
                        return newData;
                    };
                    function getSvgUrl(svgNode) {
                        let svgData = (new XMLSerializer()).serializeToString(svgNode);
                        let svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                        let svgUrl = URL.createObjectURL(svgBlob);
                        return svgUrl;
                    };

                    let newData = timeDomain ? getNewData(timeDomain) : chaData;

                    let x = d3.scaleLinear()
                        .domain(xAxisDomain)
                        .range([margin.right, width - margin.left]);

                    var updateAxis = () => {
                        var makeXAxis = g => g
                            // .style('font', '20px sans-serif')
                            // .style('font', 'italic small-caps bold 20px/2 cursive')
                            .style('font', 'small-caps bold 20px/1 sans-serif')

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
                            .domain(yAxisDomain)
                            .range([height, 0]);

                        var line = d3.line()
                            .defined(d => !isNaN(d.x))
                            .x(d => x(d.x))
                            .y(d => y(d.y));


                        var makePaths = pathGroup => pathGroup
                            .attr("filter", "url(#pathShadow)")
                            .append("path")
                            .style("mix-blend-mode", "luminosity")
                            .attr("fill", "none")
                            .attr("stroke-width", 2)
                            .attr("stroke-linejoin", "bevel")//arcs | bevel |miter | miter-clip | round
                            .attr("stroke-linecap", "butt")//butt,square,round
                            // .attr("stroke-opacity", 0.9)
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
            };



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
    //==取得速度參數svg
    function getVelocityChart() {
        const width = 560;
        const height = width;
        const margin = { top: 80, right: 80, bottom: 80, left: 80 };
        const svg = d3.create("svg")
            .attr("viewBox", [0, 0, width, height]);
        const fixedGroup = svg.append("g").attr('class', 'fixed');
        const focusGroup = svg.append("g").attr('class', 'focus');
        const xAxis = svg.append("g").attr("class", "xAxis");
        const yAxis = svg.append("g").attr("class", "yAxis");


        var x, y;
        var newDataObj;
        const slopeRange = [5, 70];//==速度參數最大小範圍(km/s)
        var handleSlope = GameData.velocity;

        var getPoint = (slope, rScale = 1) => {
            //==圓公式 : (x-h)^2+(y-k)^2=r^2 (圓心=(h,k))
            //==斜率 : m=deltaY/deltaX
            //==得 x=(r^2/(m^2+1))^(1/2)+h

            //==圓心x,y
            const h = x.range()[0];
            const k = y.range()[0];
            //==圓半徑
            const r = x.range().reduce((pre, cur) => cur - pre) * rScale;
            //==斜率(原本slope單位是km/s,換算成無單位(px/px))
            let m = (y(x.invert(r + x.range()[0]) * slope) - y.range()[0]) / r;
            // console.debug(m);
            let pointX = Math.pow((Math.pow(r, 2) / (Math.pow(m, 2) + 1)), 0.5) + h;
            let pointY = m * (pointX - h) + k;

            // console.debug(x.invert(pointX), y.invert(pointY));
            // console.debug(y.invert(pointY) / x.invert(pointX));//==驗算回slope斜率

            return { x: pointX, y: pointY };
        };

        var epicenterCoord = data.epicenter.coordinate;


        function getNewData() {

            epicenterCoord = GameData.playerEpicenter ? GameData.playerEpicenter : epicenterCoord;

            //==取得做過測站的
            let clearStationData = data
                .filter(d => d.stationStats.clear)
                .map(d => new Object({
                    station: d.station,
                    dist: distanceByLnglat(d.coordinate, epicenterCoord),
                    timeGap: Math.abs(d.stationStats.orbStats.reduce((acc, cur) => acc.time - cur.time)),
                    // timeGap: 10,
                    data: d,
                }));
            // distanceByLnglat(data[1].coordinate, data.epicenter.coordinate);
            // console.debug(clearStationData);
            return clearStationData;
        };

        function updateChart(handleUpdate = false, trans = true) {

            function init() {
                xAxis
                    .append('text')
                    .attr("class", "axis_name")
                    .attr("fill", "black")
                    .attr("font-weight", "bold")
                    .attr("font-size", "30")
                    .attr('x', width / 2)
                    .attr("y", margin.bottom * 0.7)
                    .text('▵T ( Tₛ - Tₚ ) (s)');

                yAxis
                    .append('text')
                    .attr("class", "axis_name")
                    .attr("fill", "black")
                    .attr("font-weight", "bold")
                    .attr("font-size", "30")
                    .style("text-anchor", "middle")
                    .attr("alignment-baseline", "text-before-edge")
                    .attr("transform", "rotate(-90)")
                    .attr('x', -(height - margin.top - margin.bottom) / 2 - margin.top)
                    .attr("y", -margin.left * 1.05)
                    .text('Distance (km)');
            };
            function render() {

                const strokeWidth = 5;

                //==讓點能落在扇形區
                let domainScale = 1.5;
                //==沒完成任何站就給最大時間10才不出bug
                let xAxisDomain = [0, newDataObj.length == 0 ? 10 : d3.max(newDataObj.map(d => d.timeGap)) * domainScale];
                let yAxisDomain = [0, d3.max(data.map(d => distanceByLnglat(d.coordinate, epicenterCoord))) * domainScale];

                // console.debug(xAxisDomain, yAxisDomain);

                x = d3.scaleLinear()
                    .domain(xAxisDomain)
                    .range([margin.left, width - margin.right])
                    .nice();

                y = d3.scaleLinear()
                    .domain(yAxisDomain)
                    .range([height - margin.bottom, margin.top])
                    .nice();

                const r = x.range().reduce((p, c) => c - p);

                var updateAxis = () => {

                    var makeXAxis = g => g
                        .attr("transform", `translate(0,${height - margin.bottom})`)
                        .style('font', 'small-caps bold 20px/1 sans-serif')
                        .call(d3.axisBottom(x).tickSizeOuter(0).ticks(width / 80))
                        .call(g => g.select('.domain').attr('stroke-width', strokeWidth));

                    var makeYAxis = g => g
                        .attr("transform", `translate(${margin.left},0)`)
                        .style('font', 'small-caps bold 20px/1 sans-serif')
                        .call(d3.axisLeft(y).ticks(height / 80))
                        .call(g => g.select('.domain').attr('stroke-width', strokeWidth));

                    xAxis.call(makeXAxis);
                    yAxis.call(makeYAxis);
                };
                var updateFocus = () => {
                    const transDuration = 500;
                    const transDelay = 90;

                    var makeDots = focusGroup => focusGroup
                        // .style("mix-blend-mode", "hard-light")
                        .selectAll("g")
                        .data(newDataObj)
                        .join("g")
                        .attr("class", "dots")
                        .call(() =>
                            focusGroup.selectAll(".dots").each(function (d, i) {
                                // console.debug(d);
                                let dots = d3.select(this);

                                let dot = dots
                                    .selectAll(".point")
                                    .data([0])
                                    .join("circle")
                                    .attr("class", 'point')
                                    .attr("cx", x(d.timeGap))
                                    .attr("cy", y(d.dist))
                                    .attr("r", 6)
                                    .attr("stroke", 'black')
                                    .attr("stroke-width", 1)
                                    .attr("stroke-opacity", .5)
                                    .attr("fill", "red")
                                    .attr("fill-opacity", 1);

                                if (trans)
                                    dot
                                        .attr("opacity", 0)
                                        .interrupt().transition().duration(trans ? transDuration : 0) //.interrupt()前次動畫
                                        .ease(d3.easeCircleIn)
                                        .delay(transDelay * i)
                                        .attr("opacity", 1);

                            })
                        );
                    focusGroup.call(makeDots);
                };
                var updateFixed = () => {

                    var getArcD = (r, start, end) => d3.arc()
                        .innerRadius(r)
                        .outerRadius(r)
                        .startAngle(start)
                        .endAngle(end)();

                    const rangePoint = slopeRange.map(s => getPoint(s));


                    // console.debug(rangePoint);

                    //作出弧線和夾角區域
                    var makeArcArea = fixedGroup => fixedGroup
                        .selectAll(".arcArea")
                        .data([0])
                        .join("g")
                        .attr("class", "arcArea")
                        .attr("transform", `translate(${x.range()[0]},${y.range()[0]})`)
                        .call(g => {

                            //==d3.arc()的弧度從y軸順時針算,js Math則從x軸順時針
                            let start = Math.PI / 2 + Math.asin((rangePoint[0].y - y.range()[0]) / r);
                            let end = Math.PI / 2 + Math.asin((rangePoint[1].y - y.range()[0]) / r);
                            let arc = getArcD(r, start, end);
                            arc = arc.substring(0, arc.lastIndexOf('A'));
                            // console.debug(start, end);//Math.PI/2

                            g.selectAll(".area")
                                .data([0])
                                .join("path")
                                .attr("class", "area")
                                .attr("fill", 'blue')
                                .attr("stroke", 'blue')
                                .attr("fill-opacity", .8)
                                .attr("d", `${arc} L0 0`);

                            g.selectAll(".arc")
                                .data([0])
                                .join("path")
                                .attr("class", "arc")
                                .attr("fill", 'none')
                                .attr("stroke", 'black')
                                .attr("stroke-width", strokeWidth)
                                .attr("stroke-dasharray", "10")
                                .attr("stroke-opacity", .2)
                                .attr("d", getArcD(r, 0, Math.PI / 2));

                        });

                    //作出斜率最大最小範圍的線
                    var makeSlash = fixedGroup => fixedGroup
                        .selectAll(".slash")
                        .data([0])
                        .join("g")
                        .attr("class", "slash")
                        .call(g => {
                            g
                                .selectAll(".rateLine")
                                .data(rangePoint)
                                .join("line")
                                .attr("class", "rateLine")
                                .attr("stroke-width", strokeWidth * 0.7)
                                .attr("fill", 'none')
                                .attr("stroke", 'green')
                                .attr("stroke-opacity", 1)
                                .attr("x1", point => point.x)
                                .attr("y1", point => point.y)
                                .attr("x2", x(0))
                                .attr("y2", y(0));

                        });




                    fixedGroup
                        .call(makeArcArea)
                        .call(makeSlash);

                };
                var updateHandle = () => {
                    //作出使用者操作的把手
                    var makeHandle = fixedGroup => fixedGroup
                        .selectAll(".handle")
                        .data([0])
                        .join("g")
                        .attr("class", "handle")
                        .call(g => {

                            let point = getPoint(handleSlope, 1.1);

                            g
                                .selectAll(".rateLine")
                                .data([0])
                                .join("line")
                                .attr("class", "rateLine")
                                .attr("stroke-width", strokeWidth)
                                .attr("fill", 'none')
                                .attr("stroke", '#FF60AF')
                                .attr("stroke-opacity", 1)
                                .attr("x1", point.x)
                                .attr("y1", point.y)
                                .attr("x2", x(0))
                                .attr("y2", y(0));

                            g
                                .selectAll(".point")
                                .data([0])
                                .join("circle")
                                .attr("class", 'point')
                                .attr("cx", point.x)
                                .attr("cy", point.y)
                                .attr("r", strokeWidth + 1)
                                .attr("stroke", 'grey')
                                .attr("stroke-width", 3)
                                .attr("stroke-opacity", 1)
                                .attr("fill", '#FF60AF')
                                .attr("fill-opacity", .6);


                            //===circle for anim
                            g
                                .selectAll(".anim")
                                .data(d3.range(2))
                                .join("circle")
                                .attr("class", 'anim')
                                .attr("cx", point.x)
                                .attr("cy", point.y);

                        });
                    fixedGroup
                        .call(makeHandle);
                };

                if (!handleUpdate) {
                    updateAxis();
                    updateFixed();
                    if (GameData.playerEpicenter)
                        updateFocus();
                };
                updateHandle();
            };

            if (!newDataObj) {
                newDataObj = getNewData();
                init();
            };
            render();
        };
        updateChart();

        function events(svg) {
            //==使用者按下UI紐觸發更新圖表
            var updateCustomEvent = () => {
                svg.on('updateEvt', function (d, i) {
                    // var evt = d3.event;
                    newDataObj = getNewData();
                    updateChart();
                });
            };
            var handleDrag = () => {

                let velocityStr = d3.select('#velocityStr');
                // console.debug(velocityStr);
                let dragBehavior = d3.drag()
                    .on('drag end', function (e) {
                        // console.log('drag');
                        // console.debug(e.x, e.y);
                        let slope = y.invert(e.y) / x.invert(e.x);

                        if (slope < slopeRange[0])
                            slope = slopeRange[0];
                        else if (slope > slopeRange[1])
                            slope = slopeRange[1];

                        handleSlope = Math.round(slope * 100) / 100;
                        updateChart(true);

                        //==更新測站圓圈
                        newDataObj.forEach(d => {
                            let circleObj = d.data.circleObj;
                            //距離=時間*速度,km換算成m;
                            let radius = d.timeGap * handleSlope * 1000;
                            circleObj.setRadius(radius);
                        });


                        //==更新顯示數字
                        velocityStr.text(handleSlope.toFixed(2));


                        GameData.velocity = handleSlope;
                        // circleObj.setRadius(radius);


                    });

                fixedGroup.select('.handle')
                    .attr("cursor", 'grab')
                    // .call(g => g.raise())//把選中元素拉到最上層(比zoom的選取框優先)
                    .call(g => g.call(dragBehavior));

            };
            var focusHover = () => {

                const UI = d3.select('#velocityChartUI');
                const tooltip = UI
                    .append("div")
                    .attr("id", "tooltip");


                const tooltipMouseGap = 50;//tooltip與滑鼠距離

                focusGroup
                    .on('mouseout', function (e) {
                        tooltip.style("display", "none");
                        console.debug()
                    })
                    .on('mouseover', function (e) {
                        let targetDOMRect = UI.node().getBoundingClientRect();

                        var makeTooltip = () => {
                            //==show tooltip and set position
                            tooltip.style("display", "inline")
                                //==到滑鼠位置
                                .call(tooltip => {
                                    // let mouseX = e.offsetX, mouseY = e.offsetY;
                                    // console.debug(e)
                                    tooltip
                                        .style("top", `${e.clientY - targetDOMRect.top}px`)
                                        .style("left", `${e.clientX - targetDOMRect.left}px`)
                                    // .style("right", right);
                                })
                                //==tooltip內容更新
                                .call(tooltip => {

                                    let data = e.target.parentNode.__data__;
                                    let station = data.station;
                                    let dist = parseInt(data.dist);
                                    let timeGap = parseFloat(data.timeGap.toFixed(2));

                                    tooltip.html(`
                                    <h5>${station}</h5>
                                    <h5>${GameData.languageJSON.UI['distance']} : ${dist} km</h5>
                                    <h5>${GameData.languageJSON.UI['estimatedTime']} : ${timeGap} s</h5>
                                    `);

                                    console.debug();
                                })

                        };
                        makeTooltip();
                    });

            };

            updateCustomEvent();
            handleDrag();
            focusHover();
        };
        svg.call(events);

        return svg.node();
    };

    return game;
};