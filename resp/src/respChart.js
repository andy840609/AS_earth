function RespChart() {
  let selector = "body";
  let resParam = null;

  chart.selector = (value) => {
    selector = value;
    return chart;
  };
  chart.param = (value) => {
    //default param=[z,p,f0]
    let z = [
      [+0.0, +0.0],
      [+0.0, +0.0],
      [+0.0, +0.0],
      [-3.163e1, +0.0],
      [-1.6e2, +0.0],
      [-3.5e2, +0.0],
      [-3.177e3, +0.0],
    ];
    let p = [
      [-3.6614e-2, +3.7059e-2],
      [-3.6614e-2, -3.7059e-2],
      [-3.255e1, +0.0],
      [-1.42e2, +0.0],
      [-3.64e2, +4.04e2],
      [-3.64e2, -4.04e2],
      [-1.26e3, +0.0],
      [-4.9e3, +5.204e3],
      [-4.9e3, -5.204e3],
      [-7.1e3, +1.7e3],
      [-7.1e3, -1.7e3],
    ];

    resParam =
      value && Object.keys(value).length ? value : { z, p, f0: 1, instType: 1 };
    // console.log("resParam= ", resParam);
    return chart;
  };

  function chart() {
    const chartRootNode = document.querySelector(selector);
    const defaultSetting = {
      logScale: { frq: true, amp: true, phs: false },
      instType: 1,
      f0: 1,
    };

    function init() {
      if (!resParam) chart.param();

      chartRootNode.insertAdjacentHTML(
        "beforeend",
        `
        <div class="form-group" id="chartOptions">
            <div class="row">
              <!-- ... param ... --> 
              <div class="form-group col-lg-3 col-md-3 col-sm-6 d-flex flex-row align-items-start">
                <div class="btn-group btn-group-toggle col-6" role="group">
                    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown"  data-bs-auto-close="false" aria-expanded="false"> 
                    PAZ
                    </button>
                    <div class="dropdown-menu px-3" id="paramMenu">
                        <form class="form-group col-12">
                        
                          <!-- ... example ... --> 
                          <i class="fa-regular fa-circle-question fa-lg d-flex flex-row mb-1" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="Tooltip on right" data-bs-html="true"> 
                            <label>Conventional PAZ file</label>
                          </i>

                          <!-- ... ZEROS ... --> 
                          <div class="form-floating mb-3">
                            <textarea class="form-control" id="zerosInput" name="paramInput" data-key="z"></textarea>
                            <label for="zerosInput">ZEROS</label>
                            <div class="invalid-feedback">
                            Please fix ZEROS.
                            </div>
                          </div>
                          <!-- ... POLES ... --> 
                          <div class="form-floating mb-3">
                            <textarea class="form-control" id="polesInput" name="paramInput" data-key="p"></textarea>
                            <label for="polesInput">POLES</label>
                            <div class="invalid-feedback">
                            Please fix POLES.
                            </div>
                          </div>
                          <!-- ... Instrument Type... --> 
                          <div class="form-floating mb-2">
                            <select class="form-select" id="instType">
                              <option value="0">Displacement</option>
                              <option value="1" selected>Velocity</option>
                              <option value="2">Acceleration</option>
                            </select>
                            <label for="instType">Output Instrument Type</label>
                            <div class="invalid-feedback">
                            Please fix Instrument Type.
                            </div>
                          </div>
                          <!-- ... Normalization Frequency ... --> 
                          <div class="form-floating mb-3">
                            <input type="number" class="form-control" id="f0Input" name="paramInput" data-key="f0" value="1" min="0">
                            <label for="f0Input">Normalization Frequency (Hz)</label>
                            <div class="invalid-feedback">
                            Please fix normalization frequency.
                            </div>
                          </div>
                          <!-- ...Plot Title ... --> 
                          <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="customTitle">
                            <label for="customTitle">Plot Title</label>
                          </div>

                        </form>

                        <div class="form-group col-12">
                          <label id="paramHintLabel" for="paramHintBlock">Hint</label>
                          <div id="paramHintBlock" class="form-text">\
                          Please enter param.
                          </div>
                        </div>

                    </div>
                </div>
              </div>

              <!-- ... Axis ... -->    
              <div class="form-group col-lg-3 col-md-3 col-sm-6 d-flex flex-row align-items-start">        
                  <div class="btn-group btn-group-toggle col-6" role="group">
                      <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">            
                      Axis
                      </button>
                      <div class="dropdown-menu px-3" id="axisMenu">
                          <div class="form-group col-12">
                          
                          <label class="font-weight-bold" for="">logarithmic scale</label>
                          <div class="col-12 d-flex flex-column">
                              <div class="col-12 form-check">
                                  <input class="form-check-input" type="checkbox" name="axisScale" value="frq" id="frq_log" ${
                                    defaultSetting.logScale.frq ? "checked" : ""
                                  }>
                                  <label class="form-check-label" for="frq_log">Frequency</label>
                              </div>
                              <div class="col-12 form-check">
                                  <input class="form-check-input" type="checkbox" name="axisScale" value="amp" id="amp_log" ${
                                    defaultSetting.logScale.amp ? "checked" : ""
                                  }>
                                  <label class="form-check-label" for="amp_log">Amplitude</label>
                              </div>

                          </div>
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
      //================dropdown-menu內元素被點擊不關閉menu

      d3.select(chartRootNode)
        .selectAll(".dropdown-menu")
        .on("click.bs.dropdown", (e) => e.stopPropagation());

      // d3.select(window).on("mouseup", (e) => {
      //   d3.select(chartRootNode).select("#paramMenu").classed("show", false);
      // });
      d3.select(chartRootNode)
        .select("#paramMenu i[data-bs-toggle='tooltip']")
        .call((icon) => {
          let complexToHTML = (paramObj) => {
            const paramNames = {
              z: "ZEROS",
              p: "POLES",
              f0: "Normalization Frequency",
            };

            let getHTML = (key) => {
              return `${paramNames[key]}<br>\
              ${
                key !== "f0"
                  ? paramObj[key]
                      .map((arr) =>
                        arr
                          .map((v) => (v < 0 ? "" : "+") + v.toExponential())
                          .join("  ")
                      )
                      .join("<br>")
                  : paramObj[key]
              }<br>`;
            };

            return (
              "example :<br><br>" +
              ["z", "p"].map((key) => getHTML(key)).join("<br>")
            );
          };
          let text = complexToHTML(resParam);

          new bootstrap.Tooltip(icon.node()).setContent({
            ".tooltip-inner": text,
          });
        });
      // d3.select(chartRootNode)
      //   .selectAll("[data-bs-toggle='tooltip']")
      //   .call((nodes) =>
      //     nodes.each(function () {
      //       new bootstrap.Tooltip(this);
      //     })
      //   );
    }
    function printChart() {
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
                <ul class="dropdown-menu dropdown-menu-end">
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
              let title = "Response";
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

      function getChartSvg() {
        const chartTypes = ["ampChart", "phsChart"];
        const width = 500,
          height = 300;
        const margin = { top: 30, right: 30, bottom: 50, left: 45 };
        const svg = d3.create("svg").attr("viewBox", [0, 0, width, height * 2]);
        const chartGroup = svg.append("g").attr("class", "chartGroup");
        const legendGroup = svg.append("g").attr("class", "legendGroup");
        const loadingGroup = d3.select(chartRootNode).selectAll("#loading");

        let chartElements = chartTypes.reduce((acc, type) => {
          let chartG = chartGroup.append("g").attr("class", type);
          let xAxis = chartG.append("g").attr("class", "xAxis");
          let yAxis = chartG.append("g").attr("class", "yAxis");
          let focusGroup = chartG.append("g").attr("class", "focus");
          return {
            ...acc,
            [type]: { chartG, xAxis, yAxis, focusGroup, x: null, y: null },
          };
        }, {});
        // console.debug(chartElements);

        // let x, y;
        let newDataObj;

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
        let getColor = (type) => ({ ampChart: "red", phsChart: "blue" }[type]);
        function getNewData({ option, newParam }) {
          // console.debug("aaa =", option, newParam);

          let rawData = newParam ? getResData(newParam) : newDataObj.data;
          let chartOption = newDataObj
            ? Object.assign(newDataObj.option, option)
            : option;
          let chartData = chartTypes.reduce((acc, type) => {
            let key = {
              ampChart: "amp",
              phsChart: "phs",
            }[type];

            let newData;
            if (option?.xDomain) {
              let frqArr = rawData.frq;
              let i1 = d3.bisectCenter(frqArr, option.xDomain[0]);
              let i2 = d3.bisectCenter(frqArr, option.xDomain[1]) + 1; //包含最大範圍

              newData = {
                x: rawData.frq.slice(i1, i2),
                y: rawData[key].slice(i1, i2),
              };
            } else {
              newData =
                option?.hasOwnProperty("xDomain") || newParam
                  ? { x: rawData.frq, y: rawData[key] }
                  : Object.assign(
                      { x: rawData.frq, y: rawData[key] },
                      newDataObj?.chart[type].data
                    );
            }

            return {
              ...acc,
              [type]: {
                data: newData,
                options: {
                  logScale: { x: chartOption.frq, y: chartOption[key] },
                  xDomain: chartOption.xDomain,
                },
              },
            };
          }, {});

          // console.log("rawData =", rawData);

          return {
            data: rawData,
            param: newParam ? newParam : newDataObj.param,
            option: chartOption,
            chart: chartData,
          };
        }
        function updateChart(trans = false) {
          function init() {
            const title_size = 21,
              axis_name_size = 13,
              nf_size = 10,
              logo_w = 50,
              logo_h = 27.5;

            let makeText = (type, i) => {
              // console.debug(type, i);
              let { xAxis, yAxis, chartG } = chartElements[type];
              chartG
                .append("g")
                .attr("class", "title")
                .append("text")
                .attr("fill", "currentColor")
                .attr("x", width / 2)
                .attr("y", i * height)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "before-edge")
                .attr("font-weight", "bold")
                .attr("font-size", title_size)
                .text(
                  {
                    ampChart: "Amplitude Response",
                    phsChart: "Phase Response",
                  }[type]
                );

              yAxis
                .append("text")
                .attr("class", "axis_name")
                .attr("fill", "black")
                .attr("font-weight", "bold")
                .attr("font-size", "10")
                .style("text-anchor", "middle")
                .attr("alignment-baseline", "text-before-edge")
                .attr("transform", "rotate(-90)")
                .attr("x", -height * (i + 0.5))
                .attr("y", -margin.left)
                .attr("font-size", axis_name_size)
                .text(
                  {
                    ampChart: "Normalized Amplitude",
                    phsChart: "Phase (deg.)",
                  }[type]
                );

              if (i === chartTypes.length - 1) {
                xAxis
                  .append("text")
                  .attr("class", "axis_name")
                  .attr("fill", "black")
                  .attr("alignment-baseline", "baseline")
                  .attr("font-weight", "bold")
                  .attr("x", width / 2)
                  .attr("y", margin.top)
                  .attr("font-size", axis_name_size)
                  .text("Frequency (Hz)");
              }
            };

            chartGroup
              .append("g")
              .attr("class", "nf")
              .call((g) => {
                //== nf label
                g.append("text")
                  .attr("fill", "currentColor")
                  .attr("x", width - 5)
                  .attr("y", 0)
                  .attr("text-anchor", "end")
                  .attr("alignment-baseline", "before-edge")
                  .attr("font-size", nf_size);
                // .text("A0 @ $fq Hz =");

                g.append("text")
                  .attr("fill", "currentColor")
                  .attr("x", width - 5)
                  .attr("y", nf_size + 2)
                  .attr("text-anchor", "end")
                  .attr("alignment-baseline", "before-edge")
                  .attr("font-size", nf_size);
                // .text("9999");
              })
              .call(async (g) => {
                let getLogo = () => {
                  return fetch("/img/TECDC_logo_sml.jpg")
                    .then((res) => res.blob())
                    .then((blob) => {
                      return new Promise((resolve) => {
                        let reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                      });
                    });
                };
                //== logo
                g.append("text")
                  .attr("fill", "currentColor")
                  .attr("x", width - logo_w)
                  .attr("y", height * 2 - 5)
                  .attr("text-anchor", "end")
                  .attr("alignment-baseline", "after-edge")
                  .attr("font-size", nf_size)
                  .text("Powered by TECDC");

                g.append("svg:image")
                  .attr("x", width - logo_w)
                  .attr("y", height * 2 - logo_h)
                  .attr("width", logo_w)
                  .attr("height", logo_h)
                  .attr("xlink:href", await getLogo());
              });

            chartTypes.forEach((type, i) => makeText(type, i));
          }
          function render() {
            console.debug("newDataObj=", newDataObj);

            let makeChart = (type, i) => {
              let { chartG, xAxis, yAxis, focusGroup } = chartElements[type];

              let chart = newDataObj.chart[type],
                options = chart.options,
                newData = chart.data;

              let x = d3[options.logScale.x ? "scaleLog" : "scaleLinear"]()
                .domain(
                  options.xDomain ? options.xDomain : d3.extent(newData.x)
                )
                .range([margin.left, width - margin.right]);
              if (!options.xDomain) {
                options.logScale.x
                  ? x.domain(x.domain().map((d, i) => d * (i ? 2 : 0.5)))
                  : x.nice();
              }

              let y = d3[options.logScale.y ? "scaleLog" : "scaleLinear"]()
                .domain(i ? [-180, 180] : d3.extent(newData.y))
                .range([
                  height * (i + 1) - margin.bottom,
                  height * i + margin.top,
                ]);
              if (options.logScale.y) y.nice();

              Object.assign(chartElements[type], { x, y });
              // console.debug(d3.extent(newData.x), d3.extent(newData.y));
              // console.debug(x.domain(), y.domain());

              let refreshText = () => {
                // console.debug(newDataObj.data.nf.toExponential(6));

                // update nf
                if (i == 0) {
                  chartGroup.select(".nf").call((g) => {
                    function toEXP(number) {
                      return number
                        .toExponential(6)
                        .replace(/e([+\-]?\d+)/i, (match, exp) => {
                          let expStr = "";
                          if (parseInt(exp) !== 0)
                            expStr = ` x 10${(parseInt(exp) + "").replace(
                              /./g,
                              (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c] || "⁻"
                            )}`;
                          return expStr;
                        });
                    }

                    let fq = newDataObj.param.f0;
                    nf = toEXP(newDataObj.data.nf);

                    g.select("text:nth-child(1)").text(`A0 @ ${fq} Hz =`);
                    g.select("text:nth-child(2)").text(nf);
                  });
                  // chartGroup.select(".nf tspan").text(nf);
                }

                // update title
                chartG.select(".title>text").text(() => {
                  let text = !newDataObj.option.title
                    ? {
                        ampChart: "Amplitude Response",
                        phsChart: "Phase Response",
                      }[type]
                    : i === 0
                    ? newDataObj.option.title
                    : "";

                  return text;
                });
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
                    .attr(
                      "transform",
                      `translate(0,${height * (i + 1) - margin.bottom})`
                    )
                    .call((g) => {
                      let axisFun = d3.axisBottom(x).tickSizeOuter(0);
                      let ticks = chart.options.logScale.x
                        ? [
                            Math.log10(x.domain()[1] / x.domain()[0]) + 1,
                            formatPower,
                          ]
                        : [width / 80];

                      axisFun.ticks(...ticks)(g);
                    })
                    .call((g) =>
                      g
                        .selectAll("g.xAxis g.tick line")
                        .attr("y2", (d) => -height + margin.top + margin.bottom)
                        .attr("stroke-opacity", 0.2)
                    );

                let makeYAxis = (g) =>
                  g
                    .attr("transform", `translate(${margin.left},0)`)
                    .call((g) => {
                      let axisFun = d3.axisLeft(y).tickSizeOuter(0);
                      let ticks = chart.options.logScale.y
                        ? [
                            Math.log10(y.domain()[1] / y.domain()[0]) + 1,
                            formatPower,
                          ]
                        : [height / 30];

                      axisFun.ticks(...ticks)(g);
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
                const line = (data) => {
                  // console.debug(data);

                  let pathAttr = d3
                    .line()
                    .defined((d, i) => !isNaN(data.y[i]))
                    .x((d) => x(d))
                    .y((d, i) => y(data.y[i]));

                  return pathAttr(data.x);
                };

                focusGroup
                  .selectAll("path")
                  .data([newData])
                  .join("path")
                  .attr("fill", "none")
                  .attr("stroke", getColor(type))
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
              updateFocus();
              refreshText();
            };

            chartTypes.forEach((type, i) => makeChart(type, i));
          }

          if (!newDataObj) {
            newDataObj = getNewData({
              option: {
                frq: defaultSetting.logScale.frq,
                amp: defaultSetting.logScale.amp,
                phs: defaultSetting.logScale.phs,
              },
              newParam: resParam,
            });
            init();
          }
          render();
          loadingEffect(false);
        }
        updateChart();

        function events(svg) {
          //===event eles
          const eventGroup = svg.append("g").attr("class", "eventGroup");
          const defs = eventGroup.append("defs");
          const tooltip = d3
            .select(chartRootNode)
            .select("#charts>#chart0")
            .append("div")
            .attr("class", "tooltip");

          function pathEvent() {
            //event_range=[x,y]
            const eventG_data = {
              xRange: [margin.left, width - margin.right],
              yRange: [margin.top, height * 2 - margin.bottom],
              x: margin.left,
              y: margin.top,
              width: width - margin.right - margin.left,
              height: height * 2 - margin.bottom - margin.top,
            };

            //===遮罩讓path和事件不超出邊界
            defs
              .append("clipPath")
              .append("rect")
              .attr("id", "chartRenderRange")
              .attr("x", eventG_data.x)
              .attr("y", eventG_data.y)
              .attr("width", eventG_data.width)
              .attr("height", eventG_data.height)
              .attr("fill", "none")
              .attr("pointer-events", "all");
            eventGroup.append("use").attr("xlink:href", "#chartRenderRange");

            function mouseMove() {
              const mouseMoveG = eventGroup
                .append("g") // create vertical line to follow mouse
                .attr("class", "mouseGroup");
              const mouseLine = mouseMoveG
                .append("path")
                .attr("class", "mouse-line");
              const mouseCircles = mouseMoveG
                .selectAll("g.mouse-circle")
                .data(chartTypes)
                .join("g")
                .attr("class", "mouse-circle");

              let initMoveEle = () => {
                // create vertical line to follow mouse
                mouseMoveG.style("display", "none");

                mouseLine
                  .style("stroke", "#A9A9A9")
                  .style("stroke-width", "1px")
                  .style("opacity", "0.7")
                  .attr("d", () => {
                    let p1 = `0,${eventG_data.y}`,
                      p2 = `0,${eventG_data.yRange[1]}`;
                    return "M" + p1 + " L" + p2;
                  });

                mouseCircles.call((circleG) => {
                  circleG.each(function (type, i) {
                    // console.debug(this, type, i);
                    d3.select(this)
                      .selectAll("circle")
                      .data(d3.range(3))
                      .join("circle")
                      .call((circles) =>
                        circles.each(function (cIdx) {
                          let mainCircle = cIdx % 2 != 0;

                          d3.select(this)
                            .attr("r", cIdx + 3)
                            .style("fill", "none")
                            .style("opacity", "1")
                            .style(
                              "stroke",
                              mainCircle ? getColor(type) : "white"
                            )
                            .style("stroke-width", `${mainCircle ? 2 : 0.5}px`);
                        })
                      );
                  });
                });
              };
              let initTooltip = () => {
                let tooltipHtml = `
                  <label>Frequency : </label><br>
                  <font class="tooltip_frq" size="5">84130.93</font> <label>Hz</label><br>
                  <label>Amplitude : </label><br>
                  <font class="tooltip_amp" size="5">-27.142</font><br>
                  <label>Phase : </label><br>
                  <font class="tooltip_phs" size="5">-27.142</font>`;
                tooltip.html(tooltipHtml);
              };
              let mouseMoveBehavior = (g) => {
                //用來判斷tooltip應該在滑鼠哪邊
                const chartCenter = [
                  eventG_data.x + eventG_data.width * 0.5,
                  eventG_data.y + eventG_data.height * 0.5,
                ];
                //tooltip與滑鼠距離
                const tooltipGap = 50;

                g.on("mouseleave", (e) => {
                  mouseMoveG.style("display", "none");
                  tooltip.style("display", "none");
                }).on("mousemove", function (e) {
                  // update tooltip content, line, circles and text when mouse moves
                  e.preventDefault();

                  let pointer = d3.pointer(e, this);
                  let frqArr = newDataObj.chart[chartTypes[0]].data.x;
                  let frq = chartElements[chartTypes[0]].x.invert(pointer[0]),
                    frqIdx = d3.bisectCenter(frqArr, frq);

                  mouseMoveG.style("display", "inline").call(() => {
                    mouseLine.attr("transform", `translate(${pointer[0]},0)`);

                    mouseCircles.attr("transform", (type, i) => {
                      let chart = newDataObj.chart[type],
                        x = chartElements[type].x,
                        y = chartElements[type].y;

                      let transX = x(chart.data.x[frqIdx]),
                        transY = y(chart.data.y[frqIdx]);
                      return `translate(${transX},${transY})`;
                    });
                  });
                  tooltip.style("display", "inline").call((tooltip) => {
                    let setPosition = () => {
                      let tooltipW = tooltip.property("clientWidth"),
                        tooltipH = tooltip.property("clientHeight");
                      let mouseX = e.offsetX,
                        mouseY = e.offsetY;

                      // 依照滑鼠有無過圖表一半來決定位置
                      let left =
                        mouseX +
                        (pointer[0] < chartCenter[0]
                          ? tooltipGap //tooltip在右
                          : -tooltipW - tooltipGap); //tooltip在左

                      let top =
                        mouseY +
                        (pointer[1] < chartCenter[1]
                          ? tooltipGap //tooltip在下
                          : -tooltipH - tooltipGap); //tooltip在上

                      tooltip
                        .style("top", `${top}px`)
                        .style("left", ` ${left}px`);
                    };
                    let setText = () => {
                      // console.debug(tooltip);
                      let ampArr = newDataObj.chart["ampChart"].data.y,
                        phsArr = newDataObj.chart["phsChart"].data.y;
                      tooltip
                        .select("font.tooltip_frq")
                        .text(frqArr[frqIdx].toFixed(4));
                      tooltip
                        .select("font.tooltip_amp")
                        .text(ampArr[frqIdx].toFixed(4));
                      tooltip
                        .select("font.tooltip_phs")
                        .text(phsArr[frqIdx].toFixed(4));
                    };
                    setPosition();
                    setText();
                  });
                });
              };
              initMoveEle();
              initTooltip();
              eventGroup.call(mouseMoveBehavior);
            }
            function mouseDrag() {
              const selectionRect = {
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
                getCurrentAttributesAsText: function () {
                  let attrs = this.getCurrentAttributes();
                  return (
                    "x1: " +
                    attrs.x1 +
                    " x2: " +
                    attrs.x2 +
                    " y1: " +
                    attrs.y1 +
                    " y2: " +
                    attrs.y2
                  );
                },
                init: function (newX, newY) {
                  let rectElement = eventGroup
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
                focus: function () {
                  this.element
                    .style("stroke", "#DE695B")
                    .style("stroke-width", "2.5");
                },
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
              let mouseDragBehavior = d3
                .drag()
                .on("start", function (e) {
                  selectionRect.removePrevious();
                  let pointer = d3.pointer(e, this);
                  selectionRect.init(pointer[0], eventG_data.y);
                  eventGroup.dispatch("mouseleave"); //tooltip取消
                  // d3.select(window).dispatch("click"); //關閉dropdown
                })
                .on("drag", function (e) {
                  let pointer = d3.pointer(e, this);
                  if (pointer[0] < eventG_data.x) pointer[0] = eventG_data.x;
                  else if (pointer[0] > eventG_data.xRange[1])
                    pointer[0] = eventG_data.xRange[1];
                  selectionRect.update(pointer[0], eventG_data.yRange[1]);
                })
                .on("end", (e) => {
                  loadingEffect(true);

                  let selection = selectionRect.getCurrentAttributes();
                  let x = chartElements[chartTypes[0]].x;
                  let new_xDomain =
                    selection.x2 - selection.x1 > 1
                      ? [x.invert(selection.x1), x.invert(selection.x2)]
                      : null;
                  // console.debug(new_xDomain);

                  newDataObj = getNewData({
                    option: { xDomain: new_xDomain },
                  });
                  updateChart();
                  selectionRect.remove();
                });
              eventGroup.call(mouseDragBehavior);
            }
            mouseMove();
            mouseDrag();
          }
          function chartOptionEvent() {
            let chartOptions = d3.select(chartRootNode).select("#chartOptions");
            //====Axis log scale
            chartOptions
              .selectAll("#axisMenu input[name='axisScale']")
              .on("change", (e) => {
                let axis = e.target.value,
                  checked = e.target.checked;

                newDataObj = getNewData({
                  option: { [axis]: checked },
                });
                updateChart();
              });

            //====instType,z,p,f0 input
            const paramNames = {
              z: "ZEROS",
              p: "POLES",
              f0: "Normalization Frequency",
            };
            const paramKeys = Object.keys(paramNames);
            let resParam = {
              z: false,
              p: false,
              f0: defaultSetting.f0,
              instType: defaultSetting.instType,
            };

            let hintBlock = chartOptions.select("#paramMenu #paramHintBlock");
            let paramInputArr = paramKeys.map((key) =>
              chartOptions.select(`#paramMenu [data-key='${key}']`)
            );
            // console.debug(paramInputArr);
            let submit_resParam = () => {
              let getHintText = (key) => {
                let text = `${paramNames[key]}\r${
                  key !== "f0" ? resParam[key].length : ""
                }\n${
                  key !== "f0"
                    ? resParam[key]
                        .map((arr) => arr.join(arr[1] < 0 ? "" : "+") + "i")
                        .join("\n")
                    : resParam[key]
                }\n`;

                return text;
              };

              let validArr = paramKeys.map((key, i) => {
                  // console.debug(resParam[key]);
                  let isValid = false;
                  switch (key) {
                    case "f0":
                      isValid = !isNaN(parseInt(resParam[key]));
                      break;
                    case "p":
                      isValid = !!resParam[key];
                      break;
                    case "z":
                      // TAG:根據instType判斷有指定數量的[0,0]
                      isValid =
                        !!resParam[key] &&
                        resParam[key].filter(
                          (complex) =>
                            Array.isArray(complex) &&
                            complex.reduce((a, b) => a + b) === 0
                        ).length >= resParam.instType;

                      break;
                  }
                  paramInputArr[i].classed("is-invalid", !isValid);
                  return isValid;
                }),
                allValid = validArr.every((bool) => bool);

              let text = "";
              if (allValid) {
                newDataObj = getNewData({
                  newParam: resParam,
                });
                updateChart();

                // Math.sign(arr[1] === 1 ? "+" : "")
                text = paramKeys.map((key) => getHintText(key)).join("\n");
              } else {
                text = `Please check ${paramKeys
                  .filter((key, i) => !validArr[i])
                  .map((key) => paramNames[key])
                  .join(", ")}`;
              }
              hintBlock.text(text);
            };

            chartOptions
              .selectAll("#paramMenu [name='paramInput']")
              .on("change", (e) => {
                let target = e.target,
                  key = target.getAttribute("data-key"),
                  value = target.value;
                // console.debug(key, value, target);

                let getComplexArr = (str) => {
                  let arr = str
                    .trim()
                    .split("\n")
                    .map((row) => {
                      let tmp = row
                        .replaceAll(/[ji]/g, "")
                        .trim()
                        .split(/\s+/)
                        .map((col) => parseFloat(col));

                      // console.debug(tmp);

                      return tmp.length === 2 && tmp.every((v) => !isNaN(v))
                        ? tmp
                        : false;
                    });

                  return arr;
                };

                let isValid = false;
                switch (key) {
                  case "z":
                  case "p":
                    value = getComplexArr(value);
                    isValid = value.every((v) => !!v);
                    let z_can_be_empty = key === "z" && resParam.instType === 0;
                    Object.assign(resParam, {
                      [key]: isValid ? value : z_can_be_empty ? [] : false,
                    });
                    break;
                  case "f0":
                    value = parseFloat(value);
                    isValid = !isNaN(value);
                    Object.assign(resParam, { [key]: isValid ? value : false });
                    break;
                }

                // console.debug("result=", { [key]: value }, resParam);
                submit_resParam();
              });

            chartOptions.select("#paramMenu #instType").on("change", (e) => {
              Object.assign(resParam, { instType: parseInt(e.target.value) });
              chartOptions.select("#paramMenu #zerosInput").dispatch("change");
            });

            //====chart title
            chartOptions
              .selectAll("#paramMenu #customTitle")
              .on("change", (e) => {
                let target = e.target,
                  value = target.value;
                // console.debug(key, value, target);

                newDataObj = getNewData({
                  option: { title: value },
                });
                updateChart();
              });
          }
          function keyboardEvent() {
            let hotkeyPressFlag = true; //avoid from trigger event too often

            d3.select(window).on("keydown", (e) => {
              if (!hotkeyPressFlag) return;
              // console.debug(e.code)

              //==翻頁快捷鍵
              if (e.code == "KeyA" || e.code == "KeyD") {
                switch (e.code) {
                  case "KeyA": //press a
                    updatePage(false);
                    break;
                  case "KeyD": //press d
                    updatePage(true);
                    break;
                }
              }
              //== selectMode 開關
              else if (e.code == "KeyS") {
              }

              hotkeyPressFlag = false;
              d3.timeout(() => (hotkeyPressFlag = true), 10);
            });
          }

          chartOptionEvent();
          pathEvent();
          // keyboardEvent();
        }
        svg.call(events);

        return svg.node();
      }

      getChartDivHtml(0);
      let chart0 = chartRootNode.querySelector("#chart0");
      getChartMenu(chart0);
      chart0.append(getChartSvg());
    }
    //===init once
    if (!chartRootNode.querySelector("#chartOptions")) init();
    printChart();
  }
  return chart;
}
