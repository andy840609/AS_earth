function TWSanime() {
  let selector = "body";
  let data = null;

  chart.selector = (vaule) => {
    selector = vaule;
    return chart;
  };
  chart.data = (vaule = undefined) => {
    let requsetData = (url, option) => {
      let postData = new URLSearchParams();
      Object.keys(option).forEach((key) => postData.append(key, option[key]));

      return new Promise((resolve) => {
        axios
          .post(url, postData)
          .then((res) => {
            console.log(res.data);
            let sortData = res.data
              .map(
                (d) =>
                  new Object({
                    crood: [parseFloat(d.latitude), parseFloat(d.longitude)],
                    date: new Date(
                      d.date + "T" + d.time + "." + d.ms + "Z"
                    ).getTime(),
                    ML: parseFloat(d.ML),
                    depth: parseFloat(d.depth),
                  })
              )
              .sort((a, b) => a.date - b.date);
            // console.debug(sortData)
            resolve(sortData);
          })
          .catch((error) => console.log(error));
      });
    };

    const sqlOption = {
      //   stlat: 21,
      //   edlat: 26,
      //   stlon: 118,
      //   edlon: 124,
      ML: 4.5,
      stdate: "1990-01-01",
      eddate: new Date().toISOString().substring(0, 10),
    };
    data = vaule ? vaule : requsetData("src/php/getCatalog.php", sqlOption);
    return chart;
  };

  async function chart() {
    const selectorD3 = d3.select(selector);

    function init() {
      document.querySelector(selector).insertAdjacentHTML(
        "beforeend",
        `
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
            `
      );
    }
    async function printChart() {
      // selectorD3.selectAll('#Map>*').remove();

      function animeMap() {
        console.debug(data);

        const getDateStr = (dateMs) => {
          return new Date(dateMs).toISOString().substring(0, 16);
        };
        const getCircleRadius = (ML, circleSize) => {
          let ml_base = 3;
          return ML > ml_base ? (ML - ml_base) * circleSize + 0.1 : 0.1;
        };

        const dateText = selectorD3
          .selectAll("#Map")
          .append("span")
          .attr("class", "dateText");
        const controller = selectorD3.append("div").attr("class", "controller");
        const legendGroup = selectorD3
          .append("div")
          .attr("class", "legendGroup");
        const mlDomain = [4, 8], //==規模範圍[3,7]
          depthDomain = [0, 320], //==深度範圍
          dateDomain = [data[0].date, data[data.length - 1].date], //==日期範圍
          playSpeedDomain = [5, 180]; //==播放速度5~180days/s

        //==動畫預設設定
        const defaultSetting = {
          tile: "WorldImagery", //==預設地圖圖層
          playSpeed: playSpeedDomain[0],
          startDate: dateDomain[0],
          endDate: dateDomain[1],
          play: false, //==預設播放動畫
          lockView: true, //==預設鎖定地圖
          audio: false, //==預設聲音關閉(chrome66後不能自動播放)
          volume: 0.5, //==預設聲音大小
          circleSize: 2, //==預設marker半徑係數
          displayStyle: "living", //==預設出現動畫
          displayColor: "rgba(255, 255, 255, 0.6)", //==預設動畫顏色
        };

        //==leaflet obj reference
        let leafletMap,
          markerGroup = new L.layerGroup(),
          latlngLayer;

        let markerTimer;
        let depthScale = d3.scaleSequentialSqrt(
          [...depthDomain].reverse(),
          d3.interpolateTurbo
        );

        //==timeScale用原始範圍來計算progress拉動進度
        let timeScale, newTimeScale;
        let animDataObj;

        function getNewData(option = null) {
          //   console.debug("getNewData", option);
          const getValue = (key) => {
            return (option.hasOwnProperty(key) ? option : animDataObj)[key];
          };
          //==算動畫總播放長度
          const getAnimTime = (start, end, playSpeed) => {
            //==in ms
            const dayToMs = 86400000;
            return ((end - start) / (playSpeed * dayToMs)) * 1000;
          };
          const getNewData = () => {
            let newData = data;
            // return newData.slice(0, 2);
            return newData;
          };
          let playSpeed = getValue("playSpeed"),
            startDate = getValue("startDate"),
            endDate = getValue("endDate"),
            play = getValue("play"),
            lockView = getValue("lockView"),
            audio = getValue("audio"),
            volume = getValue("volume"),
            circleSize = getValue("circleSize"),
            displayStyle = getValue("displayStyle"),
            displayColor = getValue("displayColor");
          // ml = getValue('ml'),
          // mlDomain, mlDomain
          //   console.debug(play);
          return {
            //==time unit in ms
            playSpeed, //==days/s
            startDate,
            endDate,
            animTime: getAnimTime(startDate, endDate, playSpeed),
            play,
            lockView,
            audio,
            volume,
            circleSize,
            displayStyle,
            displayColor,
            newData: getNewData(),
          };
        }
        function updateAnime(action = null) {
          function init() {
            let initMap = () => {
              const getTileLayer = (tile) => {
                return L.tileLayer(tile.url, {
                  attribution: tile.attribution,
                  // minZoom: 6,
                  maxZoom: tile.maxZoom,
                });
              };
              const tileProviders = {
                OceanBasemap: getTileLayer({
                  attribution:
                    "Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri",
                  url: "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}",
                  maxZoom: 10,
                }),
                OpenStreetMap: getTileLayer({
                  attribution:
                    '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                  maxZoom: 18,
                }),
                OpenTopoMap: getTileLayer({
                  attribution:
                    'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
                  url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
                  maxZoom: 18,
                }),
                WorldImagery: getTileLayer({
                  attribution:
                    "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
                  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                  maxZoom: 18,
                }),
              };

              //lat lon（ center, zoom）
              leafletMap = L.map("Map", {
                // attributionControl: false,
                // zoomControl: false,
              }).setView([23, 120], 7);

              // map tiles
              L.control.layers(tileProviders).addTo(leafletMap);
              // map sacles
              L.control.scale({ position: "topright" }).addTo(leafletMap);
              // map default tile
              tileProviders[defaultSetting.tile].addTo(leafletMap);
            };
            let initMarker = () => {
              const DivIcon = L.DivIcon.extend({
                options: {
                  // tooltipAnchor: [0, -25],
                  // popupAnchor: [-0.5, 0],
                  className: "animateMarker",
                },
              });

              data.forEach((d, i) => {
                let popupHtml = `
                ${getDateStr(d.date)}<br>Depth: ${d.depth}km <br>ML: ${
                  d.ML
                }<br>`;

                d.marker = L.marker(d.crood, {
                  icon: new DivIcon(),
                }).bindPopup(popupHtml);

                markerGroup.addLayer(d.marker);
                // console.debug(d.marker);
              });
              markerGroup.addTo(leafletMap);
            };
            let initToolBar = () => {
              function getTooltipText(string, hotkey = undefined) {
                let text =
                  string.charAt(0).toUpperCase() +
                  string.slice(1).replace("_", " ");
                return hotkey ? `${text} ( ${hotkey} )` : text;
              }
              function getControllerHTML(type) {
                let html;
                switch (type) {
                  case "progress":
                    html = `
                    <input class="slider col-9 p-0" type="range"
                        min="0"
                        max="${animDataObj.animTime / 1000}"
                        value="0"
                        step="any"
                    >
                    <span class="col-3 text-nowrap" style="font-size: smaller;">        
                       00:00:00
                    </span>`;
                    break;
                  case "playspeed":
                    let tickSpacing = playSpeedDomain[0]; //==多少數值一個tick

                    let labelAmount = 3,
                      labelSpacing = parseInt(playSpeedDomain[1] / labelAmount);
                    // console.debug(labelSpacing);
                    html = `
                    <input class="slider col-9 p-0" type="range"
                        min="${playSpeedDomain[0]}"
                        max="${playSpeedDomain[1]}"
                        value="${animDataObj.playSpeed}"
                        step="${tickSpacing}"
                        list="playSpeedTick">        
                    <span class="col-3 text-nowrap" style="font-size: small";>      
                        <b class="fs-6">${
                          animDataObj.playSpeed
                        }</b> day/<sub>s</sub>
                    </span>
                    <datalist class="fs-6 p-0" id="playSpeedTick" >
                        ${d3
                          .range(
                            playSpeedDomain[0],
                            playSpeedDomain[1] + 1,
                            tickSpacing
                          )
                          .map(
                            (val) => `<option value="${val}"
                          ${
                            val % labelSpacing === 0 || val === tickSpacing
                              ? `label="x${
                                  val / tickSpacing
                                }" style="font-size: small;"`
                              : ""
                          }></option>`
                          )
                          .join("")}
                    </datalist>
                    `;
                    break;
                  case "audio":
                    html = `
                    <div class="col-2 ps-4 pe-0 form-switch toolButton">
                      <span class="tooltiptext tooltip-top">
                        ${getTooltipText("ON/OFF", "A")}
                      </span>
                      <input class="my-1 form-check-input" type="checkbox" role="switch">
                    </div>
                    <input class="slider col-7 p-0" type="range"
                        min="0"
                        max="100"
                        value="${defaultSetting.volume * 100}"
                        step="1"
                        list="audioTick" disabled>        
                    <span class="col-3 text-nowrap" style="font-size: small;">      
                      <b class="fs-6">${defaultSetting.volume * 100}</b> %
                    </span>

                    <datalist class="fs-6 ps-5" id="audioTick" >
                        ${d3
                          .range(0, 101, 5)
                          .map(
                            (val) => `<option value="${val}"
                          ${
                            val % 25 === 0
                              ? `label="${val}"  style="font-size: smaller;${
                                  val !== 0 ? "padding-left:5px" : ""
                                }"`
                              : ""
                          }></option>`
                          )
                          .join("")}
                    </datalist>
                    `;
                    break;
                  case "event_Config":
                    let displaystyle = ["none", "living"];

                    html = `
                    <div class="inputGroup d-flex flex-column">
                      <label for="" class="text-start fs-5">
                        Animation
                      </label>

                      <div class="d-flex flex-row flex-nowrap mb-2">
                        <label for="displaystyle" class="col-form-label text-nowrap me-3">Display Style</label>
                        <select class="form-control" id="displaystyle">
                          ${displaystyle
                            .map(
                              (type) =>
                                `<option value="${type}" ${
                                  type === defaultSetting.displayStyle
                                    ? "selected"
                                    : ""
                                }>${type}</option>`
                            )
                            .join("")}
                        </select>
                      </div>

                      <div class="d-flex flex-row flex-nowrap mb-2">
                        <label for="circlesize" class="col-form-label text-nowrap me-3">Circle Size</label>
                        <input type="number" class="form-control" id="circlesize" min="1" value="${
                          defaultSetting.circleSize
                        }">
                      </div>

                    </div>
                    `;
                    break;
                  // case "filter":
                  //   html = ``;
                  //   break;
                  // case "audio":
                  //   html = ``;
                  //   break;
                }
                return html;
              }

              const icons = [
                { str: "setting", hotkey: "S" },
                { str: "lockView", hotkey: "L" },
                { str: "pause", hotkey: "P" },
              ];
              const panelControl = {
                slider: ["progress", "playspeed", "audio"],
                checkbox: ["mL_Legend", "depth_Legend", "grid_Line"],
                dropdown: ["event_Config"],
              };

              let buttonHtml = icons
                .map(
                  (btn) => `<div class="toolButton">
                              <span class="tooltiptext tooltip-top">
                                ${getTooltipText(btn.str, btn.hotkey)}
                              </span>
                              <a class="button" id="${btn.str}Btn" href="#"></a>
                            </div>`
                )
                .join("");

              let sliderHtml = panelControl.slider
                .map(
                  (type) => `<div class="inputGroup d-flex flex-column">
                                <label for="" class="text-start fs-5">
                                  ${getTooltipText(type)}
                                </label>
                                <div class="row" id="${type}">
                                  ${getControllerHTML(type)}
                                </div>
                            </div>`
                )
                .join("");

              let dropdownHtml = panelControl.dropdown
                .map(
                  (type) => `<div class="col-6 dropend text-start px-0">
                              <button type="button" class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
                                ${getTooltipText(type)}
                              </button>
                              <ul class="dropdown-menu p-3" id="${type}">
                                ${getControllerHTML(type)}
                              </ul>
                            </div>`
                )
                .join("");

              let checkboxHtml = panelControl.checkbox
                .map(
                  (type, i) => `<div class="form-check col-6 text-start">
                                  <input class="form-check-input" type="checkbox" name="display" value="${i}" id="${type}ckb" checked>
                                  <label class="form-check-label" for="${type}ckb">
                                    ${getTooltipText(type)}
                                  </label>
                              </div>`
                )
                .join("");

              let setPanelHtml = `
                            <div id="setPanel" class="popup">
                                <h1>Setting</h1>
                                <a class="close" href="#">&times;</a>
                                <div class="mx-1">
                                    ${sliderHtml}
                                    <div class="row my-1">
                                      ${dropdownHtml}
                                    </div>
                                    <div class="row">
                                      ${checkboxHtml}
                                    </div>
                                </div>
                            </div > `;

              controller.node().insertAdjacentHTML(
                "beforeend",
                `<div class="toolbar d-flex flex-row">
                    ${buttonHtml}
                </div>`
              );

              icons.forEach((btn) => {
                let button = controller.selectAll(`#${btn.str}Btn`);

                let onClick, value, icon;
                switch (btn.str) {
                  case "setting":
                    let toolbar = controller.selectAll(".toolbar");
                    toolbar
                      .node()
                      .insertAdjacentHTML("afterbegin", setPanelHtml);
                    let setPanel = toolbar.selectAll("#setPanel");
                    setPanel
                      .selectAll(".close")
                      .on("click", () => button.dispatch("click"));

                    value = true;
                    icon = btn.str;
                    onClick = function (e) {
                      let display = this.value ? "inline" : "none";
                      setPanel.style("display", display);
                      this.value = !this.value;
                    };
                    break;
                  case "lockView":
                    value = defaultSetting.lockView;
                    icon = (value ? "" : "un") + "lockView";
                    onClick = function () {
                      this.value = !this.value;
                      leafletMap.fire("maplock", { lock: this.value });

                      let string = (this.value ? "" : "un") + "lockView";
                      button.style("content", `url(img/${string}.png)`);
                      d3.select(this.parentNode)
                        .selectAll(".tooltiptext")
                        .text(getTooltipText(string, btn.hotkey));
                    };
                    break;
                  case "pause":
                    value = defaultSetting.play;
                    icon = value ? "pause" : "play";
                    onClick = function () {
                      this.value = !this.value;
                      leafletMap.fire("animCtrl", { play: this.value });

                      let string = this.value ? "pause" : "play";
                      button.style("content", `url(img/${string}.png)`);
                      d3.select(this.parentNode)
                        .selectAll(".tooltiptext")
                        .text(getTooltipText(string, btn.hotkey));
                    };
                    break;
                  case "b":
                    break;
                }
                button
                  .property("value", value)
                  .style("content", `url(img/${icon}.png)`)
                  .on("click", onClick);
              });
            };
            let initTimeScale = () => {
              timeScale = d3
                .scaleTime()
                .domain([animDataObj.startDate, animDataObj.endDate])
                .range([0, animDataObj.animTime]);
            };
            let initLegend = () => {
              //==Legend長度被最大的圓直徑影響
              let getSpacing = (circleSize) => {
                return (
                  parseInt(getCircleRadius(mlDomain[1], circleSize) * 2) + 30
                );
              };
              const mlRange = d3.range(...mlDomain).concat(mlDomain[1]);
              const spacing = getSpacing(animDataObj.circleSize),
                margin = spacing / 2,
                legendW = spacing * (mlRange.length - 1) + 2 * margin,
                legendH = margin;

              //==ml legend
              legendGroup
                .append("div")
                .attr("class", "legend")
                .append("svg")
                .call((svg) => {
                  svg
                    .attr("class", "mlLegend")
                    .attr("width", legendW)
                    .attr("height", legendH * 3)
                    .append("g")
                    .attr("transform", `translate(0,${margin})`)
                    .call((g) => {
                      g.append("rect")
                        .attr("height", legendH)
                        .attr("width", legendW)
                        .attr("rx", legendH / 2);

                      g.append("text")
                        .attr("text-anchor", "start")
                        .attr("alignment-baseline", "text-after-edge")
                        .text("ML");

                      g.append("g")
                        .attr("transform", `translate(0,${legendH / 2})`)
                        .call((g) => {
                          g.selectAll("circle")
                            .data(mlRange)
                            .join("circle")
                            .attr("r", (d) =>
                              getCircleRadius(d, defaultSetting.circleSize)
                            )
                            .attr("cx", (d, i) => i * spacing + margin);

                          g.selectAll("text")
                            .data(mlRange)
                            .join("text")
                            .text((d) => d)
                            .attr("text-anchor", "middle")
                            .attr("x", (d, i) => i * spacing + margin)
                            .attr("y", spacing * 0.6);
                        });
                    });

                  svg.on("updateLegend", (a, b, c) => {
                    // console.debug(a, b, c);
                    let spacing = getSpacing(animDataObj.circleSize),
                      margin = spacing / 2,
                      legendW = spacing * (mlRange.length - 1) + 2 * margin,
                      legendH = margin;

                    svg
                      .attr("width", legendW)
                      .attr("height", legendH * 3)
                      .select("g")
                      .attr("transform", `translate(0,${margin})`)
                      .call((g) => {
                        g.select("rect")
                          .attr("height", legendH)
                          .attr("width", legendW)
                          .attr("rx", legendH / 2);

                        g.select("g")
                          .attr("transform", `translate(0,${legendH / 2})`)
                          .call((g) => {
                            g.selectAll("circle")
                              .attr("r", (d) =>
                                getCircleRadius(d, animDataObj.circleSize)
                              )
                              .attr("cx", (d, i) => i * spacing + margin);

                            g.selectAll("text")
                              .attr("x", (d, i) => i * spacing + margin)
                              .attr("y", spacing * 0.6);
                          });
                      });
                  });
                });

              //==depth legend
              legendGroup
                .append("div")
                .attr("class", "legend")
                .call((div) => {
                  //==@d3/color-legend
                  let Legend = ({
                    color,
                    title,
                    tickSize = 6,
                    width = 320,
                    height = 44 + tickSize,
                    marginTop = 18,
                    marginRight = 0,
                    marginBottom = 16 + tickSize,
                    marginLeft = 0,
                    ticks = width / 64,
                    tickFormat,
                    tickValues,
                  } = {}) => {
                    function ramp(color, n = 256) {
                      const canvas = document.createElement("canvas");
                      canvas.width = n;
                      canvas.height = 1;
                      const context = canvas.getContext("2d");
                      for (let i = 0; i < n; ++i) {
                        context.fillStyle = color(i / (n - 1));
                        context.fillRect(i, 0, 1, 1);
                      }
                      return canvas;
                    }

                    const svg = d3
                      .create("svg")
                      .attr("width", width)
                      .attr("height", height)
                      .attr("viewBox", [0, 0, width, height])
                      .style("overflow", "visible")
                      .style("display", "block");

                    let tickAdjust = (g) =>
                      g
                        .selectAll(".tick line")
                        .attr("y1", marginTop + marginBottom - height);
                    let x;

                    // Continuous
                    if (color.interpolate) {
                      const n = Math.min(
                        color.domain().length,
                        color.range().length
                      );

                      x = color
                        .copy()
                        .rangeRound(
                          d3.quantize(
                            d3.interpolate(marginLeft, width - marginRight),
                            n
                          )
                        );

                      svg
                        .append("image")
                        .attr("x", marginLeft)
                        .attr("y", marginTop)
                        .attr("width", width - marginLeft - marginRight)
                        .attr("height", height - marginTop - marginBottom)
                        .attr("preserveAspectRatio", "none")
                        .attr(
                          "xlink:href",
                          ramp(
                            color
                              .copy()
                              .domain(d3.quantize(d3.interpolate(0, 1), n))
                          ).toDataURL()
                        );
                    }

                    // Sequential
                    else if (color.interpolator) {
                      x = Object.assign(
                        color
                          .copy()
                          .interpolator(
                            d3.interpolateRound(marginLeft, width - marginRight)
                          ),
                        {
                          range() {
                            return [marginLeft, width - marginRight];
                          },
                        }
                      );

                      svg
                        .append("image")
                        .attr("x", marginLeft)
                        .attr("y", marginTop)
                        .attr("width", width - marginLeft - marginRight)
                        .attr("height", height - marginTop - marginBottom)
                        .attr("preserveAspectRatio", "none")
                        .attr(
                          "xlink:href",
                          ramp(color.interpolator()).toDataURL()
                        )
                        .attr(
                          "transform",
                          `translate(${
                            width - marginLeft - marginRight
                          }) scale(-1,1)`
                        );

                      // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
                      if (!x.ticks) {
                        if (tickValues === undefined) {
                          const n = Math.round(ticks + 1);
                          tickValues = d3
                            .range(n)
                            .map((i) =>
                              d3.quantile(color.domain(), i / (n - 1))
                            );
                        }
                        if (typeof tickFormat !== "function") {
                          tickFormat = d3.format(
                            tickFormat === undefined ? ",f" : tickFormat
                          );
                        }
                      }
                    }

                    // Threshold
                    else if (color.invertExtent) {
                      const thresholds = color.thresholds
                        ? color.thresholds() // scaleQuantize
                        : color.quantiles
                        ? color.quantiles() // scaleQuantile
                        : color.domain(); // scaleThreshold

                      const thresholdFormat =
                        tickFormat === undefined
                          ? (d) => d
                          : typeof tickFormat === "string"
                          ? d3.format(tickFormat)
                          : tickFormat;

                      x = d3
                        .scaleLinear()
                        .domain([-1, color.range().length - 1])
                        .rangeRound([marginLeft, width - marginRight]);

                      svg
                        .append("g")
                        .selectAll("rect")
                        .data(color.range())
                        .join("rect")
                        .attr("x", (d, i) => x(i - 1))
                        .attr("y", marginTop)
                        .attr("width", (d, i) => x(i) - x(i - 1))
                        .attr("height", height - marginTop - marginBottom)
                        .attr("fill", (d) => d);

                      tickValues = d3.range(thresholds.length);
                      tickFormat = (i) => thresholdFormat(thresholds[i], i);
                    }

                    // Ordinal
                    else {
                      x = d3
                        .scaleBand()
                        .domain(color.domain())
                        .rangeRound([marginLeft, width - marginRight]);

                      svg
                        .append("g")
                        .selectAll("rect")
                        .data(color.domain())
                        .join("rect")
                        .attr("x", x)
                        .attr("y", marginTop)
                        .attr("width", Math.max(0, x.bandwidth() - 1))
                        .attr("height", height - marginTop - marginBottom)
                        .attr("fill", color);

                      tickAdjust = () => {};
                    }

                    svg
                      .append("g")
                      .attr(
                        "transform",
                        `translate(0,${height - marginBottom})`
                      )
                      .call(
                        d3
                          .axisBottom(x)
                          .ticks(
                            ticks,
                            typeof tickFormat === "string"
                              ? tickFormat
                              : undefined
                          )
                          .tickFormat(
                            typeof tickFormat === "function"
                              ? tickFormat
                              : undefined
                          )
                          .tickSize(tickSize)
                          .tickValues(tickValues)
                      )
                      .call(tickAdjust)
                      .call((g) => g.select(".domain").remove())
                      .call((g) =>
                        g
                          .append("text")
                          .attr("x", marginLeft)
                          .attr("y", marginTop + marginBottom - height - 6)
                          .attr("fill", "currentColor")
                          .attr("text-anchor", "start")
                          .attr("font-weight", "bold")
                          .attr("class", "title")
                          .text(title)
                      );

                    return svg.node();
                  };

                  div
                    // .attr("transform", `translate(0,35)`)
                    .append(() =>
                      Legend({
                        color: d3.scaleSequentialSqrt(
                          depthDomain,
                          d3.interpolateTurbo
                        ),
                        title: "Depth (km)",
                        width: legendW,
                        tickValues: [0, 50, 100, 200, 300],
                      })
                    )
                    .attr("class", "depthLegend");
                });
            };
            initTimeScale();
            initMap();
            initMarker();
            initToolBar();
            initLegend();
          }
          function update() {
            // console.debug("action", animDataObj);
            let startDate = animDataObj.startDate,
              endDate = animDataObj.endDate,
              animTime = animDataObj.animTime,
              play = animDataObj.play,
              newData = animDataObj.newData;

            newTimeScale = d3
              .scaleTime()
              .domain([startDate, endDate])
              .range([0, animTime]);
            // console.debug(animDataObj.playSpeed);

            const progressControl = controller.selectAll("#progress");
            const updateProgress = (newStartDate = null, startTimer = true) => {
              const timeTunnel = (date) => {
                //==更新日期
                dateText.property("value", date).text(getDateStr(date));
                //==更新進度條
                progressControl.call((div) => {
                  let timeMs = timeScale(date);
                  div.select("input").property("value", timeMs / 1000);

                  let timeString = new Date(timeMs).toISOString().substr(11, 8);
                  div.select("span").text(timeString);
                });
              };

              let duration =
                newTimeScale.range()[1] -
                (newStartDate ? newTimeScale(newStartDate) : 0);

              let newDateDomain = newStartDate
                ? [newStartDate, newTimeScale.domain()[1]]
                : newTimeScale.domain();

              if (startTimer)
                dateText
                  .interrupt()
                  .transition()
                  .ease(d3.easeLinear)
                  .duration(duration)
                  .tween("date", () => {
                    let i = d3.interpolateDate(...newDateDomain);
                    return (t) => {
                      // let date = d3.timeMinute(i(t));
                      let date = i(t).getTime();
                      timeTunnel(date);
                    };
                  });
              else timeTunnel(newDateDomain[0]);
            };
            const getAudioPlayer = (ml) => {
              const audioPlayer = new Audio("audio/1.mp3");
              // console.debug(audioPlayer);
              Object.assign(audioPlayer, {
                volume: animDataObj.volume,
                playbackRate: 1.5,
                mediaGroup: "test",
              });
              return audioPlayer;
            };
            switch (action) {
              case "play":
                let pauseDate = dateText.property("value");
                updateProgress(pauseDate);
                // console.debug(new Date(pauseDate).toISOString());

                markerTimer.forEach((t) => t.resume());
                newData.forEach((d) =>
                  L.DomUtil.removeClass(d.marker.getElement(), "anime-paused")
                );
                break;
              case "pause":
                dateText.interrupt();
                markerTimer.forEach((t) => t.pause());
                newData.forEach((d) =>
                  L.DomUtil.addClass(d.marker.getElement(), "anime-paused")
                );
                break;
              case "dragProgress":
                newData.forEach((d) => {
                  L.DomUtil.removeClass(
                    d.marker.getElement(),
                    "animateMarker-appeared"
                  );
                  L.DomUtil.removeClass(
                    d.marker.getElement(),
                    `anime-toggled-${animDataObj.displayStyle}`
                  );
                });
              case "changeSpeed":
              default: //init and speed change
                // console.debug(action);
                let startTimer = play;
                updateProgress(action ? startDate : null, startTimer);

                if (markerTimer) markerTimer.forEach((t) => t.stop());
                markerTimer = newData.map((d, i) => {
                  let callback = () => {
                    // console.debug(d.marker.getIcon());
                    let marker = d.marker.getElement();
                    let color = depthScale(d.depth);
                    let radius = getCircleRadius(d.ML, animDataObj.circleSize);

                    //==marker根據資料變化style
                    Object.assign(marker.style, {
                      "background-color": color,
                      width: `${radius * 2}px`,
                      height: `${radius * 2}px`,
                      "margin-left": `${-radius}px`,
                      "margin-top": `${-radius}px`,
                    });

                    //==marker透明度動畫
                    L.DomUtil.addClass(marker, "animateMarker-appeared");

                    //==用delay>0判斷不是過去的時間點

                    //==計時開始才校正日期
                    if (startTimer && delay > 0) updateProgress(d.date);

                    //==動畫(不補特效聲音一次多會LAG)
                    if (delay > 0 || i === 0) {
                      //==動畫顏色
                      if (animDataObj.displayStyle !== "none")
                        marker.setAttribute(
                          "data-content",
                          animDataObj.displayColor
                        );
                      //==動畫類型
                      L.DomUtil.addClass(
                        marker,
                        `anime-toggled-${animDataObj.displayStyle}`
                      );
                    }

                    if (animDataObj.audio && delay > 0)
                      //==聲音
                      getAudioPlayer(d.ML).play();
                  };
                  let delay = newTimeScale(d.date);
                  let timer = new Timer(
                    delay > 0 ? callback : callback(),
                    delay
                  );

                  if (!startTimer) timer.pause();

                  return timer;
                });
                break;
            }
          }
          if (!animDataObj) {
            animDataObj = getNewData(defaultSetting);
            init();
          }
          update();
        }
        updateAnime();

        function events() {
          let toolbar = controller.selectAll(".toolbar");

          let settingBtn = toolbar.selectAll("#settingBtn"),
            lockViewBtn = toolbar.selectAll("#lockViewBtn"),
            pauseBtn = toolbar.selectAll("#pauseBtn"),
            audioCkb = toolbar.selectAll("#audio input[type='checkbox']");

          let animeControllEvent = () => {
            let toolbarEvent = () => {
              leafletMap
                .on("maplock", (e) => {
                  let action = e.lock ? "disable" : "enable";
                  const mapEvents = [
                    "boxZoom",
                    "scrollWheelZoom",
                    "doubleClickZoom",
                    "dragging",
                    "keyboard",
                  ];
                  mapEvents.forEach((event) => leafletMap[event][action]());
                  animDataObj = getNewData({ lockView: e.lock });
                })
                .on("animCtrl", (e) => {
                  let action = e.play ? "play" : "pause";
                  animDataObj = getNewData({ play: e.play });
                  updateAnime(action);
                })
                .on("baselayerchange", (layer) => {
                  let color = layer.name === "WorldImagery" ? "white" : "black";
                  if (latlngLayer) leafletMap.removeLayer(latlngLayer);
                  latlngLayer = L.latlngGraticule({
                    showLabel: true,
                    color,
                    zoomInterval: [
                      { start: 2, end: 3, interval: 30 },
                      { start: 4, end: 4, interval: 10 },
                      { start: 5, end: 6, interval: 5 },
                      { start: 7, end: 8, interval: 1.5 },
                      { start: 9, end: 9, interval: 0.5 },
                      { start: 10, end: 11, interval: 0.2 },
                      { start: 12, end: 14, interval: 0.1 },
                      { start: 15, end: 18, interval: 0.05 },
                    ],
                  }).addTo(leafletMap);
                });
              leafletMap
                .fire("maplock", { lock: defaultSetting.lockView })
                .fire("baselayerchange", { name: defaultSetting.tile });

              // document.addEventListener("visibilitychange", (e) => {
              //   // console.debug();
              //   let playing = pauseBtn.property("value");
              //   if (document.hidden || playing) {
              //     pauseBtn.dispatch("click");
              //   }
              // });
            };
            let setPanelEvent = () => {
              let setPanel = toolbar.selectAll("#setPanel");
              let progressControl = setPanel.selectAll("#progress"),
                playspeedControl = setPanel.selectAll("#playspeed"),
                audioControl = setPanel.selectAll("#audio"),
                displayControl = setPanel.selectAll("input[name='display']");

              let pannel = () => {
                playspeedControl.select("input").on("input", function () {
                  let playSpeed = parseInt(this.value);
                  let startDate = dateText.property("value");
                  playspeedControl.select("span>b").text(playSpeed);

                  // console.debug(new Date(startDate).toISOString());
                  animDataObj = getNewData({
                    playSpeed,
                    startDate,
                  });
                  updateAnime("changeSpeed");
                });

                progressControl.select("input").on("input", function () {
                  // console.debug(this.value);
                  let startDate = timeScale
                    .invert(parseFloat(this.value) * 1000)
                    .getTime();
                  animDataObj = getNewData({
                    startDate,
                  });
                  updateAnime("dragProgress");
                });

                audioControl.selectAll("input").call((input) => {
                  let inputEles = input.nodes();
                  let checkbox = inputEles[0];
                  let range = inputEles[1];

                  checkbox.addEventListener("change", function () {
                    let check = this.checked;
                    range.disabled = !check;
                    animDataObj = getNewData({ audio: check });
                    // console.debug(check);
                  });
                  range.addEventListener("input", function () {
                    let volume = parseInt(this.value);
                    audioControl.select("span>b").text(volume);
                    animDataObj = getNewData({ volume: volume / 100 });
                  });
                });

                displayControl.on("change", function () {
                  let index = parseInt(this.value);
                  let checked = this.checked;

                  switch (index) {
                    case 0:
                    case 1:
                      legendGroup
                        .select(`.legend:nth-child(${index + 1})`)
                        .style("display", checked ? "block" : "none");
                      break;
                    case 2:
                      latlngLayer._canvas.parentNode.style.display = checked
                        ? "inline"
                        : "none";
                      break;
                  }
                });
              };
              let dropdownMenu = () => {
                let eventMenu = setPanel.selectAll("#event_Config");
                let circlesizeControl = eventMenu.selectAll("#circlesize"),
                  displaystyleControl = eventMenu.select("#displaystyle");
                // let dropdownBtns = setPanel.selectAll(
                //   "button[data-bs-toggle='dropdown']"
                // );
                // let dropdownMenus = setPanel.selectAll(".dropdown-menu");

                circlesizeControl.on("change", function (e) {
                  // console.debug(this.value);
                  let circleSize = parseFloat(this.value);
                  animDataObj = getNewData({ circleSize });

                  animDataObj.newData
                    .filter((d) =>
                      L.DomUtil.hasClass(
                        d.marker.getElement(),
                        "animateMarker-appeared"
                      )
                    )
                    .forEach((d) => {
                      let radius = getCircleRadius(d.ML, circleSize);
                      Object.assign(d.marker.getElement().style, {
                        width: `${radius * 2}px`,
                        height: `${radius * 2}px`,
                        "margin-left": `${-radius}px`,
                        "margin-top": `${-radius}px`,
                      });
                    });

                  legendGroup.select(".mlLegend").dispatch("updateLegend");
                });
                displaystyleControl.on("change", function (e) {
                  // console.debug(this.value);
                  let displayStyle = this.value;
                  animDataObj.newData.forEach((d) =>
                    L.DomUtil.removeClass(
                      d.marker.getElement(),
                      `anime-toggled-${animDataObj.displayStyle}`
                    )
                  );
                  animDataObj = getNewData({ displayStyle });
                });
                // dropdownBtns.on("mouseover mouseleave", function (e) {
                //   let menu = this.nextElementSibling;
                //   // menu.classList.add("show");
                //   bootstrap.Dropdown.getOrCreateInstance(menu).toggle();
                // });
                // dropdownMenus.on("click.bs.dropdown", (e) =>
                //   e.stopPropagation()
                // );
              };
              pannel();
              dropdownMenu();
            };
            toolbarEvent();
            setPanelEvent();
          };
          let keyboardEvent = () => {
            let hotkeyPressFlag = true; //avoid from trigger event too often

            d3.select(window).on("keydown", (e) => {
              if (!hotkeyPressFlag) return;
              // console.debug(e.code)
              switch (e.code) {
                //==快捷鍵
                case "KeyP":
                  pauseBtn.dispatch("click");
                  break;
                case "KeyS":
                  settingBtn.dispatch("click");
                  break;
                case "KeyL":
                  lockViewBtn.dispatch("click");
                  break;
                case "KeyA":
                  audioCkb
                    .property("checked", !animDataObj.audio)
                    .dispatch("change");
                  break;
              }

              hotkeyPressFlag = false;
              d3.timeout(() => (hotkeyPressFlag = true), 10);
            });
          };
          let legendEvent = () => {
            legendGroup
              .selectAll(".legend")
              .nodes()
              .forEach((legend) => new L.Draggable(legend).enable());

            // let raiseAndDrag = (d3_selection) => {
            //   let x_fixed = 0,
            //     y_fixed = 0;
            //   let legend_dragBehavior = d3
            //     .drag()
            //     .on("start", function (e) {
            //       x_fixed = e.sourceEvent.offsetX;
            //       y_fixed = e.sourceEvent.offsetY;
            //     })
            //     .on("drag end", function (e) {
            //       let translateX = e.x - x_fixed;
            //       let translateY = e.y - y_fixed;

            //       d3.select(this).style(
            //         "transform",
            //         `translate(${translateX}px, ${translateY}px)`
            //       );
            //     });

            //   d3_selection
            //     .attr("cursor", "grab")
            //     .call((g) => g.raise()) //把選中元素拉到最上層(比zoom的選取框優先)
            //     .call((g) => g.selectAll(".legend").call(legend_dragBehavior));
            // };
            // legendGroup.call(raiseAndDrag);
          };
          animeControllEvent();
          keyboardEvent();
          legendEvent();
        }
        events();
      }

      if (!data) {
        chart.data();
        data = await data;
      }
      animeMap();
    }
    //===init once
    if (!(selectorD3.selectAll("#seismicity").nodes().length >= 1)) {
      init();
    }

    printChart();

    return chart;
  }
  return chart;
}
