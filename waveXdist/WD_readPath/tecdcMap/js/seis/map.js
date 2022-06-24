$('#Map').css({ height: $('#filter').height() - $('#submit').outerHeight() });

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

//load the map
let Map = L.map('Map');
//  lat lon（ center, zoom）
Map.setView([23, 121], 7);
L.tileLayer(tileProviders[0].url, { 'attribution': tileProviders[0].attribution, 'minZoom': 6, 'maxZoom': tileProviders[0].maxZoom }).addTo(Map);

// change the map setting
tile = {};
tileProviders.forEach(function (map) {
    tile[map.name] = L.tileLayer(map.url, { 'attribution': map.attribution, 'minZoom': 6, 'maxZoom': map.maxZoom })
});
L.control.layers(tile).addTo(Map);

// map sacles
L.control.scale({
    position: 'topright'
}).addTo(Map);

// add Leaflet-Geoman controls with some options to the map
Map.pm.addControls({
    position: 'topleft',
    drawControls: false,
    drawRectangle: false,
    drawMarker: false,
    drawCircleMarker: false,
    drawPolyline: false,
    drawPolygon: false,
    drawCircle: false,
    editMode: false,
    dragMode: false,
    cutPolygon: false,
    removalMode: false,
    rotateMode: false,
    editControls: false,
    customControls: true
});

// 自定義的按鈕，繼承rectangle
actions = [{
    text: '',
}
];
Map.pm.Toolbar.copyDrawControl('Rectangle', {
    name: 'RectangleCopy',
    block: 'custom',
    title: 'Draw selection box',
    actions: actions,
});



// 按自定義按鈕會清除
document.querySelector('.button-container').addEventListener('click', () => {
    Map.eachLayer(layer => {
        if (layer._drawnByGeoman) { layer.remove() }
    })
})


// 選經緯度
Map.on('pm:create', (e) => {
    let latLngs = e.layer.getLatLngs();
    if (latLngs.length == 1) {
        document.getElementById("latMin").value = latLngs[0][0].lat.toFixed(6);//minLatitude
        document.getElementById("latMax").value = latLngs[0][2].lat.toFixed(6);//maxLatitude
        document.getElementById("lonMin").value = latLngs[0][0].lng.toFixed(6);//minLongitude
        document.getElementById("lonMax").value = latLngs[0][2].lng.toFixed(6);//maxLongitude
        Map.pm.disableDraw();
    } else if (latLngs.length == 2) {
        console.log("aaa")
    }

})

// 經緯度線
let gridLayer = new L.LayerGroup();
let gridColor;
let gridCheck = document.getElementById("grid");
function createAxis(color = '#2c2c2c') {
    let grid = L.latlngGraticule({
        showLabel: true,
        color: color,
        zoomInterval: [
            { start: 2, end: 3, interval: 30 },
            { start: 4, end: 4, interval: 10 },
            { start: 5, end: 6, interval: 5 },
            { start: 7, end: 8, interval: 1.5 },
            { start: 9, end: 9, interval: 0.5 },
            { start: 10, end: 11, interval: 0.2 },
            { start: 12, end: 14, interval: 0.1 },
            { start: 15, end: 18, interval: 0.05 },
        ]
    });
    gridLayer.addLayer(grid);
};

// 經緯度開關
function toggleGrid() {
    if (gridCheck.checked == true) {
        if (gridLayer.getLayers().length == 0) {
            createAxis(gridColor);
        }
        gridLayer.addTo(Map);
    } else if (gridCheck.checked == false) {
        Map.removeLayer(gridLayer);
    }
}


// 調整Legend字的顏色與預造經緯度
$(document).ready(function () {
    Map.on('baselayerchange', function (layer) {
        gridLayer.clearLayers();
        if (layer.name === 'WorldImagery') {
            $('#depscale text,#MLscale text:first-of-type,#MLscale text:last-of-type').css({
                'stroke': 'white',
                'stroke-width': 0.6,
            })
            gridColor = '#fffafa';

        } else {
            $('#depscale text,#MLscale text:first-of-type,#MLscale text:last-of-type').css({
                'stroke': '',
                'stroke-width': "",
            })
            gridColor = '#2c2c2c';
        };
        // 預造經緯度
        createAxis(gridColor);
    });
});

