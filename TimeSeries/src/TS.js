function TSchart() {
  let selector = "body";
  let data = null;

  // Date.prototype.toString = () => 123;
  // console.debug(Date.prototype, new Date().toLocaleTimeString());

  chart.selector = (value) => {
    selector = value;
    return chart;
  };
  chart.data = (value) => {
    function csvJSON(csvStr) {
      let rows = csvStr.trim().split("\n");
      let header = rows.shift().trim().split(",");

      return rows.map((row) => {
        let cols = row.trim().split(",");
        return cols.reduce(
          (acc, col, idx) => ({
            ...acc,
            [header[idx]]:
              header[idx] === "date" ? new Date(col) : parseFloat(col),
          }),
          {}
        );
      });
    }

    let requestData = (url) => {
      return new Promise((resolve) => {
        axios.get(url, { responseType: "blob" }).then((res) => {
          res.data.text().then((csvStr) => {
            resolve(csvJSON(csvStr));
          });
        });
      });
    };

    data = value ? value : requestData("data/data.txt");
    // console.debug(data);
    return chart;
  };

  function chart() {
    const chartRootNode = document.querySelector(selector);

    function init() {
      chartRootNode.insertAdjacentHTML(
        "beforeend",
        `
      <div class="form-group" id="chartsOptions" style="display: inline;">
          <div class="row">
          </div>
      </div>
  
      <div class="form-group"  id="chartMain">
          <div id="charts"></div>          
      
          <div id="outerDiv">
                <div id="innerDiv"></div>                      
          </div>

          <div class="d-flex align-items-center justify-content-center" id="loading">
            <span class="spinner-border" role="status"></span>
            <span class="px-2">Loading...</span>
          </div>
      </div> 
      `
      );
    }
    async function printChart() {
      chartRootNode
        .querySelectorAll("#charts>*")
        .forEach((chart) => chart.remove());

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
                            item != dropDownItems[0]
                              ? "下載圖表爲" + item
                              : "檢視圖片"
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
              let title = `example`;
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
            if (e.target.id != "outerDiv") return;
            outerDiv.style.display = "none";
            originParent.querySelector("svg").remove();
            originSvg.removeAttribute("width");
            originSvg.removeAttribute("height");
            originParent.append(originSvg);
            if (tooltip) originParent.append(tooltip);
          };
          let outerDiv = chartRootNode.querySelector("#outerDiv");

          outerDiv.style.display = "inline";
          outerDiv.removeEventListener("click", eventHandler);
          outerDiv.addEventListener("click", eventHandler);

          let originSvg = svgArr[0];
          let originParent = originSvg.parentNode;
          let cloneSvg = originSvg.cloneNode(true),
            tooltip = originParent.querySelector(".tooltip");
          originSvg.setAttribute("width", width);
          originSvg.setAttribute("height", height);
          let innerDiv = document.querySelector("#innerDiv");
          innerDiv.append(originSvg);
          if (tooltip) innerDiv.append(tooltip);
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
          // console.debug(CanvasObjArr);
          svgArr.forEach((svgNode, index) => {
            // console.debug(svgNode, index);
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
                if (option == "bigimg") {
                  show(imageWidth, imageHeight);
                } else {
                  let imgUrl = canvas.toDataURL("image/" + option);
                  download(imgUrl, fileName + "." + option);
                }
              }
            };
          });
        }
      };

      function getChartSvg(cha) {
        const width = 800,
          height = 250;
        const margin = { top: 20, right: 30, bottom: 35, left: 35 };
        const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);
        const xAxis = svg.append("g").attr("class", "xAxis");
        const yAxis = svg.append("g").attr("class", "yAxis");
        const focusGroup = svg.append("g").attr("class", "focus");
        const legendGroup = svg.append("g").attr("class", "legendGroup");
        const loadingGroup = d3.select(chartRootNode).selectAll("#loading");

        let x, y;
        let newDataObj;
        let getColor = (key) => {
          let color;
          switch (key) {
            case "dN":
              color = "rgb(201, 23, 30)";
              break;
            case "dE":
              color = "rgb(49, 103, 69)";
              break;
            case "dU":
              color = "rgb(0, 123, 187)";
              break;
            default:
              color = "black";
              break;
          }

          return color;
        };
        let loadingObj = {
          flag: false,
          timeOut: null,
        };
        let loadingEffect = (flag = true) => {
          const transitionDuration = 200;

          if (loadingObj.flag) loadingObj.timeOut.stop();

          switch (flag) {
            case true:
              d3.timeout(() => {
                loadingGroup.style("opacity", 1).style("display", "inline");
              }, 0);
              break;
            case false:
              loadingObj.timeOut = d3.timeout(() => {
                loadingGroup
                  .transition()
                  .duration(transitionDuration)
                  .style("opacity", 0);
                d3.timeout(
                  () => loadingGroup.style("display", "none"),
                  transitionDuration
                );
                loadingObj.flag = false;
              }, transitionDuration);
              break;
          }
          loadingObj.flag = flag;
        };

        function getNewData(controlObj = {}) {
          let xAxis_domain = controlObj.hasOwnProperty("xAxis_domain")
            ? controlObj.xAxis_domain
            : null;

          const getData = (xAxis_domain) => {
            let newData = data.map((d) => ({ x: d.date, y: d[cha] }));
            if (xAxis_domain) {
              let dateArr = data.map((d) => d.date);
              let idx_domain = xAxis_domain.map(
                (d, i) => d3.bisectCenter(dateArr, d) + i //包含最大範圍
              );

              newData = newData.slice(...idx_domain);
            }
            return newData;
          };

          let newData = getData(xAxis_domain);

          return {
            newData,
            xAxis_domain: xAxis_domain,
          };
        }
        function updateChart(trans = false) {
          function init() {
            const legend_items = [cha, "reg."];
            svg
              .append("g")
              .attr("class", "legend")
              .style("font-size", "12px")
              .call((legend) => {
                const path_width = 50;
                const path_interval = 50;
                const path_margin_horizontal = 10;

                const legend_width =
                  (path_width + path_interval) * legend_items.length +
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
                  .data(legend_items)
                  .join("g")
                  .call((g) => {
                    g.append("line")
                      .attr("stroke-width", 3)
                      .attr("stroke-opacity", 1)
                      .attr("stroke", (d) => getColor(d))
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
                      .text((d) => d);
                  });

                legend.attr(
                  "transform",
                  `translate(${width - margin.right - legend_width}, ${
                    margin.top * 0.3
                  })`
                );
              });
          }
          function render() {
            console.debug(newDataObj);
            function getDateDiff(dateArr) {
              let diffTime = Math.abs(dateArr[1] - dateArr[0]);
              let diffDays = diffTime / (1000 * 60 * 60 * 24);
              return diffDays;
            }
            let options = { logScale: [] };
            let yAxisOption = {};
            let newData = newDataObj.newData;

            let x_domain = options.xDomain
              ? options.xDomain
              : d3.extent(newData, (d) => d.x);
            let x_diff = getDateDiff(x_domain);

            x = d3["scaleUtc"]()
              .domain(
                x_domain.map((d, i) =>
                  new Date(d).setDate(
                    d.getDate() + (i ? 1 : -1) * x_diff * 0.01
                  )
                )
              )
              .range([margin.left, width - margin.right]);

            y = d3[options.logScale.y ? "scaleLog" : "scaleLinear"]()
              .domain(d3.extent(newData, (d) => d.y))
              .range([height - margin.bottom, margin.top]);
            y.nice();
            // console.debug(x.domain(), y.domain());

            let refreshText = () => {
              xAxis.select(".axis_name").text();

              yAxis.select(".axis_name").text();
            };
            let updateAxis = () => {
              function formatPower(x) {
                const e = Math.log10(x);
                if (e !== Math.floor(e)) return; // Ignore non-exact power of ten.
                return `10${(e + "").replace(
                  /./g,
                  (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c] || "⁻"
                )}`;
              }

              let makeXAxis = (g) =>
                g
                  .attr("transform", `translate(0,${height - margin.bottom})`)
                  .call((g) => {
                    const tickAmount = Math.floor(width / 80);
                    let getTickValues = (len) => {
                      let tickGap = getDateDiff(x_domain) / (len - 1);
                      let ticks = Array.from(
                        { length: len },
                        (_, i) =>
                          new Date(
                            new Date(x_domain[0]).setDate(
                              x_domain[0].getDate() + i * tickGap
                            )
                          )
                      );
                      ticks[len - 1] = x_domain[1];
                      ticks = ticks
                        .map((d) => d.getTime())
                        .filter((d, i, array) => array.indexOf(d) === i)
                        .map((d) => new Date(d));
                      return ticks;
                    };

                    let axisFun = d3
                      .axisBottom(x)
                      .tickSizeOuter(0)
                      .tickValues(getTickValues(tickAmount))
                      .tickFormat(d3.timeFormat("%Y-%m-%d"));
                    axisFun(g);
                  });

              let makeYAxis = (g) =>
                g
                  .attr("transform", `translate(${margin.left},0)`)
                  .call((g) => {
                    let axisFun = d3.axisLeft(y);
                    yAxisOption.logScale
                      ? axisFun.ticks(
                          Math.log10(y.domain()[1] / y.domain()[0]) + 1,
                          formatPower
                        )
                      : axisFun.ticks(height / 30);
                    axisFun(g);
                  })
                  .call((g) =>
                    g
                      .selectAll("g.yAxis g.tick line")
                      .attr("x2", (d) => width - margin.left - margin.right)
                      .attr("stroke-opacity", 0.2)
                  );

              xAxis.call(makeXAxis);
              yAxis.call(makeYAxis);
            };
            let updateFocus = () => {
              let updateLine = () => {
                let line = (data) => {
                  let pathAttr = d3
                    .line()
                    .defined((d) => !isNaN(d.y))
                    .x((d) => x(d.x))
                    .y((d) => y(d.y));
                  return pathAttr(data);
                };
                focusGroup
                  .selectAll("path")
                  .data([newData])
                  .join("path")
                  .attr("fill", "none")
                  .attr("stroke", getColor(cha))
                  .attr("stroke-width", 0.5)
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
              let updateCircles = () => {
                focusGroup
                  .selectAll("circle")
                  .data(newData)
                  .join("circle")
                  .attr("fill", getColor(cha))
                  .attr("stroke", getColor(cha))
                  .attr("stroke-width", 1)
                  .attr("stroke-opacity", 0.5)
                  .attr("r", 1)
                  .attr("cx", (d) => x(d.x))
                  .attr("cy", (d) => y(d.y));
              };
              updateLine();
              updateCircles();
            };

            updateAxis();
            updateFocus();
            // refreshText();
          }

          if (!newDataObj) {
            newDataObj = getNewData();
            init();
          }
          render();
          loadingEffect(false);
        }
        updateChart();

        function events() {
          //===event eles
          const eventRect = svg.append("g").attr("class", "eventRect");
          const defs = svg.append("defs");
          //====================================tooltip==================================================
          const tooltip = d3
            .select(chartRootNode)
            .select("#chart" + channelArr.indexOf(cha))
            .append("div")
            .attr("class", "tooltip");

          function pathEvent() {
            function init() {
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

              tooltip.html(() => {
                const tooltipHtml = `
                <div class="tooltip-container">
                  <table class="tooltip-table">
                    <tbody>
                      <tr>
                        <th class="tooltip-date" colspan="2"></th>
                      </tr>
                      <tr>
                        <td class="tooltip-channel">
                          <span style="background-color:${getColor(
                            cha
                          )}"></span>
                          <text></text>
                        </td>
                        <td class="tooltip-value"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>`;

                return tooltipHtml;
              });
            }

            //show tooltip
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
                    let action = () => {
                      mouseG.style("display", "none");
                      tooltip.style("display", "none");
                    };
                    action();
                  })
                  .on("mousemove", function (e) {
                    // update tooltip content, line, circles and text when mouse moves
                    let action = () => {
                      let newData = newDataObj.newData;
                      // 獲取鼠標在容器內的相對位置
                      const pointer = d3.pointer(e, this);
                      // console.log(pointer);

                      let mouseOnIdx = d3
                        .bisector((d) => d.x)
                        .center(newData, x.invert(pointer[0]));

                      mouseLine.attr("d", () => {
                        let xPos = pointer[0];
                        let p1 = xPos + "," + y.range()[0];
                        let p2 = xPos + "," + y.range()[1];
                        let d = "M" + p1 + " L" + p2;
                        return d;
                      });

                      mouseG
                        .selectAll(".mouse-per-line")
                        .data([newData])
                        .join("g")
                        .attr("class", "mouse-per-line")
                        .attr("transform", (d) => {
                          let transX = x(newData[mouseOnIdx].x);
                          let transY = y(newData[mouseOnIdx].y);
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

                      const updateTooltip = () => {
                        let data = newData[mouseOnIdx];

                        let box = tooltip.node().getBoundingClientRect();
                        let tooltipW = box.width;
                        let chart_centerX =
                          x.range().reduce((a, b) => b - a) / 2;
                        let mouseX = e.offsetX,
                          mouseY = e.clientY;

                        tooltip.call((div) => {
                          div
                            .select(".tooltip-date")
                            .text(data.x.toISOString().split("T")[0]);
                          div.select(".tooltip-channel>text").text(cha);
                          div.select(".tooltip-value").text(data.y);
                          div
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
                            .style("display", "inline");
                        });

                        tooltip;
                      };

                      mouseG.style("display", "inline");
                      updateTooltip();
                    };
                    action();
                  });
              eventRect.call(mouseMoveBehavior);
            }
            //zoom
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
            init();
            mouseMove();
            mouseDrag();
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
          pathEvent();
          infoBoxDragEvent();
        }
        events();

        return svg.node();
      }

      if (!data) {
        chart.data();
        data = await data;
      }

      const channelArr = ["dN", "dE", "dU"];
      channelArr.forEach((cha, i) => {
        getChartDivHtml(i);
        let chart = chartRootNode.querySelector("#chart" + i);
        getChartMenu(chart, cha);
        let chartNode = getChartSvg(cha);
        chart.append(chartNode);
      });
    }
    //===init once
    if (!chartRootNode.querySelector("#chartsOptions")) init();

    printChart();
  }
  return chart;
}
