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
                        // console.debug(data)
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
            <div id="form-chart">
                <div class="form-group" id="chartsOptions" style="display: inline;">
                    <div class="row">

                    </div>
                </div>
            

                <div class="form-group"  id="chartMain">

                    <div id="Map">
                    </div>          
                
                    <div id="outerdiv"
                        style="position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);z-index:10;width:100%;height:100%;display:none;">
                        <div id="innerdiv" style=" background-color: rgb(255, 255, 255);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"></div>                      
                    </div>

                    <div id='loading'>
                        <div class="spinner-border"role="status">
                            <span class="sr-only" >Loading...</span>
                        </div>
                        Loading...
                    </div>
                </div> 
            </div>
            `);

        };
        async function printChart() {
            selectorD3.selectAll('#Map>*').remove();

            function animeMap() {
                console.debug(data);

                const getSize = (ML) => {
                    let ml_base = 3,
                        circleSize = 3;
                    return ML > ml_base ?
                        (ML - ml_base) * circleSize + 0.1 : 0.1;
                };

                let Map = L.map('Map', {
                    attributionControl: false,
                    zoomControl: false
                });
                let markerGroup = new L.layerGroup();

                const minSpeed = 5 * 86400000;//==5d/s
                const totalTime = (data[data.length - 1].date - data[0].date) / minSpeed;

                const
                    mlDomain = [3, 7],
                    maxDepth = 320;
                const depthScale = d3.scaleSequentialSqrt([maxDepth, 0], d3.interpolateTurbo);
                const timeScale = d3.scaleTime()
                    .domain([data[0].date, data[data.length - 1].date])
                    .range([0, totalTime]);


                const mapSelectorD3 = selectorD3.selectAll('#Map');
                const dateText = mapSelectorD3.append('span').attr("class", "dateText");
                const setting = mapSelectorD3.append('div').attr("class", "setting");

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
                        Map.setView([23, 120], 7);
                        L.tileLayer(tileProviders[0].url, {
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

                        //==disable
                        // Map.boxZoom.disable();
                        // Map.scrollWheelZoom.disable();
                        // Map.doubleClickZoom.disable();
                        // Map.dragging.disable();
                        // Map.keyboard.disable();
                    };
                    let initMarker = () => {
                        data.forEach((d, i) => {
                            let marker = L.circleMarker(d.crood, {
                                color: depthScale(d.depth),
                                radius: getSize(d.ML),
                                className: 'animeMarker',
                            }
                            ).bindPopup(
                                d.date + "<br>Depth: " + d.depth + " km <br>ML: " + d.ML + "<br>"
                            );
                            markerGroup.addLayer(marker);

                        });
                    };
                    let initToolBar = () => {
                        const icons = ['setting', 'pause',];

                        let buttonHtml = icons.map(btn => `
                            <div class="toolButton">
                                <span class="tooltiptext tooltip-top">${btn}</span>
                                <a class="button" id="${btn}Btn" href="${btn === 'setting' ? '#setPanel' : '#'}"></a>
                            </div>`).join('');

                        let setPanelHtml = `
                        <div id="setPanel" class="popup">
                            <h2>Here i am</h2>
                            <a class="close" href="#">&times;</a>
                            <div class="content">
                            Thank to pop me out of that button, but now i'm done so you can close this window.
                            </div>
                        </div>`;

                        setting.node().insertAdjacentHTML('beforeend',
                            `<div class="toolBar d-flex flex-row">
                                ${buttonHtml}
                            </div>`);
                        icons.forEach(btn => {
                            let button = setting.selectAll(`#${btn}Btn`);
                            button
                                .style('content', `url(img/${btn}.png)`);

                            if (btn === 'setting')
                                button.node().parentNode.insertAdjacentHTML('beforeend', setPanelHtml);
                        });
                    };


                    initMap();
                    initMarker();
                    initToolBar();

                    markerGroup.addTo(Map);
                };
                function update() {
                    let updateDateStr = () => {
                        dateText.transition()
                            .ease(d3.easeLinear)
                            .duration(timeScale.range()[1] * 1000)
                            .tween("date", () => {
                                let i = d3.interpolateDate(...timeScale.domain());
                                return t =>
                                    dateText.text(d3.timeMinute(i(t)).toISOString().substring(0, 16));
                            });
                    };
                    let updateMarker = (data) => {
                        // markerGroup.clearLayers();

                        // marker.getElement().style.display = 'inline';
                        let markers = markerGroup.getLayers();
                        data.forEach((d, i) => {
                            // console.debug(timeScale(d.date))
                            d3.timeout(() => {
                                markers[i].getElement().style.display = 'inline';

                            }, timeScale(d.date) * 1000);
                        });

                    };
                    updateMarker(data);
                    updateDateStr();
                };

                init();
                update();
                function events() { };


            };
            // getChartMenu('qsis');

            if (!data) {
                chart.data();
                data = await data;
            };
            animeMap();
        };
        //===init once
        if (!(selectorD3.selectAll('#form-chart').nodes().length >= 1)) {
            init();
        };

        printChart();

        return chart;
    };
    return chart;
};