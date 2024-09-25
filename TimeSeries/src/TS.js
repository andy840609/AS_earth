function TSchart() {
  let selector = "body";
  let data = null;

  const YEAR_TO_MS = 365.2425 * 24 * 60 * 60 * 1000;
  // Date.prototype.toString = () => 123;
  // console.debug(Date.prototype, new Date().toLocaleTimeString());

  chart.selector = (value) => {
    selector = value;
    return chart;
  };
  chart.data = (csvStr) => {
    function csvJSON(csvStr) {
      let rows = csvStr.trim().split("\n");
      let header = rows.shift().trim().split(",");

      return rows.map((row) => {
        let cols = row.trim().split(",");
        return cols.reduce(
          (acc, col, idx) => ({
            ...acc,
            [header[idx]]:
              header[idx] === "date_float"
                ? new Date((parseFloat(col) - 1970) * YEAR_TO_MS).getTime()
                : parseFloat(col),
          }),
          {}
        );
      });
    }

    data = csvJSON(csvStr);
    console.log("rawData=", data);
    return chart;
  };

  function chart() {
    const chartRootNode = document.querySelector(selector);
    const D3chartRoot = d3.select(chartRootNode);

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
        case "reg.":
          color = "black";
          break;
        default:
          color = "black";
          break;
      }

      return color;
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
    let niceEXP = (number, DP = 2) => {
      return number.toExponential(DP).replace(/e([+\-]?\d+)/i, (match, exp) => {
        let expStr = "";
        if (parseInt(exp) !== 0)
          expStr = ` x 10${(parseInt(exp) + "").replace(
            /./g,
            (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c] || "⁻"
          )}`;
        return expStr;
      });
    };

    function init() {
      chartRootNode.insertAdjacentHTML(
        "beforeend",
        `
      <div class="form-group" id="chartsOptions" style="display: inline;">
          <div class="row">

          <!-- ... plotType ... -->
            <div class="form-group col-lg-3 col-md-4 col-sm-6">
              <label class="col-form-label me-3">Plot</label>
              <div class="btn-group" role="group" aria-label="Basic radio toggle button group">
                <input type="radio" class="btn-check" name="plotType" id="trace" value="trace" autocomplete="off" checked>
                <label class="btn btn-secondary" for="trace">trace</label>
              
                <input type="radio" class="btn-check" name="plotType" id="window" value="window" autocomplete="off">
                <label class="btn btn-secondary" for="window">window</label>
              
                <!-- <input type="radio" class="btn-check" name="plotType" id="overlay" value="overlay" autocomplete="off">
                <label class="btn btn-secondary" for="overlay">overlay</label> -->
              </div>
            </div>

            <!-- ... display ... -->
            <div class="form-group col-lg-3 col-md-4 col-sm-6">
              <label class="col-form-label me-3">Display</label>
              <div class="btn-group btn-group-toggle col-7" role="group">
                <button id="displaySelectButton" type="button" class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">select</button>
                <div class="dropdown-menu" id="displayDropDownMenu" aria-labelledby="displaySelectButton">

                <div class="form-check col-4">
                  <input class="form-check-input  col-4" type="checkbox" id="display_reg" name="reg" checked>
                  <label class="form-check-label text-nowrap col-8" for="display_reg">linear regression</label>
                </div>
                <div class="form-check col-4">
                 <input class="form-check-input  col-4" type="checkbox" id="display_data" name="data" checked>
                 <label class="form-check-label text-nowrap col-8" for="display_data">data</label>
                </div>
                <div class="form-check col-4">
                  <input class="form-check-input  col-4" type="checkbox" id="display_error" name="error" checked>
                  <label class="form-check-label text-nowrap col-8" for="display_error">error bar</label>
                </div>
                <div class="form-check col-4">
                  <input class="form-check-input  col-4" type="checkbox" id="display_slope" name="slope" checked>
                  <label class="form-check-label text-nowrap col-8" for="display_slope">slope label</label>
                </div>
                 <div class="form-check col-4">
                 <input class="form-check-input  col-4" type="checkbox" id="display_legend" name="legend" checked>
                 <label class="form-check-label text-nowrap col-8" for="display_legend">legend</label>
                </div>

                </div>
              </div>
            </div>
            

        </div>

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

      //================plotType change
      D3chartRoot.selectAll('input[name ="plotType"]').on(
        "change",
        async function (e) {
          // console.debug(e, this.value);
          chart.loadingEffect(true);
          // 讓loading先出現
          await new Promise((r) => d3.timeout(() => r(true), 10));

          let chartsOptions = chartRootNode.querySelector("#chartsOptions");
          chartsOptions.querySelector("#otherOptions")?.remove();
          // console.debug(chart);
          // switch (this.value) {
          //   case "overlay":
          //     chartsOptions.insertAdjacentHTML(
          //       "beforeend",
          //       `<div id="otherOptions" class="row">
          //         <!-- ... channel selector ... -->
          //         <div class="dropdown form-group col-lg-3 col-md-4 col-sm-6 d-flex flex-row align-items-start">
          //           <label for="chaSelectButton" class="col-form-label col-5" >Channel</label>
          //           <button class="btn btn-secondary dropdown-toggle col-7" type="button" id="chaSelectButton" data-bs-toggle="dropdown" aria-expanded="false">
          //             select
          //           </button>
          //           <div class="dropdown-menu" aria-labelledby="networkSelectButton" id="chaDropDownMenu">
          //           </div>
          //         </div>

          //         <!-- ... legend ... -->
          //         <div class="dropdown form-group col-lg-3 col-md-4 col-sm-6 d-flex align-items-center flex-row flex-nowrap">
          //           <div class="form-check">
          //             <input class="form-check-input" type="checkbox" id="legendCkb" checked>
          //             <label class="form-check-label" for="legendCkb">
          //               Legend
          //             </label>
          //           </div>
          //         </div>

          //       </div>`
          //     );
          //     break;
          // }

          printChart(this.value);
        }
      );
      //================dropdown-menu內元素被點擊不關閉menu
      D3chartRoot.selectAll(".dropdown-menu").on(
        "click.bs.dropdown",
        function (e) {
          e.stopPropagation();
        }
      );

      //== loading
      let loadingObj = {
        flag: false,
        timeOut: null,
      };
      let loadingEffect = (flag = true) => {
        const loadingGroup = d3.select(chartRootNode).selectAll("#loading");
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
      chart.loadingEffect = loadingEffect;
    }
    async function printChart(plotType) {
      chartRootNode
        .querySelectorAll("#charts>*")
        .forEach((chart) => chart.remove());

      const channelArr = ["dN", "dE", "dU"];
      const errorObj = {
        dN: "sN",
        dE: "sE",
        dU: "sU",
      };

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

      function getTraceChart(cha) {
        const width = 800,
          height = 250;
        const margin = { top: 20, right: 30, bottom: 35, left: 50 };
        const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);
        const legendGroup = svg.append("g").attr("class", "legendGroup");
        const focusGroup = svg
          .append("g")
          .attr("class", "focus")
          .attr("clip-path", "url(#clip)");
        const xAxis = svg.append("g").attr("class", "xAxis");
        const yAxis = svg.append("g").attr("class", "yAxis");

        let x, y;
        let newDataObj;

        function getNewData(controlObj = {}) {
          let xAxis_domain = controlObj.hasOwnProperty("xAxis_domain")
            ? controlObj.xAxis_domain
            : null;

          const getData = (xAxis_domain) => {
            let newData = data.map((d) => ({
              x: d.date_float,
              y: d[cha],
              error: d[errorObj[cha]],
            }));
            if (xAxis_domain) {
              let dateArr = data.map((d) => d.date_float);
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
            // legend
            const legend_items = [cha, "reg."];
            const legend_attr = {
              rect_width: 8,
              rect_textW: 30,
              rect_margin: 7,
              get legend_width() {
                return (
                  legend_attr.rect_width +
                  legend_attr.rect_textW +
                  legend_attr.rect_margin * 2
                );
              },
              get legend_height() {
                return (
                  (legend_attr.rect_width + legend_attr.rect_margin) *
                    legend_items.length +
                  legend_attr.rect_margin
                );
              },
            };

            legendGroup
              .attr(
                "transform",
                `translate(${
                  width - margin.right - legend_attr.legend_width
                }, ${margin.top * 0.3})`
              )
              .append("g")
              .attr("class", "legend")
              .style("font-size", "12px")
              .call((legend) => {
                legend
                  .append("rect")
                  .attr("height", legend_attr.legend_height)
                  .attr("width", legend_attr.legend_width)
                  .attr("fill", "#D3D3D3")
                  .attr("opacity", 0.5)
                  .attr("stroke-width", "1")
                  .attr("stroke", "black")
                  .attr("stroke-opacity", 0.8);

                legend
                  .selectAll("g")
                  .data(legend_items)
                  .join("g")
                  .attr("class", "legend_itemG")
                  .call((g) => {
                    g.append("rect")
                      .attr("x", legend_attr.rect_margin)
                      .attr(
                        "y",
                        (_, i) =>
                          legend_attr.rect_margin +
                          i * (legend_attr.rect_width + legend_attr.rect_margin)
                      )
                      .attr("height", legend_attr.rect_width)
                      .attr("width", legend_attr.rect_width)
                      .attr("fill", (d) => getColor(d));

                    g.append("text")
                      .attr("font-weight", "bold")
                      .attr("text-anchor", "start")
                      .attr("alignment-baseline", "middle")
                      .attr(
                        "x",
                        legend_attr.rect_margin * 2 + legend_attr.rect_width
                      )
                      .attr(
                        "y",
                        (d, i) =>
                          legend_attr.rect_margin +
                          legend_attr.rect_width * 0.5 +
                          i * (legend_attr.rect_width + legend_attr.rect_margin)
                      )
                      .text((d) => d);
                  });
              });

            // groups for data and reg.
            focusGroup.call((focusG) => {
              focusG.append("g").attr("class", "regGroup");
              focusG
                .append("g")
                .attr("class", "dataGroup")
                .append("g")
                .attr("class", "dataCircles");
            });

            //===遮罩讓path和事件不超出邊界
            svg
              .append("defs")
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

            //==slopeText
            yAxis
              .append("g")
              .attr("class", "slopeTextG")
              .call((g) => {
                g.append("text")
                  .attr("fill", "currentColor")
                  .attr("y", margin.top * 0.7)
                  .attr("text-anchor", "start")
                  .attr("font-weight", "bold")
                  .attr("font-size", "13");
              });

            //== title
            xAxis
              .append("text")
              .attr("class", "axis_name")
              .attr("fill", "black")
              .attr("font-weight", "bold")
              .attr("x", width / 2)
              .attr("y", margin.top + 10)
              .attr("font-size", "13")
              .text("Date");

            yAxis
              .append("text")
              .attr("class", "axis_name")
              .attr("fill", "black")
              .attr("font-weight", "bold")
              .attr("font-size", "10")
              .style("text-anchor", "middle")
              .attr("alignment-baseline", "text-after-edge")
              .attr("transform", "rotate(-90)")
              .attr("x", -height / 2)
              .attr("y", -margin.left + 13)
              .attr("font-size", "13")
              .text(`${cha} (mm)`);
          }
          function render() {
            console.debug(newDataObj);
            function getDateDiff(dateArr) {
              let diffTime = Math.abs(dateArr[1] - dateArr[0]);
              let diffDays = diffTime / (1000 * 60 * 60 * 24);
              return diffDays;
            }
            let newData = newDataObj.newData;
            //==之後能加logScale
            let logScale = false;
            let x_domain = newDataObj.xAxis_domain ?? [
              newData[0].x,
              newData[newData.length - 1].x,
            ];

            let x_diff = getDateDiff(x_domain);

            x = d3["scaleUtc"]()
              .domain(
                newDataObj.xAxis_domain ??
                  x_domain.map((d, i) =>
                    new Date(d).setDate(
                      new Date(d).getDate() + (i ? 1 : -1) * x_diff * 0.01
                    )
                  )
              )
              .range([margin.left, width - margin.right]);

            y = d3[logScale ? "scaleLog" : "scaleLinear"]()
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
                      let ticks = Array.from({ length: len }, (_, i) =>
                        new Date(x_domain[0]).setDate(
                          new Date(x_domain[0]).getDate() + i * tickGap
                        )
                      );
                      ticks[len - 1] = x_domain[1];

                      //==去除zoom後重複的tick
                      ticks = ticks
                        .map((d) => d)
                        .filter((d, i, array) => array.indexOf(d) === i)
                        .map((d) => new Date(d));
                      // console.debug("ticks", ticks);
                      return ticks;
                    };

                    let axisFun = d3
                      .axisBottom(x)
                      .tickSizeOuter(0)
                      .tickValues(getTickValues(tickAmount))
                      .tickFormat(d3.utcFormat("%Y-%m-%d"));
                    axisFun(g);
                  });

              let makeYAxis = (g) =>
                g
                  .attr("transform", `translate(${margin.left},0)`)
                  .call((g) => {
                    let axisFun = d3.axisLeft(y);
                    logScale
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
              let dataGroup = focusGroup.select("g.dataGroup"),
                regGroup = focusGroup.select("g.regGroup");

              let updateLine = () => {
                let line = (data) => {
                  let pathAttr = d3
                    .line()
                    .defined((d) => !isNaN(d.y))
                    .x((d) => x(d.x))
                    .y((d) => y(d.y));
                  return pathAttr(data);
                };
                dataGroup
                  .selectAll("path.dataLine")
                  .data([newData])
                  .join("path")
                  .attr("class", "dataLine")
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
                dataGroup
                  .select("g.dataCircles")
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
              let updateRegLine = () => {
                let linearReg = d3
                  .regressionLinear()
                  .x((d) => d.x)
                  .y((d) => d.y)
                  .domain(x.domain());
                let regData = linearReg(newData);

                regGroup
                  .selectAll("line")
                  .data([regData])
                  .join("line")
                  .attr("class", "regression")
                  .attr("stroke", getColor("reg."))
                  .attr("stroke-width", 1)
                  .attr("stroke-opacity", 0.8)
                  .attr("stroke-linejoin", "round")
                  .attr("stroke-linecap", "round")
                  .attr("x1", (d) => x(d[0][0]))
                  .attr("x2", (d) => x(d[1][0]))
                  .attr("y1", (d) => y(d[0][1]))
                  .attr("y2", (d) => y(d[1][1]));

                // console.debug("Reg=", regData);

                //== slope text
                yAxis
                  .selectAll(".slopeTextG>text")
                  .text(`slope = ${(regData.a * YEAR_TO_MS).toFixed(2)} mm/yr`);
              };
              let updateErrorBars = () => {
                let area = (data) => {
                  const area = d3
                    .area()
                    .x((d) => x(d.x))
                    .y0((d) => y(d.y - d.error))
                    .y1((d) => y(d.y + d.error));
                  return area(data);
                };
                dataGroup
                  .selectAll("path.errorBar")
                  .data([newData])
                  .join("path")
                  .attr("class", "errorBar")
                  .attr("opacity", 0.4)
                  .attr("fill", getColor(cha))
                  .call((path) => {
                    if (trans) path.transition().duration(1000).attr("d", area);
                    else path.attr("d", area);
                  });
              };
              updateErrorBars();
              updateLine();
              updateCircles();
              updateRegLine();
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
          chart.loadingEffect(false);
        }
        updateChart();

        function events() {
          //===event eles
          const eventRect = svg.append("g").attr("class", "eventRect");
          //====================================tooltip==================================================
          const tooltip = d3
            .select(chartRootNode)
            .select("#chart" + channelArr.indexOf(cha))
            .append("div")
            .attr("class", "tooltip");

          function pathEvent() {
            function init() {
              //===遮罩讓事件不超出邊界
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
                          mouseY = e.offsetY;

                        tooltip.call((div) => {
                          div
                            .select(".tooltip-date")
                            .text(new Date(data.x).toISOString().split(".")[0]);
                          div.select(".tooltip-channel>text").text(cha);
                          div
                            .select(".tooltip-value")
                            .text(`${data.y} ± ${data.error}`);
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

                  chart.loadingEffect(true);
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
            legendGroup.call(raiseAndDrag);
          }
          function chartOptionEvent() {
            // console.debug(cha);
            if (cha !== channelArr[channelArr.length - 1]) return;

            //=====display
            let displayEles = {
              get data() {
                return D3chartRoot.selectAll(
                  ".focus .dataGroup>:not(.errorBar)"
                );
              },
              get error() {
                return D3chartRoot.selectAll(".focus .dataGroup>.errorBar");
              },
              get reg() {
                return D3chartRoot.selectAll(".focus .regGroup");
              },
              get legend() {
                return D3chartRoot.selectAll(".legendGroup");
              },
              get slope() {
                return D3chartRoot.selectAll(".yAxis .slopeTextG");
              },
            };

            D3chartRoot.selectAll("#displayDropDownMenu input")
              .property("checked", true)
              .on("click", function (e) {
                displayEles[this.name].style(
                  "display",
                  this.checked ? "inline" : "none"
                );
              });
          }
          pathEvent();
          infoBoxDragEvent();
          chartOptionEvent();
        }
        events();

        return svg.node();
      }
      function getWindowChart() {
        const channelArr_reverse = [...channelArr].reverse();

        const width = 800,
          height = 500,
          height2 = 65,
          margin = { top: 20, right: 30, bottom: 35, left: 50 };
        const svg = d3
          .create("svg")
          .attr("viewBox", [0, 0, width, height + height2]);
        const legendGroup = svg.append("g").attr("class", "legendGroup");
        const focusGroup = svg
          .append("g")
          .attr("class", "focus")
          .attr("clip-path", "url(#clip)");
        const xAxis = svg.append("g").attr("class", "xAxis");
        const yAxis = svg.append("g").attr("class", "yAxis");

        let x, y;
        let newDataObj;
        // console.debug(index);
        function getNewData(controlObj = {}) {
          let xAxis_domain = controlObj.hasOwnProperty("xAxis_domain")
            ? controlObj.xAxis_domain
            : null;

          const getData = (xAxis_domain) => {
            let newData = channelArr_reverse.reduce((acc, cha) => {
              return {
                ...acc,
                [cha]: data.map((d) => ({
                  x: d.date_float,
                  y: d[cha],
                  error: d[errorObj[cha]],
                })),
              };
            }, {});

            // console.log(xAxis_domain);
            if (xAxis_domain) {
              let dateArr = data.map((d) => d.date_float);
              let idx_domain = xAxis_domain.map(
                (d, i) => d3.bisectCenter(dateArr, d) + i //包含最大範圍
              );

              Object.keys(newData).forEach((cha) => {
                newData[cha] = newData[cha].slice(...idx_domain);
              });
            }
            return newData;
          };
          const getDataRange = (data) => {
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

            let supData = channelArr_reverse.map((cha) => {
              let domain = d3.extent(data[cha], (d) => d.y);
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
          };

          let newData = getData(xAxis_domain);
          let chartData =
            newData[channelArr_reverse[0]].length > 1
              ? getDataRange(newData)
              : newDataObj.chartData;

          return {
            newData,
            xAxis_domain,
            chartData,
          };
        }
        function updateChart(trans = false) {
          function init() {
            // legend
            const legend_items = [...channelArr, "reg."];
            const legend_attr = {
              rect_width: 8,
              rect_textW: 30,
              rect_margin: 7,
              get legend_width() {
                return (
                  legend_attr.rect_width +
                  legend_attr.rect_textW +
                  legend_attr.rect_margin * 2
                );
              },
              get legend_height() {
                return (
                  (legend_attr.rect_width + legend_attr.rect_margin) *
                    legend_items.length +
                  legend_attr.rect_margin
                );
              },
            };

            legendGroup
              .attr(
                "transform",
                `translate(${
                  width - margin.right - legend_attr.legend_width
                }, ${margin.top * 0.3})`
              )
              .append("g")
              .attr("class", "legend")
              .style("font-size", "12px")
              .call((legend) => {
                legend
                  .append("rect")
                  .attr("height", legend_attr.legend_height)
                  .attr("width", legend_attr.legend_width)
                  .attr("fill", "#D3D3D3")
                  .attr("opacity", 0.5)
                  .attr("stroke-width", "1")
                  .attr("stroke", "black")
                  .attr("stroke-opacity", 0.8);

                legend
                  .selectAll("g")
                  .data(legend_items)
                  .join("g")
                  .attr("class", "legend_itemG")
                  .call((g) => {
                    g.append("rect")
                      .attr("x", legend_attr.rect_margin)
                      .attr(
                        "y",
                        (_, i) =>
                          legend_attr.rect_margin +
                          i * (legend_attr.rect_width + legend_attr.rect_margin)
                      )
                      .attr("height", legend_attr.rect_width)
                      .attr("width", legend_attr.rect_width)
                      .attr("fill", (d) => getColor(d));

                    g.append("text")
                      .attr("font-weight", "bold")
                      .attr("text-anchor", "start")
                      .attr("alignment-baseline", "middle")
                      .attr(
                        "x",
                        legend_attr.rect_margin * 2 + legend_attr.rect_width
                      )
                      .attr(
                        "y",
                        (d, i) =>
                          legend_attr.rect_margin +
                          legend_attr.rect_width * 0.5 +
                          i * (legend_attr.rect_width + legend_attr.rect_margin)
                      )
                      .text((d) => d);
                  });
              });

            // groups for data and reg.
            focusGroup
              .selectAll("g")
              .data(channelArr_reverse)
              .join("g")
              .attr("class", "channelGroup")
              .call((channelG) => {
                channelG.append("g").attr("class", "regGroup");
                channelG
                  .append("g")
                  .attr("class", "dataGroup")
                  .append("g")
                  .attr("class", "dataCircles");
              });

            //===遮罩讓path和事件不超出邊界
            svg
              .append("defs")
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

            //==slopeText
            yAxis
              .append("g")
              .attr("class", "slopeTextG")
              .call((g) => {
                g.append("text")
                  .attr("fill", "currentColor")
                  .attr("y", margin.top * 0.7)
                  .attr("text-anchor", "start")
                  .attr("font-weight", "bold")
                  .attr("font-size", "13");
              });

            //== title
            xAxis
              .append("text")
              .attr("class", "axis_name")
              .attr("fill", "black")
              .attr("font-weight", "bold")
              .attr("x", width / 2)
              .attr("y", margin.top + 10)
              .attr("font-size", "13")
              .text("Date");
          }
          function render() {
            console.debug(newDataObj);
            function getDateDiff(dateArr) {
              let diffTime = Math.abs(dateArr[1] - dateArr[0]);
              let diffDays = diffTime / (1000 * 60 * 60 * 24);
              return diffDays;
            }
            const newData = newDataObj.newData;
            const chartData = newDataObj.chartData;
            let supData = chartData.supData,
              tickRange = chartData.tickRange,
              tickPower = chartData.tickPower,
              tickValues = chartData.tickValues;

            let tmpData = newData[channelArr_reverse[0]];
            let x_domain = newDataObj.xAxis_domain ?? [
              tmpData[0].x,
              tmpData[tmpData.length - 1].x,
            ];
            let x_diff = getDateDiff(x_domain);

            x = d3["scaleUtc"]()
              .domain(
                newDataObj.xAxis_domain ??
                  x_domain.map((d, i) =>
                    new Date(d).setDate(
                      new Date(d).getDate() + (i ? 1 : -1) * x_diff * 0.01
                    )
                  )
              )
              .range([margin.left, width - margin.right]);

            y = d3
              .scaleLinear()
              .domain([supData[0].supMin, supData[supData.length - 1].supMax])
              .range([height - margin.bottom, margin.top]);

            let updateAxis = () => {
              let makeXAxis = (g) =>
                g
                  .attr("transform", `translate(0,${height - margin.bottom})`)
                  .call((g) => {
                    const tickAmount = Math.floor(width / 80);
                    let getTickValues = (len) => {
                      let tickGap = getDateDiff(x_domain) / (len - 1);
                      let ticks = Array.from({ length: len }, (_, i) =>
                        new Date(x_domain[0]).setDate(
                          new Date(x_domain[0]).getDate() + i * tickGap
                        )
                      );
                      ticks[len - 1] = x_domain[1];

                      //==去除zoom後重複的tick
                      ticks = ticks
                        .map((d) => d)
                        .filter((d, i, array) => array.indexOf(d) === i)
                        .map((d) => new Date(d));
                      // console.debug("ticks", ticks);
                      return ticks;
                    };

                    let axisFun = d3
                      .axisBottom(x)
                      .tickSizeOuter(0)
                      .tickValues(getTickValues(tickAmount))
                      .tickFormat(d3.utcFormat("%Y-%m-%d"));
                    axisFun(g);
                  });
              let makeYAxis = (g) =>
                g.attr("transform", `translate(${margin.left},0)`).call((g) => {
                  //==計算tick要扣多少
                  let supMaxArr = supData.map((d) => d.supMax),
                    cha_idx = 0;

                  //==移除上次多的分隔線和title
                  yAxis.selectAll("g.dividerTick").remove();

                  let axis = d3
                    .axisLeft(y)
                    .tickValues(tickValues)
                    .tickFormat(function (v, i) {
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
                          .attr("fill", getColor(channelArr_reverse[cha_idx]));

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
                              .selectAll("text.newTick")
                              .data([0])
                              .join("text")
                              .attr("class", "newTick")
                              .attr("font-weight", "bold")
                              .attr(
                                "fill",
                                getColor(channelArr_reverse[cha_idx - 1])
                              )
                              .attr("x", tick_x)
                              .attr("dy", 8)
                              .text(val);
                          }

                          //多兩個title（channel和slope）
                          tick.attr("class", "dividerTick").call((g) => {
                            g.selectAll("text.dividerLabel")
                              .data([0])
                              .join("text")
                              .attr("class", "dividerLabel")
                              .attr("fill", "currentColor")
                              .attr("text-anchor", "start")
                              .attr("alignment-baseline", "before-edge")
                              .attr("x", 2)
                              .attr("font-weight", "bold")
                              .attr("font-size", "13");
                            // .text(
                            //   channelArr_reverse[
                            //     cha_idx - (i == tickValues.length - 1 ? 0 : 1)
                            //   ]
                            // );

                            let title_chaIdx =
                              cha_idx - (i == tickValues.length - 1 ? 0 : 1);
                            g.selectAll("text.axis_name")
                              .data([0])
                              .join("text")
                              .attr("class", "axis_name")
                              .attr(
                                "fill",
                                getColor(channelArr_reverse[title_chaIdx])
                              )
                              .attr("font-weight", "bold")
                              .attr("font-size", "10")
                              .style("text-anchor", "middle")
                              .attr("alignment-baseline", "text-before-edge")
                              .attr("transform", "rotate(-90)")
                              .attr(
                                "x",
                                (y(supData[title_chaIdx].supMax) -
                                  y(supData[title_chaIdx].supMin)) /
                                  2
                              )
                              .attr("y", -margin.left + 8)
                              .attr("font-size", "13")
                              .text(`${channelArr_reverse[title_chaIdx]} (mm)`);

                            // console.debug("cha_idx", title_chaIdx);
                          });
                        }

                        //tick line
                        tick
                          .select("line")
                          .attr("x2", width - margin.left - margin.right)
                          .attr("stroke-opacity", isDivider ? 1 : 0.2);
                      });

                      // return toEXP(val, tickPower)[0];
                      return val;
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
            let updateFocus = () => {
              let dataGroups = focusGroup.selectAll("g.dataGroup"),
                regGroups = focusGroup.selectAll("g.regGroup");

              let updateLine = () => {
                let lineSup = (data, index) => {
                  let supRange = supData[index].supRange;
                  let line = d3
                    .line()
                    .defined((d) => !isNaN(d.y))
                    .x((d) => x(d.x))
                    .y((d) => y(d.y + supRange));
                  return line(data);
                };
                dataGroups.call((groups) => {
                  // console.log(groups);
                  groups.each(function (cha, i) {
                    let dataG = d3.select(this);
                    dataG
                      .selectAll("path.dataLine")
                      .data([cha])
                      .join("path")
                      .attr("class", "dataLine")
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
                            .attr("d", lineSup(newData[cha], i));
                        else path.attr("d", lineSup(newData[cha], i));
                      });
                  });
                });
              };
              let updateCircles = () => {
                dataGroups.call((groups) => {
                  groups.each(function (cha, i) {
                    // console.log(cha, i);
                    let dataG = d3.select(this);
                    dataG
                      .select("g.dataCircles")
                      .selectAll("circle")
                      .data(newData[cha])
                      .join("circle")
                      .attr("fill", getColor(cha))
                      .attr("stroke", getColor(cha))
                      .attr("stroke-width", 1)
                      .attr("stroke-opacity", 0.5)
                      .attr("r", 1)
                      .attr("cx", (d) => x(d.x))
                      .attr("cy", (d) => y(d.y + supData[i].supRange));
                  });
                });
              };
              let updateRegLine = () => {
                let linearReg = d3
                  .regressionLinear()
                  .x((d) => d.x)
                  .y((d) => d.y)
                  .domain(x.domain());

                regGroups.call((groups) => {
                  // console.log(groups);

                  groups.each(function (cha, i) {
                    let regData = linearReg(newData[cha]);
                    let regG = d3.select(this);

                    regG
                      .selectAll("line")
                      .data([regData])
                      .join("line")
                      .attr("class", "regression")
                      .attr("stroke", getColor("reg."))
                      .attr("stroke-width", 1)
                      .attr("stroke-opacity", 0.8)
                      .attr("stroke-linejoin", "round")
                      .attr("stroke-linecap", "round")
                      .attr("x1", (d) => x(d[0][0]))
                      .attr("x2", (d) => x(d[1][0]))
                      .attr("y1", (d) => y(d[0][1] + supData[i].supRange))
                      .attr("y2", (d) => y(d[1][1] + supData[i].supRange));

                    // console.debug("Reg=", regData);

                    //== slope text
                    yAxis
                      .selectAll("text.dividerLabel")
                      .filter((_, text_i) => text_i === i)
                      .style(
                        "display",
                        D3chartRoot.select(
                          "#displayDropDownMenu input[name='slope']"
                        ).property("checked")
                          ? "inline"
                          : "none"
                      )
                      .text(
                        `slope = ${(regData.a * YEAR_TO_MS).toFixed(2)} mm/yr`
                      );
                  });
                });
              };
              let updateErrorBars = () => {
                let areaSup = (data, index) => {
                  let supRange = supData[index].supRange;
                  const area = d3
                    .area()
                    .x((d) => x(d.x))
                    .y0((d) => y(d.y - d.error + supRange))
                    .y1((d) => y(d.y + d.error + supRange));
                  return area(data);
                };
                dataGroups.call((groups) => {
                  // console.log(groups);
                  groups.each(function (cha, i) {
                    let dataG = d3.select(this);
                    dataG
                      .selectAll("path.errorBar")
                      .data([cha])
                      .join("path")
                      .attr("class", "errorBar")
                      .attr("opacity", 0.4)
                      .attr("fill", getColor(cha))
                      // .attr("stroke", getColor(cha))
                      // .attr("stroke-width", 3)
                      // .attr("stroke-linejoin", "round")
                      // .attr("stroke-linecap", "round")
                      .call((path) => {
                        if (trans)
                          path
                            .transition()
                            .duration(1000)
                            .attr("d", areaSup(newData[cha], i));
                        else path.attr("d", areaSup(newData[cha], i));
                      });
                  });
                });
              };
              updateErrorBars();
              updateLine();
              updateCircles();
              updateRegLine();
            };
            updateAxis();
            updateFocus();
          }

          if (!newDataObj) {
            //===預設選項
            newDataObj = getNewData();
            init();
          }
          render();
          chart.loadingEffect(false);
        }

        updateChart();
        function events() {
          //===event eles
          const eventRect = svg.append("g").attr("class", "eventRect");
          //====================================tooltip==================================================
          const tooltip = d3
            .select(chartRootNode)
            .select("#chart0")
            .append("div")
            .attr("class", "tooltip");

          function pathEvent() {
            function init() {
              //===遮罩讓事件不超出邊界
              eventRect.append("use").attr("xlink:href", "#chartRenderRange");

              tooltip.html(() => {
                const tooltipHtml = `
                <div class="tooltip-container">
                  <table class="tooltip-table">
                    <tbody>
                      <tr>
                        <th class="tooltip-date" colspan="2"></th>
                      </tr>
                      ${channelArr
                        .map(
                          (cha) => `
                        <tr>
                          <td class="tooltip-channel">
                            <span style="background-color:${getColor(
                              cha
                            )}"></span>
                            <text></text>
                          </td>
                          <td class="tooltip-value"></td>
                        </tr>`
                        )
                        .join("")}
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
                        xData = newData[channelArr_reverse[0]].map((d) => d.x);

                      const pointer = d3.pointer(e, this);
                      let mouseOnIdx = d3.bisectCenter(
                        xData,
                        x.invert(pointer[0])
                      );

                      mouseLine.attr("d", () => {
                        let xPos = pointer[0];
                        let p1 = xPos + "," + y.range()[0];
                        let p2 = xPos + "," + y.range()[1];
                        let d = "M" + p1 + " L" + p2;
                        return d;
                      });

                      mouseG
                        .selectAll(".mouse-per-line")
                        .data(channelArr_reverse)
                        .join("g")
                        .attr("class", "mouse-per-line")
                        .attr("transform", (cha, i) => {
                          let supRange = chartData.supData[i].supRange;
                          let transX = x(newData[cha][mouseOnIdx].x);
                          let transY = y(newData[cha][mouseOnIdx].y + supRange);
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
                                        ? getColor(channelArr_reverse[i])
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

                      const updateTooltip = () => {
                        let date = xData[mouseOnIdx];
                        // console.log(x, xData[mouseOnIdx]);

                        let box = tooltip.node().getBoundingClientRect();
                        let tooltipW = box.width;
                        let chart_centerX =
                          x.range().reduce((a, b) => b - a) / 2;
                        let mouseX = e.offsetX,
                          mouseY = e.offsetY;

                        tooltip.call((div) => {
                          div
                            .select(".tooltip-date")
                            .text(new Date(date).toISOString().split(".")[0]);

                          div
                            .selectAll(".tooltip-channel")
                            .each(function (_, i) {
                              let cha = channelArr[i],
                                d = newData[cha][mouseOnIdx];

                              let tr = d3.select(this.parentNode);
                              tr.select(".tooltip-channel>text").text(cha);
                              tr.select(".tooltip-value").text(
                                `${d.y} ± ${d.error}`
                              );
                            });

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

                  if (newDataObj.newData[channelArr_reverse[0]].length > 1) {
                    chart.loadingEffect(true);
                    updateChart();
                  }

                  selectionRect.remove();
                  updateBrush(xAxis_domain);
                });
              eventRect.call(dragBehavior);
            }
            init();
            mouseMove();
            mouseDrag();
          }
          function brushEvent() {
            const chaIdx = channelArr_reverse.length - 1,
              cha = channelArr_reverse[chaIdx];

            let brushArea = svg
              .append("g")
              .attr("class", "brushArea")
              .attr("transform", `translate(0,${height})`);

            brushArea
              .selectAll("path")
              .data([newDataObj.newData[cha]])
              .join("path")
              .attr("fill", "none")
              .attr("stroke-width", 1)
              .attr("stroke-linejoin", "round")
              .attr("stroke-linecap", "round")
              .attr("stroke-opacity", 1)
              .attr("stroke", "#272727")
              .attr("d", (d) => {
                // console.debug(d);
                let chaChartData = newDataObj.chartData.supData[chaIdx];
                let y2 = d3
                  .scaleLinear()
                  .domain([chaChartData.min, chaChartData.max])
                  .range([height2 - margin.bottom, 0]);

                let line2 = (data) => {
                  let pathAttr = d3
                    .line()
                    .defined((d) => !isNaN(d.y))
                    .x((d) => x(d.x))
                    .y((d) => y2(d.y));

                  return pathAttr(data);
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
                if (newDataObj.newData[cha].length) updateChart();
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
            legendGroup.call(raiseAndDrag);
          }
          function chartOptionEvent() {
            //=====display
            let displayEles = {
              data: focusGroup.selectAll(".dataGroup>:not(.errorBar)"),
              error: focusGroup.selectAll(".dataGroup>.errorBar"),
              reg: focusGroup.selectAll(".regGroup"),
              legend: legendGroup,
              get slope() {
                return yAxis.selectAll(".dividerLabel");
              },
              // get data() {
              //   return focusGroup.selectAll(".dataGroup>:not(.errorBar)");
              // },
              // get error() {
              //   return focusGroup.selectAll(".dataGroup>.errorBar");
              // },
            };

            D3chartRoot.selectAll("#displayDropDownMenu input")
              .property("checked", true)
              .on("click", function (e) {
                displayEles[this.name].style(
                  "display",
                  this.checked ? "inline" : "none"
                );
              });
          }
          pathEvent();
          infoBoxDragEvent();
          chartOptionEvent();
          let updateBrush = brushEvent();
        }
        events();

        return svg.node();
      }

      // if (!data) {
      //   chart.data();
      //   data = await data;
      //   console.log("data= ", data);
      // }
      // console.log("data= ", data);
      switch (plotType) {
        default:
        case "trace":
          channelArr.forEach((cha, i) => {
            getChartDivHtml(i);
            let chart = chartRootNode.querySelector("#chart" + i);
            getChartMenu(chart, cha);
            let chartNode = getTraceChart(cha);
            chart.append(chartNode);
          });
          break;
        case "window":
          getChartDivHtml(0);
          let window = chartRootNode.querySelector("#chart0");
          getChartMenu(window);
          window.append(getWindowChart());
          break;
        case "overlay":
          // getChartDivHtml(0);
          // let overlay = chartRootNode.querySelector("#chart0");
          // getChartMenu(overlay);
          // overlay.append(overlayChart());
          break;
      }
    }
    //===init once
    if (!chartRootNode.querySelector("#chartsOptions")) init();

    printChart();
  }
  return chart;
}