// legend 開關
function openLegend(num) {
    if (num === 0) {
        var listenID = "Depth_legend";
        var targetID = "depscale"
    } else if (num === 1) {
        var listenID = "ML_legend";
        var targetID = "MLscale"
    }


    if (document.getElementById(listenID).checked == true) {
        document.getElementById(targetID).removeAttribute("style")
    } else if (document.getElementById(listenID).checked == false) {
        document.getElementById(targetID).setAttribute("style", "display: none");
    }
}

function mlLegend(circleSize, dep, s100Color) {
    let element = document.getElementById("MLscale");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    };

    let element2 = document.getElementById("depscale");
    while (element2.firstChild) {
        element2.removeChild(element2.firstChild);
    };

    let borderWidth = 10;
    let mlMax = 7;
    let mlMin = 3;
    let svgWidth = (mlMax - mlMin) * circleSize + 4 * borderWidth;
    let width = svgWidth * 4.5;
    let dataset = [[mlMin, circleSize * 0.05, width / 6]];
    for (let i = mlMin + 1; i < mlMax + 1; i++) {
        let Num1 = i;
        let Num2 = (i - mlMin) * circleSize + 0.1;
        dataset.push([Num1, Num2, width / 6 * (i - mlMin + 1)]); //兩個合併成一個陣列
    };




    let svg = d3.select('#MLscale').append('svg')
        .attr('width', width)
        .attr('height', svgWidth)
        .attr("font-family", "'Roboto', sans-serif")
        .attr("font-size", 15)
        .attr("text-anchor", "middle");


    // M3
    svg.append('circle')
        .attr('cx', dataset[0][2] - 15)
        .attr('cy', svgWidth / 2)
        .attr('r', dataset[0][1])
        .attr('fill', 'red')
        .attr('stroke', 'red')
        .attr('stroke-width', 3);


    svg.append('text')
        .attr("x", dataset[0][2] - 14)
        .attr("y", svgWidth / 2 + 20)
        .attr("fill", 'black')
        .text("3-");


    // M4
    svg.append('circle')
        .attr('cx', dataset[1][2] - 40)
        .attr('cy', svgWidth / 2)
        .attr('r', dataset[1][1])
        .attr('fill', 'red')
        .attr('stroke', 'red')
        .attr('stroke-width', 3);
    svg.append('text')
        .attr("x", dataset[1][2] - 40)
        .attr("y", svgWidth / 2 + 5)
        .attr("fill", 'black')
        .text("4");

    // M5
    svg.append('circle')
        .attr('cx', dataset[2][2] - 50)
        .attr('cy', svgWidth / 2)
        .attr('r', dataset[2][1])
        .attr('fill', 'red')
        .attr('stroke', 'red')
        .attr('stroke-width', 3);
    svg.append('text')
        .attr("x", dataset[2][2] - 50)
        .attr("y", svgWidth / 2 + 5)
        .attr("fill", 'black')
        .text("5");

    // M6
    svg.append('circle')
        .attr('cx', dataset[3][2] - 55)
        .attr('cy', svgWidth / 2)
        .attr('r', dataset[3][1])
        .attr('fill', 'red')
        .attr('stroke', 'red')
        .attr('stroke-width', 3);

    svg.append('text')
        .attr("x", dataset[3][2] - 55)
        .attr("y", svgWidth / 2 + 5)
        .attr("fill", 'black')
        .text("6");

    // M7
    svg.append('circle')
        .attr('cx', dataset[4][2] - 50)
        .attr('cy', svgWidth / 2)
        .attr('r', dataset[4][1])
        .attr('fill', 'red')
        .attr('stroke', 'red')
        .attr('stroke-width', 3);
    svg.append('text')
        .attr("x", dataset[4][2] - 50)
        .attr("y", svgWidth / 2 + 5)
        .attr("fill", 'black')
        .text("7");

    svg.append('text')
        .attr("x", 12)
        .attr("y", svgWidth / 2 + 6)
        .attr("fill", 'black')
        .text("ML");


    // depth
    let depData = [];
    let colorHeight = [12, 18, 24, 30, 50];
    let yAx = [12, 24, 42, 66, 96];  // y-axis for rectangular
    let tAx = [24, 42, 66, 96, 145];// y-axis for text
    let count = s100Color.length - 1
    for (let i = 0; i < count; i++) {
        depData.push([dep[i], s100Color[i], colorHeight[i], yAx[i], tAx[i]]);
    };
    depData.push(["300+", s100Color[count], colorHeight[count], yAx[count], tAx[count]]);



    d3.select('#depscale').append('svg')
        .call(svg => {
            svg.attr('width', 100)
                .attr('height', 200)
                .attr("font-size", 14)
                .attr("font-family", "'Roboto', sans-serif")
                .attr("text-anchor", "end")
                .attr("alignment-baseline", "middle");

            svg
                .selectAll('g').data(depData).enter()
                .call(g => {
                    g.append('rect')
                        .attr('width', 12)
                        .attr('height', function (d) { return d[2] })
                        .attr('x', 50) //x
                        .attr('y', function (d) { return d[3] + 25 })
                        .attr('fill', function (d) { return d[1] })
                        .attr('stroke', 'black')
                        .attr('stroke-width', 1);

                    g.append('text')
                        .attr("x", 48)
                        .attr("y", function (d) { return d[4] + 30 })
                        .attr("fill", 'black')
                        .text(function (d) { return d[0] });
                })
            svg.append('text')
                .attr("x", 85)
                .attr("y", 30)
                .attr("fill", 'black')
                .text("Depth (km)");
        });
}

