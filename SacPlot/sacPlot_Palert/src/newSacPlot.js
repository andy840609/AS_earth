import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7";

export function sacPlots() {
  // function sacPlots() {
  let selector = "body";
  let rawData = null;
  let waveform = null;

  chart.selector = (value) => {
    selector = value;
    return chart;
  };
  chart.data = (value) => {
    // Object.keys(data.waveform).forEach((cha, i));
    rawData = value;
    console.debug(rawData);

    //==將原資料算出 normalize_self 和 normalize_all
    // {
    //   let tmpData = rawData.waveform;
    //   let chaKeys = Object.keys(tmpData);
    //   //==先算出各自/全部平均
    //   let meanArr = chaKeys.map((cha) => d3.mean(tmpData[cha].y)),
    //     grandMean = d3.mean(meanArr);
    //   console.debug(meanArr, grandMean);
    //   //==扣掉各自/全部平均的振幅陣列
    //   let demeanArray = chaKeys.map((cha, i) =>
    //       tmpData[cha].y.map((y) => y - meanArr[i])
    //     ),
    //     deGrandMeanArray = chaKeys.map((cha) =>
    //       tmpData[cha].y.map((y) => y - grandMean)
    //     );
    //   //==去平均完才取最大振幅
    //   let maxAmpArr = demeanArray.map((chaAmps) =>
    //       d3.max(chaAmps, (amp) => Math.abs(amp))
    //     ),
    //     maxAmp = d3.max(deGrandMeanArray, (chaAmps) =>
    //       d3.max(chaAmps, (amp) => Math.abs(amp))
    //     );

    //   console.log(tmpData);
    //   console.log("demean=");
    //   console.log(demeanArray, deGrandMeanArray);
    //   console.log("mean=");
    //   console.log(meanArr, grandMean);
    //   console.log("maxAmp=");
    //   console.log(maxAmpArr, maxAmp);

    //   //===normalize_self  Math.round(num + "e+5")  + "e-5");

    //   waveform = {
    //     raw: tmpData,
    //     self: tmpData,
    //     all: tmpData,
    //   };
    //   let self = demeanArray.map(
    //     (data, i) =>
    //       new Object({
    //         fileName: raw[i].fileName,
    //         data: data.map(
    //           (d) =>
    //             new Object({
    //               x: d.x,
    //               y: floatCalc("/", d.y, maxAmpArr[i]),
    //             })
    //         ),
    //       })
    //   );
    //   console.log(self[0]);
    //   //===normalize_all
    //   let all = deGrandMeanArray.map(
    //     (data, i) =>
    //       new Object({
    //         fileName: raw[i].fileName,
    //         data: data.map(
    //           (d) =>
    //             new Object({ x: d.x, y: floatCalc("/", d.y, maxAmp) })
    //         ),
    //       })
    //   );
    //   // console.log(all);

    //   return { raw, self, all };
    // }

    return chart;
  };

  function chart() {
    const chartRootNode = document.querySelector(selector);

    let colorPalette = {};
    let getColor = (key) => {
      let color;
      if (colorPalette[key]) color = colorPalette[key];
      else {
        let index = Object.keys(rawData.waveform).indexOf(key);
        switch (index % 6) {
          case 0:
            color = "steelblue";
            break;
          case 1:
            color = "#AE0000";
            break;
          case 2:
            color = "#006030";
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
    let getMargin = (tickLength = 5) => {
      let left;
      if (tickLength >= 10) left = 100;
      else if (tickLength >= 6) left = 75;
      else left = 50;
      return { top: 20, right: 30, bottom: 35, left: left };
    };
    let floatCalc = (operator, ...theArgs) => {
      function isFloat(n) {
        return n.toString().indexOf(".") >= 0;
      }

      let powerArr = theArgs.map((d) =>
        isFloat(d) ? d.toString().split(".")[1].length : 0
      );
      let maxPower = Math.max(...powerArr);
      // console.debug(maxPower);
      let newArgs = theArgs.map(
        (d, i) =>
          parseInt(d.toString().replace(".", "")) *
          Math.pow(10, maxPower - powerArr[i])
      );
      switch (operator) {
        default:
        case "+":
          return newArgs.reduce((a, b) => a + b) / Math.pow(10, maxPower);
        case "-":
          return newArgs.reduce((a, b) => a - b) / Math.pow(10, maxPower);
        case "*":
          return (
            newArgs.reduce((a, b) => a * b) /
            Math.pow(10, maxPower * newArgs.length)
          );
        case "/":
          return (
            newArgs.reduce((a, b) => a / b) *
            Math.pow(10, maxPower * (newArgs.length - 2))
          );
      }
    };
    let toEXP = (number, maxIndex = undefined) => {
      // console.debug(number);
      let singed = number < 0,
        numberAbs = Math.abs(number);

      //maxIndex 轉成指定10的次方
      if (maxIndex || maxIndex == 0) {
        let index = number == 0 ? 0 : maxIndex;
        let constant =
          floatCalc("/", numberAbs, Math.pow(10, index)) * (singed ? -1 : 1);
        // let constant = numberAbs / Math.pow(10, index) * (singed ? -1 : 1);
        // console.debug(constant, index);
        return [constant, index];
      } else if (numberAbs >= 10) {
        let intLength = Math.floor(numberAbs).toString().length;
        let index = intLength - 1;
        let constant = (numberAbs / Math.pow(10, index)) * (singed ? -1 : 1);
        // console.debug(constant, index);
        return [constant, index];
      }
      //tickRange < 1
      else if (numberAbs > 0 && numberAbs < 1) {
        let constant = numberAbs;
        let str = constant.toString();
        let index = (str.split(".")[1] || "").length;
        constant *= (singed ? -1 : 1) * Math.pow(10, index);
        // console.debug(constant, index);
        return [constant, -index];
      } else return [number, 0];
    };

    // console.debug(channel);
    function init() {
      chartRootNode.insertAdjacentHTML(
        "beforeend",
        `
        <div id="chartsOptions" style="display: inline;">
                <div class="row d-flex justify-content-around">

                    <div class="form-group col-12">
                      <label class="col-form-label me-3">Plot</label>
                      <div class="btn-group" role="group" aria-label="Basic radio toggle button group">
                        <input type="radio" class="btn-check" name="plotType" id="trace" value="trace" autocomplete="off" checked>
                        <label class="btn btn-secondary" for="trace">trace</label>
                      
                        <input type="radio" class="btn-check" name="plotType" id="window" value="window" autocomplete="off">
                        <label class="btn btn-secondary" for="window">window</label>
                      
                        <input type="radio" class="btn-check" name="plotType" id="overlay" value="overlay" autocomplete="off">
                        <label class="btn btn-secondary" for="overlay">overlay</label>
                      </div>
                    </div>

                    <!--
                    <div class="form-group col-lg-4 col-md-6 col-sm-6">
                      <label class="col-form-label me-3">Normalization</label>
                      <div class="btn-group" role="group" aria-label="Basic radio toggle button group">
                        <input type="radio" class="btn-check" name="normalize" id="normalizeRaw" autocomplete="off" checked>
                        <label class="btn btn-secondary" for="normalizeRaw">none</label>
                      
                        <input type="radio" class="btn-check" name="normalize" id="normalizeSelf" autocomplete="off">
                        <label class="btn btn-secondary" for="normalizeSelf">self</label>
                      
                        <input type="radio" class="btn-check" name="normalize" id="normalizeOverlay" autocomplete="off">
                        <label class="btn btn-secondary" for="normalizeOverlay">all</label>
                      </div>
                    </div>
                    -->
                    </div>
    
                </div>
            <div id="charts">
    
            </div>
            <div id="outerdiv"
            style="position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);z-index:100;width:100%;height:100%;display:none;">
                <div id="innerdiv" style=" background-color: rgb(255, 255, 255);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
            </div>
        </div>`
      );

      d3.selectAll('input[name ="plotType"]').on("change", function (e) {
        // console.debug(e, this.value);
        let chartsOptions = chartRootNode.querySelector("#chartsOptions");
        chartsOptions.querySelector("#otherOptions")?.remove();
        // console.debug(chart);
        switch (this.value) {
          case "overlay":
            chartsOptions.insertAdjacentHTML(
              "beforeend",
              `<div id="otherOptions" class="row">
                <!-- ... channel selector ... -->    
                <div class="dropdown form-group col-lg-3 col-md-4 col-sm-6 d-flex flex-row align-items-start">
                  <label for="chaSelectButton" class="col-form-label col-5" >Channel</label>
                  <button class="btn btn-secondary dropdown-toggle col-7" type="button" id="chaSelectButton" data-bs-toggle="dropdown" aria-expanded="false">
                    select
                  </button>
                  <div class="dropdown-menu" aria-labelledby="networkSelectButton" id="chaDropDownMenu">
                  </div>
                </div>

                <!-- ... legend ... -->    
                <div class="dropdown form-group col-lg-3 col-md-4 col-sm-6 d-flex align-items-center flex-row flex-nowrap">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="legendCkb" checked>
                    <label class="form-check-label" for="legendCkb">
                      Legend
                    </label>
                  </div>
                </div>

              </div>`
            );
            break;
        }

        //================dropdown-menu內元素被點擊不關閉menu
        let All_dropdownMenu = d3
          .select(chartsOptions)
          .selectAll(".dropdown-menu");
        All_dropdownMenu.on("click.bs.dropdown", function (e) {
          e.stopPropagation();
        });

        printChart(this.value);
      });
    }
    function printChart(plotType) {
      chartRootNode
        .querySelectorAll("#charts>*")
        .forEach((chart) => chart.remove());

      let waveformData = rawData.waveform,
        network = rawData.network,
        staCode = rawData.staCode,
        event = rawData.event,
        channel = Object.keys(waveformData);

      //三種圖表
      function trace(cha) {
        const data = waveformData[cha],
          index = channel.indexOf(cha);

        const width = 800,
          height = 250,
          margin = getMargin();
        const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);
        const xAxis = svg.append("g").attr("class", "xAxis");
        const yAxis = svg.append("g").attr("class", "yAxis");
        const focus = svg
          .append("g")
          .attr("class", "paths")
          .attr("clip-path", "url(#clip)");

        let x, y;
        let newDataObj;
        // console.debug(index);
        function getNewData(controlObj = {}) {
          // console.debug(data);
          let xAxis_domain = controlObj.hasOwnProperty("xAxis_domain")
            ? controlObj.xAxis_domain
            : null;

          const getData = (xAxis_domain) => {
            let newData;
            if (xAxis_domain) {
              let i1 = d3.bisectCenter(data.x, xAxis_domain[0]);
              let i2 = d3.bisectCenter(data.x, xAxis_domain[1]) + 1; //包含最大範圍
              newData = {
                x: data.x.slice(i1, i2),
                y: data.y.slice(i1, i2),
              };
            } else newData = data;

            return newData;
          };

          let newData = getData(xAxis_domain);

          return {
            newData: newData,
            xAxis_domain: xAxis_domain,
            // normalize: normalize,
          };
        }
        function updateChart(trans = false) {
          function init() {
            svg
              .append("g")
              .attr("class", "SN_number")
              .style("display", "none")
              .call((g) => {
                g.append("text")
                  .attr("fill", "currentColor")
                  .attr("x", margin.left)
                  .attr("y", margin.top * 0.7)
                  .attr("text-anchor", "start")
                  .attr("font-size", 13)
                  .text(`( x 10\u00A0\u00A0\u00A0\u00A0)`);

                g.append("text")
                  .attr("class", "power")
                  .attr("font-size", 10)
                  .attr("x", margin.left + 33)
                  .attr("y", margin.top * 0.4)
                  .text(``);
              });

            svg
              .append("g")
              .attr("class", "title")
              .append("text")
              .attr("fill", "currentColor")
              .attr("x", margin.left + 55)
              .attr("y", margin.top / 2)
              .attr("text-anchor", "start")
              .attr("alignment-baseline", "central")
              .attr("font-weight", "bold")
              .attr("font-size", "13")
              .text(`${network}.${staCode}.${cha}`);

            svg
              .append("g")
              .attr("class", "referenceTime")
              .append("text")
              .attr("fill", "currentColor")
              .attr("x", width - margin.right)
              .attr("y", margin.top / 2)
              .attr("text-anchor", "end")
              .attr("alignment-baseline", "central")
              .attr("font-weight", "bold")
              .attr("font-size", "13")
              .text("reference time : " + event);

            xAxis
              .append("text")
              .attr("class", "axis_name")
              .attr("fill", "black")
              .attr("font-weight", "bold")
              .attr("x", width / 2)
              .attr("y", margin.top + 10)
              .attr("font-size", "13")
              .text("Time (s)");

            yAxis
              .append("text")
              .attr("class", "axis_name")
              .attr("fill", "black")
              .attr("font-weight", "bold")
              .attr("font-size", "10")
              .style("text-anchor", "middle")
              .attr("alignment-baseline", "text-before-edge")
              .attr("transform", "rotate(-90)")
              .attr("x", -height / 2)
              .attr("y", -margin.left + 8)
              .attr("font-size", "13")
              .text("Amplitude (cm/s/s)");
          }
          function render() {
            // console.debug(newDataObj);
            const newData = newDataObj.newData;

            x = d3
              .scaleLinear()
              .domain(d3.extent(newData.x))
              .range([margin.left, width - margin.right]);

            y = d3
              .scaleLinear()
              .domain(d3.extent(newData.y))
              .nice()
              .range([height - margin.bottom, margin.top]);

            let power = toEXP(y.domain().reduce((a, b) => Math.abs(b - a)))[1];
            newDataObj.tickPower = power;

            const line = (data) => {
              // console.debug(data);

              let pathAttr = d3
                .line()
                .defined((d, i) => !isNaN(data.y[i]))
                .x((d) => x(d))
                .y((d, i) => y(data.y[i]));

              return pathAttr(data.x);
            };

            let updateAxis = () => {
              let makeXAxis = (g) =>
                g
                  .attr("transform", `translate(0,${height - margin.bottom})`)
                  .call(
                    d3
                      .axisBottom(x)
                      .ticks(width / 80)
                      .tickSizeOuter(0)
                  );
              let makeYAxis = (g) =>
                g
                  .attr("transform", `translate(${margin.left},0)`)
                  .call((g) => {
                    let axis = d3
                      .axisLeft(y)
                      .tickFormat((v) => toEXP(v, power)[0]);
                    //
                    axis(g);

                    if (power !== 0)
                      svg
                        .select(".SN_number")
                        .style("display", "inline")
                        .select(".power")
                        .text(power);
                    else svg.select(".SN_number").style("display", "none");
                    // console.debug(power);
                  })
                  .call((g) =>
                    g
                      .selectAll("g.yAxis g.tick line")
                      .attr("x2", () => width - margin.left - margin.right)
                      .attr("stroke-opacity", 0.2)
                  );

              // console.debug(yAxis);
              if (trans) {
                xAxis.transition().duration(1000).call(makeXAxis);
                yAxis.transition().duration(1000).call(makeYAxis);
              } else {
                xAxis.call(makeXAxis);
                yAxis.call(makeYAxis);
              }
            };
            let updatePaths = () => {
              // console.debug(data);
              focus
                .selectAll("path")
                .data([newData])
                .join("path")
                .attr("fill", "none")
                .attr("stroke", getColor(cha))
                .attr("stroke-width", 1)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .call((path) => {
                  if (trans)
                    path
                      .transition()
                      .duration(1000)
                      .attr("d", (d) => line(d));
                  else path.attr("d", (d) => line(d));
                });
            };
            updateAxis();
            updatePaths();
          }

          if (!newDataObj) {
            //===預設選項
            newDataObj = getNewData();
            init();
          }
          render();
        }

        updateChart();
        function events() {
          //===event eles
          const eventRect = svg.append("g").attr("class", "eventRect");
          const defs = svg.append("defs");
          //====================================tooltip==================================================
          const tooltip = d3
            .select(chartRootNode)
            .select("#chart" + index)
            .append("div")
            .attr("class", "tooltip");

          function pathEvent() {
            //===遮罩讓path和事件不超出邊界
            defs
              .append("clipPath")
              .attr("id", "clip")
              .append("rect")
              .attr("id", "chartRenderRange")
              .attr("x", margin.left)
              .attr("y", margin.top)
              .attr("width", width - margin.right - margin.left)
              .attr("height", height - margin.top - margin.bottom)
              .attr("fill", "none")
              .attr("pointer-events", "all");

            eventRect.append("use").attr("xlink:href", "#chartRenderRange");

            //====================================mouse move==================================================
            function mouseMove() {
              const mouseG = eventRect
                .append("g")
                .attr("class", "mouse-over-effects");

              const mouseLine = mouseG
                .append("path") // create vertical line to follow mouse
                .attr("class", "mouse-line")
                .style("stroke", "#A9A9A9")
                .style("stroke-width", "2px")
                .style("opacity", "0.7");

              const mouseMoveBehavior = (use) =>
                use
                  .on("mouseleave", (e) => {
                    // on mouse out hide line, circles and text
                    // console.log('mouseleave');
                    // console.debug(e);
                    let action = () => {
                      mouseG.style("display", "none");
                      tooltip.style("display", "none");
                    };
                    action();
                  })
                  .on("mousemove", function (e) {
                    // update tooltip content, line, circles and text when mouse moves
                    // console.debug(e.target);

                    let action = () => {
                      let newData = newDataObj.newData;
                      // 獲取鼠標在容器內的相對位置
                      const pointer = d3.pointer(e, this);
                      let mouseOnIdx = d3.bisectCenter(
                        newData.x,
                        x.invert(pointer[0])
                      );
                      let chart_centerX = x.range().reduce((a, b) => b - a) / 2;

                      mouseLine.attr("d", () => {
                        // let yPos = y(newData.x[mouseOnIdx]);
                        let xPos = pointer[0];
                        let p1 = xPos + "," + y.range()[0];
                        let p2 = xPos + "," + y.range()[1];
                        let d = "M" + p1 + " L" + p2;
                        return d;
                      });

                      mouseG
                        .selectAll(".mouse-per-line")
                        .data([data])
                        .join("g")
                        .attr("class", "mouse-per-line")
                        .attr("transform", (d) => {
                          let transX = x(newData.x[mouseOnIdx]);
                          let transY = y(newData.y[mouseOnIdx]);
                          return `translate(${transX},${transY})`;
                        })
                        .call((gCollection) => {
                          gCollection.each(function (d, i) {
                            // console.debug(this);
                            const circleAmount = 3;
                            let g = d3.select(this);
                            g.selectAll("circle")
                              .data(d3.range(circleAmount))
                              .join("circle")
                              .call((circlesCollection) =>
                                circlesCollection.each(function (d) {
                                  let circle = d3.select(this);
                                  let mainCircle = d % 2 != 0;

                                  const lineStroke = "2px";
                                  const lineStroke2 = "0.5px";
                                  circle
                                    .attr("r", d + 3)
                                    .style(
                                      "stroke",
                                      mainCircle ? getColor(cha) : "white"
                                    )
                                    .style("fill", "none")
                                    .style(
                                      "stroke-width",
                                      mainCircle ? lineStroke : lineStroke2
                                    )
                                    .style("opacity", "1");
                                })
                              );
                          });
                        });
                      let mouseX = e.offsetX,
                        mouseY = e.offsetY;
                      const updateTooltip = () => {
                        let x = parseFloat(newData.x[mouseOnIdx].toFixed(2));
                        let power = newDataObj.tickPower;
                        let y = newData.y[mouseOnIdx];
                        let constant = parseFloat(
                          toEXP(y, power)[0].toFixed(3)
                        );

                        const divHtml = `
                        <font class='tooltip_tag'>Time : </font><br/>
                        <font size='5'>${x} </font> s<br/>
                        <font class='tooltip_tag'>Amplitude : </font><br/>
                        <font size='5' color="${getColor(cha)}">
                          ${
                            constant +
                            (power && constant !== 0
                              ? ` x 10<sup>${power}</sup>`
                              : "")
                          }
                        </font>`;

                        let box = tooltip.node().getBoundingClientRect();
                        let tooltipW = box.width;

                        tooltip
                          .html(divHtml)
                          .style(
                            "left",
                            `${
                              mouseX +
                              (pointer[0] > chart_centerX
                                ? -tooltipW * 1.5
                                : tooltipW / 2)
                            }px`
                          )
                          .style("top", `${mouseY}px`);
                      };

                      mouseG.style("display", "inline");
                      tooltip.style("display", "inline");
                      updateTooltip();
                    };
                    action();
                  });
              eventRect.call(mouseMoveBehavior);
            }
            // //====================================zoom==================================================
            function mouseDrag() {
              let selectionRect = {
                element: null,
                previousElement: null,
                currentY: 0,
                currentX: 0,
                originX: 0,
                originY: 0,
                setElement: function (ele) {
                  this.previousElement = this.element;
                  this.element = ele;
                },
                getNewAttributes: function () {
                  let x =
                    this.currentX < this.originX ? this.currentX : this.originX;
                  let y =
                    this.currentY < this.originY ? this.currentY : this.originY;
                  let width = Math.abs(this.currentX - this.originX);
                  let height = Math.abs(this.currentY - this.originY);
                  return {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                  };
                },
                getCurrentAttributes: function () {
                  // use plus sign to convert string into number
                  let x = +this.element.attr("x");
                  let y = +this.element.attr("y");
                  let width = +this.element.attr("width");
                  let height = +this.element.attr("height");
                  return {
                    x1: x,
                    y1: y,
                    x2: x + width,
                    y2: y + height,
                  };
                },
                // getCurrentAttributesAsText: function () {
                //     let attrs = this.getCurrentAttributes();
                //     return "x1: " + attrs.x1 + " x2: " + attrs.x2 + " y1: " + attrs.y1 + " y2: " + attrs.y2;
                // },
                init: function (newX, newY) {
                  let rectElement = svg
                    .append("rect")
                    .attr("rx", 0)
                    .attr("ry", 0)
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", 0)
                    .attr("height", 0)
                    // .attr('stroke', '#545454')
                    // .attr('stroke-width', ' 2px')
                    .attr("stroke-opacity", 1)
                    .attr("fill", "#97CBFF")
                    .attr("fill-opacity", 0.5);
                  this.setElement(rectElement);
                  this.originX = newX;
                  this.originY = newY;
                  this.update(newX, newY);
                },
                update: function (newX, newY) {
                  this.currentX = newX;
                  this.currentY = newY;

                  let newAttr = this.getNewAttributes();
                  this.element
                    .attr("x", newAttr.x)
                    .attr("y", newAttr.y)
                    .attr("width", newAttr.width)
                    .attr("height", newAttr.height);
                },
                // focus: function () {
                //     this.element
                //         .style("stroke", "#DE695B")
                //         .style("stroke-width", "2.5");
                // },
                remove: function () {
                  this.element.remove();
                  this.element = null;
                },
                removePrevious: function () {
                  if (this.previousElement) {
                    this.previousElement.remove();
                  }
                },
              };
              let dragBehavior = d3
                .drag()
                .on("start", (e) => {
                  // console.log("dragStart");
                  const p = d3.pointer(e, eventRect.node());
                  selectionRect.init(p[0], margin.top);
                  selectionRect.removePrevious();
                  d3.select(window).dispatch("click"); //關閉dropdown
                  eventRect.dispatch("mouseleave"); //tooltip取消
                })
                .on("drag", (e) => {
                  // console.log("dragMove");
                  let action = () => {
                    const p = d3.pointer(e, eventRect.node());
                    // console.debug(p);
                    if (p[0] < margin.left) p[0] = margin.left;
                    else if (p[0] > width - margin.right)
                      p[0] = width - margin.right;
                    selectionRect.update(p[0], height - margin.bottom);
                  };
                  action();
                })
                .on("end", (e) => {
                  const finalAttributes = selectionRect.getCurrentAttributes();
                  // console.debug(finalAttributes);

                  let xAxis_domain = null;
                  if (finalAttributes.x2 - finalAttributes.x1 > 1)
                    xAxis_domain = [
                      x.invert(finalAttributes.x1),
                      x.invert(finalAttributes.x2),
                    ];

                  newDataObj = getNewData({
                    xAxis_domain: xAxis_domain,
                  });
                  updateChart();

                  selectionRect.remove();
                });
              eventRect.call(dragBehavior);
            }
            mouseMove();
            mouseDrag();
          }

          pathEvent();
        }
        events();

        return svg.node();
      }
      function windowChart() {
        const data = waveformData;
        // console.debug(data);
        channel = channel.reverse().filter((cha) => data[cha].x.length > 1);
        // console.debug(channel);
        const width = 800,
          height = 500,
          height2 = 65,
          margin = getMargin();
        const svg = d3
          .create("svg")
          .attr("viewBox", [0, 0, width, height + height2]);
        const xAxis = svg.append("g").attr("class", "xAxis");
        const yAxis = svg.append("g").attr("class", "yAxis");
        const focus = svg
          .append("g")
          .attr("class", "paths")
          .attr("clip-path", "url(#clip)");

        let x, y;
        let newDataObj;
        // console.debug(index);
        function getNewData(controlObj = {}) {
          // console.debug(data);
          let xAxis_domain = controlObj.hasOwnProperty("xAxis_domain")
            ? controlObj.xAxis_domain
            : null;

          function getData(xAxis_domain) {
            let newData = {};

            if (xAxis_domain) {
              // console.debug(xAxis_domain);
              let xData = data[channel[0]].x;
              let i1 = d3.bisectCenter(xData, xAxis_domain[0]);
              let i2 = d3.bisectCenter(xData, xAxis_domain[1]) + 1; //包含最大範圍

              newData = channel.reduce((acc, key) => {
                // 從累加器中獲取當前鍵值對應的分組，如果不存在則創建一個新的空陣列
                // const curGroup = acc[key] ?? [];
                // 將當前物件合併到當前分組中
                return {
                  ...acc,
                  [key]: {
                    x: xData.slice(i1, i2),
                    y: data[key].y.slice(i1, i2),
                  },
                };
              }, {});

              // console.debug(newData);
            } else newData = data;

            return newData;
          }
          function getDataRange(data) {
            const tickBaseArr = [1, 2, 5, 10];
            const maxTickAmount = 20;

            let niceRange = (range, tickRange, floor = false) => {
              // console.debug(range, tickRange);
              if (range == 0) return 0;
              else {
                let n = range / tickRange;
                let nice_n = floor ? Math.floor(n) : Math.ceil(n);
                let niceRange = floatCalc("*", nice_n, tickRange);
                return niceRange;
              }
            };
            let getTickRange = () => {
              let getRange = (range) => {
                let exp = Math.floor(Math.log10(range)) - 1; //==新公式
                let multiplier = Math.pow(10, exp);

                let minBase = tickBaseArr.find(
                  (base) => range / (base * multiplier) <= maxTickAmount
                );
                return floatCalc("*", minBase, multiplier);
              };

              let totalRange = supData
                .map((d) => d.range)
                .reduce((a, b) => floatCalc("+", a, b));
              let tickRange = getRange(totalRange);

              // console.debug("tickRange  ", tickRange);
              return tickRange;
            };
            let getTickValues = (minRange, maxRange, tickRange) => {
              // console.debug(minRange, maxRange, tickRange);
              let length = Math.ceil((maxRange - minRange) / tickRange + 0.1);
              let tickValues = d3
                .range(length)
                .map((i) =>
                  floatCalc("+", minRange, floatCalc("*", i, tickRange))
                );
              // console.debug("tickValues = ", tickValues);
              return tickValues;
            };

            let supData = channel.map((cha) => {
              let domain = d3.extent(data[cha].y);
              let range = domain.reduce((a, b) =>
                Math.abs(floatCalc("-", b, a))
              );
              return { min: domain[0], max: domain[1], range };
            });
            let tickRange = getTickRange();
            //counting data sup range
            supData.forEach((d, i) => {
              let max = d.max;
              let min = d.min;
              let range = d.range;
              let supRange = 0,
                supMin = 0,
                supMax = 0;
              if (i == 0) {
                supRange = 0;
                supMin = niceRange(min, tickRange, true);
                supMax = niceRange(max, tickRange, false);
              } else {
                // supRange = niceRange(Math.abs(supData[i - 1].max) + Math.abs(min) + supData[i - 1].supRange, false);
                supRange = niceRange(
                  supData[i - 1].max - min + supData[i - 1].supRange,
                  tickRange,
                  false
                );
                supMin = supData[i - 1].supMax;
                if (supRange - supMin < Math.abs(min))
                  supRange = floatCalc("+", supRange, tickRange); //supRange += tickRange;
                supMax = floatCalc(
                  "+",
                  supRange,
                  niceRange(max, tickRange, false)
                ); // supMax = supRange + niceRange(max, false);
              }

              Object.assign(supData[i], {
                supRange,
                supMin,
                supMax,
              });
            });
            let tickValues = getTickValues(
              supData[0].supMin,
              supData[supData.length - 1].supMax,
              tickRange
            );

            return {
              supData,
              tickRange,
              tickValues,
              tickPower: toEXP(tickRange)[1],
            };
          }

          let newData = getData(xAxis_domain);

          let chartData =
            newData[channel[0]].x.length > 1
              ? getDataRange(newData)
              : newDataObj.chartData;

          return {
            newData: newData,
            xAxis_domain: xAxis_domain,
            chartData: chartData,
            // normalize: normalize,
          };
        }
        function updateChart(trans = false) {
          function init() {
            svg
              .append("g")
              .attr("class", "SN_number")
              .style("display", "none")
              .call((g) => {
                g.append("text")
                  .attr("fill", "currentColor")
                  .attr("x", margin.left)
                  .attr("y", margin.top * 0.7)
                  .attr("text-anchor", "start")
                  .attr("font-size", 13)
                  .text(`( x 10\u00A0\u00A0\u00A0\u00A0)`);

                g.append("text")
                  .attr("class", "power")
                  .attr("font-size", 10)
                  .attr("x", margin.left + 33)
                  .attr("y", margin.top * 0.4)
                  .text(``);
              });

            svg
              .append("g")
              .attr("class", "referenceTime")
              .append("text")
              .attr("fill", "currentColor")
              .attr("x", width - margin.right)
              .attr("y", margin.top / 2)
              .attr("text-anchor", "end")
              .attr("alignment-baseline", "central")
              .attr("font-weight", "bold")
              .attr("font-size", "13")
              .text("reference time : " + event);

            xAxis
              .append("text")
              .attr("class", "axis_name")
              .attr("fill", "black")
              .attr("font-weight", "bold")
              .attr("x", width / 2)
              .attr("y", margin.top + 10)
              .attr("font-size", "13")
              .text("Time (s)");

            yAxis
              .append("text")
              .attr("class", "axis_name")
              .attr("fill", "black")
              .attr("font-weight", "bold")
              .attr("font-size", "10")
              .style("text-anchor", "middle")
              .attr("alignment-baseline", "text-before-edge")
              .attr("transform", "rotate(-90)")
              .attr("x", -height / 2)
              .attr("y", -margin.left + 8)
              .attr("font-size", "13")
              .text("Amplitude (cm/s/s)");
          }
          function render() {
            // console.debug(newDataObj);
            const newData = newDataObj.newData;
            const chartData = newDataObj.chartData;
            let supData = chartData.supData,
              tickRange = chartData.tickRange,
              tickPower = chartData.tickPower,
              tickValues = chartData.tickValues;

            let getDomain = (axis) => {
              return d3.extent(
                [].concat(
                  ...channel.map((cha) => d3.extent(newData[cha][axis]))
                )
              );
            };

            x = d3
              .scaleLinear()
              .domain(getDomain("x"))
              .range([margin.left, width - margin.right]);

            y = d3
              .scaleLinear()
              .domain([supData[0].supMin, supData[supData.length - 1].supMax])
              .range([height - margin.bottom, margin.top]);

            let updateAxis = () => {
              let makeXAxis = (g) =>
                g
                  .attr("transform", `translate(0,${height - margin.bottom})`)
                  .call(
                    d3
                      .axisBottom(x)
                      .ticks(width / 80)
                      .tickSizeOuter(0)
                  );
              let makeYAxis = (g) =>
                g.attr("transform", `translate(${margin.left},0)`).call((g) => {
                  //==計算tick要扣多少
                  let supMaxArr = supData.map((d) => d.supMax),
                    cha_idx = 0;

                  //==移除上次多的分隔線和title
                  yAxis.selectAll("g.title").remove();

                  let axis = d3
                    .axisLeft(y)
                    .tickValues(tickValues)
                    .tickFormat(function (v, i) {
                      // return;
                      //是分隔線
                      let isDivider =
                        v >= supMaxArr[cha_idx] || i == tickValues.length - 1;
                      if (isDivider && cha_idx < supData.length - 1) cha_idx++;

                      let val = floatCalc("-", v, supData[cha_idx].supRange);

                      //調整分隔線附近的元素
                      d3.select(this.parentNode).call((tick) => {
                        // console.debug(tick._groups[0][0]);
                        let text = tick
                          .select("text")
                          .attr("font-weight", "bold")
                          .attr("fill", getColor(channel[cha_idx]));

                        if (isDivider) {
                          let val = floatCalc(
                            "-",
                            v,
                            supData[cha_idx - 1].supRange
                          );
                          let tick_x = text.attr("x");

                          //最後一條不用多tick
                          if (i != tickValues.length - 1) {
                            //多一個tick
                            text.attr("dy", -1);
                            tick
                              .attr("class", "title")
                              .selectAll("text.dividerTick")
                              .data([0])
                              .join("text")
                              .attr("class", "dividerTick")
                              .attr("font-weight", "bold")
                              .attr("fill", getColor(channel[cha_idx - 1]))
                              .attr("x", tick_x)
                              .attr("dy", 8)
                              .text(toEXP(val, tickPower)[0]);
                          }

                          //多一個title
                          tick
                            .attr("class", "title")
                            .selectAll("text.dividerTitle")
                            .data([0])
                            .join("text")
                            .attr("class", "dividerTitle")
                            .attr("fill", "currentColor")
                            .attr("text-anchor", "start")
                            .attr("alignment-baseline", "before-edge")
                            .attr("font-weight", "bold")
                            .attr("font-size", "13")
                            .text(
                              `${network}.${staCode}.${
                                channel[
                                  cha_idx - (i == tickValues.length - 1 ? 0 : 1)
                                ]
                              }`
                            );
                        }

                        //tick line
                        tick
                          .select("line")
                          .attr("x2", width - margin.left - margin.right)
                          .attr("stroke-opacity", isDivider ? 1 : 0.2);
                      });

                      return toEXP(val, tickPower)[0];
                    });
                  //
                  axis(g);

                  if (tickPower !== 0)
                    svg
                      .select(".SN_number")
                      .style("display", "inline")
                      .select(".power")
                      .text(tickPower);
                  else svg.select(".SN_number").style("display", "none");
                });
              // console.debug(yAxis);
              if (trans) {
                xAxis.transition().duration(1000).call(makeXAxis);
                yAxis.transition().duration(1000).call(makeYAxis);
              } else {
                xAxis.call(makeXAxis);
                yAxis.call(makeYAxis);
              }
            };
            let updatePaths = () => {
              // console.debug(data);
              let lineSup = (data, index) => {
                let supRange = supData[index].supRange;
                let line = d3
                  .line()
                  .defined((d, i) => !isNaN(data.y[i]))
                  .x((d) => x(d))
                  .y((d, i) => y(data.y[i] + supRange));
                return line(data.x);
              };

              focus
                .selectAll("path")
                .data(channel)
                .join("path")
                .attr("fill", "none")
                .attr("stroke", (cha) => getColor(cha))
                .attr("stroke-width", 1)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .call((path) => {
                  if (trans)
                    path
                      .transition()
                      .duration(1000)
                      .attr("d", (cha, i) => lineSup(newData[cha], i));
                  else path.attr("d", (cha, i) => lineSup(newData[cha], i));
                });
            };
            updateAxis();
            updatePaths();
          }

          if (!newDataObj) {
            //===預設選項
            newDataObj = getNewData();
            init();
          }
          render();
        }

        updateChart();
        function events() {
          //===event eles
          const eventRect = svg.append("g").attr("class", "eventRect");
          const defs = svg.append("defs");
          //====================================tooltip==================================================
          const tooltip = d3
            .select(chartRootNode)
            .select("#chart0")
            .append("div")
            .attr("class", "tooltip");

          function pathEvent() {
            //===遮罩讓path和事件不超出邊界
            defs
              .append("clipPath")
              .attr("id", "clip")
              .append("rect")
              .attr("id", "chartRenderRange")
              .attr("x", margin.left)
              .attr("y", margin.top)
              .attr("width", width - margin.right - margin.left)
              .attr("height", height - margin.top - margin.bottom)
              .attr("fill", "none")
              .attr("pointer-events", "all");

            eventRect.append("use").attr("xlink:href", "#chartRenderRange");

            //====================================mouse move==================================================
            function mouseMove() {
              const mouseG = eventRect
                .append("g")
                .attr("class", "mouse-over-effects");

              const mouseLine = mouseG
                .append("path") // create vertical line to follow mouse
                .attr("class", "mouse-line")
                .style("stroke", "#A9A9A9")
                .style("stroke-width", "2px")
                .style("opacity", "0.7");

              const mouseMoveBehavior = (use) =>
                use
                  .on("mouseleave", (e) => {
                    let action = () => {
                      mouseG.style("display", "none");
                      tooltip.style("display", "none");
                    };
                    action();
                  })
                  .on("mousemove", function (e) {
                    let action = () => {
                      let newData = newDataObj.newData,
                        chartData = newDataObj.chartData,
                        xData = newData[channel[0]].x;

                      const pointer = d3.pointer(e, this);
                      let mouseOnIdx = d3.bisectCenter(
                        xData,
                        x.invert(pointer[0])
                      );

                      let chart_centerX = x.range().reduce((a, b) => b - a) / 2;

                      mouseLine.attr("d", () => {
                        let xPos = pointer[0];
                        let p1 = xPos + "," + y.range()[0];
                        let p2 = xPos + "," + y.range()[1];
                        let d = "M" + p1 + " L" + p2;
                        return d;
                      });

                      mouseG
                        .selectAll(".mouse-per-line")
                        .data(channel)
                        .join("g")
                        .attr("class", "mouse-per-line")
                        .attr("transform", (cha, i) => {
                          let supRange = chartData.supData[i].supRange;
                          let transX = x(newData[cha].x[mouseOnIdx]);
                          let transY = y(newData[cha].y[mouseOnIdx] + supRange);
                          return `translate(${transX},${transY})`;
                        })
                        .call((gCollection) => {
                          gCollection.each(function (d, i) {
                            // console.debug(this);
                            const circleAmount = 3;
                            let g = d3.select(this);
                            g.selectAll("circle")
                              .data(d3.range(circleAmount))
                              .join("circle")
                              .call((circlesCollection) =>
                                circlesCollection.each(function (d) {
                                  let circle = d3.select(this);
                                  let mainCircle = d % 2 != 0;

                                  const lineStroke = "2px";
                                  const lineStroke2 = "0.5px";
                                  circle
                                    .attr("r", d + 3)
                                    .style(
                                      "stroke",
                                      mainCircle
                                        ? getColor(channel[i])
                                        : "white"
                                    )
                                    .style("fill", "none")
                                    .style(
                                      "stroke-width",
                                      mainCircle ? lineStroke : lineStroke2
                                    )
                                    .style("opacity", "1");
                                })
                              );
                          });
                        });
                      let mouseX = e.offsetX,
                        mouseY = e.offsetY;
                      const updateTooltip = () => {
                        let x = parseFloat(xData[mouseOnIdx].toFixed(2));

                        const divHtml = `
                        <font class='tooltip_tag'>Time : </font><br/>
                        <font size='5'>${x} </font> s<br/>
                        <font class='tooltip_tag'>Amplitude : </font><br/>`;

                        let box = tooltip.node().getBoundingClientRect();
                        let tooltipW = box.width;

                        tooltip
                          .html(divHtml)
                          .style(
                            "left",
                            `${
                              mouseX +
                              (pointer[0] > chart_centerX
                                ? -tooltipW * 1.5
                                : tooltipW / 2)
                            }px`
                          )
                          .style("top", `${mouseY}px`)
                          .selectAll("div")
                          .data(channel.slice(0).reverse())
                          .join("div")
                          .style("color", (cha) => getColor(cha))
                          .style("font-size", 10)
                          .html((cha, i) => {
                            let power = chartData.tickPower;
                            let y = newData[cha].y[mouseOnIdx];
                            let constant = parseFloat(
                              toEXP(y, power)[0].toFixed(3)
                            );

                            let html = `<font size='5'>${
                              constant +
                              (power && constant !== 0
                                ? ` x 10<sup>${power}</sup>`
                                : "")
                            } </font>`;
                            return html;
                          });
                      };

                      mouseG.style("display", "inline");
                      tooltip.style("display", "inline");
                      updateTooltip();
                    };
                    action();
                  });
              eventRect.call(mouseMoveBehavior);
            }
            //====================================zoom==================================================
            function mouseDrag() {
              let selectionRect = {
                element: null,
                previousElement: null,
                currentY: 0,
                currentX: 0,
                originX: 0,
                originY: 0,
                setElement: function (ele) {
                  this.previousElement = this.element;
                  this.element = ele;
                },
                getNewAttributes: function () {
                  let x =
                    this.currentX < this.originX ? this.currentX : this.originX;
                  let y =
                    this.currentY < this.originY ? this.currentY : this.originY;
                  let width = Math.abs(this.currentX - this.originX);
                  let height = Math.abs(this.currentY - this.originY);
                  return {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                  };
                },
                getCurrentAttributes: function () {
                  // use plus sign to convert string into number
                  let x = +this.element.attr("x");
                  let y = +this.element.attr("y");
                  let width = +this.element.attr("width");
                  let height = +this.element.attr("height");
                  return {
                    x1: x,
                    y1: y,
                    x2: x + width,
                    y2: y + height,
                  };
                },
                // getCurrentAttributesAsText: function () {
                //     let attrs = this.getCurrentAttributes();
                //     return "x1: " + attrs.x1 + " x2: " + attrs.x2 + " y1: " + attrs.y1 + " y2: " + attrs.y2;
                // },
                init: function (newX, newY) {
                  let rectElement = svg
                    .append("rect")
                    .attr("rx", 0)
                    .attr("ry", 0)
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", 0)
                    .attr("height", 0)
                    // .attr('stroke', '#545454')
                    // .attr('stroke-width', ' 2px')
                    .attr("stroke-opacity", 1)
                    .attr("fill", "#97CBFF")
                    .attr("fill-opacity", 0.5);
                  this.setElement(rectElement);
                  this.originX = newX;
                  this.originY = newY;
                  this.update(newX, newY);
                },
                update: function (newX, newY) {
                  this.currentX = newX;
                  this.currentY = newY;

                  let newAttr = this.getNewAttributes();
                  this.element
                    .attr("x", newAttr.x)
                    .attr("y", newAttr.y)
                    .attr("width", newAttr.width)
                    .attr("height", newAttr.height);
                },
                // focus: function () {
                //     this.element
                //         .style("stroke", "#DE695B")
                //         .style("stroke-width", "2.5");
                // },
                remove: function () {
                  this.element.remove();
                  this.element = null;
                },
                removePrevious: function () {
                  if (this.previousElement) {
                    this.previousElement.remove();
                  }
                },
              };
              let dragBehavior = d3
                .drag()
                .on("start", (e) => {
                  // console.log("dragStart");
                  const p = d3.pointer(e, eventRect.node());
                  selectionRect.init(p[0], margin.top);
                  selectionRect.removePrevious();
                  d3.select(window).dispatch("click"); //關閉dropdown
                  eventRect.dispatch("mouseleave"); //tooltip取消
                })
                .on("drag", (e) => {
                  // console.log("dragMove");
                  let action = () => {
                    const p = d3.pointer(e, eventRect.node());
                    // console.debug(p);
                    if (p[0] < margin.left) p[0] = margin.left;
                    else if (p[0] > width - margin.right)
                      p[0] = width - margin.right;
                    selectionRect.update(p[0], height - margin.bottom);
                  };
                  action();
                })
                .on("end", (e) => {
                  const finalAttributes = selectionRect.getCurrentAttributes();
                  // console.debug(finalAttributes);

                  let xAxis_domain = null;
                  if (finalAttributes.x2 - finalAttributes.x1 > 1)
                    xAxis_domain = [
                      x.invert(finalAttributes.x1),
                      x.invert(finalAttributes.x2),
                    ];

                  newDataObj = getNewData({
                    xAxis_domain: xAxis_domain,
                  });

                  if (newDataObj.newData[channel[0]].x.length > 1)
                    updateChart();

                  selectionRect.remove();
                  updateBrush(xAxis_domain);
                });
              eventRect.call(dragBehavior);
            }
            mouseMove();
            mouseDrag();
          }
          function brushEvent() {
            const chaIdx = channel.length - 1,
              cha = channel[chaIdx],
              chaData = data[cha];

            let brushArea = svg
              .append("g")
              .attr("class", "brushArea")
              .attr("transform", `translate(0,${height})`);

            brushArea
              .selectAll("path")
              .data([chaData])
              .join("path")
              .attr("fill", "none")
              .attr("stroke-width", 1)
              .attr("stroke-linejoin", "round")
              .attr("stroke-linecap", "round")
              .attr("stroke-opacity", 1)
              .attr("stroke", "#272727")
              .attr("d", (d) => {
                let chaChartData = newDataObj.chartData.supData[chaIdx];
                let y2 = d3
                  .scaleLinear()
                  .domain([chaChartData.min, chaChartData.max])
                  .range([height2 - margin.bottom, 0]);

                let line2 = (data) => {
                  let pathAttr = d3
                    .line()
                    .defined((d, i) => !isNaN(data.y[i]))
                    .x((d) => x(d))
                    .y((d, i) => y2(data.y[i]));

                  return pathAttr(data.x);
                };

                return line2(d);
              });

            let brushRect = brushArea.append("g").attr("class", "brush");

            let x2, brush;
            const updateBrush = (domain) => {
              let range = domain ? domain.map((d) => x2(d)) : x2.range();
              brushRect.call(brush.move, range);
            };
            let brushMove = () => {
              x2 = d3
                .scaleLinear()
                .domain(x.domain())
                .range([margin.left, width - margin.right]);

              let brush_flag = true; //prevent brushing too often
              const brush_updateChart = (selection) => {
                if (!brush_flag) return;

                let xAxis_domain;
                if (selection && selection[1] - selection[0]) {
                  xAxis_domain = [
                    x2.invert(selection[0]),
                    x2.invert(selection[1]),
                  ];
                } else {
                  xAxis_domain = x2.domain();
                  updateBrush();
                }
                newDataObj = getNewData({ xAxis_domain });
                if (newDataObj.newData[cha].x.length) updateChart();
                brush_flag = false;
                d3.timeout(() => (brush_flag = true), 50);
              };
              brush = d3
                .brushX()
                .extent([
                  [margin.left, 0],
                  [width - margin.right, height2 - margin.bottom],
                ])
                .on("brush end", (e) => {
                  if (!e.sourceEvent) return; // ignore brush-by-zoom
                  brush_updateChart(e.selection);
                });

              brushRect.call(brush);
              updateBrush();
            };
            brushMove();
            return updateBrush;
          }
          pathEvent();
          let updateBrush = brushEvent();
        }
        events();

        return svg.node();
      }
      function overlayChart() {
        const data = waveformData;
        channel = channel.reverse().filter((cha) => data[cha].x.length > 1);

        const width = 800,
          height = 500,
          height2 = 65,
          margin = getMargin();
        const svg = d3
          .create("svg")
          .attr("viewBox", [0, 0, width, height + height2]);
        const xAxis = svg.append("g").attr("class", "xAxis");
        const yAxis = svg.append("g").attr("class", "yAxis");
        const focus = svg
          .append("g")
          .attr("class", "paths")
          .attr("clip-path", "url(#clip)");

        let x, y;
        let newDataObj;
        // console.debug(index);
        function getNewData(controlObj = {}) {
          let xAxis_domain = controlObj.hasOwnProperty("xAxis_domain")
            ? controlObj.xAxis_domain
            : newDataObj?.xAxis_domain;
          let normalize = false;
          let selectedCha = controlObj.hasOwnProperty("selectedCha")
            ? controlObj.selectedCha
            : newDataObj
            ? newDataObj.selectedCha
            : channel.slice(0);

          const getData = (xAxis_domain) => {
            // 挑選有選則的cha資料
            let newData = selectedCha.reduce((acc, key) => {
              // 從累加器中獲取當前鍵值對應的分組，如果不存在則創建一個新的空陣列
              return {
                ...acc,
                [key]: JSON.parse(JSON.stringify(data[key])),
              };
            }, {});
            // console.debug(selectedCha);
            if (xAxis_domain) {
              // console.debug(xAxis_domain);
              let xData = data[channel[0]].x;
              let i1 = d3.bisectCenter(xData, xAxis_domain[0]);
              let i2 = d3.bisectCenter(xData, xAxis_domain[1]) + 1; //包含最大範圍

              Object.keys(newData).forEach((cha) => {
                Object.assign(newData[cha], {
                  x: newData[cha].x.slice(i1, i2),
                  y: newData[cha].y.slice(i1, i2),
                });
              });
            }
            // console.debug(newData);
            return newData;
          };

          let newData = getData(xAxis_domain);

          return {
            newData,
            xAxis_domain,
            selectedCha,
            // normalize: normalize,
          };
        }
        function updateChart(trans = false) {
          function init() {
            svg
              .append("g")
              .attr("class", "SN_number")
              .style("display", "none")
              .call((g) => {
                g.append("text")
                  .attr("fill", "currentColor")
                  .attr("x", margin.left)
                  .attr("y", margin.top * 0.7)
                  .attr("text-anchor", "start")
                  .attr("font-size", 13)
                  .text(`( x 10\u00A0\u00A0\u00A0\u00A0)`);

                g.append("text")
                  .attr("class", "power")
                  .attr("font-size", 10)
                  .attr("x", margin.left + 33)
                  .attr("y", margin.top * 0.4)
                  .text(``);
              });

            svg
              .append("g")
              .attr("class", "title")
              .append("text")
              .attr("fill", "currentColor")
              .attr("x", margin.left + 55)
              .attr("y", margin.top / 2)
              .attr("text-anchor", "start")
              .attr("alignment-baseline", "central")
              .attr("font-weight", "bold")
              .attr("font-size", "13")
              .text(`${network}.${staCode}`);

            svg
              .append("g")
              .attr("class", "referenceTime")
              .append("text")
              .attr("fill", "currentColor")
              .attr("x", width - margin.right)
              .attr("y", margin.top / 2)
              .attr("text-anchor", "end")
              .attr("alignment-baseline", "central")
              .attr("font-weight", "bold")
              .attr("font-size", "13")
              .text("reference time : " + event);

            xAxis
              .append("text")
              .attr("class", "axis_name")
              .attr("fill", "black")
              .attr("font-weight", "bold")
              .attr("x", width / 2)
              .attr("y", margin.top + 10)
              .attr("font-size", "13")
              .text("Time (s)");

            yAxis
              .append("text")
              .attr("class", "axis_name")
              .attr("fill", "black")
              .attr("font-weight", "bold")
              .attr("font-size", "10")
              .style("text-anchor", "middle")
              .attr("alignment-baseline", "text-before-edge")
              .attr("transform", "rotate(-90)")
              .attr("x", -height / 2)
              .attr("y", -margin.left + 8)
              .attr("font-size", "13")
              .text("Amplitude (cm/s/s)");

            svg
              .append("g")
              .attr("class", "legend")
              .style("font-size", "12px")
              .attr(
                "transform",
                `translate(${(width - margin.right) / 2}, ${margin.top * 0.3})`
              )
              .call((legend) => {
                const path_width = 50;
                const path_interval = 50;
                const path_margin_horizontal = 10;

                const legend_width =
                  (path_width + path_interval) * channel.length +
                  path_margin_horizontal * 2;
                const legend_height = 50;

                legend
                  .append("rect")
                  .attr("height", legend_height)
                  .attr("width", legend_width)
                  .attr("fill", "#D3D3D3")
                  .attr("opacity", 0.5)
                  .attr("stroke-width", "1")
                  .attr("stroke", "black")
                  .attr("stroke-opacity", 0.8);

                legend
                  .selectAll("g")
                  .data(channel)
                  .join("g")
                  .call((g) => {
                    g.append("line")
                      .attr("stroke-width", 3)
                      .attr("stroke-opacity", 1)
                      .attr("stroke", (cha) => getColor(cha))
                      .attr(
                        "x1",
                        (d, i) =>
                          (path_width + path_interval) * i +
                          path_margin_horizontal
                      )
                      .attr(
                        "x2",
                        (d, i) =>
                          (path_interval + path_width) * i +
                          path_width +
                          path_margin_horizontal
                      )
                      .attr("y1", legend_height / 2)
                      .attr("y2", legend_height / 2);

                    g.append("text")
                      .attr("font-weight", "bold")
                      .style("text-anchor", "middle")
                      .attr("alignment-baseline", "middle")
                      .attr(
                        "x",
                        (d, i) =>
                          i * (path_width + path_interval) +
                          path_width +
                          path_interval / 2 +
                          path_margin_horizontal
                      )
                      .attr("y", legend_height / 2)
                      .text((cha) => cha);
                  });
              });

            d3.select(chartRootNode)
              .selectAll("#chaDropDownMenu")
              .selectAll("div")
              .data(channel)
              .join("div")
              .attr("class", "form-check col-4")
              .call((divG) =>
                divG.each(function (cha) {
                  let div = d3.select(this);
                  div
                    .append("input")
                    .attr("class", "form-check-input  col-4")
                    .attr("type", "checkbox")
                    .attr("id", "cha_" + cha)
                    .attr("name", "cha")
                    .attr("value", cha)
                    .property("checked", true);

                  div
                    .append("label")
                    .attr("class", "form-check-label text-nowrap col-8")
                    .attr("for", "cha_" + cha)
                    .text(cha);
                })
              );
          }
          function render() {
            // console.debug(newDataObj);
            const newData = newDataObj.newData,
              selectedCha = newDataObj.selectedCha;

            let getDomain = (axis) => {
              return d3.extent(
                [].concat(
                  ...selectedCha.map((cha) => d3.extent(newData[cha][axis]))
                )
              );
            };

            x = d3
              .scaleLinear()
              .domain(getDomain("x"))
              .range([margin.left, width - margin.right]);

            y = d3
              .scaleLinear()
              .domain(getDomain("y"))
              .nice()
              .range([height - margin.bottom, margin.top]);

            let power = toEXP(y.domain().reduce((a, b) => Math.abs(b - a)))[1];
            newDataObj.tickPower = power;

            const line = (data) => {
              // console.debug(data);

              let pathAttr = d3
                .line()
                .defined((d, i) => !isNaN(data.y[i]))
                .x((d) => x(d))
                .y((d, i) => y(data.y[i]));

              return pathAttr(data.x);
            };

            let updateAxis = () => {
              let makeXAxis = (g) =>
                g
                  .attr("transform", `translate(0,${height - margin.bottom})`)
                  .call(
                    d3
                      .axisBottom(x)
                      .ticks(width / 80)
                      .tickSizeOuter(0)
                  );
              let makeYAxis = (g) =>
                g
                  .attr("transform", `translate(${margin.left},0)`)
                  .call((g) => {
                    let axis = d3
                      .axisLeft(y)
                      .tickFormat((v) => toEXP(v, power)[0]);
                    //
                    axis(g);

                    if (power !== 0)
                      svg
                        .select(".SN_number")
                        .style("display", "inline")
                        .select(".power")
                        .text(power);
                    else svg.select(".SN_number").style("display", "none");
                    // console.debug(power);
                  })
                  .call((g) =>
                    g
                      .selectAll("g.yAxis g.tick line")
                      .attr("x2", () => width - margin.left - margin.right)
                      .attr("stroke-opacity", 0.2)
                  );

              // console.debug(yAxis);
              if (trans) {
                xAxis.transition().duration(1000).call(makeXAxis);
                yAxis.transition().duration(1000).call(makeYAxis);
              } else {
                xAxis.call(makeXAxis);
                yAxis.call(makeYAxis);
              }
            };
            let updatePaths = () => {
              // console.debug(data);
              focus
                .selectAll("path")
                .data(selectedCha)
                .join("path")
                .attr("fill", "none")
                .attr("stroke", (cha) => getColor(cha))
                .attr("stroke-width", 1)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .call((path) => {
                  if (trans)
                    path
                      .transition()
                      .duration(1000)
                      .attr("d", (cha) => line(newData[cha]));
                  else path.attr("d", (cha) => line(newData[cha]));
                });
            };
            updateAxis();
            updatePaths();
          }

          if (!newDataObj) {
            //===預設選項
            newDataObj = getNewData();
            init();
          }
          render();
        }

        updateChart();
        function events() {
          //===event eles
          const eventRect = svg.append("g").attr("class", "eventRect");
          const defs = svg.append("defs");
          //====================================tooltip==================================================
          const tooltip = d3
            .select(chartRootNode)
            .select("#chart0")
            .append("div")
            .attr("class", "tooltip");

          function pathEvent() {
            let mouseEvent = () => {
              //===遮罩讓path和事件不超出邊界
              defs
                .append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("id", "chartRenderRange")
                .attr("x", margin.left)
                .attr("y", margin.top)
                .attr("width", width - margin.right - margin.left)
                .attr("height", height - margin.top - margin.bottom)
                .attr("fill", "none")
                .attr("pointer-events", "all");

              eventRect.append("use").attr("xlink:href", "#chartRenderRange");

              //====================================mouse move==================================================
              function mouseMove() {
                const mouseG = eventRect
                  .append("g")
                  .attr("class", "mouse-over-effects");

                const mouseLine = mouseG
                  .append("path") // create vertical line to follow mouse
                  .attr("class", "mouse-line")
                  .style("stroke", "#A9A9A9")
                  .style("stroke-width", "2px")
                  .style("opacity", "0.7");

                const mouseMoveBehavior = (use) =>
                  use
                    .on("mouseleave", (e) => {
                      let action = () => {
                        mouseG.style("display", "none");
                        tooltip.style("display", "none");
                      };
                      action();
                    })
                    .on("mousemove", function (e) {
                      let action = () => {
                        let newData = newDataObj.newData,
                          tickPower = newDataObj.tickPower,
                          selectedCha = newDataObj.selectedCha,
                          xData = newData[selectedCha[0]].x;

                        const pointer = d3.pointer(e, this);
                        let mouseOnIdx = d3.bisectCenter(
                          xData,
                          x.invert(pointer[0])
                        );

                        let chart_centerX =
                          x.range().reduce((a, b) => b - a) / 2;

                        mouseLine.attr("d", () => {
                          let xPos = pointer[0];
                          let p1 = xPos + "," + y.range()[0];
                          let p2 = xPos + "," + y.range()[1];
                          let d = "M" + p1 + " L" + p2;
                          return d;
                        });

                        mouseG
                          .selectAll(".mouse-per-line")
                          .data(selectedCha)
                          .join("g")
                          .attr("class", "mouse-per-line")
                          .attr("transform", (cha, i) => {
                            let transX = x(newData[cha].x[mouseOnIdx]);
                            let transY = y(newData[cha].y[mouseOnIdx]);
                            return `translate(${transX},${transY})`;
                          })
                          .call((gCollection) => {
                            gCollection.each(function (d, i) {
                              // console.debug(this);
                              const circleAmount = 3;
                              let g = d3.select(this);
                              g.selectAll("circle")
                                .data(d3.range(circleAmount))
                                .join("circle")
                                .call((circlesCollection) =>
                                  circlesCollection.each(function (d) {
                                    let circle = d3.select(this);
                                    let mainCircle = d % 2 != 0;

                                    const lineStroke = "2px";
                                    const lineStroke2 = "0.5px";
                                    circle
                                      .attr("r", d + 3)
                                      .style(
                                        "stroke",
                                        mainCircle
                                          ? getColor(selectedCha[i])
                                          : "white"
                                      )
                                      .style("fill", "none")
                                      .style(
                                        "stroke-width",
                                        mainCircle ? lineStroke : lineStroke2
                                      )
                                      .style("opacity", "1");
                                  })
                                );
                            });
                          });
                        let mouseX = e.offsetX,
                          mouseY = e.offsetY;
                        const updateTooltip = () => {
                          let x = parseFloat(xData[mouseOnIdx].toFixed(2));

                          const divHtml = `
                          <font class='tooltip_tag'>Time : </font><br/>
                          <font size='5'>${x} </font> s<br/>
                          <font class='tooltip_tag'>Amplitude : </font><br/>`;

                          let box = tooltip.node().getBoundingClientRect();
                          let tooltipW = box.width;

                          tooltip
                            .html(divHtml)
                            .style(
                              "left",
                              `${
                                mouseX +
                                (pointer[0] > chart_centerX
                                  ? -tooltipW * 1.5
                                  : tooltipW / 2)
                              }px`
                            )
                            .style("top", `${mouseY}px`)
                            .selectAll("div")
                            .data(selectedCha.slice(0).reverse())
                            .join("div")
                            .style("color", (cha) => getColor(cha))
                            .style("font-size", 10)
                            .html((cha, i) => {
                              let y = newData[cha].y[mouseOnIdx];
                              let constant = parseFloat(
                                toEXP(y, tickPower)[0].toFixed(3)
                              );

                              let html = `<font size='5'>${
                                constant +
                                (tickPower && constant !== 0
                                  ? ` x 10<sup>${tickPower}</sup>`
                                  : "")
                              } </font>`;
                              return html;
                            });
                        };

                        mouseG.style("display", "inline");
                        tooltip.style("display", "inline");
                        updateTooltip();
                      };
                      action();
                    });
                eventRect.call(mouseMoveBehavior);
              }
              // //====================================zoom==================================================
              function mouseDrag() {
                let selectionRect = {
                  element: null,
                  previousElement: null,
                  currentY: 0,
                  currentX: 0,
                  originX: 0,
                  originY: 0,
                  setElement: function (ele) {
                    this.previousElement = this.element;
                    this.element = ele;
                  },
                  getNewAttributes: function () {
                    let x =
                      this.currentX < this.originX
                        ? this.currentX
                        : this.originX;
                    let y =
                      this.currentY < this.originY
                        ? this.currentY
                        : this.originY;
                    let width = Math.abs(this.currentX - this.originX);
                    let height = Math.abs(this.currentY - this.originY);
                    return {
                      x: x,
                      y: y,
                      width: width,
                      height: height,
                    };
                  },
                  getCurrentAttributes: function () {
                    // use plus sign to convert string into number
                    let x = +this.element.attr("x");
                    let y = +this.element.attr("y");
                    let width = +this.element.attr("width");
                    let height = +this.element.attr("height");
                    return {
                      x1: x,
                      y1: y,
                      x2: x + width,
                      y2: y + height,
                    };
                  },
                  // getCurrentAttributesAsText: function () {
                  //     let attrs = this.getCurrentAttributes();
                  //     return "x1: " + attrs.x1 + " x2: " + attrs.x2 + " y1: " + attrs.y1 + " y2: " + attrs.y2;
                  // },
                  init: function (newX, newY) {
                    let rectElement = svg
                      .append("rect")
                      .attr("rx", 0)
                      .attr("ry", 0)
                      .attr("x", 0)
                      .attr("y", 0)
                      .attr("width", 0)
                      .attr("height", 0)
                      // .attr('stroke', '#545454')
                      // .attr('stroke-width', ' 2px')
                      .attr("stroke-opacity", 1)
                      .attr("fill", "#97CBFF")
                      .attr("fill-opacity", 0.5);
                    this.setElement(rectElement);
                    this.originX = newX;
                    this.originY = newY;
                    this.update(newX, newY);
                  },
                  update: function (newX, newY) {
                    this.currentX = newX;
                    this.currentY = newY;

                    let newAttr = this.getNewAttributes();
                    this.element
                      .attr("x", newAttr.x)
                      .attr("y", newAttr.y)
                      .attr("width", newAttr.width)
                      .attr("height", newAttr.height);
                  },
                  // focus: function () {
                  //     this.element
                  //         .style("stroke", "#DE695B")
                  //         .style("stroke-width", "2.5");
                  // },
                  remove: function () {
                    this.element.remove();
                    this.element = null;
                  },
                  removePrevious: function () {
                    if (this.previousElement) {
                      this.previousElement.remove();
                    }
                  },
                };
                let dragBehavior = d3
                  .drag()
                  .on("start", (e) => {
                    // console.log("dragStart");
                    const p = d3.pointer(e, eventRect.node());
                    selectionRect.init(p[0], margin.top);
                    selectionRect.removePrevious();
                    d3.select(window).dispatch("click"); //關閉dropdown
                    eventRect.dispatch("mouseleave"); //tooltip取消
                  })
                  .on("drag", (e) => {
                    // console.log("dragMove");
                    let action = () => {
                      const p = d3.pointer(e, eventRect.node());
                      // console.debug(p);
                      if (p[0] < margin.left) p[0] = margin.left;
                      else if (p[0] > width - margin.right)
                        p[0] = width - margin.right;
                      selectionRect.update(p[0], height - margin.bottom);
                    };
                    action();
                  })
                  .on("end", (e) => {
                    const finalAttributes =
                      selectionRect.getCurrentAttributes();
                    // console.debug(finalAttributes);

                    let xAxis_domain = null;
                    if (finalAttributes.x2 - finalAttributes.x1 > 1)
                      xAxis_domain = [
                        x.invert(finalAttributes.x1),
                        x.invert(finalAttributes.x2),
                      ];

                    newDataObj = getNewData({
                      xAxis_domain: xAxis_domain,
                    });

                    if (
                      newDataObj.newData[newDataObj.selectedCha[0]].x.length > 1
                    )
                      updateChart();

                    selectionRect.remove();
                    updateBrush(xAxis_domain);
                  });
                eventRect.call(dragBehavior);
              }
              mouseMove();
              mouseDrag();
            };
            mouseEvent();
          }
          function infoBoxDragEvent() {
            let raiseAndDrag = (d3_selection) => {
              let x_fixed = 0,
                y_fixed = 0;
              let legend_dragBehavior = d3
                .drag()
                .on("start", function (e) {
                  // console.log('drag start');
                  // console.debug(this);
                  let matrix = this.transform.baseVal[0].matrix;
                  x_fixed = e.x - matrix.e;
                  y_fixed = e.y - matrix.f;
                })
                .on("drag end", function (e) {
                  // console.log('drag');
                  let translateX = e.x - x_fixed;
                  let translateY = e.y - y_fixed;

                  let targetSVGRect = this.getBBox();
                  let targetWidth = targetSVGRect.width;
                  let targetHeight = targetSVGRect.height;

                  // console.debug(targetSVGRect);
                  let range_margin = 5;
                  let xRange = [
                    0 + range_margin,
                    width - targetWidth - range_margin,
                  ];
                  let yRange = [
                    range_margin,
                    height - targetHeight - range_margin,
                  ];
                  //不能拉出svg範圍

                  if (translateX < xRange[0]) translateX = xRange[0];
                  else if (translateX > xRange[1]) translateX = xRange[1];
                  // console.debug(width)
                  if (translateY < yRange[0]) translateY = yRange[0];
                  else if (translateY > yRange[1]) translateY = yRange[1];

                  d3.select(this).attr(
                    "transform",
                    `translate(${translateX}, ${translateY})`
                  );
                });

              d3_selection
                .attr("cursor", "grab")
                .call((g) => g.raise()) //把選中元素拉到最上層(比zoom的選取框優先)
                .call(legend_dragBehavior);
            };
            svg.select(".legend").call(raiseAndDrag);
          }
          function chartOptionEvent() {
            const chartOption = d3
              .select(chartRootNode)
              .selectAll("#otherOptions");

            //=====change channel
            let chaCheckbox = chartOption.selectAll("#chaDropDownMenu input");

            chaCheckbox.on("click", function (e) {
              let selectedBool = chaCheckbox
                .nodes()
                .map((input) => input.checked);

              let selectedCha = channel.filter((cha, i) => selectedBool[i]);
              newDataObj = getNewData({ selectedCha });
              updateChart();
            });

            //=====legend show
            let legendCkb = chartOption.selectAll("#legendCkb"),
              legend = svg.select(".legend");
            legendCkb.on("click", function (e) {
              legend.style("display", this.checked ? "inline" : "none");
            });
          }
          function brushEvent() {
            const chaIdx = channel.length - 1,
              cha = channel[chaIdx],
              chaData = data[cha];

            let brushArea = svg
              .append("g")
              .attr("class", "brushArea")
              .attr("transform", `translate(0,${height})`);

            brushArea
              .selectAll("path")
              .data([chaData])
              .join("path")
              .attr("fill", "none")
              .attr("stroke-width", 1)
              .attr("stroke-linejoin", "round")
              .attr("stroke-linecap", "round")
              .attr("stroke-opacity", 1)
              .attr("stroke", "#272727")
              .attr("d", (data) => {
                let y2 = d3
                  .scaleLinear()
                  .domain(d3.extent(data.y))
                  .range([height2 - margin.bottom, 0]);

                let line2 = (data) => {
                  let pathAttr = d3
                    .line()
                    .defined((d, i) => !isNaN(data.y[i]))
                    .x((d) => x(d))
                    .y((d, i) => y2(data.y[i]));

                  return pathAttr(data.x);
                };

                return line2(data);
              });

            let brushRect = brushArea.append("g").attr("class", "brush");

            let x2, brush;
            const updateBrush = (domain) => {
              let range = domain ? domain.map((d) => x2(d)) : x2.range();
              brushRect.call(brush.move, range);
            };
            let brushMove = () => {
              x2 = d3
                .scaleLinear()
                .domain(x.domain())
                .range([margin.left, width - margin.right]);

              let brush_flag = true; //prevent brushing too often
              const brush_updateChart = (selection) => {
                if (!brush_flag) return;

                let xAxis_domain;
                if (selection && selection[1] - selection[0]) {
                  xAxis_domain = [
                    x2.invert(selection[0]),
                    x2.invert(selection[1]),
                  ];
                } else {
                  xAxis_domain = x2.domain();
                  updateBrush();
                }
                newDataObj = getNewData({ xAxis_domain });
                if (newDataObj.newData[cha].x.length) updateChart();
                brush_flag = false;
                d3.timeout(() => (brush_flag = true), 50);
              };
              brush = d3
                .brushX()
                .extent([
                  [margin.left, 0],
                  [width - margin.right, height2 - margin.bottom],
                ])
                .on("brush end", (e) => {
                  if (!e.sourceEvent) return; // ignore brush-by-zoom
                  brush_updateChart(e.selection);
                });

              brushRect.call(brush);
              updateBrush();
            };
            brushMove();
            return updateBrush;
          }
          pathEvent();
          infoBoxDragEvent();
          chartOptionEvent();
          let updateBrush = brushEvent();
        }
        events();
        //------channel Title

        return svg.node();
      }
      // let plotType = $('input[name ="plotType"]:checked').val();
      let getChartDivHtml = (idx) => {
        let chartDiv = `<div id="chart${idx}" class="chart col-md-12 col-sm-12"></div>`;
        chartRootNode
          .querySelector("#charts")
          .insertAdjacentHTML("beforeend", chartDiv);
      };
      let getChartMenu = (chartNode, cha) => {
        let dropDownItems = ["bigimg", "svg", "png", "jpg"];
        let nav = `   
        <nav class="toggle-menu">
        <a class="toggle-nav" data-bs-toggle="dropdown" role="button" aria-expanded="false">
          &#9776;
        </a>
        <ul class="dropdown-menu">
          ${dropDownItems
            .map(
              (item) =>
                `<li><a class="dropdown-item" href="javascript:void(0)">${
                  item != dropDownItems[0] ? "下載圖表爲" + item : "檢視圖片"
                }</a></li>`
            )
            .join("")}
        </ul>
        </nav>`;

        chartNode.insertAdjacentHTML("beforeend", nav);
        chartNode
          .querySelectorAll(".toggle-menu .dropdown-menu a")
          .forEach((a, i) => {
            a.addEventListener("click", (e) => {
              let title =
                `${event}_${network}.${staCode}` + (cha ? `.${cha}` : "");
              let svg = chartNode.querySelector("svg");
              downloadSvg([svg], title, dropDownItems[i]);
            });
          });
      };
      let MenuEvents = () => {
        let charts = chartRootNode.getElementById("charts");
        let stopPropagation = (e) => {
          e.stopPropagation();
        };

        //start or stop DOM event capturing
        function chartEventControl(control) {
          if (control == "stop") {
            // console.debug('add');
            charts.addEventListener("mousemove", stopPropagation, true);
            charts.addEventListener("mouseenter", stopPropagation, true);
          } else {
            // console.debug('remove');
            charts.removeEventListener("mousemove", stopPropagation, true);
            charts.removeEventListener("mouseenter", stopPropagation, true);
          }
        }

        chartRootNode.querySelector(".toggle-nav").off("click");
        chartRootNode.querySelector(".toggle-nav").click(function (e) {
          // console.debug(e.target === this);//e.target===this

          // d3.select(this).toggleClass("active");
          // d3.select(this).next().toggleClass("active");
          e.preventDefault();

          //選單打開後阻止事件Capture到SVG(選單打開後svg反應mousemove,mouseenter圖片會有問題)
          if ($(this).hasClass("active")) chartEventControl("stop");
          else chartEventControl("start");
        });
        // console.debug($(".toggle-nav"));
        $("body").off("click");
        $("body").click(function (e) {
          $(".toggle-nav").each((i, d) => {
            // console.debug(e.target == d);
            // console.debug(e.target);
            if (e.target != d && $(d).hasClass("active")) {
              $(d).toggleClass("active");
              $(d).next().toggleClass("active");

              setTimeout(() => chartEventControl("start"), 100);
            }
          });
        });
      };
      let downloadSvg = (svgArr, fileName, option) => {
        // console.debug(svgArr, fileName, option);
        function getSvgUrl(svgNode) {
          let svgData = new XMLSerializer().serializeToString(svgNode);
          let svgBlob = new Blob([svgData], {
            type: "image/svg+xml;charset=utf-8",
          });
          let svgUrl = URL.createObjectURL(svgBlob);
          return svgUrl;
        }
        function getCanvas(resize) {
          // =============== canvas init
          let canvas = document.createElement("canvas");
          let context = canvas.getContext("2d");

          let svgWidth = svgArr[0].viewBox.baseVal.width;
          let svgHeight = svgArr[0].viewBox.baseVal.height * svgArr.length;
          let canvasWidth, canvasHeight;
          //檢視時縮放,下載時放大
          if (resize) {
            let windowW = window.innerWidth; //获取当前窗口宽度
            let windowH = window.innerHeight; //获取当前窗口高度

            let width, height;
            let scale = 0.9; //缩放尺寸
            height = windowH * scale;
            width = (height / svgHeight) * svgWidth;
            while (width > windowW * scale) {
              //如宽度扔大于窗口宽度
              height = height * scale; //再对宽度进行缩放
              width = width * scale;
            }
            canvasWidth = width;
            canvasHeight = height;
          } else {
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
          const eventHandler = function (e) {
            //再次点击淡出消失弹出层
            if (e.target.id != "outerdiv") return;
            outerdiv.style.display = "none";
            originParent.querySelector("svg").remove();
            originSvg.removeAttribute("width");
            originSvg.removeAttribute("height");
            originParent.append(originSvg);
            originParent.append(tooltip);
          };
          let outerdiv = chartRootNode.querySelector("#outerdiv");

          outerdiv.style.display = "inline";
          outerdiv.removeEventListener("click", eventHandler);
          outerdiv.addEventListener("click", eventHandler);

          let originSvg = svgArr[0];
          let originParent = originSvg.parentNode;
          let cloneSvg = originSvg.cloneNode(true),
            tooltip = originParent.querySelector(".tooltip");
          originSvg.setAttribute("width", width);
          originSvg.setAttribute("height", height);
          let innerdiv = document.querySelector("#innerdiv");
          innerdiv.append(originSvg);
          innerdiv.append(tooltip);
          originParent.append(cloneSvg);
        }

        if (option == "svg") {
          //==============merge svg
          let newSvg = document.createElement("svg");
          svgArr.forEach((svgNode) => newSvg.append(svgNode.cloneNode(true)));
          let svgUrl = getSvgUrl(newSvg);
          download(svgUrl, fileName + "." + option);
        } else {
          //==============each svg draw to canvas
          let CanvasObjArr = getCanvas(option == "bigimg");

          let canvas = CanvasObjArr[0];
          let context = CanvasObjArr[1];
          let imageWidth = canvas.width;
          let imageHeight = canvas.height / svgArr.length;

          svgArr.forEach((svgNode, index) => {
            let svgUrl = getSvgUrl(svgNode);
            let image = new Image();
            image.src = svgUrl;
            image.onload = () => {
              context.drawImage(
                image,
                0,
                index * imageHeight,
                imageWidth,
                imageHeight
              );

              //done drawing and output
              if (index == svgArr.length - 1) {
                let imgUrl;
                if (option == "bigimg") {
                  show(imageWidth, imageHeight);
                } else {
                  imgUrl = canvas.toDataURL("image/" + option);
                  download(imgUrl, fileName + "." + option);
                }
              }
            };
          });
        }
      };

      switch (plotType) {
        default:
        case "trace":
          channel.forEach((cha, i) => {
            getChartDivHtml(i);
            let chart = chartRootNode.querySelector("#chart" + i);
            getChartMenu(chart, cha);
            let chartNode = trace(cha);
            chart.append(chartNode);
          });
          break;
        case "window":
          getChartDivHtml(0);
          let window = chartRootNode.querySelector("#chart0");
          getChartMenu(window);
          window.append(windowChart());
          // contextSelectionSide();
          break;
        case "overlay":
          getChartDivHtml(0);
          let overlay = chartRootNode.querySelector("#chart0");
          getChartMenu(overlay);
          overlay.append(overlayChart());
          break;
      }
    }
    if (!chartRootNode.querySelector("#sacPlotChart")) init();
    printChart();
  }

  return chart;
}
