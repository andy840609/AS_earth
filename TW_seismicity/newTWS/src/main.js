function TWSanime() {
    let selector = 'body';
    let data = null;

    chart.selector = (vaule) => {
        selector = vaule;
        return chart;
    };
    chart.data = (vaule = undefined) => {
        let ajaxGetData = (url, option) => {
            return new Promise(resolve =>
                $.ajax({
                    url,
                    data: option,
                    method: 'POST',
                    dataType: 'json',
                    async: true,
                    success: function (data) {
                        console.log(data);
                        let sortData = data.map(d => new Object(
                            {
                                crood: [parseFloat(d.latitude), parseFloat(d.longitude)],
                                date: new Date(d.date + "T" + d.time + "." + d.ms).getTime(),
                                ML: parseFloat(d.ML),
                                depth: parseFloat(d.depth),
                            })
                        ).sort((a, b) => a.date - b.date);
                        // console.debug(sortData)
                        resolve(sortData);
                    }, error: function (jqXHR, textStatus, errorThrown) {
                        console.log(jqXHR, textStatus, errorThrown);
                    }
                })
            );



        };

        const sqlOption = {
            stlat: 21,
            edlat: 26,
            stlon: 118,
            edlon: 124,
            ML: 4.5,
            stdate: '1990-1-1',
            eddate: new Date().toISOString().substring(0, 10),
        };
        data = vaule ? vaule : ajaxGetData('src/php/getCatalog.php', sqlOption);
        return chart;
    };

    async function chart() {
        const selectorD3 = d3.select(selector);

        function init() {
            document.querySelector(selector).insertAdjacentHTML('beforeend', `
            <div id="seismicity">        
                <div id="Map"></div>          
            
                <div id="outerdiv"
                    style="position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);z-index:10;width:100%;height:100%;display:none;">
                    <div id="innerdiv" style=" background-color: rgb(255, 255, 255);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"></div>                      
                </div>

                <!--<div id='loading'>
                    <div class="spinner-border"role="status">
                        <span class="sr-only" >Loading...</span>
                    </div>
                    Loading...
                </div>-->
            </div>
            `);

        };
        async function printChart() {
            // selectorD3.selectAll('#Map>*').remove();

            function animeMap() {
                console.debug(data);

                const getDateStr = (dateObj) => {
                    return dateObj.toISOString().substring(0, 16);
                };
                const getSize = (ML) => {
                    let ml_base = 3,
                        circleSize = 3;
                    return ML > ml_base ?
                        (ML - ml_base) * circleSize + 0.1 : 0.1;
                };

                const dateText = selectorD3.selectAll('#Map').append('span').attr("class", "dateText");
                const controller = selectorD3.append('div').attr("class", "controller");
                const
                    mlDomain = [3, 7],//==規模範圍
                    depthDomain = [0, 320],//==深度範圍
                    dateDomain = [data[0].date, data[data.length - 1].date],//==日期範圍
                    playSpeedDomain = [5, 180];//==播放速度5~180days/s

                //==動畫預設設定
                const defaultSetting = {
                    playSpeed: playSpeedDomain[0],
                    startDate: dateDomain[0],
                    endDate: dateDomain[1],
                    lockView: true,//==預設鎖定地圖
                };

                let
                    Map,//leaflet obj
                    markerGroup = new L.layerGroup(),
                    markerTimer;

                let depthScale = d3.scaleSequentialSqrt(depthDomain.reverse(), d3.interpolateTurbo),
                    timeScale;
                let animDataObj;

                function getNewData(option = null) {
                    const getValue = (key) => {
                        return (option.hasOwnProperty(key) ? option : animDataObj)[key];
                    };
                    //==算動畫總播放長度
                    const getAnimTime = (start, end, playSpeed) => {//==in ms
                        const dayToMs = 86400000;
                        return (end - start) / (playSpeed * dayToMs) * 1000;
                    };

                    let playSpeed = getValue('playSpeed'),
                        startDate = getValue('startDate'),
                        endDate = getValue('endDate');
                    // ml = getValue('ml'),
                    // mlDomain, mlDomain

                    return {//==time unit in ms
                        playSpeed,//==days/s
                        startDate,
                        endDate,
                        animTime: getAnimTime(startDate, endDate, playSpeed),
                    };
                };
                function updateAnime(action = null) {//==暫停不用更新markerTimer
                    function init() {
                        let initMap = () => {
                            const tileProviders = [
                                {
                                    name: 'OceanBasemap',
                                    attribution:
                                        'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
                                    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',
                                    maxZoom: 10
                                },
                                {
                                    name: 'OpenStreetMap',
                                    attribution: '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                                    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                                    maxZoom: 18
                                },
                                {
                                    name: 'OpenTopoMap',
                                    attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
                                    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
                                    maxZoom: 18
                                },
                                {
                                    name: 'WorldImagery',
                                    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                                    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                                    maxZoom: 18
                                }
                            ];
                            //  lat lon（ center, zoom）
                            Map = L.map('Map', {
                                attributionControl: false,
                                zoomControl: false
                            }).setView([23, 120], 7);

                            L.tileLayer(tileProviders[tileProviders.length - 1].url, {
                                // 'attribution': tileProviders[0].attribution,
                                // 'minZoom': 6,
                                // 'maxZoom': tileProviders[0].maxZoom
                            }).addTo(Map);

                            // change the map setting
                            let tile = {};
                            tileProviders.forEach(function (map) {
                                tile[map.name] = L.tileLayer(map.url, {
                                    'attribution': map.attribution,
                                    'minZoom': 6,
                                    'maxZoom': map.maxZoom
                                })
                            });
                            L.control.layers(tile).addTo(Map);

                            // map sacles
                            L.control.scale({
                                position: 'topright'
                            }).addTo(Map);


                        };
                        let initMarker = () => {
                            data.forEach((d, i) => {

                                let popupHtml = `${getDateStr(new Date(d.date))}<br>Depth: ${d.depth}km <br>ML: ${d.ML}<br>`;

                                let marker = L.circleMarker(d.crood, {
                                    color: depthScale(d.depth),
                                    radius: getSize(d.ML),
                                    className: 'animeMarker',
                                }).bindPopup(popupHtml);

                                markerGroup.addLayer(marker);

                            });
                        };
                        let initToolBar = () => {
                            function getTooltipText(string, hotkey = undefined) {
                                let text = string.charAt(0).toUpperCase() + string.slice(1);
                                return hotkey ? `${text} ( ${hotkey} )` : text;
                            };

                            const icons = [
                                { str: 'setting', hotkey: 'S' },
                                { str: 'lockView', hotkey: 'L' },
                                { str: 'pause', hotkey: 'P' },
                            ];
                            const panelControl = {
                                slider: ['progress', 'playspeed'],
                            };

                            let buttonHtml = icons.map(btn => `
                                <div class="toolButton">
                                    <span class="tooltiptext tooltip-top">
                                        ${getTooltipText(btn.str, btn.hotkey)}
                                    </span>
                                    <a class="button" id="${btn.str}Btn" href="#"></a>
                                </div>`).join('');

                            let sliderHtml = panelControl.slider.map(type => `
                                <label for="customRange3" class="form-label">Example range</label>
                                <input class="slider" type="range"></input>
                               `).join('');

                            let setPanelHtml = `
                            <div id="setPanel" class="popup">
                                <h2>Setting</h2>
                                <a class="close" href="#">&times;</a>
                                <div>
                                    ${sliderHtml}
                                </div>
                                <!-- < div class= "content" >
                                Thank to pop me out of that button, but now i'm done so you can close this window.
                                </div > -->
                            </div > `;

                            controller.node().insertAdjacentHTML('beforeend',
                                `<div class="toolbar d-flex flex-row">
                                    ${buttonHtml}
                                </div>`);

                            icons.forEach(btn => {
                                let button = controller.selectAll(`#${btn.str}Btn`);
                                button.style('content', `url(img/${btn.str}.png)`);

                                let onClick;
                                switch (btn.str) {
                                    case 'setting':
                                        let toolbar = controller.selectAll('.toolbar');
                                        toolbar.node().insertAdjacentHTML('afterbegin', setPanelHtml);
                                        let setPanel = toolbar.selectAll('#setPanel');
                                        setPanel.selectAll('.close').on('click', () => button.dispatch('click'));

                                        onClick = function (e) {
                                            let display = this.value ? 'inline' : 'none';
                                            setPanel.style('display', display);
                                            this.value = !this.value;
                                        };
                                        break;
                                    case 'lockView':
                                        onClick = function () {
                                            this.value = !this.value;
                                            Map.fire('maplock', { lock: this.value });

                                            let string = (this.value ? '' : 'un') + 'lockView';
                                            button.style('content', `url(img/${string}.png)`);
                                            d3.select(this.parentNode).selectAll('.tooltiptext')
                                                .text(getTooltipText(string, btn.hotkey));
                                        };
                                        break;
                                    case 'pause':
                                        onClick = function () {
                                            this.value = !this.value;
                                            Map.fire('animCtrl', { play: this.value });

                                            let string = this.value ? 'pause' : 'play';
                                            button.style('content', `url(img/${string}.png)`);
                                            d3.select(this.parentNode).selectAll('.tooltiptext')
                                                .text(getTooltipText(string, btn.hotkey));
                                        };
                                        break;
                                    case 'b':
                                        break;

                                };
                                button.property("value", true);
                                button.on('click', onClick);

                            });
                        };

                        initMap();
                        initMarker();
                        initToolBar();

                        markerGroup.addTo(Map);
                    };
                    function update() {
                        // console.debug(action, animDataObj);

                        let startDate = animDataObj.startDate,
                            endDate = animDataObj.endDate,
                            animTime = animDataObj.animTime;

                        timeScale = d3.scaleTime()
                            .domain([startDate, endDate])
                            .range([0, animTime]);
                        // console.debug(timeScale(startDate - 1000))

                        let updateDateStr = (duration, dateDomain) => {
                            dateText.interrupt().transition()
                                .ease(d3.easeLinear)
                                .duration(duration)
                                .tween("date", () => {
                                    let i = d3.interpolateDate(...dateDomain);
                                    return t => {
                                        // let date = d3.timeMinute(i(t));
                                        let date = i(t);
                                        // console.debug(date.toISOString())
                                        dateText
                                            .property('value', date.getTime())
                                            .text(getDateStr(date));
                                    };
                                });
                        };

                        let duration, dateDomain;
                        switch (action) {
                            case 'play':
                                let pauseDate = dateText.property('value');
                                duration = timeScale.range()[1] - timeScale(pauseDate);
                                dateDomain = [pauseDate, timeScale.domain()[1]];
                                updateDateStr(duration, dateDomain);
                                // console.debug(new Date(pauseDate).toISOString());

                                markerTimer.forEach(t => t.resume());
                                break;
                            case 'pause':
                                console.debug(new Date(dateText.property('value')).toISOString())
                                dateText.interrupt();

                                markerTimer.forEach(t => t.pause());
                                break;
                            default://init
                                duration = timeScale.range()[1];
                                dateDomain = timeScale.domain();
                                updateDateStr(duration, dateDomain);

                                let markers = markerGroup.getLayers();
                                markerTimer = data.map((d, i) => {
                                    // console.debug(timeScale(d.date))

                                    return new Timer(() => {
                                        markers[i].getElement().style.display = 'inline';

                                        //==debug
                                        // console.debug(Date.now() - start - timeScale(d.date))
                                        let timer = markerTimer[i];
                                        let elapsed = timer.elapsed + Date.now() - timer.start;
                                        console.debug(elapsed - timeScale(d.date));
                                        //==debug

                                    }, timeScale(d.date));
                                });
                                console.debug(setTimeout(() => { }, 1000))
                                console.debug(window.setTimeout(() => { }, 1000))
                                break;
                        };

                    };
                    if (!animDataObj) {
                        animDataObj = getNewData(defaultSetting);
                        init();
                    };
                    update();
                };
                updateAnime();

                function events() {
                    let toolbar = controller.selectAll('.toolbar');

                    let settingBtn = toolbar.selectAll('#settingBtn'),
                        lockViewBtn = toolbar.selectAll('#lockViewBtn'),
                        pauseBtn = toolbar.selectAll('#pauseBtn');

                    let animeControllEvent = () => {
                        //==map events
                        Map
                            .on('maplock', (e) => {
                                let action = e.lock ? 'disable' : 'enable';
                                Map.boxZoom[action]();
                                Map.scrollWheelZoom[action]();
                                Map.doubleClickZoom[action]();
                                Map.dragging[action]();
                                Map.keyboard[action]();
                            })
                            .on('animCtrl', (e) => {
                                let action = e.play ? 'play' : 'pause';
                                updateAnime(action);
                            });


                        Map.fire('maplock', { lock: defaultSetting.lockView });


                        document.addEventListener("visibilitychange", (e) => {
                            // console.debug();
                            let playing = pauseBtn.property('value');
                            if (document.hidden || playing) {
                                pauseBtn.dispatch('click');
                            };
                        });
                    };
                    let keyboardEvent = () => {
                        let hotkeyPressFlag = true;//avoid from trigger event too often

                        d3.select(window)
                            .on("keydown", (e) => {
                                if (!hotkeyPressFlag) return;
                                // console.debug(e.code)
                                switch (e.code) {
                                    //==快捷鍵
                                    case 'KeyP':
                                        pauseBtn.dispatch('click');
                                        break;
                                    case 'KeyS':
                                        settingBtn.dispatch('click');
                                        break;
                                    case 'KeyL':
                                        lockViewBtn.dispatch('click');
                                        break;
                                };

                                hotkeyPressFlag = false;
                                d3.timeout(() => hotkeyPressFlag = true, 10);
                            });
                    };
                    animeControllEvent();
                    keyboardEvent();
                };
                events();

            };
            // getChartMenu('qsis');

            if (!data) {
                chart.data();
                data = await data;
            };
            animeMap();
        };
        //===init once
        if (!(selectorD3.selectAll('#seismicity').nodes().length >= 1)) {
            init();
        };

        printChart();

        return chart;
    };
    return chart;
};