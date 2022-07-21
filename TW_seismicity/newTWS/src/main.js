function TWSanime() {
    let selector = 'body';
    let data = null;

    chart.selector = (vaule) => {
        selector = vaule;
        return chart;
    };
    chart.data = (vaule = undefined) => {
        ajaxGetData = (url, option) => {
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
                                date: d.date + "T" + d.time + "." + d.ms,
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
        const chartContainerJQ = $(selector);

        function init() {
            chartContainerJQ.append(`
            <div id="form-chart">
                <div class="form-group" id="chartsOptions" style="display: inline;">
                    <div class="row">

                    </div>
                </div>
            

                <div class="form-group"  id="chartMain">

                    <div id="Map"></div>          
                
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
            chartContainerJQ.find('#Map').children().remove();

            let getChartMenu = () => {
                // console.log(d.data);
                let div = document.createElement("div");
                div.setAttribute("id", "chart" + i);
                div.setAttribute("class", "chart col-md-12 col-sm-12");
                div.setAttribute("style", "position:relative");

                let nav = document.createElement('nav');
                nav.setAttribute("id", "nav" + i);
                nav.setAttribute("class", "toggle-menu");
                nav.setAttribute("style", "position:absolute");
                nav.style.right = "0";

                let a = document.createElement('a');
                a.setAttribute("class", "toggle-nav");
                a.setAttribute("href", "#");
                a.innerHTML = "&#9776;";
                nav.append(a);

                let ul = document.createElement("ul");
                ul.classList.add("active");
                nav.append(ul);

                let chartDropDown = ['bigimg', 'svg', 'png', 'jpg'];
                chartDropDown.forEach(option => {
                    let li = document.createElement("li");
                    let item = document.createElement("a");
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
            };
            let MenuEvents = () => {
                let charts = document.getElementById('charts');
                let stopPropagation = (e) => {
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
            };
            let downloadSvg = (svgArr, fileName, option) => {

                function getSvgUrl(svgNode) {
                    let svgData = (new XMLSerializer()).serializeToString(svgNode);
                    let svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                    let svgUrl = URL.createObjectURL(svgBlob);
                    return svgUrl;
                }
                function getCanvas(resize) {
                    // =============== canvas init
                    let canvas = document.createElement('canvas');
                    let context = canvas.getContext('2d');

                    let svgWidth = svgArr[0].viewBox.baseVal.width;
                    let svgHeight = svgArr[0].viewBox.baseVal.height * svgArr.length;
                    let canvasWidth, canvasHeight;
                    //檢視時縮放,下載時放大
                    if (resize) {
                        let windowW = window.innerWidth;//获取当前窗口宽度 
                        let windowH = window.innerHeight;//获取当前窗口高度 

                        let width, height;
                        let scale = 0.9;//缩放尺寸
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
                        let scale = 1.5;
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
                    let downloadLink = document.createElement("a");
                    downloadLink.href = href;
                    downloadLink.download = name;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }
                function show(width, height) {
                    // $('#bigimg').attr("src", img);//设置#bigimg元素的src属性 
                    // $('#outerdiv').fadeIn("fast");//淡入显示#outerdiv及.pimg 
                    // $('#outerdiv').off('click');
                    // $('#outerdiv').click(function () {//再次点击淡出消失弹出层 
                    //     $(this).fadeOut("fast");
                    // });
                    let outerdiv = $('#outerdiv');

                    outerdiv.fadeIn("fast");//淡入显示#outerdiv及.pimg 
                    outerdiv.off('click');
                    outerdiv.click(function (e) {//再次点击淡出消失弹出层 
                        if (e.target.id != 'outerdiv') return;
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
                    let newSvg = document.createElement('svg');


                    svgArr.forEach(queryStr => {
                        let svgjQobj = $(queryStr);
                        svgjQobj.clone().appendTo(newSvg);
                    });
                    // console.debug(newSvg);
                    let svgUrl = getSvgUrl(newSvg);
                    download(svgUrl, fileName + '.' + option);
                }
                else {
                    //==============each svg draw to canvas
                    let CanvasObjArr = getCanvas(option == 'bigimg');

                    let canvas = CanvasObjArr[0];
                    let context = CanvasObjArr[1];
                    let imageWidth = canvas.width;
                    let imageHeight = canvas.height / svgArr.length;


                    svgArr.forEach((queryStr, index) => {
                        let svgNode = $(queryStr)[0];
                        let svgUrl = getSvgUrl(svgNode);
                        let image = new Image();
                        image.src = svgUrl;
                        image.onload = () => {
                            context.drawImage(image, 0, index * imageHeight, imageWidth, imageHeight);

                            //done drawing and output
                            if (index == svgArr.length - 1) {
                                let imgUrl;
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

            };

            function animeMap() {
                // console.debug(data);

                let Map = L.map('Map', {
                    attributionControl: false,
                    zoomControl: false
                });
                let markerGroup = new L.layerGroup();

                const getSize = (ML) => {
                    let ml_base = 3,
                        circleSize = 3;
                    return ML > ml_base ?
                        (ML - ml_base) * circleSize + 0.1 : 0.1;
                };
                const
                    mlDomain = [3, 7],
                    maxDepth = 320;
                const depthScale = d3.scaleSequentialSqrt([maxDepth, 0], d3.interpolateTurbo);


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
                        tile = {};
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
                    }
                    initMap();
                    initMarker();
                    markerGroup.addTo(Map);
                };
                function update() {
                    // let dep = [10, 35, 70, 150];
                    // let s100Color = [
                    //     '#DB453F', '#F2B53A', '#97E838', '#26D2EB', '#7B3AF2'
                    // ];
                    // function getColor(depth) {
                    //     for (let i = 0; i < s100Color.length - 1; i++) {
                    //         if (depth <= dep[i]) { return s100Color[i] }
                    //         else { continue };
                    //     }
                    //     return s100Color[s100Color.length - 1];
                    // };


                    let updateMarker = (data) => {
                        // markerGroup.clearLayers();

                        // marker.getElement().style.display = 'inline';
                        markerGroup.getLayers().forEach(marker => {
                            // console.debug();
                            marker.getElement().style.display = 'inline';
                        });

                    };
                    updateMarker(data)

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
        if (!(chartContainerJQ.find('#form-chart').length >= 1)) {
            init();
        };

        printChart();

        return chart;
    };
    return chart;
};