// 移動legend
$(function () {
    $("#MLscale").draggable();
    $("#depscale").draggable();
});


// data processing
let dataLayer = new L.layerGroup();

let dep = [10, 35, 70, 150];
let s100Color = [
    '#DB453F', '#F2B53A', '#97E838', '#26D2EB', '#7B3AF2'
];
function getColor(depth) {
    for (let i = 0; i < s100Color.length - 1; i++) {
        if (depth <= dep[i]) { return s100Color[i] }
        else { continue };
    }
    return s100Color[s100Color.length - 1];
}


function getSize(ML, circleSize) {
    let ml_base = 3;
    if (ML > ml_base) { return (ML - ml_base) * circleSize + 0.1 }
    else { return 0.1 };
}

function toUpperFirst(data) {
    let data1 = new Object();
    for (let i = 0; i < data.length; i++) {
        let entries = Object.entries(data[i]);
        let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
        let capsdata = Object.fromEntries(capsEntries);
        data1[i] = capsdata
    }

    return data1;
}

function addLayerToMap(data, circleSize, isTesis = false) {
    if (Map.hasLayer(dataLayer)) {
        Map.removeLayer(dataLayer)
        dataLayer.clearLayers()
    }
    for (let i in data) {
        let row = data[i];
        let colorcode = getColor(row.Depth);
        let size = getSize(row.ML, circleSize);
        let marker;
        // if (isTesis && (typeof (row.CWB_ID) != "undefined")) {
        //     marker = L.circleMarker([row.Latitude, row.Longitude], { radius: size, color: colorcode }
        //     ).bindPopup(row.Date + "<br>" + row.Time +
        //         "<br>Depth: " + row.Depth + " km <br>ML: " + row.ML +
        //         "<br>" + "<a href= https://tesis.earth.sinica.edu.tw/showDetail.php?date=" +
        //         row.Date + "&time=" + row.Time + " target='_blank'>More Information</a>"
        //     );
        // } else {
        //     marker = L.circleMarker([row.Latitude, row.Longitude], { radius: size, color: colorcode }
        //     ).bindPopup(row.Date + "<br>" + row.Time +
        //         "<br>Depth: " + row.Depth + " km <br>ML: " + row.ML
        //     );
        // }

        marker = L.circleMarker([row.Latitude, row.Longitude], { radius: size, color: colorcode }
        ).bindPopup(row.Date + "<br>" + row.Time +
            "<br>Depth: " + row.Depth + " km <br>ML: " + row.ML + "<br>" + `<button type="button" class="btn btn-secondary" onClick="selectCatlog('${row.catlog}')">Show waveform</button>`
        );


        dataLayer.addLayer(marker);
        dataLayer.addTo(Map);
    }

}


function outputInfo(stdate, eddate, maxlon, minlon, maxlat, minlat, maxdep, mindep, maxMag, minMag, total_event) {
    $("#output").html(
        "<b>Num. of Events </b> : " + total_event + "<br/>" +
        "<b>Date</b>  : " + stdate + " ~ " + eddate + "<br/>" +
        minlat + " ≦ <b>Latitude (°N) </b> ≦ " + maxlat + " <br/>" +
        minlon + " ≦ <b>Longitude (°E) </b> ≦ " + maxlon + " <br/>" +
        mindep + " km ≦  <b>Depth</b>  ≦ " + maxdep + " km <br/>" +
        minMag + "  ≦  <b>ML</b> ≦ " + maxMag + " <br/>"
    );



}

