function locatingGame() {
    let selector = 'body';
    let data;
    let rankingData;
    let GameData = null;

    //Append to the object constructor function so you can only make static calls
    // Object.merge2 = function (obj1, obj2) {
    //     for (let attrname in obj2) {
    //         obj1[attrname] = obj2[attrname];
    //     }
    //     //Returning obj1 is optional and certainly up to your implementation
    //     return obj1;
    // };
    let getRandom = (x) => {
        return Math.floor(Math.random() * x);
    };
    let distanceByLnglat = (coordinate1, coordinate2) => {
        const Rad = (d) => d * Math.PI / 180.0;

        let lng1 = coordinate1[1], lat1 = coordinate1[0],
            lng2 = coordinate2[1], lat2 = coordinate2[0];

        let radLat1 = Rad(lat1);
        let radLat2 = Rad(lat2);
        let a = radLat1 - radLat2;
        let b = Rad(lng1) - Rad(lng2);
        let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * 6378137.0;// 取WGS84標準參考橢球中的地球長半徑(單位:m)
        s = Math.round(s * 10000) / 10000;
        // console.debug(s);
        return s / 1000;//==km
    };
    let getPhaserConfig = (width, height) => {
        return {
            parent: 'gameMain',
            type: Phaser.AUTO,
            width: width,
            height: height,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 300 },
                    debug: true,
                },
            },
            dom: {//==for rexUI:rexTextEdit
                createContainer: true
            },
            // scale: {
            //     mode: Phaser.Scale.FIT,
            // }
        };

    };

    game.selector = (value) => {
        selector = value;
        return game;
    };
    game.dataDir = async (value) => {
        //==異步讀檔,回傳一個promise而非結果
        let readTextFile = (filePath, fileDataKey) => {
            // console.debug(fileDataKey);
            let tmpData = [];

            let pushData;
            if (fileDataKey.length > 1) {//一行有兩列以上的資料則作物件陣列
                pushData = (row) => {
                    let col = row.trim().split(/\s+/);
                    // console.debug(col);
                    let obj = {};
                    col.forEach((c, index) => obj[fileDataKey[index]] = (isNaN(c) ? c : parseFloat(c)));
                    tmpData.push(obj);
                };
            }
            else {//一行有一列直接作數值陣列
                pushData = (row) => {
                    tmpData.push(isNaN(row) ? row : parseFloat(row));
                }
            };

            return new Promise((resolve, reject) => {
                let rawFile = new XMLHttpRequest();
                rawFile.open("GET", filePath, true);
                // rawFile.open("GET", filePath, false);
                rawFile.onreadystatechange = function () {
                    if (rawFile.readyState === 4) {
                        if (rawFile.status === 200 || rawFile.status == 0) {
                            let rows = rawFile.responseText.split("\n");
                            rows.forEach(row => {
                                if (row != '') {
                                    pushData(row);
                                }
                            })
                            // let fileName = filePath.substring(
                            //     filePath.lastIndexOf('/') + 1,
                            //     filePath.indexOf(fileExtension));
                            // let fileData = { fileName: fileName, data: tmpData };
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
        let ajaxReadFile = (dataObj) => {
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

        const eventArr = ajaxReadFile({ url: datafileDir + 'event/eventList.txt', async: false }).responseText.split('\n');
        // const event = eventArr[eventArr.length - 1];//之後能選
        const event = eventArr[getRandom(eventArr.length)];
        const eventCatlog = (value ? value : datafileDir + 'event/') + event + '/';
        const channel = ['BHE', 'BHN', 'BHZ'];//不一定BH的話還要有檔案得到
        const fileExtension = '.xy';

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
                let col = success.split(',');
                data = {
                    coordinate: [parseFloat(col[0]), parseFloat(col[1])],
                    depth: parseFloat(col[2]),
                };

                resolve(data);
            })
        );

        //===C.讀範例波形資料(教學用)
        let tutorialData = new Promise((resolve, reject) => {
            const dir = datafileDir + 'event/tutorial/';
            const files = ['2010.166.TDCB.BHE.xy', '2010.166.TDCB.BHN.xy', '2010.166.TDCB.BHZ.xy'];
            const fileDataKey = ['x', 'y'];
            const tutorialData = {//09850, 16630
                Pwave: 9.85,//P到時
                Swave: 16.63,//S到時
                allowedErro: 6,//==P波S波的容許誤差(pixel)
                isTutorial: true,//==用來判斷時間軸位置
            };


            let data;
            data =
                Promise.all(
                    files.map(async (file) => {
                        let path = dir + file;
                        return { channel: file[file.lastIndexOf('.') - 1], data: await readTextFile(path, fileDataKey) };
                    })
                );

            resolve(Object.assign(tutorialData, { waveData: data, }));

        });

        //===D.排名資料
        rankingData = new Promise((resolve, reject) =>
            ajaxReadFile({ url: datafileDir + "rank/records.txt" }).then(success => {
                let data;
                data = success.split("\n").filter(d => d !== '').map(row => {
                    let col = row.split(' ');
                    return {
                        player: col[0],
                        timeUse: parseFloat(col[1]),
                        score: parseInt(col[2])
                    };
                });
                // console.debug(data);
                resolve(data);
            })
        );

        data = Promise.all([stationData, epicenterData, tutorialData]).then(sucess => {
            // console.debug(sucess);
            let tmp = sucess[0];
            tmp.epicenter = sucess[1];
            tmp.tutorialData = sucess[2];
            tmp.event = event;
            return tmp;
        });
        // console.log(eventArr);
        // console.debug(data);
        return game;
    };

    async function game() {
        const chartContainerJQ = $(selector);

        //===append map,gameInnerDiv..etc
        function initForm() {
            chartContainerJQ.append(`       
                <div class="row" id="gameGroup">
                
                    <div id="bigMap" class="col-12">
                        <div id="blackout" class="col-12"></div>   
                    </div>
                                
                    <div id="gameOuter">
                        <div id="gameMain"></div>                 
                    </div>

                    <div id="gameUI"></div>

                </div>            
                `);

            if (data === undefined)
                game.dataDir();
        };
        function gameGenerate() {
            const gameOuterDiv = chartContainerJQ.find('#gameOuter');
            const gameUI = chartContainerJQ.find('#gameUI');
            const bigMap = document.querySelector('#bigMap');//==一些畫面位置計算用到
            const width = window.innerWidth, height = window.innerHeight;

            let mapObj;
            let geoJSON;//===location data
            let assumedEpicenter;

            //===遊戲相關
            const clearStationToUnlock = 3;//==完成幾個解鎖第二關
            const allowedErro = 25;//==容許與震央相差距離(km)
            let stopClickFlag = false;//==gameOver暫停點擊關卡
            let gameStartFlag = false;//==停止map快捷鍵

            let gameDisplay = (display) => {
                if (display) {
                    gameOuterDiv.fadeIn();
                    // $(bigMap).hide();

                    //==遊戲開始UI關閉
                    gameUI.find('.UIicon').toggleClass('clicked', false);
                    gameUI.find('.UI').hide();
                    gameUI.find('.sidekickUI .sidekickTXB').hide();
                    gameUI.find('.guideArrow').hide();
                    $('#blackout').hide();
                    GameData.sidekick.doneTalking = false;
                }
                else {
                    gameOuterDiv.fadeOut();
                    // $(bigMap).show();
                };
                gameStartFlag = display;
            };
            let hintTextAnime = (description = 'itemGain1', items = null) => {

                let createHintGroup = () => {
                    const itemsDir = assetsDir + 'ui/game/backpack/items/';
                    const imgW = 60;

                    let getItemImg = () => {
                        let html = '';
                        if (items) {
                            let imgs = items.map(item =>
                                `<img src="${itemsDir + item[0]}.png" width="${imgW}px"  height="${imgW}px">`).join('');
                            html = `<div class="claimItem">${imgs}</div>`;
                        }
                        return html;
                    };

                    let itemHint = $(bigMap)
                        .append(`
                        <div class="itemHint d-flex flex-row  align-items-center">
                            <div class="hint"></div>                           
                            ${getItemImg()}                            
                        </div>`)
                        .find('.itemHint').last();
                    // console.debug(itemHint);
                    // $(bigMap).append(itemHint);
                    return itemHint;
                };
                let itemFlyToBag = (hintGroup, duration = 500) => {
                    let bag = $('#backpack'),
                        bagImg = bag.children('img'),
                        bagPos = bag.get(0).getBoundingClientRect();
                    let items = hintGroup.find('.claimItem>img');

                    let itemAnime = (item) => {
                        let targetPos = item.get(0).getBoundingClientRect();
                        let goalPos = [bagPos.left - targetPos.left, bagPos.top - targetPos.top];
                        // console.debug(targetPos, goalPos);
                        item.animate({ left: goalPos[0], top: goalPos[1] }, duration, 'swing', () => bagAnime(item));
                    };
                    //==飛到包包後包包動畫
                    let bagAnime = (item) => {

                        const duration = 250;
                        const
                            originW = bagImg.prop("width"),
                            bigW = originW * 2,
                            fixPos = 0.5 * (originW - bigW);

                        // console.debug(bagImg.css("top") === '0px')
                        //==包包變大
                        bagImg.stop(false, true).animate({
                            width: bigW,
                            height: bigW,
                            top: fixPos,
                            left: fixPos,
                        }, duration, 'swing', () => {
                            //==包包變小
                            bagImg.stop(false, true).animate({
                                width: originW,
                                height: originW,
                                top: 0,
                                left: 0,
                            }, duration);
                        });

                        //==道具淡出
                        item.animate({ opacity: 0 }, duration * 2);
                    };

                    items.each((i, item) => setTimeout(() => itemAnime($(item)), i * 500));

                };
                let hintText = (hintGroup) => {
                    const showDuration = 2000,
                        fadeDuration = 2000;

                    let hint = hintGroup.find('.hint');
                    let string = items ? `${GameData.localeJSON.UI[description] + GameData.localeJSON.UI['itemGain']} 
                    ${items.map(item => GameData.localeJSON.Item[item[0]].name + (item[1] ? `x${item[1]}` : '')).join(', ')}` :
                        GameData.localeJSON.UI[description];
                    hint.text(string);

                    setTimeout(() => {
                        hint.animate({ opacity: 0 }, fadeDuration, 'swing', () => hintGroup.remove());
                        if (items) itemFlyToBag(hintGroup, showDuration / 2);
                    }, showDuration);

                };

                let hintGroup = createHintGroup();
                hintText(hintGroup);

                //==放入包包
                if (items) {
                    items.forEach(item => {
                        if (item[1] === 0)
                            GameData.backpack.equip.push(item[0]);
                        else {
                            let itemName = item[0],
                                itemAmount = item[1];
                            let itemBackpack = GameData.backpack.item;
                            let stuff = itemBackpack.find(stuff => stuff.name === itemName);
                            if (stuff) stuff.amount += itemAmount;
                            else itemBackpack.push({ name: itemName, amount: itemAmount });
                        }
                    });
                    gameUI.find('#backpackUI').trigger('updateEvt');
                };
            };

            function initGameData() {
                let playerRole = 'maleAdventurer';//==之後能選其他[femalePerson,maleAdventurer]
                let sidekick = 'Dude';//=='Owlet,Dude,Pink'

                let playerName = '',
                    avatarIndex = 0,//==自選頭像
                    avatarBgColor = 0x5B5B5B;//

                GameData = {
                    timeRemain: 30 * 60000,//1min=60000ms           
                    // timeRemain: 0.03 * 60000,//1min=60000ms
                    timeMultiplier: 300,//real 1 ms = game x ms;
                    velocity: 7.5,//==速度參數預設7.5
                    playerEpicenter: null,
                    controllCursor: { ...defaultControllCursor },
                    locale: 'zh-TW',
                    playerRole: playerRole,
                    playerStats: GameObjectStats.player[playerRole],
                    playerTimeUse: 0,//==圖表
                    playerCustom: {
                        avatarIndex: avatarIndex,
                        avatarBgColor, avatarBgColor,
                        name: playerName,
                    },
                    stationClear: {
                        chartUnlock: false,
                        count: 0,
                    },
                    sidekick: {
                        type: sidekick,
                        lineStage: [1, 0],//==第2-0句
                        doneTalking: false,
                        stopHotkey: false,//==對話完空白鍵不再出現對話（只能滑鼠點）
                    },
                    backpack: {//==道具裝備相關
                        hotKey: ['bread', 'bone', 'catfood'],//快捷鍵
                        item: [//消耗品

                        ],
                        equip: [],//背包中裝備
                        onEquip: [],//人物裝備中
                    },
                    // backpack: {//==道具裝備相關
                    //     hotKey: ['catfood', 'bone', 'seeds'],//快捷鍵
                    //     item: [//消耗品
                    //         { name: 'okra', amount: 999 },
                    //         { name: 'sunny', amount: 12 },
                    //         { name: 'bone', amount: 999 },
                    //         { name: 'catfood', amount: 999 },
                    //         { name: 'seeds', amount: 999 },

                    //     ],
                    //     equip: ['syringe', 'medicalKit', 'scientistCard', 'pan'],//背包中裝備[]
                    //     onEquip: ['scientistCard'],//人物裝備中
                    // },
                };
            };
            function initStartScene() {
                let getLanguageJSON = (locale = false) => {
                    // console.debug(locale);
                    return $.ajax({
                        url: "data/locale/" + (locale ? locale : GameData.locale) + ".json",
                        dataType: "json",
                        async: false,
                        // success: function (d) { console.debug(d); },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.error(jqXHR, textStatus, errorThrown);
                        },
                    });
                };
                let startScene = async () => {
                    GameData.localeJSON = await getLanguageJSON();
                    GameData.getLanguageJSON = getLanguageJSON;

                    // //==test
                    // gameDisplay(true);
                    // let doneTutorial = await new Promise((resolve, reject) => {
                    //     const config = Object.assign(getPhaserConfig(width, height), {
                    //         scene: new GameStartScene(GameData, {
                    //             getWaveImg: getWaveImg,
                    //             tutorialData: data.tutorialData,
                    //             resolve: resolve,
                    //             getLanguageJSON: getLanguageJSON,
                    //             rankingData: rankingData,//排行榜
                    //         }),
                    //     });
                    //     new Phaser.Game(config);
                    // });
                    // // console.debug(doneTutorial);
                    // gameDisplay(false);
                    // //==test

                    // if (doneTutorial) {//doneTutorial     
                    //     const gainItems = [['pan', 0], ['bread', 5], ['bone', 3]];
                    //     hintTextAnime('itemGain1', gainItems);
                    // };
                    initMap();
                    //==test
                    gameStart('defend');
                    // gameStart('dig');
                    // initEndScene(true);
                    //==test
                };
                startScene();
            };
            function initEndScene(win = false) {

                let gameOverScene = async () => {
                    gameDisplay(true);
                    const rewindTime = 10 * 60000;

                    let newGameData = await new Promise((resolve, reject) => {
                        const config = Object.assign(getPhaserConfig(width, height), {
                            scene: new GameOverScene(GameData, resolve),
                        });
                        new Phaser.Game(config);
                    });

                    // Object.assign(GameData, newGameData);
                    gameDisplay(false);

                    updateMapUI({ timeRemain: rewindTime }, 800);
                    updateSidekick(0, 2, true);

                    data.forEach(d => {
                        let icon = d.stationStats.clear ? 'clear' : 'default';
                        updateStation(d.markerObj, { icon: icon });
                    });

                };
                let congratsScene = async () => {
                    let congrats = chartContainerJQ.find('#gameGroup .Congrats');

                    let initRankChart = () => {
                        let svg = getRankChart(rankingData);
                        // let svgBox = svg.viewBox.baseVal;

                        congrats
                            .find('.rankChart')
                            .append(svg)
                            .find('svg');
                        // .height(height)
                        // .width(svgBox.width * (height / svgBox.height));

                    };
                    let initMenu = () => {
                        let endMenu = congrats.find('.endMenu');

                        endMenu
                            .append(`
                            <div class="buttonGroup">

                                <button type="button" class="btn btn-primary rounded-pill" id="fbButton">
                                    <div class="d-flex align-items-center">
                                        <i class="fab fa-facebook fa-2x"></i>
                                        <text class="text-nowrap p-1 pt-2">${GameData.localeJSON.UI['shareTo']} FACEBOOK </text>
                                    </div>
                                </button>

                                <button type="button" class="btn btn-primary rounded-pill" id="downloadButton">
                                    <div class="d-flex align-items-center">
                                        <i class="fa-solid fa-image fa-2x"></i>
                                        <text class="text-nowrap p-1 pt-2">${GameData.localeJSON.UI['downloadCert']}</text>
                                    </div>
                                </button>

                                <button type="button" class="btn btn-primary rounded-pill" id="surveyButton">
                                <div class="d-flex align-items-center">
                                    <i class="fa-solid fa-thumbs-up fa-2x"></i>
                                    <text class="text-nowrap p-1 pt-2">${GameData.localeJSON.UI['survey']}</text>
                                </div>
                                </button>
     
                            </div>
                            `);

                        //==按鈕一個一個出現                       
                        endMenu.find('.buttonGroup>button').each(function (i) {
                            let button = $(this);
                            button.css('top', height * (0.4 + 0.1 * i));
                            setTimeout(() => button.show(), 5400 + i * 1000);//==5400是動畫時間
                        });

                        endMenu.find('#fbButton')
                            .on('click', () => {
                                let getProfile = () => {
                                    const pictureW = 100;
                                    return new Promise(r => {
                                        FB.api('/me', { fields: `id,name,picture.width(${pictureW}).height(${pictureW}).redirect(true)` }, function (response) {
                                            // console.log('Good to see you, ' + response.name + '.');
                                            console.log(response);
                                            r(response);
                                        });

                                    });
                                };

                                let share = async (profilePromise = null) => {
                                    const server = "https://tecdc.earth.sinica.edu.tw/tecdc/Game/location/";
                                    const certificateDir = server + "certificate/";

                                    // let imgName = await getSharingImg(await profilePromise);
                                    // console.debug(imgName);

                                    FB.ui(
                                        {
                                            display: 'popup',
                                            method: 'share',
                                            href: certificateDir + 'sample.png',
                                            // picture: certificateDir + 'dude.png',
                                            // caption: 'AAA',
                                            // description: 'BBB',
                                        },
                                        // callback
                                        function (response) {
                                            if (response && !response.error_message) {
                                                // alert('Posting completed.');
                                            } else {
                                                // alert('Error while posting.');
                                            }

                                            FB.api("/me/permissions", "DELETE", function (res) {
                                                FB.logout();
                                            });

                                        }
                                    );
                                };
                                // FB.getLoginStatus((response) => {
                                //     console.log(response);
                                //     if (response.status == "connected")
                                //         // FB.api('/' + response.authResponse.userID + '/picture', 'GET', {}, function (response) {
                                //         //     console.log(response);
                                //         // });
                                //         FB.logout();
                                // });

                                FB.login(function (response) {
                                    if (response.authResponse) {
                                        // console.log(response);
                                        // console.log('Welcome!  Fetching your information.... ');
                                        share();

                                    } else {
                                        // console.log('User cancelled login or did not fully authorize.');
                                    };
                                }, { auth_type: 'reauthenticate' });//, { auth_type: 'reauthenticate' }



                            });
                        endMenu.find('#downloadButton')
                            .on('click', () => {
                                getSharingImg();
                                // console.debug(imgName);
                            });
                        endMenu.find('#surveyButton')
                            .on('click', () => {
                                window.open('https://forms.gle/UZjB2T6fvY27PE5y8');
                            });
                    };

                    congrats.fadeIn();
                    initRankChart();
                    initMenu();
                };
                win ? congratsScene() : gameOverScene();

            };
            function initMap() {
                const fadeInDuration = 300;
                const fadeOutDuration = 100;

                //==confirmWindow沒關閉又再次點擊會無法產生打字特效,所以用這方法
                let requestTypingAnim = () => {
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
                        // attributionControl: false,
                    });

                    const esriMap = {
                        attr: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
                        url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                    };

                    // esri map layer
                    L.tileLayer(esriMap.url, {
                        maxZoom: 15,
                        // attribution: esriMap.attr,
                    }).addTo(mapObj);

                };
                async function addCounty() {

                    geoJSON = await $.ajax({
                        url: "data/datafile/twCounty.json",
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
                    console.debug(data);
                    const backgroundArr = Object.keys(BackGroundResources.defend);
                    const enemyArr = Object.keys(GameObjectStats.creature).filter(c => c != 'boss' && c != 'zombie');
                    let copyEnemyArr = [...enemyArr].sort(() => 0.5 - Math.random());//===確保每種敵人出現一次

                    data.forEach((d, i) => {
                        // console.debug(d);
                        // let enemy = ['dog', 'cat', 'dove'];//==之後隨機抽敵人組
                        // let enemy = ['dove'];//==之後隨機抽敵人組
                        let enemy = copyEnemyArr.length !== 0 ?//===拷貝的陣列抽完才全隨機
                            [copyEnemyArr.pop()] :
                            [enemyArr[getRandom(enemyArr.length)]];

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
                                if (stopClickFlag) return;
                                requestTypingAnim();

                                gameUI.find('.confirmWindow')
                                    .fadeIn(fadeInDuration)
                                    .find('.placeStr')
                                    .text(`${d['station']}${GameData.localeJSON.UI['station']}`)
                                    .data('gameStartParameters', ['defend', marker]);

                            });


                        let tooltipHtml = `
                            <text class='staName'>${GameData.localeJSON.UI['station'] + ' : ' + d['station']}</text><br>
                            <text class='enmeyType'>${GameData.localeJSON.UI['enmey'] + ' : '}</text>
                            ${enemy.map(e => `<img src='${assetsDir + 'icon/' + e + '.png'}' width='25px'></img>`).join(' ')}<br>            
                        `;


                        marker.bindTooltip(tooltipHtml, {
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

                        //==label
                        let label = document.createElement("p");


                        Object.assign(d, {
                            markerObj: marker,
                            circleObj: circle,
                            labelObj: label
                        });


                        // markerArr.push(marker);
                        // circleArr.push(circle);
                        // updateStation(marker, { icon: 'default' });
                        // marker.addTo(mapObj);

                        // console.debug(marker.getIcon())
                        // console.debug(marker._icon.style)
                        // getAttribute("align")
                        // marker._icon
                    });

                    // L.layerGroup(markerArr, { key: 'markerGroup' }).addTo(mapObj);
                    // L.layerGroup(circleArr, { key: 'circleGroup' }).addTo(mapObj);

                    let size = 40;
                    //==test 震央
                    // L.marker(data.epicenter['coordinate'], {
                    //     icon: L.icon({
                    //         iconUrl: assetsDir + 'icon/star.png',
                    //         iconSize: [size, size],
                    //         iconAnchor: [size / 2, size / 2],
                    //     }),
                    //     pane: 'markerPane',
                    //     data: data.epicenter,
                    // }).addTo(mapObj);
                    //==test 震央

                    assumedEpicenter = L.marker(data.epicenter['coordinate'], {
                        icon: L.icon({
                            iconUrl: assetsDir + 'icon/star2.png',
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
                        })
                        .on('click', function (e) {
                            if (stopClickFlag || !GameData.stationClear.chartUnlock) return;
                            //==觸發畫面位置點擊(要在假設點上座標才對)
                            const event = new MouseEvent('click', {
                                'view': window,
                                'bubbles': true,
                                'cancelable': true,
                                'clientX': e.originalEvent.clientX,
                                'clientY': e.originalEvent.clientY,
                            });
                            bigMap.dispatchEvent(event);

                            // let bigMapDOMRect = bigMap.getBoundingClientRect();
                            // const event = new MouseEvent('click', {
                            //     'view': window,
                            //     'bubbles': true,
                            //     'cancelable': true,
                            //     'clientX': e.containerPoint.x + bigMapDOMRect.x,
                            //     'clientY': e.containerPoint.y + bigMapDOMRect.y,
                            // });
                            // bigMap.dispatchEvent(event);

                        }).addTo(mapObj);

                    assumedEpicenter.getElement().style.display = 'none';
                    // console.debug(assumedEpicenter.getElement())



                };
                async function addUI() {
                    const ctrlDir = assetsDir + 'ui/map/controller/';

                    //===UIBar
                    const UIbuttons = ['playerStats', 'backpack', 'velocityChart', 'questInfo',];

                    //===UItooltip
                    const UItooltip = gameUI
                        .append(`<div class="UItooltip"><div class="tooltipText"></div></div>`)
                        .find('.UItooltip');

                    //===UIhint
                    const UIhint = gameUI
                        .append(`<div class="UIhint"><div class="tooltipText"></div></div>`)
                        .find('.UIhint');

                    //===guideArrow
                    const guideArrow = gameUI
                        .append(`<div class="guideArrow"><img src="${assetsDir}ui/map/guideArrow.gif"></img></div>`)
                        .find('.guideArrow');

                    function updateTooltip(target) {
                        let bigMapDOMRect = bigMap.getBoundingClientRect();
                        let targetDOMRect = target.getBoundingClientRect();
                        let imgNode = target.children[0];

                        let UI_index = UIbuttons.indexOf(target.id),
                            hotKey = UI_index != -1 ?
                                target.id === 'backpack' ? 'I' :
                                    UIbuttons[UI_index][0].toUpperCase() : null;

                        UItooltip.show()//==先show才能得到寬高
                            .children('.tooltipText')
                            .text(GameData.localeJSON.UI[target.id] + (hotKey ? ` (${hotKey}) ` : ''));

                        // console.debug(targetDOMRect)
                        // UItooltip
                        let top = targetDOMRect.top - bigMapDOMRect.top - imgNode.offsetHeight * 0.7,
                            left = targetDOMRect.left + 60;//==加icon寬
                        // left = targetDOMRect.left - bigMapDOMRect.left - 0.5 * (UItooltip.get(0).offsetWidth - imgNode.offsetWidth);

                        UItooltip.css({ top: top, left: left, });


                        if (!GameData.stationClear.chartUnlock && target.id == 'velocityChart') {

                            UIhint
                                .animate({ "opacity": "show" }, 500)
                                .children('.tooltipText')
                                .text(GameData.localeJSON.UI[`${target.id}Lock`]);

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
                            // console.debug(target);

                            let top = (id == 'questInfo' || id == 'velocityChart') ? height * 0.1 : targetDOMRect.top - bigMapDOMRect.top,
                                left = targetDOMRect.left - bigMapDOMRect.left + 80;
                            UI.css({ top: top, left: left, });

                            if (id == 'velocityChart')  //==速度參數圖表更新
                                d3.select(`#velocityChartUI>svg`).dispatch('updateEvt');
                            else if (id == 'playerStats' || id == 'backpack')  //==人物圖更新
                                UI.trigger('updateEvt');
                        }
                        else UI.hide();
                    };

                    let timeRemain = () => {
                        gameUI.append(`
                        <div class="timeRemain">${GameData.localeJSON.UI['timeRemain']} : 
                            <div class='timer' value='0'>
                                &nbsp;<font size="5" >0</font>&nbsp;${GameData.localeJSON.UI['DAYS']}
                                &nbsp;<font size="5" >0</font>&nbsp;${GameData.localeJSON.UI['HRS']}
                                &nbsp;<font size="5" >0</font>&nbsp;${GameData.localeJSON.UI['MINS']}
                            </div>
                        </div>             
                        `);

                        updateMapUI({ timeRemain: GameData.timeRemain }, 800);
                    };
                    let UIbar = () => {
                        const eachButtonH = 100;
                        const UIbarH = eachButtonH * UIbuttons.length,
                            UIbarW = 60;
                        const interval = UIbarH / (UIbuttons.length + 1);
                        const iconW = 50;

                        let init = () => {
                            gameUI
                                .append(`<div class="UIbar"></div>`)
                                .find('.UIbar')
                                .width(UIbarW)
                                .height(UIbarH);
                        };
                        let addIcons = () => {
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
                                        const avatarDir = `${assetsDir}avatar/${GameData.playerRole}/${GameData.playerCustom.avatarIndex}.png`;
                                        UI
                                            .width(height * 0.5)
                                            // .height(height * 0.5)
                                            .append(`
                                            <div class='black-tooltip'></div>
                                            <div class='row'>
                                                <div class='col-4 d-flex align-items-center'>
                                                    <img src='${avatarDir}' width='100px'></img>                                                    
                                                </div>

                                                <div class='col-8'>
                                                    <p>HP</p>
                                                    <div class="barBox">
                                                        <div class="bar HP"></div>
                                                    </div>
                                                    
                                                    <p>MP</p>
                                                    <div class="barBox">
                                                        <div class="bar MP"></div>
                                                    </div>
                                                </div>

                                            </div>

                                            <div class='row' id='playerStats'>
                                                <div class='col-12 attackPower'>
                                                    <div class='row'>
                                                        <div class='text-center col-6'>
                                                            ${GameData.localeJSON.UI['attackPower']}
                                                        </div>
                                                        <div class='text-center col-6 val'>
                                                            ${GameData.playerStats.attackPower}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div class='col-12 defense'>
                                                    <div class='row'>
                                                        <div class='text-center col-6'>
                                                            ${GameData.localeJSON.UI['defense']}
                                                        </div>
                                                        <div class='text-center col-6 val'>
                                                            ${GameData.playerStats.defense}
                                                        </div>
                                                    </div>
                                                </div>
                                              
                                                <div class='col-12 movementSpeed'>
                                                    <div class='row'>
                                                        <div class='text-center col-6'>
                                                            ${GameData.localeJSON.UI['movementSpeed']}
                                                        </div>
                                                        <div class='text-center col-6 val'>
                                                            ${GameData.playerStats.movementSpeed}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class='col-12 jumpingPower'>
                                                    <div class='row'>
                                                        <div class='text-center col-6'>
                                                            ${GameData.localeJSON.UI['jumpingPower']}
                                                        </div>
                                                        <div class='text-center col-6 val'>
                                                            ${GameData.playerStats.jumpingPower}
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                     
                                            `);

                                        UI.find('.barBox')
                                            .on('mouseover', function (e) {
                                                let isHP = this.children[0].classList.contains('HP');
                                                let playerStats = GameData.playerStats;
                                                let status = isHP ?
                                                    parseInt(playerStats.HP) + ' / ' + playerStats.maxHP :
                                                    parseInt(playerStats.MP) + ' / ' + playerStats.maxMP;

                                                UI.find('.black-tooltip')
                                                    .text((isHP ? 'HP ' : 'MP ') + status)
                                                    .css({
                                                        "top": `${isHP ? 0 : this.getBoundingClientRect().height * 2}px`,
                                                        "left": `${e.offsetX}px`
                                                    })
                                                    .show();

                                            })
                                            .on('mouseout', (e) => {
                                                UI.find('.black-tooltip')
                                                    .hide();
                                            });

                                        UI.on('updateEvt', () => {
                                            // console.debug('updateEvt');
                                            let playerStats = { ...GameData.playerStats };
                                            let onEquip = GameData.backpack.onEquip;

                                            //==加上裝備數值
                                            if (onEquip.length !== 0)
                                                onEquip.forEach(item => {
                                                    let buffs = GameItemData[item].buff;
                                                    Object.keys(buffs).forEach(stat => playerStats[stat] += buffs[stat]);
                                                });
                                            // console.debug(UI);
                                            let hpPercent = parseFloat((playerStats.HP / playerStats.maxHP * 100).toFixed(1)) + '%',
                                                mpPercent = parseFloat((playerStats.MP / playerStats.maxMP * 100).toFixed(1)) + '%';

                                            UI.find('.HP')
                                                .width(hpPercent)
                                                .text(hpPercent);
                                            UI.find('.MP')
                                                .width(mpPercent)
                                                .text(mpPercent);


                                            //==角色屬性
                                            let statDiv = UI.find('#playerStats');
                                            Object.keys(playerStats.buff).forEach(stat =>
                                                statDiv.find(`.${stat} .val`).text(playerStats[stat])
                                            );

                                        });


                                        break;
                                    case 'velocityChart':
                                        //==lock gif
                                        gameUI.find('#velocityChart').append(`
                                            <img id="velocityChartLock" src="${ctrlDir}unlock.gif" width="${iconW}px" height="${iconW}px">
                                        `);

                                        UI
                                            .append(`
                                            <div>
                                                <h2>${GameData.localeJSON.UI['velocityStr']}：
                                                    <div style="white-space:nowrap;text-align:center;">
                                                        <b id="velocityStr" style="color:Tomato;font-size:60px;">${GameData.velocity.toFixed(2)}</b> km/s
                                                    </div>
                                                </h2>
                                            </div>                  
                                            `)
                                            .append(getVelocityChart())
                                            .find('svg')
                                            .width(height * 0.4)
                                            .height(height * 0.4);

                                        UI
                                            .append(`
                                            <div class="btn-group dropright">
                                                <button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                    ${GameData.localeJSON.UI['showCircle']}
                                                </button>
                                                <div class="dropdown-menu">
                                                  <div class="stations d-flex flex-row flex-wrap">

                                                  </div>
                                                </div>
                                            </div>
                                            `);

                                        UI.on('addDropdownItem', (e, data) => {
                                            // console.debug(data);
                                            let station = data.station;
                                            let dropdown = UI.find('.stations');
                                            let html = `<div class="form-check col-6" style="text-align: left; display: inline;">
                                                            <input class="form-check-input  col-4" type="checkbox" id="display_${station}" name="display" value="${station}" checked>
                                                            <label class="col-8" for="display_${station}" style="display: block; text-indent: -5px;">${station} </label>
                                                        </div>`;
                                            dropdown.append(html).find(`#display_${station}`)
                                                .change(function () {
                                                    data.circleObj._path.style.display =
                                                        this.checked ? 'inline' : 'none';
                                                });

                                            UI.find('.dropdown-menu')
                                                .on("click.bs.dropdown", (e) => e.stopPropagation());
                                        });

                                        break;
                                    case 'questInfo':
                                        const infoCount = 9;
                                        const infoImgDir = assetsDir + 'ui/map/questInfo/';
                                        const imgW = width * 0.6 * 2 / 3 - 15;//== col 8/12 ,margin=15
                                        let getImgHTML = (img, imgScale = 1) => {
                                            return `<img src='${infoImgDir + img}' width='${imgW * imgScale}px'></img>`;
                                        };

                                        UI
                                            .width(width * 0.6)
                                            .height(height * 0.8)
                                            .append(`
                                            <div class="row">
                                                <div class="col-4">
                                                    <!-- List group -->
                                                    <div class="list-group scroll" id="infoList" role="tablist"></div>
                                                </div>

                                                <div class="col-8">   
                                                    <!-- Tab panes -->
                                                    <div  class="tab-content scroll" id="infoContent"></div>
                                                </div>
                                            </div>    
                                            <form class="quickQuestion">
                                                
                                                <div class="mb-2 quickTitle">Q0</div>
                                                <div class="form-group">
                                                    <div class="form-check pt-2">
                                                        <input type="radio" class="form-check-input" id="qs1" name="quickSelection" value="0">
                                                        <label class="form-check-label" for="qs1"></label>
                                                    </div>
                                                    <div class="form-check pt-2">
                                                        <input type="radio" class="form-check-input" id="qs2" name="quickSelection" value="1">
                                                        <label class="form-check-label" for="qs2"></label>
                                                    </div>
                                                    <div class="form-check pt-2">
                                                        <input type="radio" class="form-check-input" id="qs3" name="quickSelection" value="2">
                                                        <label class="form-check-label" for="qs3"></label>
                                                    </div>
                                                    <div class="form-check pt-2">
                                                        <input type="radio" class="form-check-input" id="qs4" name="quickSelection" value="4">
                                                        <label class="form-check-label" for="qs4"></label>
                                                    </div>
                                                </div>
                                                <div class="questFooter d-flex justify-content-around">
                                                    <button type="button" class="btn btn-secondary quickOK">${GameData.localeJSON.UI['submit1']}</button>
                                                    <button type="button" class="btn btn-secondary quickCancel">${GameData.localeJSON.UI['submit2']}</button>
                                                </div>
                                            </form>            
                                        `);


                                        let infoListHTML = [...Array(infoCount).keys()].map((d, i) => `
                                            <a class="list-group-item list-group-item-action ${i === 0 ? 'active' : ''}" data-toggle="list" href="#questInfo${i}" role="tab">${GameData.localeJSON.UI['questInfo' + i]}</a>
                                        `);
                                        let infoContentHTML = [...Array(infoCount).keys()].map((d, i) => {
                                            let content = GameData.localeJSON.Intro['questInfo' + i];

                                            switch (i) {
                                                case 1:
                                                    content = content.replace('\t', getImgHTML('1.gif'));
                                                    break;
                                                case 2:
                                                    content = content.replace('\t', getImgHTML('2.png', 0.8))
                                                        .replace('[link]', `<a target="_blank" href="https://www.cwb.gov.tw/Data/service/Newsbb/CH/1081218earthquakepress.pdf">`)
                                                        .replace('[/link]', '</a>');
                                                    break;
                                                case 5:
                                                    content = content.replace('\t', getImgHTML('3.png', 0.8));
                                                    break;
                                                case 6:
                                                    content = content.replace('\t', getImgHTML('4.png', 0.9));
                                                    break;
                                                case 7:
                                                    content = content.replace('\t', getImgHTML('5.png')).replace('\t', getImgHTML('6.png', 0.8));
                                                    break;
                                                case 8:
                                                    content = content.replace('\t', getImgHTML('7.png', 0.8));
                                                    break;
                                            };

                                            return `<div class="tab-pane fade ${i === 0 ? 'show active' : ''}" id="questInfo${i}" role="tabpanel" style="white-space: pre-line">
                                                <div>${content}</div>
                                                <div class="d-flex justify-content-end questFooter">
                                                    <button type="button" class="btn btn-primary questButton">${GameData.localeJSON.UI['quickAnswer']}</button>
                                                    <img class="questComplete" src="${assetsDir}ui/map/missionAccomplished.png">
                                                </div>
                                            </div>`;

                                        });

                                        UI.find('#infoList').append(infoListHTML);
                                        UI.find('#infoContent').append(infoContentHTML);

                                        //===問答題
                                        let bingoCount = 0;//玩家答對3、6、9題時獎勵裝備

                                        let quickQuestion = $('.quickQuestion');
                                        let quickTitle = $('.quickTitle');
                                        let quickSelection = $('input[name=quickSelection]');
                                        let questComplete = UI.find('.questComplete');
                                        let questButton =
                                            UI.find('.questButton').each((i, button) =>
                                                $(button).on('click', () => {
                                                    if (quickQuestion.css('display')) quickQuestion.hide();

                                                    let questionObj = GameData.localeJSON.quickQuestion[i],
                                                        choices = [...questionObj.choices].sort(() => 0.5 - Math.random());

                                                    quickTitle.text('Q' + (i + 1) + ': ' + questionObj.content);

                                                    quickSelection.prop('checked', false);
                                                    quickSelection.each((i, ele) => {
                                                        ele.value = choices[i] === questionObj.answer;
                                                        ele.nextElementSibling.innerText = choices[i];
                                                    });
                                                    quickQuestion
                                                        .prop('value', i)//紀錄第幾題
                                                        .toggle("fold");

                                                })
                                            );
                                        UI.find('.quickOK').on('click', (e) => {
                                            let questionIdx = quickQuestion.prop('value');
                                            let isAnswer = quickSelection.filter(":checked").val();

                                            if (isAnswer == undefined) {   //==全沒選
                                                hintTextAnime('quickUnselect');
                                            }
                                            else {
                                                // let answerIdx = e
                                                // console.debug(questButton);
                                                if (isAnswer === 'true') {
                                                    bingoCount++;


                                                    let getRandomAmount = (min = 3) => {//==隨機最小幾個到+2
                                                        return getRandom(3) + min;
                                                    };
                                                    let getRandomItem = (type = 0) => {
                                                        let items = Object.keys(GameItemData).filter(item => GameItemData[item].type === type);
                                                        return items[getRandom(items.length)];
                                                    };

                                                    let gainItems = bingoCount % 3 === 0 ?
                                                        [[{
                                                            1: 'medicalKit',
                                                            2: 'syringe',
                                                            3: 'scientistCard'
                                                        }[bingoCount / 3], 0], [getRandomItem(), getRandomAmount()], ['seeds', getRandomAmount()]] :
                                                        bingoCount % 3 === 1 ?
                                                            [[getRandomItem(), getRandomAmount()], ['bone', getRandomAmount()]] :
                                                            [[getRandomItem(), getRandomAmount()], ['catfood', getRandomAmount()]];

                                                    hintTextAnime('itemGain2', gainItems);
                                                }
                                                else {
                                                    hintTextAnime('quickWrong');
                                                };
                                                questButton.eq(questionIdx).prop('disabled', true);
                                                questComplete.eq(questionIdx).show();
                                                quickQuestion.toggle("fold");
                                            };

                                        });
                                        UI.find('.quickCancel').on('click', () => quickQuestion.toggle("fold"));

                                        break;
                                    case 'backpack':
                                        const itemsDir = assetsDir + 'ui/game/backpack/items/';
                                        const blocks = ['onEquip', 'item', 'equip'];
                                        const blockSize = {//==[row,colum]
                                            onEquip: [1, 1],
                                            equip: [1, 4],
                                            item: [3, 4],
                                        };

                                        UI
                                            .width(510)
                                            .height(320)
                                            .append(`
                                            <div class='black-tooltip'></div>
                                            <div class='row'>
                                                <div class='col-5'>
                                                    <div class="block" id="onEquip"></div>
                                                    <div class="photo">
                                                        <img src="${assetsDir + 'ui/map/player/' + GameData.playerRole}.png" width="140px">
                                                        
                                                        <div>
                                                            <div class="barGroup">
                                                                <text>HP </text>
                                                                <div class="barBox">
                                                                    <div class="bar HP"></div>
                                                                </div>
                                                            </div>
                                                            <div class="barGroup">
                                                                <text>MP </text>
                                                                <div class="barBox">
                                                                    <div class="bar MP"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                       
                                                     
                                                    </div>                                          
                                                </div>
                                                <div class='col-7'>
                                                    <div class="block" id="item"></div>
                                                    <div class="block" id="equip"></div>
                                                </div>
                                            </div>
                                            <div class="backpackHint" >
                                                <div class="itemTooltip"></div>
                                                <div class="itemSelectBar"></div>
                                            </div>
                                        `);

                                        let getItemImg = (idx, key) => {
                                            let item = GameData.backpack[key][idx];
                                            let imgHtml = item ?
                                                `<img class="item" src="${itemsDir + (key === 'item' ? item.name : item)}.png" width="${iconW}px" height="${iconW}px" value="${idx}">
                                                ${key === 'item' ? `<div>x${item.amount}</div>` : ''}` : '';

                                            return imgHtml;
                                        };
                                        let getTableHTML = (key) => {
                                            //==道具多於格數擴增包包格子
                                            if (key === 'item') {
                                                let itemLength = GameData.backpack['item'].length;
                                                blockSize[key] = itemLength > blockSize[key].reduce((p, c) => p * c) ?
                                                    [Math.ceil(itemLength / 4), 4] : blockSize[key];
                                            };
                                            let size = blockSize[key];

                                            let row = size[0],
                                                col = size[1];
                                            let rowIdxs = [...Array(row).keys()],
                                                colIdxs = [...Array(col).keys()];

                                            let table = rowIdxs.map(row =>
                                                `<tr> 
                                                    ${colIdxs.map(col => `<td align='center'>${getItemImg(row * colIdxs.length + col, key)}</td>`).join('')}
                                                </tr>`
                                            ).join('');

                                            // console.debug(table);
                                            let html = `
                                            <div class="blockLabel">${GameData.localeJSON.UI[key]}</div>
                                            <div class="blockTable"><table>${table}</table></div>`;

                                            return html;
                                        };

                                        let itemTooltip = UI.find('.itemTooltip');
                                        let itemSelectBar = UI.find('.itemSelectBar');
                                        let updateTooltip = (target, blockKey) => {
                                            let UIDOMRect = UI.get(0).getBoundingClientRect();
                                            let targetDOMRect = target.getBoundingClientRect();

                                            let top = targetDOMRect.top - UIDOMRect.top - targetDOMRect.height * 0.5,
                                                left = targetDOMRect.left - UIDOMRect.left + targetDOMRect.width;

                                            let itemIdx = target.getAttribute('value'),
                                                item = GameData.backpack[blockKey][itemIdx],
                                                itemName = blockKey === 'item' ? item.name : item,
                                                itemBuff = GameItemData[itemName].buff,
                                                itemInfo = GameData.localeJSON.Item[itemName];

                                            let blockText = {
                                                itemName: itemInfo['name'],
                                                itemBuff: Object.keys(itemBuff).map(key =>
                                                    `${GameData.localeJSON.UI[key] + (itemBuff[key] > 0 ? ' +' : ' ') + itemBuff[key]}`).join('<br>'),
                                                itemInfo: itemInfo['short'],
                                                itemdetail: itemInfo['long'],
                                            };

                                            const tooltipBlock = ['itemName', 'itemBuff', 'itemInfo', 'itemdetail'];
                                            let html = tooltipBlock.map(key => `<div class="tooltipText" id="${key}">${blockText[key]}</div>`).join('');

                                            itemTooltip
                                                .show()
                                                .css({ top: top, left: left, })
                                                .html(html);

                                        };
                                        let updateSelectBar = (target, blockKey) => {
                                            let UIDOMRect = UI.get(0).getBoundingClientRect();
                                            let targetDOMRect = target.getBoundingClientRect();

                                            let top = targetDOMRect.top - UIDOMRect.top - targetDOMRect.height * 0.5,
                                                left = targetDOMRect.left - UIDOMRect.left + targetDOMRect.width;

                                            const selection = {
                                                onEquip: ['unequip'],
                                                item: ['use'],
                                                equip: ['equip'],
                                            }[blockKey];

                                            let html = selection.map(key =>
                                                `<div class="" option="${key}">${GameData.localeJSON.UI[key]}</div>`).join('');

                                            let itemIdx = target.getAttribute('value'),
                                                item = GameData.backpack[blockKey][itemIdx],
                                                itemName = blockKey === 'item' ? item.name : item,
                                                itemBuff = GameItemData[itemName].buff,
                                                itemInfo = GameData.localeJSON.Item[itemName];

                                            itemSelectBar
                                                .show()
                                                .css({ top: top, left: left, })
                                                .html(html)
                                                .data('item', {
                                                    key: blockKey,
                                                    idx: itemIdx,
                                                });
                                        };

                                        UI.on('updateEvt', () => {
                                            blocks.forEach(key => {
                                                let block = UI.find('#' + key);
                                                block.children().remove();
                                                block.append(getTableHTML(key));
                                                block.find('img')
                                                    .on('mouseover', e => {
                                                        updateTooltip(e.target, key);
                                                    })
                                                    .on('mouseout', e => {
                                                        itemTooltip.hide();
                                                    })
                                                    .on('click', e => {
                                                        updateSelectBar(e.target, key);
                                                    });
                                            });


                                            // console.debug('updateEvt');
                                            let playerStats = { ...GameData.playerStats };

                                            let hpPercent = parseFloat((playerStats.HP / playerStats.maxHP * 100).toFixed(1)) + '%',
                                                mpPercent = parseFloat((playerStats.MP / playerStats.maxMP * 100).toFixed(1)) + '%';

                                            UI.find('.HP')
                                                .width(hpPercent)
                                                .text(hpPercent);
                                            UI.find('.MP')
                                                .width(mpPercent)
                                                .text(mpPercent);

                                        });

                                        itemSelectBar.on('click', e => {
                                            let option = e.target.getAttribute('option');
                                            let selectData = itemSelectBar.data('item');

                                            let item;
                                            switch (option) {
                                                case 'unequip':
                                                case 'equip':
                                                    let isEquip = option === 'equip';
                                                    item = GameData.backpack[selectData.key][selectData.idx];
                                                    GameData.backpack.onEquip = isEquip ? [item] : [];
                                                    break;
                                                case 'use':
                                                    item = GameData.backpack[selectData.key][selectData.idx];

                                                    //==物品效果
                                                    let gameItemData = GameItemData[item.name];
                                                    //消耗品才能在大地圖用
                                                    if (gameItemData.type === 0) {
                                                        Object.keys(gameItemData.buff).forEach(key => {
                                                            GameData.playerStats[key] += gameItemData.buff[key];
                                                            if (key === 'HP' || key === 'MP')
                                                                GameData.playerStats[key] = GameData.playerStats[key] > GameData.playerStats['max' + key] ?
                                                                    GameData.playerStats['max' + key] : GameData.playerStats[key];
                                                        });
                                                        //==數量用完就刪除
                                                        if ((item.amount -= 1) <= 0) GameData.backpack[selectData.key].splice(selectData.idx, 1);
                                                    };
                                                    break;
                                            };
                                            gameUI.find('#playerStatsUI').trigger('updateEvt');
                                            UI.trigger('updateEvt');


                                        });
                                        // console.debug(GameData);

                                        $(window).on('click', e => {
                                            if (!e.target.classList.contains('item'))
                                                itemSelectBar.hide();
                                        });

                                        UI.find('.barBox')
                                            .on('mouseover', function (e) {
                                                let isHP = this.children[0].classList.contains('HP');
                                                let playerStats = GameData.playerStats;
                                                let status = isHP ?
                                                    parseInt(playerStats.HP) + ' / ' + playerStats.maxHP :
                                                    parseInt(playerStats.MP) + ' / ' + playerStats.maxMP;

                                                UI.find('.black-tooltip')
                                                    .text((isHP ? 'HP ' : 'MP ') + status)
                                                    .css({
                                                        "top": `${200 + (isHP ? 0 : this.getBoundingClientRect().height * 1.5)}px`,
                                                        "left": `${e.offsetX}px`
                                                    })
                                                    .show();

                                            })
                                            .on('mouseout', (e) => {
                                                UI.find('.black-tooltip')
                                                    .hide();
                                            });
                                        break;
                                };


                                let closeBtn = UI
                                    .append(`<div class="closeBtn">✖</div>`)
                                    .find(`.closeBtn`);

                                closeBtn
                                    .css('cursor', 'pointer')
                                    .on('mouseover', (e) => {
                                        $(e.target).animate({
                                            backgroundColor: "#FF2D2D",
                                        }, 100);
                                    })
                                    .on('mouseout', (e) => {
                                        $(e.target).stop(true)
                                            .animate({
                                                backgroundColor: "#FFFFFF",
                                            }, 100);
                                    })
                                    .on('click', function (e) {
                                        $(`#${btn}`).toggleClass('clicked', false);
                                        UI.hide();
                                    });
                            });

                        };
                        let iconEvent = () => {
                            const iconW2 = iconW * 1.5,
                                fixPos = 0.5 * (iconW - iconW2);//==至中要修正position
                            const duration = 50;

                            gameUI.find('.UIicon')
                                .on('mouseover', (e) => {
                                    $(e.target).animate({
                                        width: iconW2,
                                        height: iconW2,
                                        top: fixPos,
                                        left: fixPos,
                                    }, duration);
                                    updateTooltip(e.target.parentNode);
                                })
                                .on('mouseout', (e) => {
                                    $(e.target).stop(true)
                                        .animate({
                                            width: iconW,
                                            height: iconW,
                                            top: 0,
                                            left: 0,
                                        }, duration);

                                    UItooltip.hide();
                                    if (!GameData.stationClear.chartUnlock && e.target.parentNode.id == 'velocityChart')
                                        UIhint.hide();
                                })
                                .on('click', function (e) {
                                    //==速度參數要完成兩站才能調整
                                    // if (this.id == 'velocityChart' && !GameData.stationClear.chartUnlock) return;

                                    let button = $(this);
                                    let ckick = button.hasClass('clicked');
                                    button.toggleClass('clicked', !ckick);

                                    updateUI(this, !ckick);

                                    //===第一次開速度圖
                                    if (this.id == 'velocityChart' && GameData.sidekick.lineStage[0] == 3) {
                                        updateSidekick(4, 0, false);
                                    };
                                });

                        };
                        init();
                        addIcons();
                        iconEvent();
                        //==test
                        // $(`#velocityChart`).trigger('click');
                    };
                    let confirmWindow = () => {
                        let imgW = 10;
                        let confirmWindow = gameUI.append(`
                        <div class="confirmWindow">
                            <text>${GameData.localeJSON.UI['mapClickConfirm1']} 
                                <b class="placeStr"></b>
                             ${GameData.localeJSON.UI['mapClickConfirm2']}
                            </text>
                            <div class="d-flex justify-content-around" >
                                <text name="confirm" value="yes">
                                    <img name="confirmImg" src="${ctrlDir}triangle_left.png" width="${imgW}px" height="${imgW}px">
                                    ${GameData.localeJSON.UI['yes']} (Y)
                                    <img name="confirmImg" src="${ctrlDir}triangle_right.png" width="${imgW}px" height="${imgW}px">
                                </text>

                                <text name="confirm" value="no">
                                    <img name="confirmImg" src="${ctrlDir}triangle_left.png" width="${imgW}px" height="${imgW}px">
                                    ${GameData.localeJSON.UI['no']} (N)
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
                    let congratsPage = () => {
                        chartContainerJQ.find('#gameGroup')
                            .append(`
                                <div class="Congrats">
                                    <div class="d-flex justify-content-center ">
                                        <div class="rankChart col-9"></div>
                                        <div class="endMenu col-3 d-flex align-items-center"></div>
                                    </div>
                                </div>
                            `);
                    };
                    let sidekick = () => {
                        const sidekickDir = assetsDir + 'ui/map/sidekick/';
                        const sidekickW = 200;
                        const textBoxW = 500;

                        //===sidekickUI
                        const sidekickUI = gameUI
                            .append(`<div class="sidekickUI"></div>`)
                            .find('.sidekickUI');

                        let init = () => {
                            let localeJSON = GameData.localeJSON.UI;

                            sidekickUI
                                .append(`
                                    <div class="sidekickTXB">
                                        <img src="${sidekickDir}/textBox.png" width="${textBoxW}px">
                                        <div class="sidekickText" style="white-space: pre-wrap"></div>
                                        <div class="hint">
                                        ( ${localeJSON.sidekickHint.replace('\t', ' SPACE ').replace('\t', ' A ')} )
                                        </div>                                
                                    </div>`
                                )
                                .append(`
                                    <div class="sidekick">
                                        <img src="${sidekickDir}Doctor.png" width="${sidekickW}px">
                                    </div>`
                                );


                            let sidekick = sidekickUI.find('.sidekick')
                                .on('click', () => {
                                    if (stopClickFlag) return;

                                    updateSidekick(...GameData.sidekick.lineStage);
                                })
                                .on('mouseover', e => {

                                })
                                .on('mouseout', () => {

                                });


                            sidekickUI.find('.sidekickTXB').hide()
                                .on('click', () => GameData.sidekick.stopHotkey ?
                                    false : sidekick.trigger("click"));

                        };
                        init();
                        updateSidekick(...GameData.sidekick.lineStage);
                    };

                    timeRemain();
                    UIbar();
                    confirmWindow();
                    congratsPage();
                    sidekick();
                };
                function addMapEvent() {
                    let confirmWindow = gameUI.find('.confirmWindow');

                    mapObj
                        .on('click', function (e) {
                            // if (stopClickFlag || !GameData.stationClear.chartUnlock) return;
                            let lat = e.latlng.lat,
                                lng = e.latlng.lng

                            let distToEpicenter = distanceByLnglat([lat, lng], data.epicenter.coordinate);
                            console.debug(distToEpicenter);
                            //==找到震央布林值 
                            let bingo = distToEpicenter <= allowedErro;

                            requestTypingAnim();

                            lat = lat.toFixed(2);
                            lng = lng.toFixed(2);
                            let coordinate = [lat, lng];

                            confirmWindow.fadeIn(fadeInDuration)
                                .find('.placeStr')
                                .text(`${lat} , ${lng}`)
                                .data('gameStartParameters', ['dig', {
                                    coordinate,
                                    depth: bingo ? data.epicenter.depth : null,
                                }]);


                            //==顯示假設點
                            assumedEpicenter
                                .setLatLng(coordinate)
                                .getTooltip()
                                .setContent(`${GameData.localeJSON.UI['assumedEpicenter']} : ${coordinate.join(' , ')}`)
                            assumedEpicenter.getElement().style.display = 'inline';

                            GameData.playerEpicenter = coordinate;

                            if (gameUI.find('#velocityChartUI').is(':visible'))
                                d3.select(`#velocityChartUI>svg`).dispatch('updateEvt');
                            else
                                gameUI.find('#velocityChart').trigger('click');


                        })
                        .on('move', function (e) {
                            confirmWindow.fadeOut(fadeOutDuration);
                        })
                        .on('zoomstart', function (e) {
                            data.forEach(d => d.labelObj.style.display = 'none');
                        })
                        .on('zoomend', function (e) {
                            data.forEach(d => {
                                let markerNode = d.markerObj._icon;
                                let labelObj = d.labelObj;
                                Object.assign(labelObj.style, {
                                    transform: markerNode.style.transform,
                                    display: 'inline',
                                });
                            });

                        });


                    //==快捷鍵
                    $(window)
                        .on("keyup", (e) => {
                            if (gameStartFlag) return;
                            // console.debug(e);

                            switch (e.code) {
                                case 'KeyA':
                                    GameData.sidekick.lineStage[1] <= 1 ?
                                        GameData.sidekick.lineStage[1] = 0 :
                                        GameData.sidekick.lineStage[1] -= 2;
                                    gameUI.find('.sidekick').trigger("click");
                                    break;
                                case 'Space':
                                    if (GameData.sidekick.stopHotkey) return;
                                    gameUI.find('.sidekick').trigger("click");
                                    break;
                                case 'KeyP':
                                    gameUI.find('#playerStats').trigger("click");
                                    break;
                                case 'KeyV':
                                    gameUI.find('#velocityChart').trigger("click");
                                    break;
                                case 'KeyQ':
                                    gameUI.find('#questInfo').trigger("click");
                                    break;
                                case 'KeyI':
                                    gameUI.find('#backpack').trigger("click");
                                    break;
                                case 'KeyY':
                                case 'KeyN':
                                    let confirmWindow = gameUI.find('.confirmWindow');
                                    if (confirmWindow.css('display') != 'block') return;
                                    confirmWindow.find(`text[value = "${e.code == 'KeyY' ? 'yes' : 'no'}"]`)
                                        .trigger("click");
                                    break;

                            };
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

                let circleAnime = (circleObj, originalRadius, duration = 500) => {
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
                let iconUpDownAnime = (marker, iconUrl, duration = 600) => {
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
                let iconTriggerAnime = (marker, trigger = true, duration = 50) => {
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
                let iconBrokenAnime = (marker, duration = 500) => {
                    const
                        iconUrl1 = marker.getIcon().options.iconUrl,
                        iconUrl2 = assetsDir + 'icon/home_broken.png',
                        iconUrl3 = assetsDir + 'icon/home_destruction.png';

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

                let data = stationMarker.options.data;
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
                    //===update station
                    if (updateObj.hasOwnProperty('stationInfo')) {
                        let stationStats = data.stationStats;
                        if (updateObj.stationInfo.clear) {
                            //==第一次更新測站圖案和在圓圈選單裡增加該站
                            if (!stationStats.clear) {
                                iconUpDownAnime(stationMarker, clearIconUrl);
                                gameUI.find(`#velocityChartUI`).trigger('addDropdownItem', data);
                            };

                            //==tooltip label
                            stationStats = updateObj.stationInfo;
                            let orbStats = stationStats.orbStats;
                            if (orbStats) {//orbStats
                                //==tooltip
                                let timeGap = Math.abs(orbStats.reduce((acc, cur) => acc.time - cur.time));
                                orbStats.timeGap = timeGap;
                                //距離=時間*速度,km換算成m;
                                let radius = timeGap * GameData.velocity * 1000;

                                //==半徑跟之前相差大於1不作動畫
                                let pre_radius = data.circleObj.getRadius();
                                if (Math.abs(radius - pre_radius) > 1)
                                    //== circle更新動畫
                                    circleAnime(data.circleObj, radius);

                                //==更新tooltip
                                let tooltipContent = `
                                    <text class='staName'>${GameData.localeJSON.UI['station'] + ' : ' + data.station}</text><br>
                                    <text class='pTime'>${GameData.localeJSON.UI['pTime'] + ' : ' + parseFloat((orbStats[0].time).toFixed(2)) + ' s'}</text><br>
                                    <text class='sTime'>${GameData.localeJSON.UI['sTime'] + ' : ' + parseFloat((orbStats[1].time).toFixed(2)) + ' s'}</text><br>
                                    <text class='timeGap'>${GameData.localeJSON.UI['timeGap'] + ' : ' + parseFloat(timeGap.toFixed(2)) + ' s'}</text><br>
                                    <text class='preDistance'>${GameData.localeJSON.UI['preDistance'] + ' : ' + parseFloat((radius / 1000).toFixed(1)) + ' km'}</text><br>
                                    
                                    ${stationStats.liberate ? '' :
                                        `<text class='enmeyType'>${GameData.localeJSON.UI['enmey'] + ' : '}</text>
                                    ${Object.keys(stationStats.enemyStats).map(e =>
                                            stationStats.enemyStats[e].HP >= 0 ?
                                                `<img src='${assetsDir + 'icon/' + e + '.png'}' width='25px'></img>` : '').join(' ')}<br>`}
                                `;
                                stationMarker.setTooltipContent(tooltipContent);

                                //==label
                                let markerNode = stationMarker._icon;
                                let labelObj = data.labelObj;

                                labelObj.innerHTML = parseFloat(timeGap.toFixed(2)) + '(s)';
                                Object.assign(labelObj.style, {
                                    transform: markerNode.style.transform,
                                    font: 'bold 16px sans-serif',
                                    color: 'red',
                                    position: 'absolute',
                                    top: '-20px',
                                    left: '20px',
                                });
                                markerNode.parentNode.append(labelObj);
                            };
                        };
                        Object.assign(data.stationStats, updateObj.stationInfo);
                    };


                    //==label test
                    // let markerNode = stationMarker._icon;
                    // let labelObj = data.labelObj;

                    // labelObj.innerHTML = "AAAA";
                    // Object.assign(labelObj.style, {
                    //     transform: markerNode.style.transform,
                    //     font: 'bold 16px sans-serif',
                    //     color: 'red',
                    //     position: 'absolute',
                    //     top: '-20px',
                    //     left: '20px',
                    //     // 'text-align': 'start',
                    // });
                    // markerNode.parentNode.append(labelObj);
                };

            };
            function updateMapUI(gameResult, duration = 600) {
                let timeRemain = gameResult.timeRemain < 0 ? 0 : gameResult.timeRemain;
                let playerStats = gameResult.playerStats;
                let controllCursor = gameResult.controllCursor;

                //==timerAnime
                const timer = document.querySelector('#gameUI .timer');
                const timerTexts = timer.children;
                const pre_timeRemain = parseInt(timer.getAttribute('value'));

                if (pre_timeRemain > timeRemain) GameData.playerTimeUse += (pre_timeRemain - timeRemain);

                const
                    start = pre_timeRemain * GameData.timeMultiplier,
                    end = timeRemain * GameData.timeMultiplier;
                const increase = start > end ? false : true;

                // console.debug(GameData.playerTimeUse);
                // console.debug(start, end);

                let timerAnime = (increase) => {
                    const delay = 10;
                    const sign = increase ? 1 : -1;
                    const step = sign * Math.abs(start - end) / (duration / delay);

                    // console.debug(step);

                    let now = start;
                    let interval = setInterval(() => {
                        if ((now - end) * sign >= 0) {
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

                //==gameover
                let stageUnlock = () => {
                    if (!GameData.stationClear.chartUnlock) {
                        GameData.stationClear.count = data.filter(d => d.stationStats.clear).length;
                        if (GameData.stationClear.count >= clearStationToUnlock) {
                            GameData.stationClear.chartUnlock = true;

                            //==延遲後移除lock.gif
                            const lock = gameUI.find('#velocityChartLock');
                            let lockAnime = () => {
                                const delay = 10;
                                const step = 1 / (duration * 1.5 / delay);//==opacity預設1

                                let opacity = 1;
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
                            updateSidekick(3, 0);
                        }
                        else if (GameData.stationClear.count > 0) {
                            // console.debug('update')
                            updateSidekick(2, 0);
                        };
                    };
                };

                // console.debug(GameData);
                if (GameData.timeRemain <= 0) {
                    stopClickFlag = true;
                    const quakeDuration = 800;
                    let apocalypse = () => {
                        const bigMapJQ = $(bigMap);

                        const delay = 50;
                        const step = quakeDuration * 0.5 / delay;
                        // console.debug(quakeDuration)
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
                            quakeDuration: quakeDuration * 3,
                        }));
                    };

                    //==說世界毀滅
                    updateSidekick(0, 1, false);

                    setTimeout(() => apocalypse(), quakeDuration);
                    setTimeout(() => {
                        initEndScene(false);
                        stopClickFlag = false;
                    }, quakeDuration * 6);
                }
                else if (GameData.playerStats.HP < 1) {
                    stopClickFlag = true;
                    const restTimeCost = 1 * 60000;//1min=60000ms    
                    const restAnimDelay = 3000;

                    let resting = () => {
                        const blackout = $('#blackout');

                        blackout
                            .css('opacity', 1)
                            .fadeIn(1500);

                        setTimeout(() => {
                            blackout.fadeOut(1500);
                        }, restAnimDelay);

                    };

                    //==說需要恢復
                    updateSidekick(0, 0, true);

                    //==休息動畫
                    setTimeout(() => {
                        resting();
                        GameData.playerStats.HP = GameData.playerStats.maxHP;
                        stopClickFlag = false;
                        setTimeout(() => updateMapUI({ timeRemain: GameData.timeRemain - restTimeCost }, 2000), restAnimDelay * 0.8);
                    }, 1000);


                }
                else {
                    stageUnlock();
                };

            };
            function updateSidekick(stage, index, doneTalking = undefined) {
                let lines = GameData.localeJSON.Lines.bigMap;

                let showText = (stage, index, doneTalking) => {
                    // console.debug(stage, index, doneTalking);
                    let sidekickTXB = gameUI.find('.sidekickUI .sidekickTXB');

                    // console.debug(line);
                    if (!GameData.sidekick.doneTalking || doneTalking == false) {

                        let line = lines[stage][index];
                        let replaceHTML;

                        let bigMapOffset, targetOffset;
                        switch (`${stage}_${index}`) {
                            case '1_0':
                                line = line.replace('\t', GameData.playerCustom.name);
                                break;
                            case '1_1':
                                $('#blackout')
                                    .css('opacity', 0.5)
                                    .fadeIn()

                                targetOffset = gameUI.find('.timeRemain').offset();
                                bigMapOffset = bigMap.getBoundingClientRect();

                                gameUI.find('.guideArrow')
                                    .css('top', targetOffset.top - bigMapOffset.top)
                                    .css('left', targetOffset.left - bigMapOffset.left + 180)
                                    .show();

                                break;
                            case '1_2':
                                targetOffset = gameUI.find('.UIbar').offset();
                                bigMapOffset = bigMap.getBoundingClientRect();

                                gameUI.find('.guideArrow')
                                    .css('top', targetOffset.top - bigMapOffset.top + 100)
                                    .css('left', targetOffset.left - bigMapOffset.left + 50);

                                replaceHTML = `<img src='${assetsDir}icon/backpack.png' width='50px'></img>`;
                                line = line.replace('\t', replaceHTML);
                                break;
                            case '1_3':
                                targetOffset = gameUI.find('.UIbar').offset();
                                bigMapOffset = bigMap.getBoundingClientRect();

                                gameUI.find('.guideArrow')
                                    .css('top', targetOffset.top - bigMapOffset.top + 180)
                                    .css('left', targetOffset.left - bigMapOffset.left + 50);

                                replaceHTML = `<img src='${assetsDir}icon/velocityChart.png' width='50px'></img>`;
                                line = line.replace('\t', replaceHTML);
                                break;
                            case '1_4':
                                targetOffset = gameUI.find('.UIbar').offset();
                                bigMapOffset = bigMap.getBoundingClientRect();

                                gameUI.find('.guideArrow')
                                    .css('top', targetOffset.top - bigMapOffset.top + 260)
                                    .css('left', targetOffset.left - bigMapOffset.left + 50);

                                replaceHTML = `<img src='${assetsDir}icon/questInfo.png' width='50px'></img>`;
                                line = line.replace('\t', replaceHTML);
                                break;
                            // case '1_2':
                            //     targetOffset = gameUI.find('.UIbar').offset();
                            //     bigMapOffset = bigMap.getBoundingClientRect();

                            //     gameUI.find('.guideArrow')
                            //         .css('top', targetOffset.top - bigMapOffset.top)
                            //         .css('left', targetOffset.left - bigMapOffset.left + 50);

                            //     break;

                            case '1_5':
                                $('#blackout').fadeOut();
                                gameUI.find('.guideArrow').hide();
                                data.forEach(d => {
                                    let markerObj = d.markerObj;
                                    let circleObj = d.circleObj;
                                    markerObj.addTo(mapObj);
                                    circleObj.addTo(mapObj);

                                    updateStation(markerObj, { icon: 'default' });
                                });
                                break;
                            case '1_6':
                                replaceHTML = `<img src='${assetsDir}icon/questInfo.png' width='50px'></img>`;
                                line = line.replace('\t', replaceHTML);
                                replaceHTML = `<img src='${assetsDir}icon/home.png' width='50px'></img>`;
                                line = line.replace('\t', replaceHTML);
                                replaceHTML = `<img src='${assetsDir}ui/map/sidekick/Doctor.png' width='50px'></img>`;
                                line = line.replace('\t', replaceHTML);
                                break;
                            case '2_1':
                                replaceHTML = `<img src='${assetsDir}icon/home.png' width='50px'></img>`;
                                line = line.replace('\t', replaceHTML);
                                break;
                            case '2_0':
                                replaceHTML = `<text>${clearStationToUnlock - GameData.stationClear.count}</text>`;
                                line = line.replace('\t', replaceHTML);
                                break;
                            case '3_1':
                                replaceHTML = `<img src='${assetsDir}icon/velocityChart.png' width='50px'></img>`;
                                line = line.replace('\t', replaceHTML);

                                $('#blackout')
                                    .css('opacity', 0.5)
                                    .fadeIn()

                                targetOffset = gameUI.find('#velocityChart').offset();
                                bigMapOffset = bigMap.getBoundingClientRect();

                                gameUI.find('.guideArrow')
                                    .css('top', targetOffset.top - bigMapOffset.top - 10)
                                    .css('left', targetOffset.left - bigMapOffset.left + 25)
                                    .show();
                                break;
                            case '4_0':
                                $('#blackout').fadeOut();
                                gameUI.find('.guideArrow').hide();
                                break;
                            case '4_3':
                                replaceHTML = `<img src='${assetsDir}ui/map/chartHandle.png' width='50px'></img>`;
                                line = line.replace('\t', replaceHTML);
                                break;
                            case '5_2':
                                replaceHTML = `<img src='${assetsDir}ui/map/chartHandle.png' width='50px'></img>`;
                                line = line.replace('\t', replaceHTML);
                                replaceHTML = `<img src='${assetsDir}icon/home_clear.png' width='50px'></img>`;
                                line = line.replace('\t', replaceHTML);
                                break;
                            // case '3_1':
                            //     break;
                        };
                        // console.debug(line);

                        sidekickTXB.fadeIn()
                            .children('.sidekickText')
                            .html(line);

                        let endIdx = Object.keys(lines[stage]).length - 1;
                        GameData.sidekick.doneTalking = doneTalking == undefined ?
                            (index == endIdx) : doneTalking;
                        if (++index > endIdx) index = endIdx;

                        if (stage != 0)//==失敗對話不紀錄
                            GameData.sidekick.lineStage = [stage, index];

                        GameData.sidekick.stopHotkey = false;
                        // console.debug(GameData.sidekick.lineStage);
                        // console.debug(GameData.sidekick.doneTalking);
                    }
                    else {
                        if (stage != 0)//==失敗對話不紀錄
                            GameData.sidekick.lineStage = [stage, 0];

                        sidekickTXB.fadeOut(500);
                        GameData.sidekick.doneTalking = false;
                        GameData.sidekick.stopHotkey = true;


                    };


                };
                showText(stage, index, doneTalking);

            };
            //===when map clicked
            async function gameStart(gameMode, siteData = null) {
                // console.debug(gameMode, siteData);

                gameDisplay(true);

                let gameResult;
                if (gameMode == 'defend') {
                    let stationData = siteData ?
                        siteData.options.data :
                        data[0].markerObj.options.data;//test

                    gameResult = await new Promise((resolve, reject) => {
                        const config = Object.assign(getPhaserConfig(width, height), {
                            scene: new DefendScene(stationData, GameData, {
                                getWaveImg: getWaveImg,
                                tutorialData: data.tutorialData,
                                resolve: resolve,
                            }),
                        });
                        new Phaser.Game(config);
                    });

                    // console.debug(gameResult);
                    let stationInfo = gameResult.stationInfo;
                    let playerInfo = gameResult.playerInfo;

                    //===更新測站情報
                    updateStation(siteData, { stationInfo });
                    //===更新人物資料
                    updateMapUI(playerInfo, 1000);
                }
                else if (gameMode == 'dig') {
                    // // console.debug(siteData);
                    {
                        const backgroundArr = Object.keys(BackGroundResources.dig);

                        let coordinate = siteData.coordinate;
                        // let background = 'halloween_4';//==之後經緯度判斷？
                        let background = backgroundArr[getRandom(backgroundArr.length)];
                        let mineBGindex = 0;//==之後經緯度判斷？

                        let placeData = {
                            coordinate: coordinate,
                            background: background,
                            mineBGindex: mineBGindex,
                            depth: siteData.depth ? siteData.depth : null,
                        };

                        // //==顯示假設點
                        // assumedEpicenter
                        //     .setLatLng(coordinate)
                        //     .getTooltip()
                        //     .setContent(`${GameData.localeJSON.UI['assumedEpicenter']} : ${coordinate.join(' , ')}`)
                        // assumedEpicenter.getElement().style.display = 'inline';

                        // GameData.playerEpicenter = coordinate;

                        gameResult = await new Promise((resolve, reject) => {
                            const config = Object.assign(getPhaserConfig(width, height), {
                                scene: new DigScene(placeData, GameData, {
                                    resolve: resolve,
                                }),
                            });
                            new Phaser.Game(config);
                        });

                        // console.debug(gameResult);
                        let playerInfo = gameResult.playerInfo;

                        //===更新人物資料
                        updateMapUI(playerInfo, 1000);
                    }

                    // === 進王關
                    if (gameResult.bossRoom) {//gameResult.bossRoom
                        const backgroundArr = Object.keys(BackGroundResources.boss);
                        let background = backgroundArr[getRandom(backgroundArr.length)];

                        gameResult = await new Promise((resolve, reject) => {
                            const config = Object.assign(getPhaserConfig(width, height), {
                                scene: new BossScene(GameData, background, {
                                    resolve: resolve,
                                }),
                            });
                            new Phaser.Game(config);
                        });
                        // console.debug(gameResult);
                        let playerInfo = gameResult.playerInfo;

                        //===更新人物資料
                        updateMapUI(playerInfo, 1000);

                        //==通關
                        if (gameResult.bossDefeated) {//gameResult.bossDefeated
                            // console.debug('通關');
                            initEndScene(true);
                            return;
                        };
                    }
                    else { //=== 沒找到
                        updateSidekick(5, 0);
                    };

                };
                gameDisplay(false);

            };

            initGameData();
            initStartScene();
        };

        //===init once
        // if (!(chartContainerJQ.find('#form-game').length >= 1)) {
        //     initForm();
        // };
        initForm();
        data = await data;
        rankingData = await rankingData;
        // console.log(data);
        // console.log(rankingData);
        gameGenerate();

    };
    //==================d3 chart================================================
    //==取得波形svg圖
    async function getWaveImg(stationData, timeDomain = null, overview = false, scaleY = 1) {
        // console.debug(stationData, timeDomain);
        let waveData = await (stationData.waveData ? stationData.waveData : data.tutorialData);
        // console.debug(waveData);

        function getSvgUrl(data) {
            //==max min要一樣起始點才會落在同位置(避免波形間隔看起來不同)
            const xAxisDomain = timeDomain ? timeDomain : d3.extent(data[0].data.map(d => d.x));
            const yAxisDomain = d3.extent([].concat(...data.map(d => d3.extent(d.data, d => d.y))));
            // console.debug(xAxisDomain, yAxisDomain);

            const getColor = (index) => {
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
                };
                return color;
            };
            // const width = 800;
            // const height = 600;
            const width = window.innerWidth,
                height = window.innerHeight;
            const margin = { top: 30, right: 30, bottom: height * 0.075, left: 55 };
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
                    let timeArr = data[0].data.map(d => d.x);
                    let i1 = d3.bisectCenter(timeArr, timeDomain[0]);
                    let i2 = d3.bisectCenter(timeArr, timeDomain[1]) + 1;//包含最大範圍
                    // let newData = data.map(d => new Object({
                    //     channel: d.channel,
                    //     data: d.data.slice(i1, i2)
                    // }));

                    let newData = data.map(d =>
                        Object.assign({ ...d }, { data: d.data.slice(i1, i2) })
                    );

                    return newData;
                };
                function getSvgUrl(svgNode) {
                    let svgData = (new XMLSerializer()).serializeToString(svgNode);
                    let svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                    let svgUrl = URL.createObjectURL(svgBlob);
                    return svgUrl;
                };

                let newData = timeDomain ? getNewData(timeDomain) : data;
                // console.debug(newData);
                // console.debug(data);

                let x = d3.scaleLinear()
                    .domain(xAxisDomain)
                    .range([margin.left, width - margin.right]);

                let updateAxis = () => {

                    let makeXAxis = g => g
                        .attr("transform", `translate(0,${height - margin.bottom * (stationData.isTutorial && !overview ? 2.5 : 1)})`)
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
                            .attr("y", margin.bottom * 0.8)
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

                let updatePaths = () => {
                    //波形第一點離中心點偏移位置修正(sclae變大會歪)
                    const domainMean = yAxisDomain.reduce((p, c) => p + c) * 0.5;
                    let getShiftY = (firstPoint) => {
                        let shiftMean = y(domainMean) - y(firstPoint);
                        return shiftMean;
                    };

                    let eachHeight = overview ?
                        (height - margin.bottom) * 0.8 / 3 :
                        (height - margin.bottom - margin.top) * 0.8 / 3;

                    let y = d3.scaleLinear()
                        .domain(yAxisDomain)
                        .range([0.5 * (1 + scaleY) * eachHeight, 0.5 * (1 - scaleY) * eachHeight]);

                    let line = d3.line()
                        .defined(d => !isNaN(d.x))
                        .x(d => x(d.x))
                        .y(d => y(d.y));

                    let makePaths = pathGroup => pathGroup
                        .attr("filter", overview ? null : "url(#pathShadow)")
                        .selectAll('g')
                        .data(newData)
                        .join("g")
                        .attr("transform", (d, i) => `translate(0,${eachHeight * i + margin.top + getShiftY(d.data[0].y)})`)
                        .call(gCollection =>
                            gCollection.each(function (d, i) {
                                let g = d3.select(this),
                                    color = getColor(i),
                                    data = d.data;

                                g
                                    .append("path")
                                    .style("mix-blend-mode", "luminosity")
                                    .attr("fill", "none")
                                    .attr("stroke-width", overview ? 5 : 2)
                                    .attr("stroke-linejoin", "bevel")//arcs | bevel |miter | miter-clip | round
                                    .attr("stroke-linecap", "butt")//butt,square,round
                                    // .attr("stroke-opacity", 0.9)
                                    .attr("stroke", color)
                                    .attr("d", line(data));

                                let channel = d.channel.slice(-1);
                                g
                                    .append("text")
                                    .attr("transform", `translate(${margin.left},${y(data[0].y)})`)
                                    .attr("fill", color)
                                    .attr("text-anchor", "end")
                                    // .attr("alignment-baseline", "before-edge")
                                    .attr("font-weight", "bold")
                                    .attr("font-size", "20")
                                    .text(channel + GameData.localeJSON.UI['channel' + channel]);

                            })
                        );

                    pathGroup.call(makePaths);

                };
                updateAxis();
                updatePaths();

                return {
                    svg: getSvgUrl(svg.node()),
                    x: x,
                    margin: margin,
                };
            };

            return getChart();
        };

        let SvgUrlArr = getSvgUrl(waveData);
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

        let x, y;
        let newDataObj;
        const slopeRange = [5, 70];//==速度參數最大小範圍(km/s)
        let handleSlope = GameData.velocity;

        let getPoint = (slope, rScale = 1) => {
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

        let epicenterCoord = data.epicenter.coordinate;

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
                    .text(`${GameData.localeJSON.UI['timeGap']} (s)`);//'▵T ( Tₛ - Tₚ ) (s)'

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
                    .text(`${GameData.localeJSON.UI['distance']} (km)`);
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

                let updateAxis = () => {

                    let makeXAxis = g => g
                        .attr("transform", `translate(0,${height - margin.bottom})`)
                        .style('font', 'small-caps bold 20px/1 sans-serif')
                        .call(d3.axisBottom(x).tickSizeOuter(0).ticks(width / 80))
                        .call(g => g.select('.domain').attr('stroke-width', strokeWidth));

                    let makeYAxis = g => g
                        .attr("transform", `translate(${margin.left},0)`)
                        .style('font', 'small-caps bold 20px/1 sans-serif')
                        .call(d3.axisLeft(y).ticks(height / 80))
                        .call(g => g.select('.domain').attr('stroke-width', strokeWidth));

                    xAxis.call(makeXAxis);
                    yAxis.call(makeYAxis);
                };
                let updateFocus = () => {
                    const transDuration = 500;
                    const transDelay = 90;

                    let makeDots = focusGroup => focusGroup
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
                let updateFixed = () => {

                    let getArcD = (r, start, end) => d3.arc()
                        .innerRadius(r)
                        .outerRadius(r)
                        .startAngle(start)
                        .endAngle(end)();

                    const rangePoint = slopeRange.map(s => getPoint(s));


                    // console.debug(rangePoint);

                    //作出弧線和夾角區域
                    let makeArcArea = fixedGroup => fixedGroup
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
                    let makeSlash = fixedGroup => fixedGroup
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
                let updateHandle = () => {
                    //作出使用者操作的把手
                    let makeHandle = fixedGroup => fixedGroup
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
            let updateCustomEvent = () => {
                svg.on('updateEvt', function (d, i) {
                    // let evt = d3.event;
                    newDataObj = getNewData();
                    updateChart();
                });
            };
            let handleDrag = () => {

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
            let focusHover = () => {

                const UI = d3.select('#velocityChartUI');
                const tooltip = UI
                    .append("div")
                    .attr("class", "black-tooltip");
                // const tooltipMouseGap = 50;//tooltip與滑鼠距離

                focusGroup
                    .on('mouseout', function (e) {
                        tooltip.style("display", "none");
                        // console.debug()
                    })
                    .on('mouseover', function (e) {
                        let targetDOMRect = UI.node().getBoundingClientRect();

                        let makeTooltip = () => {
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
                                    <h5>${GameData.localeJSON.UI['assumedDist']} : ${dist} km</h5>
                                    <h5>${GameData.localeJSON.UI['estimatedTime']} : ${timeGap} s</h5>
                                    `);

                                    // console.debug();
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
    //==取得過關排名圖
    function getRankChart(rankingData) {
        // console.debug(rankingData);
        const width = 700;
        const height = 600;
        const margin = { top: 130, right: 90, bottom: 80, left: 80 };
        const svg = d3.create("svg")
            .attr("viewBox", [0, 0, width, height]);
        const xAxis = svg.append("g").attr("class", "xAxis");
        const yAxis = svg.append("g").attr("class", "yAxis");
        const title = svg.append("g").attr("class", "title");
        const focusGroup = svg.append("g").attr('class', 'focus');

        let x, y, line;
        let newDataObj;
        let braveAnim, boss, brave;


        let replayFlag = false;
        const
            originOpacity = 0.2,
            afterOpacity = 0.7;

        function getNewData() {
            const gap = 3,//==每10分鐘一組(>10,10-20)
                groupCount = 10;//==暫定10組(最大90-100)

            // console.debug(GameData.playerTimeUse);
            let playerObj = {
                player: GameData.playerCustom.name,
                timeUse: parseFloat((GameData.playerTimeUse / 60000).toFixed(2)),
                score: 0,
            };

            let getGapGroupData = () => {
                let gapGroupData = Array.from(new Array(groupCount), () => 0);
                // console.debug(rankingData);
                rankingData.forEach(d => {
                    let groupIndex = Math.ceil(d.timeUse / gap) - 1;
                    if (groupIndex < 0) groupIndex = 0;//==0時index會是-1
                    else if (groupIndex > groupCount - 1) groupIndex = groupCount - 1;//==超過90都算第一組
                    // console.debug(groupIndex);
                    if (d === playerObj) gapGroupData.playerGroupIdx = gapGroupData.length - groupIndex - 1;
                    gapGroupData[groupIndex]++;
                });
                return gapGroupData;
            };
            let getPR = () => {
                rankingData.push(playerObj);
                rankingData.sort((a, b) => b.timeUse - a.timeUse);
                let playerIdx = rankingData.findIndex(obj => obj === playerObj);

                for (let i = playerIdx; i > 0; i--) {
                    if (rankingData[i].timeUse < rankingData[i - 1].timeUse) {
                        playerIdx = i - 1;
                        break;
                    }
                };

                return parseFloat(((playerIdx + 1) / rankingData.length * 100).toFixed(1));
            };
            let writeFile = () => {
                $.ajax({
                    type: 'POST',
                    url: "src/php/writeRankingFile.php",
                    data: playerObj,//['playerName',100]
                    async: true,
                    success: function (d) { console.debug(d); },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error(jqXHR, textStatus, errorThrown);
                    },
                });
            };

            writeFile();

            return {
                PR: getPR(),
                gapGroupData: getGapGroupData().reverse(),//因為是用時排列,越少時間排名越高
                gap: gap,
            };
        };
        function updateChart(replay = false) {
            const textColor = '#ADFFFA',
                barFill = '#283618',
                barFill2 = '#00AF54',
                barStroke = '#606C38',
                pathStroke = '#FFD633';

            const
                appearDuration = 1200,
                runDuration = 3000,//3000
                attackDuration = 1200,
                fallDuration = 600;
            const braveDir = assetsDir + 'ui/map/brave/';
            const braveW = 70;
            const devilW = 130;

            function init() {

                //==svg轉圖片css不會套用所以寫在這裏
                svg.style('text-shadow', '#111 0 0 2px, rgba(255, 255, 255, 0.1) 0 1px 3px');

                title
                    .append('text')
                    .attr("fill", textColor)
                    .attr("text-anchor", "middle")
                    .attr("font-weight", "bold")
                    .attr("font-size", "15")
                    .attr("x", width / 2)
                    .attr("y", 30);

                xAxis
                    .append('text')
                    .attr("class", "axis_name")
                    .attr("fill", textColor)
                    .attr("font-weight", "bold")
                    .attr("font-size", "20")
                    .attr('x', width / 2)
                    .attr("y", margin.bottom * 0.7)
                    .text(`${GameData.localeJSON.UI['score']}`);

                yAxis
                    .append('text')
                    .attr("class", "axis_name")
                    .attr("fill", textColor)
                    .attr("font-weight", "bold")
                    .attr("font-size", "20")
                    .style("text-anchor", "middle")
                    .attr("alignment-baseline", "text-before-edge")
                    .attr("transform", "rotate(-90)")
                    .attr('x', -(height - margin.top - margin.bottom) / 2 - margin.top)
                    .attr("y", -margin.left * 0.7)
                    .text(`${GameData.localeJSON.UI['playerCount']}`);
            };
            function render() {
                let gapGroupData = newDataObj.gapGroupData;
                let playerGroupIdx = gapGroupData.playerGroupIdx;
                let PR = newDataObj.PR;
                let gap = newDataObj.gap;

                // console.debug(newDataObj);
                let init = () => {
                    //==沒完成任何站就給最大時間10才不出bug
                    let xAxisDomain = [gap * gapGroupData.length, 0];
                    let yAxisDomain = [0, d3.max(gapGroupData)];

                    // console.debug(xAxisDomain, yAxisDomain);
                    x = d3.scaleLinear()
                        .domain(xAxisDomain)
                        .range([margin.left, width - margin.right]);

                    y = d3.scaleLinear()
                        .domain(yAxisDomain)
                        .range([height - margin.bottom, margin.top]);

                    line = d3.line()
                        .curve(d3.curveCatmullRom.alpha(0.5))
                        .x((d, i) => {
                            let multi = gapGroupData.length - i - (i == 0 ? 2 : i == gapGroupData.length - 1 ? 1 : 1.5);
                            return x(multi * gap);
                        })
                        .y(d => y(d));
                };
                let updateAxis = () => {
                    let setStyle = g => {
                        g.selectAll(".tick line").remove();
                        g.selectAll(".tick text")
                            .attr("fill", textColor);
                        g.select(".domain")
                            .attr('stroke', textColor)
                            .attr('stroke-width', 3)
                            .attr('stroke-linecap', "round")
                    };
                    let makeXAxis = g => g
                        .attr("transform", `translate(0,${height - margin.bottom})`)
                        .call(g => {
                            let axisFun = d3.axisBottom(x).tickSizeOuter(0);
                            let tickValues = gapGroupData.map((d, i) => gap * i);
                            // console.debug(tickValues);
                            axisFun
                                .tickValues(tickValues)
                                .tickFormat(d => d);//==不然小數會被轉整數
                            axisFun(g);
                        })
                        .call(setStyle)
                        .call(g => g//==改成顯示分數
                            .selectAll('.tick>text')
                            .text((d, i) => (gapGroupData.length - i) * 10)
                        );
                    let makeYAxis = g => g
                        .attr("transform", `translate(${margin.left},0)`)
                        .call(g => {
                            let axisFun = d3.axisLeft(y).tickSizeOuter(0);
                            let tickValues = y.ticks()
                                .filter(Number.isInteger);
                            axisFun
                                .tickValues(tickValues)
                                .tickFormat(d3.format('d'));//==不然小數會被轉整數
                            axisFun(g);
                        })
                        .call(setStyle);

                    xAxis.call(makeXAxis);
                    yAxis.call(makeYAxis);
                };
                let updateFocus = () => {
                    const width = (x(0) - x(gap)) - 1;

                    let bar = focusGroup
                        .selectAll(".braveBar")
                        .data(gapGroupData)
                        .join("rect")
                        .attr("class", "braveBar")
                        .attr("fill", barFill)
                        .attr("stroke", barStroke)
                        .attr("stroke-width", 2)
                        .attr('opacity', originOpacity)
                        .attr("rx", '4')
                        .attr("x", (d, i) => x((gapGroupData.length - i) * gap) + 1)
                        .attr("y", d => y(d))
                        .attr("height", d => y(0) - y(d))
                        .attr("width", width);
                    //     console.debug(gapGroupData);

                    let path = svg
                        .selectAll(".bravePath")
                        .data([PR])
                        .join("path")
                        .attr("class", "bravePath")
                        .attr("fill", "none")
                        .attr("stroke", pathStroke)
                        .attr("stroke-width", 4)
                        .attr("stroke-linejoin", "round")
                        .attr("d", () => {//==頭尾從0開始
                            gapGroupData.unshift(0);
                            gapGroupData.push(0);
                            return line(gapGroupData);
                        });


                    bar
                        .attr("y", y(0))
                        .attr("height", 0)
                        .interrupt().transition().duration(appearDuration) //.interrupt()前次動畫
                        .ease(d3.easeBounceIn)
                        .attr("y", d => y(d))
                        .attr("height", d => y(0) - y(d));

                    bar
                        .filter((d, i) => i <= playerGroupIdx)
                        .attr("opacity", originOpacity)
                        .transition().duration(appearDuration)
                        .delay((d, i) => appearDuration + i * (runDuration / (playerGroupIdx + 1)))
                        .ease(d3.easeLinear)
                        .call(bar => bar.filter((d, i) => i == playerGroupIdx).attr("fill", barFill2))
                        .attr("opacity", afterOpacity);

                    path
                        .attr("stroke-dashoffset", 3000)
                        .attr("stroke-dasharray", 3000)
                        .interrupt().transition().duration(appearDuration * 2)
                        .ease(d3.easeLinear)
                        .attr("stroke-dashoffset", 0);



                };
                let updateBraves = () => {

                    boss = svg
                        .selectAll(".image")
                        .data([0])
                        .join("image")
                        .attr("class", "devil")
                        .attr("href", braveDir + 'devilFly.gif')
                        .attr("width", devilW);

                    brave = svg
                        .selectAll(".image")
                        .data([0])
                        .join("image")
                        .attr("class", "brave")
                        .attr("opacity", 0)
                        .attr("width", braveW)
                        .attr("x", -braveW * 0.4)
                        .attr("y", -braveW * 1.1);

                    braveAnim = brave
                        .selectAll(".braveAnim")
                        .data([0])
                        .join("animateMotion")
                        .attr("class", "braveAnim");

                };
                let playAnime = (replay) => {
                    let init = () => {
                        brave
                            .attr("href", braveDir + 'braveRun.gif');

                        boss
                            .attr("x", x((gapGroupData.length - playerGroupIdx - 2) * gap))
                            .attr("y", y(gapGroupData[playerGroupIdx + 1]) - devilW * 0.65)
                            .attr("transform", null);

                    };
                    let walkingAnime = () => {
                        let dur = runDuration / 1000,
                            delay = appearDuration / 1000;

                        braveAnim
                            .attr("restart", "whenNotActive")
                            .attr("dur", dur + "s")
                            .attr("begin", `${delay}s;op.end+${delay}s`)
                            .attr("path", () => line(gapGroupData.slice(0, playerGroupIdx + 2)))
                            .attr("repeatCount", "1")
                            .attr("fill", "freeze")
                            .attr("rotate", 0);

                        braveAnim.node().beginElement();

                    };
                    let attackAnime = () => {
                        braveAnim
                            .on('beginEvent', () => brave.attr("opacity", 1))
                            .on('endEvent', () => {
                                brave.attr("href", braveDir + 'braveAttack.gif');
                                d3.timeout(() => {
                                    brave.attr("href", braveDir + 'braveIdle.gif');

                                    let bossX = parseFloat(boss.attr("x")),
                                        bossY = parseFloat(boss.attr("y")),
                                        bossW = parseFloat(boss.attr("width")),
                                        bossH = parseFloat(boss.attr("height"));
                                    // console.debug(bossX, bossY, bossW, bossH)

                                    let bossT1 = fallDuration * 0.5,
                                        bossT2 = fallDuration * 0.2,
                                        bossT3 = fallDuration * 2;
                                    boss
                                        .attr("y", bossY)
                                        .attr("transform-origin", `${bossX + 0.5 * bossW} ${bossY + 0.3 * bossW}`)
                                        .attr("transform", `scale(-1,1) rotate(-180)`)
                                        .transition().duration(bossT1) //.interrupt()前次動畫
                                        .ease(d3.easeSinOut)
                                        .attr("y", bossY + 15)
                                        .transition().duration(bossT3).delay(bossT2)
                                        .ease(d3.easeCubicIn)
                                        .attr("y", -height);


                                    if (!replay) {

                                        let titleDelay = bossT1 + bossT2 + bossT3 * 0.5;

                                        title
                                            .select('text')
                                            .text(GameData.localeJSON.UI['rankChartStr1'])
                                            .append('tspan')
                                            .attr("fill", "red")
                                            .attr("font-size", "30")
                                            .text(` ${PR}% `)
                                            .append('tspan')
                                            .attr("fill", textColor)
                                            .attr("font-size", "15")
                                            .text(GameData.localeJSON.UI['rankChartStr2']);


                                        title
                                            .attr('opacity', 0)
                                            .transition().duration(appearDuration).delay(titleDelay)
                                            .ease(d3.easeCubicIn)
                                            .attr('opacity', 1);
                                    };

                                    d3.timeout(() => replayFlag = true, bossT1 + bossT2 + bossT3);
                                    // chartContainerJQ.find('#gameGroup .Congrats .endMenu').show();

                                }, attackDuration);
                            });

                    };

                    init();
                    walkingAnime();
                    attackAnime();


                };
                if (!replay) {
                    init();
                    updateAxis();
                    updateFocus();
                    updateBraves();
                };
                playAnime(replay);
            };

            if (!newDataObj) {
                newDataObj = getNewData();
                init();
            };
            render();
        };
        updateChart();

        function events(svg) {
            const tooltip = d3.select(".rankChart")
                .append("div")
                .attr("class", "black-tooltip ");
            const mouseGap = 50;

            let replayAnime = () => {
                let brave = svg.select('.brave');

                brave
                    .on('click', () => {
                        if (replayFlag) {
                            updateChart(true);
                            replayFlag = false;
                        };
                    })
                    .on('mouseover', e => {
                        if (replayFlag) {
                            brave.attr("cursor", 'pointer');

                            tooltip
                                .style("display", "inline")
                                .style("top", `${e.offsetY - mouseGap}px`)
                                .style("left", `${e.offsetX}px`)
                                .selectAll('div')
                                .data([0])
                                .join('div')
                                .text(GameData.localeJSON.UI['replay']);
                        };
                    })
                    .on('mouseout', () => {
                        brave.attr("cursor", 'auto');
                        tooltip.style("display", "none");
                    });

            };
            let barHover = () => {
                let updateTooltip = (groupIndex, data) => {

                    tooltip
                        .selectAll('div')
                        .data([groupIndex, data])
                        .join('div')
                        .attr('class', 'd-flex flex-nowrap justify-content-center align-items-end text-nowrap')
                        .call(divC => divC.each(function (d, i) {
                            let div = d3.select(this);
                            let html;
                            if (i == 0) {
                                let groupCount = newDataObj.gapGroupData.length - 2;//==頭尾多的
                                let multiplier = d;

                                let range1, range2;

                                range1 = multiplier * groupCount + 1;
                                range2 = (multiplier + 1) * groupCount;

                                html = (d == 0 ? `<h5>≦</h5>&nbsp;${range2}` : `${range1}&nbsp;~&nbsp;${range2}`) + '&nbsp;<h5>pt</h5>';
                            }
                            else
                                html = `<h1 style='font-weight:bold;'>${d}</h1>&nbsp;<h6>${GameData.localeJSON.UI['playerCount']}</h6> `;

                            div
                                .style('font-size', '30px')
                                .html(html);

                        }));

                };


                let braveBars = focusGroup.selectAll(".braveBar");
                braveBars
                    .on('mouseover', e => {
                        let bar = e.target;
                        d3.select(bar).attr("opacity", 1);

                        //==show tooltip and set position
                        tooltip
                            .style("display", "inline")
                            .style("top", `${e.offsetY - mouseGap}px`)
                            .style("left", `${e.offsetX + mouseGap}px`);

                        let groupIndex = Array.from(bar.parentNode.children).indexOf(bar);
                        let data = bar.__data__;

                        updateTooltip(groupIndex, data);
                    })
                    .on('mouseout', e => {
                        let playerGroupIdx = newDataObj.gapGroupData.playerGroupIdx;
                        braveBars
                            .attr("opacity", (d, i) => i <= playerGroupIdx ? afterOpacity : originOpacity);

                        tooltip.style("display", "none");
                    });

            };
            replayAnime();
            barHover();

        };
        svg.call(events);

        return svg.node();
    };
    //==取得分享圖
    function getSharingImg(profile = null) {
        const photoW = profile ? profile.picture.data.width : 120;

        let rankChart = document.querySelector('.rankChart>svg');
        let composeCertificate = (imgObj, fileName, option) => {

            function getBlobUrl(imgData, isSvg) {
                // console.debug(svgUrl);
                return new Promise(r => {
                    if (isSvg) {
                        // console.debug(imgData);
                        let svgData = (new XMLSerializer()).serializeToString(imgData);
                        let blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                        r(URL.createObjectURL(blob));
                    }
                    else {
                        //==fb大頭照下載
                        fetch(imgData)
                            .then(res => res.blob()) // Gets the response and returns it as a blob
                            .then(blob => r(URL.createObjectURL(blob)));
                    };
                });
            };
            function getCanvas(isAvatar) {
                let width = isAvatar ? photoW : 800;
                // =============== canvas init
                let canvas = document.createElement('canvas');
                let context = canvas.getContext('2d');
                canvas.width = width;
                canvas.height = width;
                context.fillStyle = isAvatar ?
                    "#" + GameData.playerCustom.avatarBgColor.toString(16).padStart(6, '0').toUpperCase() :
                    "#FFF";
                context.fillRect(0, 0, canvas.width, canvas.height);

                //==頭像框線
                if (isAvatar) {
                    context.lineJoin = 'bevel';
                    context.lineWidth = 10;
                    context.strokeStyle = '#7b5e57';
                    context.strokeRect(0, 0, width, width);
                };

                return [canvas, context];

            };
            function download(href, name) {
                let downloadLink = document.createElement("a");
                downloadLink.href = href;
                downloadLink.download = name;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            };
            function saveCertificate(imgUrl) {
                // console.debug(imgUrl);
                return $.ajax({
                    type: 'POST',
                    url: "src/php/saveCertificate.php",
                    data: {
                        imgUrl: imgUrl,
                        imgType: option,
                        fileName: fileName,
                    },
                    async: true,
                    // success: function (d) { console.debug(d); },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error(jqXHR, textStatus, errorThrown);
                    },
                });
            };

            //==============each svg draw to canvas
            let CanvasObjArr = getCanvas(option == 'avatar');
            let canvas = CanvasObjArr[0],
                context = CanvasObjArr[1];

            let certPromise;

            if (option == 'avatar')//==合成玩家自訂頭像
                certPromise = new Promise(async (resolve) => {

                    let image = new Image();
                    let avatarDir = assetsDir + 'avatar/' + GameData.playerRole + '/' + GameData.playerCustom.avatarIndex + '.png';
                    image.src = avatarDir;
                    image.onload = () => {
                        // 素材貼到畫布上
                        const headScale = 0.9,//不貼齊框線
                            headW = photoW * headScale,
                            headX = (photoW - headW) / 2;
                        context.drawImage(image, headX, headX, headW, headW);

                        let certificateUrl = canvas.toDataURL('image/png');
                        // console.debug(certificateUrl);
                        resolve(certificateUrl);
                    };
                });
            else//==合成獎狀
                certPromise = new Promise(async (resolve) => {
                    imgObj = await imgObj;
                    let imgKeys = Object.keys(imgObj);
                    // console.debug(imgObj);

                    for (let index = 0; index < imgKeys.length; index++) {
                        let key = imgKeys[index];
                        let value = imgObj[key];
                        // console.debug(key, value);

                        let imageX, imageY,
                            imageWidth, imageHeight;

                        switch (key) {
                            case 'rankChart'://==PR圖
                                //==標題字調整
                                d3.select(value)
                                    .select('.title>text').remove();

                                imageWidth = canvas.width * 0.75;
                                imageHeight = imageWidth * 6 / 7;
                                imageX = canvas.width * 0.05;
                                imageY = canvas.height - imageHeight - margin.bottom - 20;
                                break;
                            case 'words'://==獎狀底   
                                imageWidth = canvas.width;
                                imageHeight = canvas.height;
                                imageX = 0;
                                imageY = 0;
                                break;
                            case 'photo':
                                imageWidth = photoW;
                                imageHeight = photoW;
                                imageX = margin.left + 25;
                                imageY = canvas.height * 0.2 + 20;
                                break;
                            case 'head_line'://==素材
                                imageWidth = canvas.width;
                                imageHeight = 30;
                                imageX = 0;
                                imageY = margin.top;
                                break;
                            case 'head_line2'://==素材
                                imageWidth = canvas.width;
                                imageHeight = 10;
                                imageX = 0;
                                imageY = margin.top + 50;
                                break;
                            case 'foot_line'://==素材
                                imageWidth = canvas.width;
                                imageHeight = 10;
                                imageX = 0;
                                imageY = canvas.height - margin.bottom * 1.5;
                                break;
                            case 'ribbon'://==素材
                                imageWidth = 100;
                                imageHeight = 200;
                                imageX = canvas.width * 0.8;
                                imageY = margin.top - 20;
                                break;
                            case 'seal'://==素材
                                imageWidth = 300;
                                imageHeight = 300;
                                imageX = canvas.width - imageWidth;
                                imageY = canvas.height - imageHeight - margin.bottom;
                                break;
                            case 'background'://==素材
                                imageWidth = canvas.width;
                                imageHeight = canvas.height;
                                imageX = 0;
                                imageY = 0;
                                break;
                            case 'gameTitle'://==素材
                                imageWidth = 350;
                                imageHeight = 175;
                                imageX = canvas.width * 0.5 - 80;
                                imageY = margin.top - 50;
                                break;

                        };

                        let imgUrl = ((key == 'rankChart') || (key == 'words')) ?
                            await getBlobUrl(value, true) :
                            value;

                        let image = new Image();
                        image.src = imgUrl;
                        // console.debug(key, imgUrl);
                        //確保圖層貼上順序
                        await new Promise(r => {
                            image.onload = async () => {
                                // 素材貼到畫布上
                                context.globalAlpha = key == 'seal' ? 0.7 : 1;
                                context.drawImage(image, imageX, imageY, imageWidth, imageHeight);

                                // console.debug(index, key);
                                //貼完輸出
                                if (index == imgKeys.length - 1) {
                                    let certificateUrl = canvas.toDataURL('image/' + option);

                                    if (profile) {
                                        let imgName = await saveCertificate(certificateUrl);
                                        resolve(imgName);
                                    }
                                    else {
                                        download(certificateUrl, fileName);
                                        resolve();
                                    };

                                };
                                r();
                            };
                        });
                    };
                });

            return certPromise;
        };
        const width = 560;
        const height = width;
        const margin = { top: 50, right: 50, bottom: 50, left: 50 };
        const svg = d3.create('svg')            // const svg = d3.select(document.createElement("svg"))
            .attr("viewBox", [0, 0, width, height]);
        const title = svg.append("g").attr("class", "title");
        const focusGroup = svg.append("g").attr('class', 'focus');

        let newDataObj;
        function getNewData() { };
        function updateChart() {
            const
                textColor = '#000',
                PRColor = 'red';

            // const photoDir = assetsDir + 'gameObj/brave/';
            function init() {
                let localeJSON = GameData.localeJSON.UI;

                title
                    .append('text')
                    .attr("fill", textColor)
                    .attr("text-anchor", "start")
                    .attr("font-weight", "bold")
                    .attr("font-size", "20")
                    .attr("x", margin.left)
                    .attr("y", height * 0.2)
                    .style('font-family', 'Pigmo')
                    .text(localeJSON['certTitle']);

                focusGroup
                    .call(g => {
                        g
                            .append('text')
                            .attr("fill", textColor)
                            .attr("text-anchor", "start")
                            .attr("font-weight", "bold")
                            .attr("font-size", "15")
                            .attr("x", margin.left + photoW * 1.2)
                            .attr("y", height * 0.3)
                            .text(`${localeJSON['certLabel1']} ： ${profile ? profile.name : GameData.playerCustom.name}`);


                        let timeUse = {
                            hour: parseInt(GameData.playerTimeUse / 3600000),
                            min: parseInt(GameData.playerTimeUse % 3600000 / 60000),
                            sec: Math.ceil(GameData.playerTimeUse % 60000 / 1000),
                        },
                            timeUseStr = (timeUse.hour > 0 ? timeUse.hour + ' ' + localeJSON['HRS'] + ' ' : '') +
                                ((timeUse.hour > 0 || timeUse.min > 0) ? timeUse.min + ' ' + localeJSON['MINS'] + ' ' : '') +
                                timeUse.sec + ' ' + localeJSON['SECS'];

                        g
                            .append('text')
                            .attr("fill", textColor)
                            .attr("text-anchor", "start")
                            .attr("font-weight", "bold")
                            .attr("font-size", "15")
                            .attr("x", margin.left + photoW * 1.2)
                            .attr("y", height * 0.3 + 20)//
                            .text(`${localeJSON['certLabel2']} ： ${timeUseStr}`);

                        g
                            .append('text')
                            .attr("fill", textColor)
                            .attr("text-anchor", "start")
                            .attr("font-weight", "bold")
                            .attr("font-size", "10")
                            .attr("x", width * 0.4)
                            .attr("y", height - margin.bottom + 20)
                            .text(`${localeJSON['certLabel3']} ： ${new Date().toISOString().substring(0, 10)}`);

                        let webSite = 'https://tecdc.earth.sinica.edu.tw/tecdc/Game/location';
                        g
                            .append('text')
                            .attr("fill", textColor)
                            .attr("text-anchor", "start")
                            .attr("font-weight", "bold")
                            .attr("font-size", "10")
                            .attr("x", width * 0.4)
                            .attr("y", height - margin.bottom + 40)
                            .text(`${localeJSON['certLabel4']} ： ${webSite}`);

                        let PR = d3.select(rankChart).select('.bravePath').data()[0];
                        g
                            .append('text')
                            .attr("fill", textColor)
                            .attr("text-anchor", "middle")
                            .attr("font-weight", "bold")
                            .attr("font-size", "15")
                            .attr("x", width - margin.left * 2)
                            .attr("y", height * 0.65)
                            .attr("transform-origin", `${width - 20} ${height * 0.6}`)
                            .attr("transform", "rotate(25)")
                            .text(`${localeJSON['certLabel5']} ： `)
                            .append('tspan')
                            .attr("fill", PRColor)
                            .attr("font-size", "30")
                            .text(`${PR}`)
                            .append('tspan')
                            .attr("fill", textColor)
                            .attr("font-size", "15")
                            .text(` ％`);
                    });

            };
            function render() {

                let updatePhoto = () => {
                    let boss = svg
                        .selectAll(".image")
                        .data([0])
                        .join("image")
                        .attr("class", "photo")
                        .attr("href", braveDir + 'devilFly.gif')
                        .attr("width", devilW)
                        .attr("x", x((gapGroupData.length - playerGroupIdx - 2) * gap))
                        .attr("y", y(gapGroupData[playerGroupIdx + 1]) - devilW * 0.65);
                };

            };
            if (!newDataObj) {
                newDataObj = getNewData();
                init();
            };
            render();
        };
        updateChart();


        async function getCertRes() {
            const certificateDir = assetsDir + 'certificate/';
            let imgResource = {
                background: certificateDir + 'background.jpeg',
                head_line: certificateDir + 'head_line.png',
                head_line2: certificateDir + 'head_line2.png',
                foot_line: certificateDir + 'foot_line.png',
                ribbon: certificateDir + 'ribbon.png',

                gameTitle: assetsDir + 'ui/game/gameTitle.png',
                rankChart: rankChart.cloneNode(true),
                words: svg.node().cloneNode(true),
                photo: profile ? profile.picture.data.url : await composeCertificate(null, null, 'avatar'),
                seal: certificateDir + 'seal.png',
            };

            return imgResource;
        };

        let fileName = GameData.playerCustom.name + GameData.localeJSON.UI['whosCert'] + '_' + new Date().toISOString().substring(0, 10);
        return composeCertificate(getCertRes(), fileName, profile ? 'jpeg' : 'png');

    };

    return game;
};