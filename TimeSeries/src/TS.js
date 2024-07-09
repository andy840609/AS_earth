function TSchart() {
  let selector = "body";
  let data = null;

  chart.selector = (value) => {
    selector = value;
    return chart;
  };
  chart.data = (value) => {
    let requestData = (url) => {
      return new Promise((resolve) => {
        axios
          .get(url)
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

    data = value ? value : requestData("src/php/getCatalog.php");
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

      function getChartSvg() {
        const width = 800,
          height = 500;
        const margin = { top: 30, right: 30, bottom: 50, left: 45 };
        const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);
        const xAxis = svg.append("g").attr("class", "xAxis");
        const yAxis = svg.append("g").attr("class", "yAxis");
        const focusGroup = svg.append("g").attr("class", "focus");
        const legendGroup = svg.append("g").attr("class", "legendGroup");
        const loadingGroup = d3.select(chartRootNode).selectAll("#loading");

        let x, y;
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

        function getNewData(trans = false) {
          return data;
        }
        function updateChart(trans = false) {
          function init() {}
          function render() {
            let options = { logScale: [] };
            let yAxisOption = {};
            let newData = newDataObj;

            x = d3["scaleUtc"]()
              .domain(
                options.xDomain
                  ? options.xDomain
                  : d3.extent(newData, (d) => d.date)
              )
              .range([margin.left, width - margin.right]);
            if (!options.xDomain) {
              options.logScale.x
                ? x.domain(x.domain().map((d, i) => d * (i ? 2 : 0.5)))
                : x.nice();
            }

            y = d3[options.logScale.y ? "scaleLog" : "scaleLinear"]()
              .domain(d3.extent(newData, (d) => d.ML))
              .range([height - margin.bottom, margin.top]);
            if (options.logScale.y) y.nice();

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
                    let axisFun = d3
                      .axisBottom(x)
                      .tickSizeOuter(0)
                      .ticks(width / 80);
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
              focusGroup
                .selectAll("circle")
                .data(newData)
                .join("circle")
                .attr("fill", "none")
                .attr("stroke", "blue")
                .attr("stroke-width", 1)
                .attr("stroke-opacity", 0.5)
                .attr("r", 3)
                .attr("cx", (d) => x(d.date))
                .attr("cy", (d) => y(d.ML));
              // .call((path) => {
              //   if (trans)
              //     path
              //       .transition()
              //       .duration(1000)
              //       .attr("d", (d) => line(d));
              //   else path.attr("cx", (d) => line(d));
              // });
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

        function events(svg) {}
        svg.call(events);

        return svg.node();
      }

      if (!data) {
        chart.data();
        data = await data;
      }

      getChartDivHtml(0);
      let chart0 = chartRootNode.querySelector("#chart0");
      getChartMenu(chart0);
      chart0.append(getChartSvg());
    }
    //===init once
    if (!chartRootNode.querySelector("#chartsOptions")) init();

    printChart();
  }
  return chart;
}