function getError(errorMessage = 0) {
    let text;
    if (errorMessage === 0) {
        text = 'Please check input parameters!';
    } else {
        text = 'System is busy now! Please wait and try again!'
    }
    Swal.fire({
        icon: 'error',
        title: 'Oops...Something went wrong!',
        text: text
    })
}

function checkEventNumber(data) {
    let maxNum = 10000;
    if (data.length >= maxNum) {
        Swal.fire({
            title: 'Notification!',
            text: `Totally ${data.length} events were found. But only the larger ${maxNum} earthquakes are presented on the map.`,
            icon: 'warning',
            showCancelButton: false,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'OK'
        })
        data = data.sort(function (a, b) {
            return a.ML < b.ML ? 1 : -1;
        });
        return data.slice(0, maxNum);

    } else {
        return data
    }
}

let eqData;
function get_events() {
    $('#load').show();
    if (!checkInput()) {
        $('#load').hide();
        getError(0);
        return;
    };

    let minMag = document.getElementById("magMin").value;
    let maxMag = document.getElementById("magMax").value;
    let stdate = document.getElementById("datefrom").value;
    let eddate = document.getElementById("dateto").value;
    let maxlon = document.getElementById("lonMax").value;
    let minlon = document.getElementById("lonMin").value;
    let maxlat = document.getElementById("latMax").value;
    let minlat = document.getElementById("latMin").value;
    let mindep = document.getElementById("depthMin").value;
    let maxdep = document.getElementById("depthMax").value;
    let opt = document.getElementById("catalog");
    let circleSize = $("#circle_size").val();

    let cosObj = new URLSearchParams();
    cosObj.append('stdate', stdate);
    cosObj.append('eddate', eddate);
    cosObj.append('minlon', minlon);
    cosObj.append('maxlon', maxlon);
    cosObj.append('maxlat', maxlat);
    cosObj.append('minlat', minlat);
    cosObj.append('maxMag', maxMag);
    cosObj.append('minMag', minMag);
    cosObj.append('maxdep', maxdep);
    cosObj.append('mindep', mindep);
    cosObj.append('option', opt.selectedIndex);

    mlLegend(circleSize, dep, s100Color);
    // 判斷是否是WorldImagery
    if ($('.leaflet-layer[style*="z-index: 4"]').length === 1) {
        $('#depscale text,#MLscale text:first-of-type,#MLscale text:last-of-type').css({
            'stroke': 'white',
            'stroke-width': 0.6,
        });
    };


    // axios.post('./php/getCatalog_all.php', cosObj)
    //     .then(response => {
    //         $('#load').hide();
    //         eqData = [];
    //         let data = checkEventNumber(response.data);
    //         eqData = toUpperFirst(data);
    //         addLayerToMap(eqData, circleSize);
    //         outputInfo(stdate, eddate, maxlon, minlon, maxlat, minlat, maxdep, mindep, maxMag, minMag, response.data.length);
    //     })
    //     .catch((error) => {
    //         $('#load').hide();
    //         getError(1)
    //     });



    axios.post('../map/eventlist_all.txt')
        .then(response => {
            $('#load').hide();
            // console.debug(response.data);
            eqData = response.data.split('\n').map(row => {
                let col = row.split(/\s+/);
                // console.debug(col);
                return {
                    Date: col[0],
                    Time: col[1],
                    Latitude: col[2],
                    Longitude: col[3],
                    Depth: col[4],
                    ML: col[5],
                    catlog: col[6],
                };
            });
            // console.debug(eqData);
            addLayerToMap(eqData, circleSize);

        })
        .catch((error) => {
            console.debug(error);
            $('#load').hide();
            getError(1)
        });

}

// 直接改圓圈大小
$('#circle_size').on('change', function () {
    if (!checkInput()) {
        $('#load').hide();
        getError(0);
        return;
    };
    let opt = document.getElementById("catalog");
    mlLegend(this.value, dep, s100Color);

    if (opt.selectedIndex === 0) {
        addLayerToMap(eqData, this.value, true);
    } else if (opt.selectedIndex === 1) {
        addLayerToMap(eqData, this.value, false);
    }

})
