function sacPlots() {
  let selector = "body";
  let rawData = null;
  let titleArr = null;
  let channel = null;

  //solve deviation from float calculate
  let floatCalculate = (method, ...theArgs) => {
    let result;
    function isFloat(n) {
      return n.toString().indexOf(".") >= 0;
    }

    let powerArr = [];
    theArgs.forEach((d) => {
      if (isFloat(d)) {
        // console.debug(d);
        // let tmp = d.toString().split('.')[1].length;
        // if (tmp > power)
        //     power = tmp;
        powerArr.push(d.toString().split(".")[1].length);
      } else powerArr.push(0);
    });
    let maxPower = Math.max(...powerArr);
    // console.debug(maxPower);
    let newArgs = theArgs.map(
      (d, i) =>
        parseInt(d.toString().replace(".", "")) *
        Math.pow(10, maxPower - powerArr[i])
    );
    // console.debug(newArgs);
    switch (method) {
      case "add":
        result = 0;
        newArgs.forEach((d) => (result += d));
        result /= Math.pow(10, maxPower);
        break;
      case "minus":
        result = newArgs[0] * 2;
        newArgs.forEach((d) => (result -= d));
        result /= Math.pow(10, maxPower);
        break;
      case "times":
        result = 1;
        newArgs.forEach((d) => (result *= d));
        result /= Math.pow(Math.pow(10, maxPower), newArgs.length);
        break;
      case "divide":
        result = Math.pow(newArgs[0], 2);
        newArgs.forEach((d, i) => {
          if (!(result == 0 && i == 0)) result /= d;
        });
        // console.debug(result);
        result *= Math.pow(Math.pow(10, maxPower), newArgs.length - 2);
        break;
      default:
        result = 0;
        newArgs.forEach((d) => (result += d));
        result /= Math.pow(10, maxPower);
        break;
    }
    return result;
  };
  chart.selector = (vaule) => {
    selector = vaule;
    return chart;
  };
  chart.data = (vaule) => {
    let paths = vaule;

    let promises = paths.map((path) => {
      return $.ajax({
        url: path,
        dataType: "text",
        async: true,
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          console.debug(XMLHttpRequest, textStatus, errorThrown);
        },
      }).then((success) => {
        let fileName = path.substring(path.lastIndexOf("/") + 1);
        let xyArr = [];

        let rows = success.split("\n");
        rows.forEach((row) => {
          if (row != "") {
            let col = row.trim().split(/\s+/);
            xyArr.push({ x: parseFloat(col[0]), y: parseFloat(col[1]) });
          }
        });

        return { fileName: fileName, data: xyArr };
      });
    });
    // console.log(promises);
    //==將原資料算出 normalize_self 和 normalize_all
    rawData = Promise.all(promises).then((raw) => {
      // raw = raw.filter((file) => file.data.length !== 0);
      let tmpData = raw.map((s) => s.data);
      // console.log(tmpData);
      //==先算出各自/全部平均
      let meanArr = tmpData.map((data) => d3.mean(data, (d) => d.y)),
        grandMean = d3.mean(meanArr);

      //==扣掉各自/全部平均的振幅陣列
      let demeanArray = tmpData.map((data, i) =>
          data.map(
            (d) =>
              new Object({
                x: d.x,
                y: floatCalculate("minus", d.y, meanArr[i]),
              })
          )
        ),
        deGrandMeanArray = tmpData.map((data) =>
          data.map(
            (d) =>
              new Object({ x: d.x, y: floatCalculate("minus", d.y, grandMean) })
          )
        );

      //==去平均完才取最大振幅
      let maxAmpArr = demeanArray.map((data) =>
          d3.max(data, (d) => Math.abs(d.y))
        ),
        maxAmp = d3.max(deGrandMeanArray, (data) =>
          d3.max(data, (d) => Math.abs(d.y))
        );

      // console.log(tmpData);
      // console.log("demean=");
      // console.log(demeanArray, deGrandMeanArray);
      // console.log("mean=");
      // console.log(meanArr, grandMean);
      // console.log("maxAmp=");
      // console.log(maxAmpArr, maxAmp);

      //===normalize_self  Math.round(num + "e+5")  + "e-5");
      let self = demeanArray.map(
        (data, i) =>
          new Object({
            fileName: raw[i].fileName,
            data: data.map(
              (d) =>
                new Object({
                  x: d.x,
                  y: floatCalculate("divide", d.y, maxAmpArr[i]),
                })
            ),
          })
      );
      // console.log(self[0]);
      //===normalize_all
      let all = deGrandMeanArray.map(
        (data, i) =>
          new Object({
            fileName: raw[i].fileName,
            data: data.map(
              (d) =>
                new Object({ x: d.x, y: floatCalculate("divide", d.y, maxAmp) })
            ),
          })
      );
      // console.log(all);

      return { raw, self, all };
    });
    // console.log(rawData);
    return chart;
  };
  chart.title = (vaule) => {
    titleArr = vaule.split(" ");
    return chart;
  };
  chart.legend = (vaule) => {
    channel = vaule.split(" ");
    return chart;
  };

  async function chart() {
    let normalize = 0; //==0:raw 1:self 2:all
    let pre_xdomain = [];
    let title = "";
    let referenceTime, referenceTimeStr;

    rawData = await rawData;
    let data = rawData.raw;
    console.debug(rawData);

    if (titleArr) {
      for (let i = 0; i < titleArr.length - 1; i++) {
        title += titleArr[i];
        if (i != titleArr.length - 2) title += ".";
      }
      referenceTimeStr = titleArr[titleArr.length - 1];
      // referenceTime = new Date(referenceTimeStr + "Z");
      // referenceTime = referenceTime == "Invalid Date" ? null : referenceTime.getTime();

      //test
      // referenceTime = null;
      //test
      // if (referenceTime) data.forEach(d => d.data.forEach(p => p.x = 1000 * p.x + referenceTime));
    }

    let getLineColor = (index) => {
      switch (index % 6) {
        case 0:
          return "steelblue";
        case 1:
          return "#AE0000";
        case 2:
          return "#006030";
        case 3:
          return "#EA7500";
        case 4:
          return "#4B0091";
        case 5:
          return "#272727";
        default:
          return "steelblue";
      }
    };
    let getMargin = (tickLength = 5) => {
      let left;
      if (tickLength >= 10) left = 100;
      else if (tickLength >= 6) left = 75;
      else left = 50;
      return { top: 20, right: 30, bottom: 30, left: left };
    };
    let toScientificNotation = (number, maxIndex = undefined) => {
      // console.debug(number);
      let singed, numberAbs;
      if (number < 0) {
        singed = true;
        numberAbs = Math.abs(number);
      } else {
        singed = false;
        numberAbs = number;
      }
      //maxIndex 轉成指定10的次方
      if (maxIndex || maxIndex == 0) {
        let index = number == 0 ? 0 : maxIndex;
        let constant =
          floatCalculate("divide", numberAbs, Math.pow(10, index)) *
          (singed ? -1 : 1);
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
        let index = 0;
        while (constant < 0.1) {
          constant *= 10;
          index--;
        }
        constant *= singed ? -1 : 1;
        // console.debug(constant, index);
        return [constant, index];
      } else return [number, 0];
    };

    // console.debug(channel);
    function init() {
      $(selector).append(`
                <form id="form-chart">
            <div class="form-group" id="chartsOptions" style="display: inline;">
                <div class="row">

                    <div class="form-group col-12">
                
                      <div class="btn-group btn-group-toggle" data-toggle="buttons">
                        <label class="btn btn-secondary active">
                          <input type="radio" name="plotType" id="trace" value="trace" checked>trace
                        </label>
                        <label class="btn btn-secondary">
                          <input type="radio" name="plotType" id="window" value="window">window
                        </label>
                        <label class="btn btn-secondary">
                          <input type="radio" name="plotType" id="overlay" value="overlay">overlay
                        </label>

                        <div class="dropdown btn-group">
                          <button class="btn btn-secondary dropdown-toggle" type="button" id="normalizeBtn" data-toggle="dropdown" aria-expanded="false">
                              raw data
                          </button>
                          <ul class="dropdown-menu" aria-labelledby="normalizeBtn">
                              <li><button class="dropdown-item" type="button" name="normalize" value="raw">raw data</button></li>
                              <li><button class="dropdown-item" type="button" name="normalize" value="self">normalization(self)</button></li>
                              <li><button class="dropdown-item" type="button" name="normalize" value="all">normalization(all)</button></li>
                          </ul>
                        </div>

                      </div>

                    </div>
    
                </div>
            </div>
            <div class="form-group" id="charts">
    
            </div>
            <div id="outerdiv"
            style="position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);z-index:100;width:100%;height:100%;display:none;">
                <div id="innerdiv" style=" background-color: rgb(255, 255, 255);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
            </div>
        </form>
                `);

      $('button[name ="normalize"]').click(function (e) {
        // console.debug(pre_xdomain);
        // console.debug(this.innerHTML);

        data = rawData[this.value];
        normalize = !(this.value === "raw");
        $("#normalizeBtn").text(this.innerHTML);

        //x+referenceTime
        // console.debug("referenceTime=" + referenceTime);
        // if (referenceTime) data.forEach(d => d.data.forEach(p => p.x = 1000 * p.x + referenceTime));

        printChart();
      });
      $('input[name ="plotType"]').change(function (e) {
        // console.debug(this.value);
        if (this.value == "trace") pre_xdomain = [];
        else pre_xdomain = null;

        printChart();
      });
    }
    async function printChart() {
      $("#charts").children().remove();

      let i = 1;
      let getChartMenu = (title) => {
        // console.log(d.data);
        let div = document.createElement("div");
        div.setAttribute("id", "chart" + i);
        div.setAttribute("class", "chart col-md-12 col-sm-12");
        div.setAttribute("style", "position:relative");

        let nav = document.createElement("nav");
        nav.setAttribute("id", "nav" + i);
        nav.setAttribute("class", "toggle-menu");
        nav.setAttribute("style", "position:absolute");
        nav.style.right = "0";

        let a = document.createElement("a");
        a.setAttribute("class", "toggle-nav");
        a.setAttribute("href", "#");
        a.innerHTML = "&#9776;";
        nav.append(a);

        let ul = document.createElement("ul");
        ul.classList.add("active");
        nav.append(ul);

        let chartDropDown = ["bigimg", "svg", "png", "jpg"];
        chartDropDown.forEach((option) => {
          let li = document.createElement("li");
          let item = document.createElement("a");
          item.href = "javascript:void(0)";

          if (option != chartDropDown[0])
            item.innerHTML = "下載圖表爲" + option;
          else item.innerHTML = "檢視圖片";

          item.addEventListener("click", (e, a) => {
            let svgArr = [];
            let svg = $("#" + $(e.target).parents(".chart")[0].id).children(
              "svg"
            )[0];
            // console.debug(svg);
            svgArr.push(svg);
            downloadSvg(svgArr, title, option);
          });

          li.append(item);
          ul.append(li);
        });
        $("#charts").append(div);
        $("#chart" + i).append(nav);
        MenuEvents();
      };
      let MenuEvents = () => {
        let charts = document.getElementById("charts");
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

        $(".toggle-nav").off("click");
        $(".toggle-nav").click(function (e) {
          // console.debug(e.target === this);//e.target===this

          $(this).toggleClass("active");
          $(this).next().toggleClass("active");
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
          // $('#bigimg').attr("src", img);//设置#bigimg元素的src属性
          // $('#outerdiv').fadeIn("fast");//淡入显示#outerdiv及.pimg
          // $('#outerdiv').off('click');
          // $('#outerdiv').click(function () {//再次点击淡出消失弹出层
          //     $(this).fadeOut("fast");
          // });
          let outerdiv = $("#outerdiv");

          outerdiv.fadeIn("fast"); //淡入显示#outerdiv及.pimg
          outerdiv.off("click");
          outerdiv.click(function (e) {
            //再次点击淡出消失弹出层
            if (e.target.id != "outerdiv") return;
            $(this).fadeOut("fast");
            $(originParent).children("svg").remove();
            originSvg.removeAttribute("width");
            originSvg.removeAttribute("height");
            originParent.append(originSvg);
          });

          let originSvg = svgArr[0];
          let originParent = originSvg.parentNode;
          let cloneSvg = originSvg.cloneNode(true);
          originSvg.setAttribute("width", width);
          originSvg.setAttribute("height", height);
          document.querySelector("#innerdiv").append(originSvg);
          originParent.append(cloneSvg);
        }

        if (option == "svg") {
          //==============merge svg
          let newSvg = document.createElement("svg");

          svgArr.forEach((queryStr) => {
            let svgjQobj = $(queryStr);
            svgjQobj.clone().appendTo(newSvg);
          });
          // console.debug(newSvg);
          let svgUrl = getSvgUrl(newSvg);
          download(svgUrl, fileName + "." + option);
        } else {
          //==============each svg draw to canvas
          let CanvasObjArr = getCanvas(option == "bigimg");

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

      //brush的側邊線與長方形
      function contextSelectionSide() {
        //=================brushSide======================================

        let brush_g = d3.select(".brush");
        // console.debug(brush_g._groups[0][0].childNodes);

        let brushSideWidth = 5;
        let brushDefs = brush_g.append("defs");
        let brushSideA_g = brushDefs.append("g").attr("id", "brushSideA");
        let brushSideB_g = brushDefs.append("g").attr("id", "brushSideB");

        brushSideA_g
          .append("rect")
          .attr("width", brushSideWidth)
          .attr("height", 15)
          .attr("stroke", "#545454")
          // .attr('stroke-width', ' 2px')
          .attr("stroke-opacity", 1)
          .attr("fill", "#6C6C6C")
          .attr("fill-opacity", 1)
          .attr("y", 10)
          .attr("transform", "translate(" + -brushSideWidth + ",0)");
        brushSideA_g
          .append("line")
          .attr("stroke", "#545454")
          .attr("stroke-width", " 2px")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 0)
          .attr("y2", 35);

        brushSideB_g
          .append("rect")
          .attr("width", brushSideWidth)
          .attr("height", 15)
          .attr("stroke", "#545454")
          // .attr('stroke-width', ' 2px')
          .attr("stroke-opacity", 1)
          .attr("fill", "#6C6C6C")
          .attr("fill-opacity", 1)
          .attr("y", 10);
        brushSideB_g
          .append("line")
          .attr("stroke", "#545454")
          .attr("stroke-width", " 2px")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 0)
          .attr("y2", 35);

        let overlayRect = d3.select(".overlay");
        let x1 = parseInt(overlayRect.attr("x"));
        let x2 = parseInt(x1) + parseInt(overlayRect.attr("width"));

        let brushSideA = brush_g
          // .append("use").lower()
          .insert("use", ".handle")
          .attr("xlink:href", "#brushSideA")
          .attr("x", x1);

        let brushSideB = brush_g
          // .append("use").lower()
          .insert("use", ".handle")
          .attr("xlink:href", "#brushSideB")
          .attr("x", x2);

        let selectionRect = document.querySelector(".selection");
        // console.debug(selectionRect);
        let observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            if (mutation.attributeName == "width") {
              let target = mutation.target;
              let width = target.width.baseVal.value;
              if (width) {
                x1 = target.x.baseVal.value;
                x2 = x1 + width;
                // console.log(target.width.baseVal.value)
                brushSideA.attr("x", x1);
                brushSideB.attr("x", x2);
              }
            }
          });
        });
        observer.observe(selectionRect, {
          attributes: true, //configure it to listen to attribute changes
        });

        // d3.select(".selection")
        //     .style("stroke-dasharray", "0," + (selection[1] - margin.left) + "," + (height2 - margin.bottom) + ",0");
        // brushSideA.attr('x', selection[0] - 5);
        // brushSideB.attr('x', selection[1]);
        // console.debug('pre=' + pre_selection);
        //=================brushSide======================================
      }

      //限制brush刷新頻率
      const updateDelay = 10;
      let updateFlag = true;
      let updateTimeOut = null;
      let updateHandler = (action, parameter = null) => {
        // console.debug(parameter)

        if (!updateFlag) updateTimeOut.stop();

        updateTimeOut = d3.timeout(() => {
          parameter ? action(...parameter) : action();
          updateFlag = true;
        }, updateDelay);

        updateFlag = false;
      };

      //三種圖表
      function trace() {
        let extend;
        let chartNodes = [];

        function getExtent(dataArr) {
          // console.debug(dataArr);
          let min = d3.min(dataArr, (d) => {
            // console.debug(!isNaN(d.y) ? 'true' : 'false');
            return !isNaN(d.y) ? d.y : d3.min(d.data, (p) => p.y);
          });
          // console.debug(min);
          let max = d3.max(dataArr, (d) => {
            return !isNaN(d.y) ? d.y : d3.max(d.data, (p) => p.y);
            // return d3.max(d.data, p => p.y);
          });
          // console.debug(data);
          let extend = [min, max];
          let range = Math.abs(max - min);
          // console.debug(range);
          let tick_toSN_index = toScientificNotation(range / 10)[1];
          // console.debug(tick_toSN_index);
          return [extend, tick_toSN_index];
        }
        function getChartNodes(index, data, tick_toSN_index) {
          // let y_extent = d3.extent(data, d => d.y);
          // let minLenght = y_extent[0].toString().length;
          // let maxLenght = y_extent[1].toString().length;
          // let absLenght = maxLenght > minLenght ? maxLenght : minLenght;
          // console.debug(absLenght);
          let margin = getMargin();
          let width = 800;
          let height = 250;

          let line = d3
            .line()
            .defined((d) => !isNaN(d.x))
            .x((d) => x(d.x))
            .y((d) => y(d.y));

          let x = referenceTime
            ? d3
                .scaleUtc()
                .domain(d3.extent(data, (d) => d.x))
                .range([margin.left, width - margin.right])
            : d3
                .scaleLinear()
                .domain(d3.extent(data, (d) => d.x))
                // .nice()
                .range([margin.left, width - margin.right]);

          let origin_x_domain = x.domain();

          // console.debug(!isNaN(referenceTime.getTime()));
          let y = d3
            .scaleLinear()
            .domain(extend)
            .nice()
            .range([height - margin.bottom, margin.top]);
          let origin_y_domain = y.domain();

          let xAxis_g = (g) =>
            g
              .attr("transform", `translate(0,${height - margin.bottom})`)
              .call(
                d3
                  .axisBottom(x)
                  .ticks(width / 80)
                  .tickSizeOuter(0)
              )
              .append("text")
              .attr("x", width / 2)
              .attr("y", margin.top + 6)
              .attr("fill", "black")
              .attr("font-weight", "bold")
              .text(
                "Time" +
                  (referenceTime ? "" : "" + (referenceTime ? "" : " (s)"))
              );

          let yAxis_g = (g) =>
            g
              .attr("transform", `translate(${margin.left},0)`)
              .attr("class", "yAxis")
              .call(d3.axisLeft(y))
              .call((g) => {
                // let indexArr = [];
                // console.debug(indexArr);
                g.selectAll(".tick text").text(
                  (d) => toScientificNotation(d, tick_toSN_index)[0]
                );

                //標示指數在左上角(10的0次不標)
                if (tick_toSN_index != 0)
                  g.selectAll(".tick:last-child")
                    .append("text")
                    .attr("x", 0)
                    .attr("y", -margin.top / 3)
                    .attr("fill", "black")
                    .attr("text-anchor", "start")
                    // .attr("alignment-baseline", "before-edge")
                    .text("( x 10")
                    .append("tspan")
                    .attr("dy", -5)
                    .attr("font-weight", "bold")
                    .attr("font-size", "10")
                    .text(tick_toSN_index)
                    .append("tspan")
                    .attr("dy", 5)
                    .attr("font-weight", "normal")
                    .attr("font-size", "10")
                    .text(" )");
              })
              .call((g) =>
                g
                  .selectAll("g.yAxis g.tick line")
                  // .attr("stroke-width", "1px")
                  .attr("x2", width - margin.left - margin.right)
                  .attr("stroke-opacity", 0.2)
              )
              .append("text")
              .attr("x", -height / 2)
              .attr("y", -margin.left + 8)
              .attr("fill", "black")
              .attr("font-weight", "bold")
              .attr("font-size", "10")
              .style("text-anchor", "middle")
              .attr("alignment-baseline", "text-before-edge")
              .attr("transform", "rotate(-90)")
              .call((g) => g.text("Amplipude" + (normalize ? " (count)" : "")));
          // console.debug(yAxis);

          const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);

          let xAxis = svg.append("g").call(xAxis_g);

          let yAxis = svg.append("g").call(yAxis_g);

          // console.debug(index);

          let focus = svg
            .append("g")
            .attr("class", "focus")
            .attr("clip-path", "url(#clip" + (index + 1) + ")");

          focus
            .append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", getLineColor(index))
            .attr("stroke-width", 1)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", line);

          let renderChart = (trans = false) => {
            if (trans)
              focus
                .select("path")
                .datum(data)
                .transition()
                .duration(500)
                .attr("fill", "none")
                .attr("stroke", getLineColor(index))
                .attr("stroke-width", 1)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("d", line);
            else
              focus
                .select("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", getLineColor(index))
                .attr("stroke-width", 1)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("d", line);
          };

          //------channel Title
          svg
            .append("g")
            .append("text")
            .attr("x", margin.left + 50)
            .attr("align", "center")
            .attr("y", margin.top / 2)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .attr("alignment-baseline", "central")
            .attr("font-weight", "bold")
            .attr("font-size", "13")
            .text(title + (channel ? "." + channel[index] : ""));
          //------referenceTime
          svg
            .append("g")
            .append("text")
            .attr("x", width - margin.right)
            .attr("align", "center")
            .attr("y", margin.top / 2)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .attr("alignment-baseline", "central")
            .attr("font-weight", "bold")
            .attr("font-size", "13")
            .text("referenceTime : " + referenceTimeStr);

          //====================================events=========================================================
          function events(svg) {
            const datesArr = data.map((d) => d.x);

            const lineStroke = "2px";
            const lineStroke2 = "0.5px";

            //====================================mouse move==================================================
            const mouseG = svg.append("g").attr("class", "mouse-over-effects");

            mouseG
              .append("path") // create vertical line to follow mouse
              .attr("class", "mouse-line")
              .style("stroke", "#A9A9A9")
              .style("stroke-width", lineStroke)
              .style("opacity", "0");

            // console.debug(data);
            const mousePerLine = mouseG
              .datum(data)
              .append("g")
              .attr("class", "mouse-per-line");

            mousePerLine
              .append("circle")
              .attr("r", 3)
              .style("stroke", "white")
              .style("fill", "none")
              .style("stroke-width", lineStroke2)
              .style("opacity", "0");
            mousePerLine
              .append("circle")
              .attr("r", 4)
              .style("stroke", () => getLineColor(index))
              .style("fill", "none")
              .style("stroke-width", lineStroke)
              .style("opacity", "0");
            mousePerLine
              .append("circle")
              .attr("r", 5)
              .style("stroke", "white")
              .style("fill", "none")
              .style("stroke-width", lineStroke2)
              .style("opacity", "0");

            svg
              .append("defs")
              .append("clipPath")
              .attr("id", "clip" + (index + 1))
              .append("rect")
              .attr("id", "rectRenderRange" + (index + 1))
              .attr("x", margin.left)
              .attr("y", margin.top)
              .attr("width", width - margin.right - margin.left)
              .attr("height", height - margin.top - margin.bottom)
              .attr("fill", "none")
              .attr("pointer-events", "all");

            //==tooltip
            const chart_center = [d3.mean(x.range()), d3.mean(y.range())];
            const tooltipMouseGap = 50;

            const tooltip = d3
              .select("#charts")
              .append("div")
              .attr("id", "tooltip")
              .style("position", "absolute")
              .style("z-index", "999")
              .style("background-color", "#D3D3D3")
              .style("padding", "20px 20px 20px 20px")
              .style("opacity", " .9")
              .style("display", "none");
            // append a rect to catch mouse movements on canvas

            let event_rect = mouseG
              .append("use")
              .attr("xlink:href", "#rectRenderRange" + (index + 1))
              .on("mouseleave", function () {
                // on mouse out hide line, circles and text
                svg.select(".mouse-line").style("opacity", "0");
                svg.selectAll(".mouse-per-line circle").style("opacity", "0");
                svg.selectAll(".mouse-per-line text").style("opacity", "0");
                tooltip.style("display", "none");
              })
              .on("mousemove", function (event) {
                // update tooltip content, line, circles and text when mouse moves
                event.preventDefault();
                const pointer = d3.pointer(event, this);
                // console.debug(pointer);
                const xm = x.invert(pointer[0]);
                // const ym = y.invert(pointer[1]);
                const idx = d3.bisectCenter(datesArr, xm);
                // console.debug(idx);
                svg.selectAll(".mouse-per-line").attr("transform", (d) => {
                  // console.debug(d);
                  svg.select(".mouse-line").attr("d", () => {
                    let data =
                      "M" + x(d[idx].x) + "," + (height - margin.bottom);
                    data += " " + x(d[idx].x) + "," + margin.top;
                    return data;
                  });
                  return "translate(" + x(d[idx].x) + "," + y(d[idx].y) + ")";
                });

                let timeStr;
                if (referenceTime) {
                  let ISOString = new Date(datesArr[idx]).toISOString();
                  timeStr = ISOString.substring(
                    ISOString.indexOf("T") + 1,
                    ISOString.indexOf("Z")
                  );
                } else timeStr = datesArr[idx].toFixed(2);
                const divHtml =
                  "Time : <br/><font size='5'>" +
                  timeStr +
                  "</font> s<br/>Amplipude : <br/>";
                // console.debug(dot.offset());
                svg.select(".mouse-line").style("opacity", "0.7");
                svg.selectAll(".mouse-per-line circle").style("opacity", "1");

                tooltip
                  .html(divHtml)
                  .style("display", "inline")
                  .style(
                    "left",
                    `${
                      pointer[0] < chart_center[0]
                        ? event.pageX + tooltipMouseGap
                        : event.pageX -
                          tooltipMouseGap -
                          tooltip.property("clientWidth")
                    }px`
                  )
                  .style(
                    "top",
                    `${
                      pointer[1] < chart_center[1]
                        ? event.pageY
                        : event.pageY - tooltip.property("clientHeight")
                    }px`
                  )
                  .append("div")
                  .style("color", () => getLineColor(index))
                  .style("font-size", 10)
                  .html((d, i) => {
                    let y = data[idx].y;
                    // console.debug(y, tick_toSN_index);
                    let SN = toScientificNotation(y, tick_toSN_index);
                    // console.debug(SN);
                    let constant = Number.isInteger(SN[0])
                      ? SN[0]
                      : Math.round(SN[0] * 100000) / 100000;
                    let index = SN[1];
                    let SN_html = "";
                    if (index == 0) SN_html = constant;
                    else SN_html = constant + " x 10<sup>" + index + "</sup>";
                    let html = "<font size='5'>" + SN_html + "</font>";
                    return html;
                    // return data[idx].y;
                  });
              });

            //====================================context==================================================

            let update_Axis = (x_domain, trans = false) => {
              // console.debug(pre_xdomain);
              // console.debug(x_domain);
              if (x_domain.toString() == origin_x_domain.toString()) {
                pre_xdomain[index] = origin_x_domain;
                x.domain(origin_x_domain);
                y.domain(origin_y_domain);
              } else {
                //-------- get y_domain
                let i1 = d3.bisectCenter(datesArr, x_domain[0]);
                let i2 = d3.bisectCenter(datesArr, x_domain[1]);
                // console.debug(i1, i2);
                let newData = data.filter((item, index) => {
                  return index >= i1 && index <= i2;
                });
                // console.debug('newData=');
                // console.debug(newData);
                let newExtent = getExtent(newData);
                // console.debug(newExtent);
                let y_domain = newExtent[0];
                tick_toSN_index = newExtent[1];

                pre_xdomain[index] = x_domain;
                x.domain(x_domain);
                y.domain(y_domain).nice();
                // y.domain([500000000, -500000000]);
              }

              if (trans)
                xAxis
                  .transition()
                  .duration(1000)
                  .call(
                    d3
                      .axisBottom(x)
                      .ticks(width / 80)
                      .tickSizeOuter(0)
                  );
              else
                xAxis.call(
                  d3
                    .axisBottom(x)
                    .ticks(width / 80)
                    .tickSizeOuter(0)
                );

              yAxis.selectAll("*").remove();
              yAxis.call(yAxis_g);

              // console.debug(pre_xdomain);
            };

            // //====================================zoom==================================================
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
            //================alarm
            let alarm_width = 300;
            let alarm_height = 50;

            let alarm = svg
              .append("g")
              .attr("class", "alarm")
              .attr("display", "none");

            let minimum_data = 10;
            const timeDiff = data[1].x - data[0].x; //======for limit zooming range
            // console.debug(timeDiff);
            let alarm_g_timeOut;
            let alarm_rect = alarm
              .append("rect")
              .attr("rx", 5)
              .attr("ry", 5)
              .attr(
                "x",
                margin.left +
                  (width - margin.left - margin.right - alarm_width) / 2
              )
              .attr(
                "y",
                margin.top +
                  (height - margin.bottom - margin.top - alarm_height) / 2
              )
              .attr("width", alarm_width)
              .attr("height", alarm_height)
              .attr("stroke", "#000000")
              .attr("stroke-opacity", 0)
              .attr("fill", "#D3D3D3")
              .attr("fill-opacity", 0);
            let alarm_text = alarm
              .append("text")
              .attr("x", margin.left + (width - margin.left - margin.right) / 2)
              .attr("y", margin.top + (height - margin.bottom - margin.top) / 2)
              .attr("text-anchor", "middle")
              .attr("alignment-baseline", "middle")
              .attr("opacity", 0)
              .text("It can't be less than " + minimum_data + " data points");
            //================alarm

            let dragBehavior = d3
              .drag()
              .on("start", () => {
                // console.log("dragStart");
                const p = d3.pointer(event, event_rect.node());
                selectionRect.init(p[0], margin.top);
                // const xm = x.invert(p[0]);
                // console.debug(p);
                selectionRect.removePrevious();
              })
              .on("drag", () => {
                // console.log("dragMove");
                const p = d3.pointer(event, event_rect.node());
                if (p[0] < margin.left) p[0] = margin.left;
                else if (p[0] > width - margin.right)
                  p[0] = width - margin.right;
                // console.debug(p);
                // const xm = x.invert(p[0]);
                selectionRect.update(p[0], height - margin.bottom);
              })
              .on("end", () => {
                // console.log("dragEnd");
                // console.debug('end');
                const finalAttributes = selectionRect.getCurrentAttributes();
                // console.debug(finalAttributes);

                if (
                  finalAttributes.x2 - finalAttributes.x1 > 1 &&
                  finalAttributes.y2 - finalAttributes.y1 > 1
                ) {
                  // console.log("range selected");
                  // range selected
                  event.preventDefault();

                  //-------- Update x_domain
                  let x_domain = [
                    x.invert(finalAttributes.x1),
                    x.invert(finalAttributes.x2),
                  ];
                  if (x_domain[1] - x_domain[0] > minimum_data * timeDiff) {
                    //-------- Update Axis and paths
                    update_Axis(x_domain, true);
                    renderChart(true);
                  } else {
                    //lower than minimum_data points alarm
                    alarm.attr("display", "inline");
                    alarm_rect
                      .transition()
                      .duration(500)
                      .attr("fill-opacity", 1)
                      .attr("stroke-opacity", 1)
                      .transition()
                      .duration(800)
                      .attr("fill-opacity", 0)
                      .attr("stroke-opacity", 0);
                    alarm_text
                      .transition()
                      .duration(500)
                      .attr("opacity", 1)
                      .transition()
                      .duration(800)
                      .attr("opacity", 0);

                    if (alarm_g_timeOut)
                      if (alarm_g_timeOut._time != Infinity)
                        alarm_g_timeOut.stop();
                    alarm_g_timeOut = d3.timeout(
                      () => alarm.attr("display", "none"),
                      1300
                    );
                    // console.debug(alarm_g_timeOut._time);
                  }
                } else {
                  //-------- reset zoom
                  // console.log("single point");
                  tick_toSN_index = origin_tick_toSN_index;
                  update_Axis(origin_x_domain, true);
                  renderChart(true);
                  // brush_g.call(brush.move, x2.range());
                }
                selectionRect.remove();
                // console.debug(x.domain());
              });
            event_rect.call(dragBehavior);

            //update if xdomain had been change
            // console.debug(pre_xdomain);

            if (pre_xdomain.length > 0) {
              // console.debug('index=' + index);
              pre_xdomain.forEach((d, i) => {
                if (i == index) {
                  // console.debug(d);
                  // console.debug(origin_x_domain, d);
                  update_Axis(d, false);
                  renderChart(false);
                }
              });
            }
          }
          if (data.length !== 0) svg.call(events);

          // console.debug(data);

          return svg.node();
        }

        let tick_toSN_index, origin_tick_toSN_index;

        if (!normalize) {
          let extend_and_SNindex = getExtent(data);
          extend = extend_and_SNindex[0];
          tick_toSN_index = extend_and_SNindex[1];
          origin_tick_toSN_index = tick_toSN_index;
        } else {
          extend = [-1, 1];
          tick_toSN_index = 0;
          origin_tick_toSN_index = 0;
        }

        data.forEach((d, i) => {
          chartNodes.push(getChartNodes(i, d.data, tick_toSN_index));
        });
        // console.debug(pre_xdomain);
        return chartNodes;
      }
      function windowChart(data) {
        let lastIndex = data.length - 1;
        // data.forEach(d => { console.debug(d.data[0]); console.debug(d.data[d.data.length - 1]) })

        let width = 800;
        let height = 500;
        let height2 = 65; //for context
        const svg = d3
          .create("svg")
          .attr("viewBox", [0, 0, width, height + height2]);

        function getDataRange(data, assign_tickRange = undefined) {
          // console.debug('==new chart============');
          //get datas max,min and range
          let dataRangeArray = [];
          data.forEach((d, i) => {
            let max = d3.max(d.data, (d) => d.y);
            let min = d3.min(d.data, (d) => d.y);
            let range = Math.abs(max - min);
            dataRangeArray.push({ min: min, max: max, range: range });
          });

          let getTickRange = () => {
            let tickRange;
            let ranges = 0;
            dataRangeArray.forEach((d) => {
              ranges += d.range;
            });
            // console.debug(ranges);
            let range = ranges / 20;
            // console.debug(range);

            if (range < 1) {
              let power = 0;
              while (range < 1) {
                range *= 10;
                power++;
              }
              // tickRange = Math.floor(range) / Math.pow(10, power);
              tickRange = Math.ceil(range) / Math.pow(10, power);
            } else {
              let pre_tickRange = Math.ceil(range);
              // console.debug(pre_tickRange);
              let rangesLength = pre_tickRange.toString().length;
              tickRange =
                Math.ceil(pre_tickRange / Math.pow(10, rangesLength - 1)) *
                Math.pow(10, rangesLength - 1);
              // console.debug(tickRange);
            }
            // console.debug('tickRange= ' + tickRange);
            return tickRange;
          };
          let tickRange = assign_tickRange ? assign_tickRange : getTickRange();

          //for tick values look better
          let niceRange = (range, floor = false) => {
            if (range == 0) return 0;
            else {
              let n = range / tickRange;
              let nice_n = floor ? Math.floor(n) : Math.ceil(n);
              // let niceRange;
              // if (tickRange < 1)
              //     niceRange = (nice_n * (tickRange * Math.pow(10, toIntPower))) / Math.pow(10, toIntPower);
              // // niceRange = nice_n * tickRange;
              // else
              // let niceRange = nice_n * tickRange;
              let niceRange = floatCalculate("times", nice_n, tickRange);

              // console.debug((floor ? Math.floor(n) : Math.ceil(n)) + '*' + tickRange + '=' + niceRange);
              return niceRange;
            }
          };

          //counting data sup range
          dataRangeArray.forEach((d, i) => {
            let max = d.max;
            let min = d.min;
            let range = d.range;
            let supRange = 0,
              supMin = 0,
              supMax = 0;
            if (i == 0) {
              supRange = 0;
              supMin = niceRange(min, true);
              supMax = niceRange(max, false);
            } else {
              // supRange = niceRange(Math.abs(dataRangeArray[i - 1].max) + Math.abs(min) + dataRangeArray[i - 1].supRange, false);
              supRange = niceRange(
                dataRangeArray[i - 1].max -
                  min +
                  dataRangeArray[i - 1].supRange,
                false
              );
              supMin = dataRangeArray[i - 1].supMax;
              if (supRange - supMin < Math.abs(min))
                supRange = floatCalculate("add", supRange, tickRange); //supRange += tickRange;
              supMax = floatCalculate("add", supRange, niceRange(max, false)); // supMax = supRange + niceRange(max, false);
            }
            dataRangeArray[i].supRange = supRange;
            dataRangeArray[i].supMin = supMin;
            dataRangeArray[i].supMax = supMax;
          });

          // console.debug('dataRangeArray=');
          // console.debug(dataRangeArray);

          let dataRangeArrayANDtickRange = [];
          dataRangeArrayANDtickRange.push(dataRangeArray, tickRange);
          // console.debug(dataRangeArrayANDtickRange);
          return dataRangeArrayANDtickRange;
        }

        let lineSup = (data, index) => {
          // console.debug('HI ' + index);
          let supRange = dataRangeArray[index].supRange;
          // console.debug('supRange=' + supRange);
          let line = d3
            .line()
            .defined((d) => !isNaN(d.x))
            .x((d) => x(d.x))
            .y((d) => y(d.y + supRange));
          return line(data);
        };
        const dataRangeArrayANDtickRange = getDataRange(
          data,
          normalize ? 0.2 : undefined
        );
        let dataRangeArray = dataRangeArrayANDtickRange[0];
        let tickRange = dataRangeArrayANDtickRange[1];
        let tick_toSN_index = toScientificNotation(tickRange)[1];
        // console.debug(dataRangeArray);

        // //longest tick lenght to get margin left
        // let maxLenght = d3.max(dataRangeArray, d => d.max).toString().length;
        // let minLenght = d3.min(dataRangeArray, d => d.min).toString().length;
        // let absLenght = maxLenght > minLenght ? maxLenght : minLenght;
        let margin = getMargin();

        let x = referenceTime
          ? d3
              .scaleUtc()
              .domain([
                d3.min(data, (d) => d3.min(d.data, (d) => d.x)),
                d3.max(data, (d) => d3.max(d.data, (d) => d.x)),
              ])
              .range([margin.left, width - margin.right])
          : d3
              .scaleLinear()
              .domain([
                d3.min(data, (d) => d3.min(d.data, (d) => d.x)),
                d3.max(data, (d) => d3.max(d.data, (d) => d.x)),
              ])
              // .nice()
              .range([margin.left, width - margin.right]);
        let origin_x_domain = x.domain();

        let y = d3
          .scaleLinear()
          .domain([
            dataRangeArray[0].supMin,
            dataRangeArray[dataRangeArray.length - 1].supMax,
          ])
          .range([height - margin.bottom, margin.top]);

        // let origin_y_domain = y.domain();

        let xAxis_g = (g) =>
          g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(
              d3
                .axisBottom(x)
                .ticks(width / 80)
                .tickSizeOuter(0)
            )
            .append("text")
            .attr("x", width / 2)
            .attr("y", margin.top + 6)
            .attr("fill", "black")
            .attr("font-weight", "bold")
            .text("Time" + (referenceTime ? "" : " (s)"));

        let getTickValues = (minRange, maxRange, tickRange) => {
          let tickValues = [];
          let tickValue = minRange;
          while (tickValue < maxRange + tickRange / 10) {
            tickValues.push(tickValue);
            tickValue = floatCalculate("add", tickValue, tickRange); // tickValue += tickRange;
          }
          // console.debug('tickValues = ');
          // console.debug(tickValues);
          return tickValues;
        };
        let yAxis_g = (g) =>
          g
            .attr("transform", `translate(${margin.left},0)`)
            .attr("class", "yAxis")
            .call(
              d3
                .axisLeft(y)
                // .tickValues(d3.range(y.domain()[0], y.domain()[1] + (tickRange / 10), tickRange))
                .tickValues(
                  getTickValues(
                    y.domain()[0],
                    y.domain()[1] + tickRange / 10,
                    tickRange
                  )
                )
                .ticks(height / 40)
            )
            //＝＝＝＝＝＝＝＝＝＝tick扣掉各資料的上移量並轉科學記號
            .call((g) =>
              g.selectAll(".tick text").each(function (d, i) {
                let text = d3.select(this);

                for (let i = 0; i < dataRangeArray.length; i++) {
                  if (d <= dataRangeArray[i].supMax) {
                    let val = floatCalculate(
                      "minus",
                      d,
                      dataRangeArray[i].supRange
                    );
                    //刻度轉成科學記號的常數
                    text.text(toScientificNotation(val, tick_toSN_index)[0]);
                    //分界線的tick
                    if (d == dataRangeArray[i].supMax) {
                      if (i != dataRangeArray.length - 1) {
                        val = floatCalculate(
                          "minus",
                          d,
                          dataRangeArray[i + 1].supRange
                        );
                        text
                          .attr("y", 5)
                          .append("tspan")
                          .attr("x", function () {
                            return this.parentNode.x.baseVal[0].value;
                          })
                          .attr("y", -1)
                          .attr("color", getLineColor(lastIndex - (i + 1)))
                          .text(toScientificNotation(val, tick_toSN_index)[0]);
                      }
                      //最後一個tick標示指數在左上角(10的0次不標)
                      else if (tick_toSN_index != 0) {
                        text
                          .append("tspan")
                          .attr("x", 0)
                          .attr("y", -margin.top / 3)
                          .attr("fill", "black")
                          .attr("font-weight", "normal")
                          .attr("text-anchor", "start")
                          .text("( x 10")
                          .append("tspan")
                          .attr("dy", -5)
                          .attr("font-weight", "bold")
                          .attr("font-size", "10")
                          .text(tick_toSN_index)
                          .append("tspan")
                          .attr("dy", 5)
                          .attr("font-weight", "normal")
                          .attr("font-size", "10")
                          .text(" )");
                      }
                    }

                    text
                      .attr("font-weight", "bold")
                      .attr("color", getLineColor(lastIndex - i));

                    break;
                  }
                }
              })
            )
            //＝＝＝＝＝＝＝＝＝＝資料分隔線、tick虛線、資料標題
            .call((g) => {
              g.selectAll(".tick line")
                .attr("x2", () => width - margin.left - margin.right)
                .attr("stroke-opacity", function (d) {
                  let isDivider = dataRangeArray.findIndex(
                    (range) => range.supMax == d
                  );

                  let stroke;
                  if (isDivider != -1) {
                    stroke = 1;
                    let tick = d3.select(this.parentNode);
                    tick
                      .append("text")
                      .attr("x", 0)
                      .attr("fill", "currentColor")
                      .attr("text-anchor", "start")
                      .attr("alignment-baseline", "before-edge")
                      .attr("font-weight", "bold")
                      .attr("font-size", "13")
                      .text(
                        title +
                          (channel ? "." + channel[lastIndex - isDivider] : "")
                      );

                    if (isDivider == lastIndex)
                      tick
                        .append("text")
                        .attr("x", width - margin.right - margin.left)
                        .attr("fill", "currentColor")
                        .attr("text-anchor", "end")
                        .attr("alignment-baseline", "after-edge")
                        .attr("font-weight", "bold")
                        .attr("font-size", "13")
                        .text("referenceTime : " + referenceTimeStr);
                  } else stroke = 0.2;
                  return stroke;
                });
            })
            //＝＝＝＝＝＝＝＝＝＝Axis name
            .append("text")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 8)
            .attr("fill", "black")
            .attr("font-weight", "bold")
            .attr("font-size", "10")
            .style("text-anchor", "middle")
            .attr("alignment-baseline", "text-before-edge")
            .attr("transform", "rotate(-90)")
            .text("Amplipude" + (normalize ? " (count)" : ""));

        let xAxis = svg.append("g").call(xAxis_g);

        // console.debug(xAxis);

        let yAxis = svg.append("g").call(yAxis_g);

        const focus = svg
          .append("g")
          .attr("class", "focus")
          .attr("clip-path", "url(#clip)");

        let renderChart = (trans = false, dataArr = data) => {
          if (trans)
            focus
              .selectAll("path")
              .data(dataArr)
              .join("path")
              .transition()
              .duration(500)
              .style("mix-blend-mode", "normal")
              .attr("fill", "none")
              .attr("stroke-width", 1)
              .attr("stroke-linejoin", "round")
              .attr("stroke-linecap", "round")
              .attr("stroke-opacity", 1)
              .attr("stroke", (d, i) => getLineColor(lastIndex - i))
              .attr("d", (d, i) => lineSup(d.data, i));
          else
            focus
              .selectAll("path")
              .data(dataArr)
              .join("path")
              .style("mix-blend-mode", "normal")
              .attr("fill", "none")
              .attr("stroke-width", 1)
              .attr("stroke-linejoin", "round")
              .attr("stroke-linecap", "round")
              .attr("stroke-opacity", 1)
              .attr("stroke", (d, i) => getLineColor(lastIndex - i))
              .attr("d", (d, i) => lineSup(d.data, i));
        };
        renderChart();

        //====================================events=========================================================
        function events(svg, focus) {
          // const datesArrIdx = data.findIndex((d) => d.data.length > 0);
          const datesArr = data[0].data.map((obj) => obj.x);
          // console.debug(data, datesArr);

          let newDatesArr = datesArr;
          let newData = data;

          const lineStroke = "2px";
          const lineStroke2 = "0.5px";

          //====================================mouse move==================================================
          const mouseG = svg.append("g").attr("class", "mouse-over-effects");

          mouseG
            .append("path") // create vertical line to follow mouse
            .attr("class", "mouse-line")
            .style("stroke", "#A9A9A9")
            .style("stroke-width", lineStroke)
            .style("opacity", "0");

          // console.debug(data);
          const mousePerLine = mouseG
            .selectAll(".mouse-per-line")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "mouse-per-line");

          mousePerLine
            .append("circle")
            .attr("r", 3)
            .style("stroke", "white")
            .style("fill", "none")
            .style("stroke-width", lineStroke2)
            .style("opacity", "0");
          mousePerLine
            .append("circle")
            .attr("r", 4)
            .style("stroke", (d, i) => getLineColor(lastIndex - i))
            .style("fill", "none")
            .style("stroke-width", lineStroke)
            .style("opacity", "0");
          mousePerLine
            .append("circle")
            .attr("r", 5)
            .style("stroke", "white")
            .style("fill", "none")
            .style("stroke-width", lineStroke2)
            .style("opacity", "0");

          svg
            .append("defs")
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("id", "rectRenderRange")
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("width", width - margin.right - margin.left)
            .attr("height", height - margin.top - margin.bottom)
            .attr("fill", "none")
            .attr("pointer-events", "all");

          //==tooltip
          const chart_center = [d3.mean(x.range()), d3.mean(y.range())];
          const tooltipMouseGap = 50;

          const tooltip = d3
            .select("#charts")
            .append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("z-index", "999")
            .style("background-color", "#D3D3D3")
            .style("padding", "20px 20px 20px 20px")
            .style("opacity", " .9")
            .style("display", "none");

          // append a rect to catch mouse movements on canvas
          let event_rect = mouseG
            .append("use")
            .attr("xlink:href", "#rectRenderRange")
            .on("mouseleave", function () {
              // on mouse out hide line, circles and text
              svg.select(".mouse-line").style("opacity", "0");
              svg.selectAll(".mouse-per-line circle").style("opacity", "0");
              svg.selectAll(".mouse-per-line text").style("opacity", "0");
              tooltip
                // .transition().duration(500)
                // .style("opacity", 0)
                .style("display", "none");
            })
            .on("mousemove", function (event) {
              // update tooltip content, line, circles and text when mouse moves
              event.preventDefault();
              const pointer = d3.pointer(event, this);
              const xm = x.invert(pointer[0]);
              // const ym = y.invert(pointer[1]);
              const idx = d3.bisectCenter(newDatesArr, xm);
              // console.debug(newData[0].data.length);
              // console.debug(idx);

              svg
                .selectAll(".mouse-per-line")
                .attr("transform", function (d, i) {
                  svg.select(".mouse-line").attr("d", function () {
                    let data =
                      "M" +
                      x(newData[i].data[idx].x) +
                      "," +
                      (height - margin.bottom);
                    data += " " + x(newData[i].data[idx].x) + "," + margin.top;
                    return data;
                  });
                  let supRange = dataRangeArray[i].supRange;
                  // console.debug(d.data[idx].y);
                  return (
                    "translate(" +
                    x(newData[i].data[idx].x) +
                    "," +
                    y(newData[i].data[idx].y + supRange) +
                    ")"
                  );
                });

              let timeStr;
              if (referenceTime) {
                let ISOString = new Date(newDatesArr[idx]).toISOString();
                timeStr = ISOString.substring(
                  ISOString.indexOf("T") + 1,
                  ISOString.indexOf("Z")
                );
              } else timeStr = newDatesArr[idx].toFixed(2);
              const divHtml =
                "Time : <br/><font size='5'>" +
                timeStr +
                "</font> s<br/>Amplipude : <br/>";
              // console.debug(dot.offset());
              svg.select(".mouse-line").style("opacity", "0.7");
              svg.selectAll(".mouse-per-line circle").style("opacity", "1");

              tooltip
                .html(divHtml)
                .style("display", "inline")
                .style(
                  "left",
                  `${
                    pointer[0] < chart_center[0]
                      ? event.pageX + tooltipMouseGap
                      : event.pageX -
                        tooltipMouseGap -
                        tooltip.property("clientWidth")
                  }px`
                )
                .style(
                  "top",
                  `${
                    pointer[1] < chart_center[1]
                      ? event.pageY
                      : event.pageY - tooltip.property("clientHeight")
                  }px`
                )
                .selectAll()
                .data(newData)
                .enter()
                .append("div")
                .style("color", (d, i) => getLineColor(i))
                .style("font-size", 10)
                .html((d, i) => {
                  let y = newData[lastIndex - i].data[idx].y;
                  let SN = toScientificNotation(y, tick_toSN_index);
                  let constant = Number.isInteger(SN[0])
                    ? SN[0]
                    : Math.round(SN[0] * 100000) / 100000;
                  let index = SN[1];
                  let SN_html = "";
                  if (index == 0) SN_html = constant;
                  else SN_html = constant + " x 10<sup>" + index + "</sup>";
                  let html = "<font size='5'>" + SN_html + "</font>";

                  // if (normalize)
                  return html;
                  // else {
                  //     return html + ' cm/s<sup>2</sup>';
                  // }
                });
            });

          //====================================context==================================================

          function getNewDataArr(x_domain) {
            let newData = [];
            let i1 = d3.bisectCenter(datesArr, x_domain[0]);
            let i2 = d3.bisectCenter(datesArr, x_domain[1]);
            // console.debug(i1, i2);

            //make sure zoom in path will be continue
            if (i1 - 1 >= 0) i1--;
            if (i2 + 1 < data[0].data.length) i2++;

            data.forEach((d, index) => {
              let tmpData = [],
                tmpDates = [];
              for (let i = i1; i <= i2; i++) {
                tmpData.push(d.data[i]);
                if (index == 0) tmpDates.push(d.data[i].x);
              }
              newData.push({ data: tmpData });
              if (index == 0) newDatesArr = tmpDates;
            });
            // console.log(newData);
            return newData;
          }
          let update_xAxis = (x_domain, trans = false) => {
            pre_xdomain = x_domain;
            // console.debug(pre_xdomain);
            x.domain(x_domain);
            if (trans)
              xAxis
                .transition()
                .duration(1000)
                .call(
                  d3
                    .axisBottom(x)
                    .ticks(width / 80)
                    .tickSizeOuter(0)
                );
            else
              xAxis.call(
                d3
                  .axisBottom(x)
                  .ticks(width / 80)
                  .tickSizeOuter(0)
              );
          };
          let update_yAxis = (origin = true, newDataArr = undefined) => {
            if (origin) {
              dataRangeArray = dataRangeArrayANDtickRange[0];
              tickRange = dataRangeArrayANDtickRange[1];
              tick_toSN_index = toScientificNotation(tickRange)[1];
              newData = data;
              newDatesArr = datesArr;
              // console.debug(newData)
            } else {
              // let newData = [];
              // let i1 = d3.bisectCenter(datesArr, x_domain[0]);
              // let i2 = d3.bisectCenter(datesArr, x_domain[1]);
              // // console.debug(i1, i2);
              // data.forEach(d => {
              //     newData.push({ data: d.data.filter((item, index) => { return index >= i1 && index <= i2 }) });
              // });
              // let newData = getNewDataArr(x_domain);
              let newDataRange = getDataRange(newDataArr);
              dataRangeArray = newDataRange[0];
              tickRange = newDataRange[1];
              tick_toSN_index = toScientificNotation(tickRange)[1];
              // console.debug(tick_toSN_index);
            }
            y.domain([
              dataRangeArray[0].supMin,
              dataRangeArray[dataRangeArray.length - 1].supMax,
            ]);

            yAxis.selectAll("*").remove();
            yAxis.call(yAxis_g);
          };
          // let contextData = data[lastIndex];
          let context = svg
            .append("g")
            .attr("class", "context")
            .attr("transform", "translate(0, " + height + ")")
            .append("path")
            .datum(data[0])
            .attr("fill", "none")
            .attr("stroke-width", 1)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-opacity", 1)
            .attr("stroke", "#272727")
            .attr("d", (d, i) => {
              let y2 = d3
                .scaleLinear()
                .domain([
                  dataRangeArray[0].supMin - dataRangeArray[0].supRange,
                  dataRangeArray[0].supMax - dataRangeArray[0].supRange,
                ])
                .range([height2 - margin.bottom, 0]);

              let line2 = d3
                .line()
                .defined((d) => !isNaN(d.x))
                .x((d) => x(d.x))
                .y((d) => y2(d.y));

              return line2(d.data);
            });

          let x2 = referenceTime
            ? d3
                .scaleUtc()
                .domain(origin_x_domain)
                .range([margin.left, width - margin.right])
            : d3
                .scaleLinear()
                .domain(origin_x_domain)
                .range([margin.left, width - margin.right]);

          svg
            .append("g")
            .attr("class", "context_xAxis")
            .attr(
              "transform",
              "translate(0," + (height + height2 - margin.bottom) + ")"
            )
            .call(
              d3
                .axisBottom(x2)
                .ticks(width / 80)
                .tickSizeOuter(0)
            );

          let pre_selection = x2.range();

          let brush_flag = true; //prevent brushing too often
          let brush = d3
            .brushX()
            .extent([
              [margin.left, 0],
              [width - margin.right, height2 - margin.bottom],
            ])
            .on("start", (event) => {
              if (!event.sourceEvent) return;
              // console.log("brush start");
              update_yAxis(true);
              renderChart();
            })
            .on("brush", (event) => {
              if (!event.sourceEvent) return; // ignore brush-by-zoom

              let action = () => {
                let selection = event.selection;
                if (selection) {
                  let x_domain = [
                    x2.invert(selection[0]),
                    x2.invert(selection[1]),
                  ];

                  if (x_domain[1] - x_domain[0] > 40 * timeDiff) {
                    if (brush_flag) {
                      update_xAxis(x_domain);
                      newData = getNewDataArr(x_domain);
                      renderChart(false, newData);
                      brush_flag = false;
                      d3.timeout(() => (brush_flag = true), 100);
                    }
                  } else {
                    // console.log(selection);
                    if (selection[0] == pre_selection[0]) {
                      // console.log('brush rihgt');
                      brush_g.call(brush.move, [
                        selection[0],
                        x2(x_domain[0] + 40 * timeDiff),
                      ]);
                    } else if (selection[1] == pre_selection[1]) {
                      // console.log('brush left');
                      brush_g.call(brush.move, [
                        x2(x_domain[1] - 40 * timeDiff),
                        selection[1],
                      ]);
                    } else {
                      // console.log('brush clear');
                      brush_g.call(brush.clear);
                    }
                  }
                }
                pre_selection = selection;
              };
              updateHandler(action);
            })
            .on("end", (event) => {
              if (!event.sourceEvent) return; // ignore brush-by-zoom
              // console.log("brush end");
              let selection = event.selection;

              if (selection) {
                let x_domain = [
                  x2.invert(selection[0]),
                  x2.invert(selection[1]),
                ];
                update_xAxis(x_domain, true);
                newData = getNewDataArr(x_domain);
                update_yAxis(false, newData);
                renderChart(false, newData);
              } else {
                update_xAxis(origin_x_domain, true);
                update_yAxis(true);
                renderChart(true);
                brush_g.call(brush.move, x2.range());
              }
            });

          let brush_g = svg
            .append("g")
            .attr("class", "brush")
            .attr("transform", "translate(0," + height + ")")
            .call(brush)
            .call(brush.move, x2.range());

          // console.debug(x.range());

          //***********TEST************
          // let TEST_x_domain = [95.12, 95.40];
          // brush_g.call(brush.move, [x2(TEST_x_domain[0]), x2(TEST_x_domain[1])]);
          // update_xAxis(TEST_x_domain, true);
          // update_yAxis(false, TEST_x_domain);
          // renderChart(true);
          //***********TEST************
          //====================================zoom==================================================
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
          //================alarm
          let alarm_width = 300;
          let alarm_height = 50;

          let alarm = svg
            .append("g")
            .attr("class", "alarm")
            .attr("display", "none");

          let minimum_data = 10;
          const timeDiff = data[0].data[1].x - data[0].data[0].x; //======for limit zooming range
          // const timeDiff = 100;
          // console.debug(timeDiff);

          let alarm_g_timeOut;
          let alarm_rect = alarm
            .append("rect")
            .attr("rx", 5)
            .attr("ry", 5)
            .attr(
              "x",
              margin.left +
                (width - margin.left - margin.right - alarm_width) / 2
            )
            .attr(
              "y",
              margin.top +
                (height - margin.bottom - margin.top - alarm_height) / 2
            )
            .attr("width", alarm_width)
            .attr("height", alarm_height)
            .attr("stroke", "#000000")
            .attr("stroke-opacity", 0)
            .attr("fill", "#D3D3D3")
            .attr("fill-opacity", 0);
          let alarm_text = alarm
            .append("text")
            .attr("x", margin.left + (width - margin.left - margin.right) / 2)
            .attr("y", margin.top + (height - margin.bottom - margin.top) / 2)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("opacity", 0)
            .text("It can't be less than " + minimum_data + " data points");
          //================alarm

          let dragBehavior = d3
            .drag()
            .on("start", () => {
              // console.log("dragStart");
              const p = d3.pointer(event, event_rect.node());
              selectionRect.init(p[0], margin.top);
              // const xm = x.invert(p[0]);
              // console.debug(p);
              selectionRect.removePrevious();
            })
            .on("drag", () => {
              // console.log("dragMove");
              const p = d3.pointer(event, event_rect.node());
              if (p[0] < margin.left) p[0] = margin.left;
              else if (p[0] > width - margin.right) p[0] = width - margin.right;
              // console.debug(p);
              // const xm = x.invert(p[0]);
              selectionRect.update(p[0], height - margin.bottom);
            })
            .on("end", () => {
              // console.log("dragEnd");
              // console.debug('end');
              const finalAttributes = selectionRect.getCurrentAttributes();
              // console.debug(finalAttributes);

              if (
                finalAttributes.x2 - finalAttributes.x1 > 1 &&
                finalAttributes.y2 - finalAttributes.y1 > 1
              ) {
                // console.log("range selected");
                // range selected
                event.preventDefault();

                //-------- Update x_domain
                let x_domain = [
                  x.invert(finalAttributes.x1),
                  x.invert(finalAttributes.x2),
                ];
                // console.debug(x_domain);
                //-------- Update Axis and paths(at less minimum_data  points)
                if (x_domain[1] - x_domain[0] > minimum_data * timeDiff) {
                  update_xAxis(x_domain, true);
                  // update_yAxis(false, x_domain);
                  newData = getNewDataArr(x_domain);
                  update_yAxis(false, newData);
                  renderChart(true, newData);
                  brush_g.call(brush.move, [x2(x_domain[0]), x2(x_domain[1])]);
                } else {
                  //lower than minimum_data points alarm
                  alarm.attr("display", "inline");
                  alarm_rect
                    .transition()
                    .duration(500)
                    .attr("fill-opacity", 1)
                    .attr("stroke-opacity", 1)
                    .transition()
                    .duration(800)
                    .attr("fill-opacity", 0)
                    .attr("stroke-opacity", 0);
                  alarm_text
                    .transition()
                    .duration(500)
                    .attr("opacity", 1)
                    .transition()
                    .duration(800)
                    .attr("opacity", 0);

                  if (alarm_g_timeOut)
                    if (alarm_g_timeOut._time != Infinity)
                      alarm_g_timeOut.stop();
                  alarm_g_timeOut = d3.timeout(
                    () => alarm.attr("display", "none"),
                    1300
                  );
                  // console.debug(alarm_g_timeOut._time);
                }
              } else {
                //-------- reset zoom
                // console.log("single point");
                update_xAxis(origin_x_domain, true);
                update_yAxis(true);
                renderChart(false);
                brush_g.call(brush.move, x2.range());
              }
              selectionRect.remove();
            });
          event_rect.call(dragBehavior);

          //zoom to pre_xdomain before normalize
          if (pre_xdomain) {
            brush_g.call(brush.move, [x2(pre_xdomain[0]), x2(pre_xdomain[1])]);
            update_xAxis(pre_xdomain, false);
            newData = getNewDataArr(pre_xdomain);
            update_yAxis(false, newData);
            renderChart(false, newData);
          }
        }

        svg.call(events, focus);

        return svg.node();
      }
      function overlayChart(data) {
        let width = 800;
        let height = 500;
        let height2 = 65; //for context
        const svg = d3
          .create("svg")
          .attr("viewBox", [0, 0, width, height + height2]);

        let line = d3
          .line()
          .defined((d) => !isNaN(d.x))
          .x((d) => x(d.x))
          .y((d) => y(d.y));

        let margin = getMargin();

        let x = referenceTime
          ? d3
              .scaleUtc()
              .domain([
                d3.min(data, (d) => d3.min(d.data, (d) => d.x)),
                d3.max(data, (d) => d3.max(d.data, (d) => d.x)),
              ])
              .range([margin.left, width - margin.right])
          : d3
              .scaleLinear()
              .domain([
                d3.min(data, (d) => d3.min(d.data, (d) => d.x)),
                d3.max(data, (d) => d3.max(d.data, (d) => d.x)),
              ])
              // .nice()
              .range([margin.left, width - margin.right]);

        let origin_x_domain = x.domain();

        let y = d3
          .scaleLinear()
          .domain([
            d3.min(data, (d) => d3.min(d.data, (d) => d.y)),
            d3.max(data, (d) => d3.max(d.data, (d) => d.y)),
          ])
          .nice()
          .range([height - margin.bottom, margin.top]);
        let origin_y_domain = y.domain();

        let xAxis_g = (g) =>
          g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(
              d3
                .axisBottom(x)
                .ticks(width / 80)
                .tickSizeOuter(0)
            )
            .append("text")
            .attr("x", width / 2)
            .attr("y", margin.top + 6)
            .attr("fill", "black")
            .attr("font-weight", "bold")
            .text("Time" + (referenceTime ? "" : " (s)"));

        let tick_toSN_index, tick_SN_Arr;

        let yAxis_g = (g) =>
          g
            .attr("transform", `translate(${margin.left},0)`)
            .attr("class", "yAxis")
            .call(d3.axisLeft(y).ticks(height / 40))

            // //＝＝＝＝＝＝＝＝＝＝tick轉科學記號
            // //刻度轉成科學記號的常數
            .call((g) => {
              let ticks = g.selectAll(".tick text")._groups[0];
              let tickRange = ticks[1].__data__ - ticks[0].__data__;
              tick_toSN_index = toScientificNotation(tickRange)[1];
              tick_SN_Arr = [];

              g.selectAll(".tick text")._groups[0].forEach((d) => {
                let SN = toScientificNotation(d.__data__, tick_toSN_index);
                tick_SN_Arr.push({ constant: SN[0] });
              });
              // console.debug(tick_SN_Arr);
              g.selectAll(".tick text").text((d, i) => tick_SN_Arr[i].constant);
              //標示指數在左上角(10的0次不標)
              if (tick_toSN_index != 0)
                g.selectAll(".tick:last-child")
                  .append("text")
                  .attr("x", 0)
                  .attr("y", -margin.top / 3)
                  .attr("fill", "black")
                  .attr("text-anchor", "start")
                  // .attr("alignment-baseline", "before-edge")
                  .text("( x 10")
                  .append("tspan")
                  .attr("dy", -5)
                  .attr("font-weight", "bold")
                  .attr("font-size", "10")
                  .text(tick_toSN_index)
                  .append("tspan")
                  .attr("dy", 5)
                  .attr("font-weight", "normal")
                  .attr("font-size", "10")
                  .text(" )");
            })
            //＝＝＝＝＝＝＝＝＝＝資料分隔線與tick虛線
            .call((g) => {
              let lastTickIndex =
                g.selectAll("g.yAxis g.tick")._groups[0].length - 1;
              g.selectAll("g.yAxis g.tick line")
                .attr("x2", (d) => width - margin.left - margin.right)
                .attr("stroke-opacity", (d, i) =>
                  i == lastTickIndex ? 1 : 0.2
                );
            })
            .append("text")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 8)
            .attr("fill", "black")
            .attr("font-weight", "bold")
            .attr("font-size", "10")
            .style("text-anchor", "middle")
            .attr("alignment-baseline", "text-before-edge")
            .attr("transform", "rotate(-90)")
            .call((g) => g.text("Amplipude" + (normalize ? " (count)" : "")));

        let xAxis = svg.append("g").call(xAxis_g);

        // console.debug(xAxis);

        let yAxis = svg.append("g").call(yAxis_g);

        const focus = svg
          .append("g")
          .attr("class", "focus")
          .attr("clip-path", "url(#clip)");

        let renderChart = (trans = false, dateArr = data) => {
          if (trans)
            focus
              .selectAll("path")
              .data(dateArr)
              .join("path")
              .transition()
              .duration(500)
              .style("mix-blend-mode", "normal")
              .attr("fill", "none")
              .attr("stroke-width", 1)
              .attr("stroke-linejoin", "round")
              .attr("stroke-linecap", "round")
              .attr("stroke-opacity", 0.8)
              .attr("stroke", (d, i) => getLineColor(i))
              .attr("d", (d, i) => line(d.data));
          else
            focus
              .selectAll("path")
              .data(dateArr)
              .join("path")
              .style("mix-blend-mode", "normal")
              .attr("fill", "none")
              .attr("stroke-width", 1)
              .attr("stroke-linejoin", "round")
              .attr("stroke-linecap", "round")
              .attr("stroke-opacity", 0.8)
              .attr("stroke", (d, i) => getLineColor(i))
              .attr("d", (d, i) => line(d.data));
        };
        renderChart();
        //====================================channel Title====================================
        svg
          .append("g")
          .append("text")
          .attr("x", margin.left + 50)
          .attr("align", "center")
          .attr("y", margin.top / 2)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .attr("alignment-baseline", "central")
          .attr("font-weight", "bold")
          .attr("font-size", "13")
          .text(title);
        //====================================referenceTime====================================
        svg
          .append("g")
          .append("text")
          .attr("x", width - margin.right)
          .attr("align", "center")
          .attr("y", margin.top / 2)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .attr("alignment-baseline", "central")
          .attr("font-weight", "bold")
          .attr("font-size", "13")
          .text("referenceTime : " + referenceTimeStr);
        //====================================legend=========================================================

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
              (path_width + path_interval) * data.length +
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
              .data(data)
              .join("g")
              .call((g) => {
                g.append("line")
                  .attr("stroke-width", 3)
                  .attr("stroke-opacity", 1)
                  .attr("stroke", (d, i) => getLineColor(i))
                  .attr(
                    "x1",
                    (d, i) =>
                      (path_width + path_interval) * i + path_margin_horizontal
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
                  .text((d, i) =>
                    channel ? channel[i] : d.fileName.split(".")[2]
                  );
              });
          });

        //====================================legend=========================================================

        //====================================events=========================================================
        function events(svg) {
          function chartEvent() {
            const datesArr = data[0].data.map((obj) => obj.x);
            let newDatesArr = datesArr;
            let newData = data;

            const lineStroke = "2px";
            const lineStroke2 = "0.5px";

            //====================================mouse move==================================================
            const mouseG = svg.append("g").attr("class", "mouse-over-effects");

            mouseG
              .append("path") // create vertical line to follow mouse
              .attr("class", "mouse-line")
              .style("stroke", "#A9A9A9")
              .style("stroke-width", lineStroke)
              .style("opacity", "0");

            // console.debug(data);
            const mousePerLine = mouseG
              .selectAll(".mouse-per-line")
              .data(data)
              .enter()
              .append("g")
              .attr("class", "mouse-per-line");

            mousePerLine
              .append("circle")
              .attr("r", 3)
              .style("stroke", "white")
              .style("fill", "none")
              .style("stroke-width", lineStroke2)
              .style("opacity", "0");
            mousePerLine
              .append("circle")
              .attr("r", 4)
              .style("stroke", (d, i) => getLineColor(i))
              .style("fill", "none")
              .style("stroke-width", lineStroke)
              .style("opacity", "0");
            mousePerLine
              .append("circle")
              .attr("r", 5)
              .style("stroke", "white")
              .style("fill", "none")
              .style("stroke-width", lineStroke2)
              .style("opacity", "0");

            svg
              .append("defs")
              .append("clipPath")
              .attr("id", "clip")
              .append("rect")
              .attr("id", "rectRenderRange")
              .attr("x", margin.left)
              .attr("y", margin.top)
              .attr("width", width - margin.right - margin.left)
              .attr("height", height - margin.top - margin.bottom)
              .attr("fill", "none")
              .attr("pointer-events", "all");

            //==tooltip
            const chart_center = [d3.mean(x.range()), d3.mean(y.range())];
            const tooltipMouseGap = 50;

            const tooltip = d3
              .select("#charts")
              .append("div")
              .attr("id", "tooltip")
              .style("position", "absolute")
              .style("z-index", "999")
              .style("background-color", "#D3D3D3")
              .style("padding", "20px 20px 20px 20px")
              .style("opacity", " .9")
              .style("display", "none");
            // append a rect to catch mouse movements on canvas
            let event_rect = mouseG
              .append("use")
              .attr("xlink:href", "#rectRenderRange")
              .on("mouseleave", function () {
                // on mouse out hide line, circles and text
                svg.select(".mouse-line").style("opacity", "0");
                svg.selectAll(".mouse-per-line circle").style("opacity", "0");
                svg.selectAll(".mouse-per-line text").style("opacity", "0");
                tooltip
                  // .transition().duration(500)
                  // .style("opacity", 0)
                  .style("display", "none");
              })
              .on("mousemove", function (event) {
                // update tooltip content, line, circles and text when mouse moves
                event.preventDefault();
                const pointer = d3.pointer(event, this);
                const xm = x.invert(pointer[0]);
                // const ym = y.invert(pointer[1]);
                const idx = d3.bisectCenter(newDatesArr, xm);
                const sortedIndex = d3.range(newData.length);
                // console.debug('start' + sortedIndex);
                // console.debug(newData[0].data.length);
                // console.debug(idx + "/" + newData[0].data.length);
                // console.debug(data[0].data.length);
                svg
                  .selectAll(".mouse-per-line")
                  .attr("transform", function (d, i) {
                    // console.debug(d);
                    svg.select(".mouse-line").attr("d", function () {
                      let data =
                        "M" +
                        x(newData[i].data[idx].x) +
                        "," +
                        (height - margin.bottom);
                      data +=
                        " " + x(newData[i].data[idx].x) + "," + margin.top;
                      return data;
                    });

                    // console.debug(d.data[idx].y);
                    return (
                      "translate(" +
                      x(newData[i].data[idx].x) +
                      "," +
                      y(newData[i].data[idx].y) +
                      ")"
                    );
                  });

                let timeStr;
                if (referenceTime) {
                  let ISOString = new Date(newDatesArr[idx]).toISOString();
                  timeStr = ISOString.substring(
                    ISOString.indexOf("T") + 1,
                    ISOString.indexOf("Z")
                  );
                } else timeStr = newDatesArr[idx].toFixed(2);
                const divHtml =
                  "Time : <br/><font size='5'>" +
                  timeStr +
                  "</font> s<br/>Amplipude : <br/>";
                // console.debug(dot.offset());
                svg.select(".mouse-line").style("opacity", "0.7");
                svg.selectAll(".mouse-per-line circle").style("opacity", "1");

                tooltip
                  .html(divHtml)
                  .style("display", "inline")
                  .style(
                    "left",
                    `${
                      pointer[0] < chart_center[0]
                        ? event.pageX + tooltipMouseGap
                        : event.pageX -
                          tooltipMouseGap -
                          tooltip.property("clientWidth")
                    }px`
                  )
                  .style(
                    "top",
                    `${
                      pointer[1] < chart_center[1]
                        ? event.pageY
                        : event.pageY - tooltip.property("clientHeight")
                    }px`
                  )
                  .selectAll()
                  .data(newData)
                  .enter()
                  .append("div")
                  .call(() => {
                    // console.debug('=============');
                    for (let i = 0; i < newData.length - 1; i++)
                      for (let j = 0; j < newData.length - 1 - i; j++)
                        // console.debug(data[sortedIndex[j]].data[idx].y, data[sortedIndex[j + 1]].data[idx].y);
                        if (
                          newData[sortedIndex[j]].data[idx].y <
                          newData[sortedIndex[j + 1]].data[idx].y
                        ) {
                          let tmp = sortedIndex[j];
                          sortedIndex[j] = sortedIndex[j + 1];
                          sortedIndex[j + 1] = tmp;
                        }
                    // console.debug(sortedIndex);
                  })
                  .style("color", (d, i) => getLineColor(sortedIndex[i]))
                  .style("font-size", 10)
                  .html((d, i) => {
                    // console.debug(d.data);
                    let y = newData[sortedIndex[i]].data[idx].y;
                    let SN = toScientificNotation(y, tick_toSN_index);
                    let constant = Number.isInteger(SN[0])
                      ? SN[0]
                      : Math.round(SN[0] * 100000) / 100000;
                    let index = SN[1];
                    let SN_html = "";
                    if (index == 0) SN_html = constant;
                    else SN_html = constant + " x 10<sup>" + index + "</sup>";
                    let html = "<font size='5'>" + SN_html + "</font>";
                    return html;
                  });
              });

            //====================================context==================================================
            function getNewDataArr(x_domain) {
              let newData = [];
              let i1 = d3.bisectCenter(datesArr, x_domain[0]);
              let i2 = d3.bisectCenter(datesArr, x_domain[1]);
              // console.debug(i1, i2);

              //make sure zoom in path will be continue
              if (i1 - 1 >= 0) i1--;
              if (i2 + 1 < data[0].data.length) i2++;

              data.forEach((d, index) => {
                let tmpData = [],
                  tmpDates = [];
                for (let i = i1; i <= i2; i++) {
                  tmpData.push(d.data[i]);
                  if (index == 0) tmpDates.push(d.data[i].x);
                }
                newData.push({ data: tmpData });
                if (index == 0) newDatesArr = tmpDates;
              });
              // console.log(newData);
              return newData;
            }
            let update_xAxis = (x_domain, trans = false) => {
              pre_xdomain = x_domain;
              x.domain(x_domain);
              if (trans)
                xAxis
                  .transition()
                  .duration(1000)
                  .call(
                    d3
                      .axisBottom(x)
                      .ticks(width / 80)
                      .tickSizeOuter(0)
                  );
              else
                xAxis.call(
                  d3
                    .axisBottom(x)
                    .ticks(width / 80)
                    .tickSizeOuter(0)
                );
            };
            let update_yAxis = (origin = true, newDataArr = undefined) => {
              if (origin) {
                y.domain(origin_y_domain);
                newData = data;
                newDatesArr = datesArr;
              } else {
                y.domain([
                  d3.min(newDataArr, (d) => d3.min(d.data, (d) => d.y)),
                  d3.max(newDataArr, (d) => d3.max(d.data, (d) => d.y)),
                ]).nice();
              }
              yAxis.selectAll("*").remove();
              yAxis.call(yAxis_g);
            };
            // let contextData = data[lastIndex];
            let context = svg
              .append("g")
              .attr("class", "context")
              .attr("transform", "translate(0, " + height + ")")
              .selectAll("path")
              .data(data)
              .join("path")
              .style("mix-blend-mode", "normal")
              .attr("fill", "none")
              .attr("stroke-width", 1)
              .attr("stroke-linejoin", "round")
              .attr("stroke-linecap", "round")
              .attr("stroke-opacity", 1)
              .attr("stroke", "#272727")
              .attr("d", (d, i) => {
                let y2 = d3
                  .scaleLinear()
                  .domain(origin_y_domain)
                  .range([height2 - margin.bottom, 0]);

                let line2 = d3
                  .line()
                  .defined((d) => !isNaN(d.x))
                  .x((d) => x(d.x))
                  .y((d) => y2(d.y));

                return line2(d.data);
              });

            let x2 = referenceTime
              ? d3
                  .scaleUtc()
                  .domain(origin_x_domain)
                  .range([margin.left, width - margin.right])
              : d3
                  .scaleLinear()
                  .domain(origin_x_domain)
                  .range([margin.left, width - margin.right]);

            svg
              .append("g")
              .attr("class", "context_xAxis")
              .attr(
                "transform",
                "translate(0," + (height + height2 - margin.bottom) + ")"
              )
              .call(
                d3
                  .axisBottom(x2)
                  .ticks(width / 80)
                  .tickSizeOuter(0)
              );

            let pre_selection = x2.range();
            let brush_flag = true;
            let brush = d3
              .brushX()
              .extent([
                [margin.left, 0],
                [width - margin.right, height2 - margin.bottom],
              ])
              .on("start", (event) => {
                if (!event.sourceEvent) return;
                // console.log("brush start");
                update_yAxis(true);
                renderChart();
              })
              .on("brush", (event) => {
                if (!event.sourceEvent) return; // ignore brush-by-zoom

                let action = () => {
                  // console.log("brushing");
                  let selection = event.selection;
                  // console.debug(selection);

                  if (selection) {
                    let x_domain = [
                      x2.invert(selection[0]),
                      x2.invert(selection[1]),
                    ];

                    if (x_domain[1] - x_domain[0] > 40 * timeDiff) {
                      if (brush_flag) {
                        update_xAxis(x_domain);
                        newData = getNewDataArr(x_domain);
                        renderChart(false, newData);
                        brush_flag = false;
                        d3.timeout(() => (brush_flag = true), 100);
                      }
                    } else {
                      if (selection[0] == pre_selection[0]) {
                        // console.log('brush rihgt');
                        brush_g.call(brush.move, [
                          selection[0],
                          x2(x_domain[0] + 40 * timeDiff),
                        ]);
                      } else if (selection[1] == pre_selection[1]) {
                        // console.log('brush left');
                        brush_g.call(brush.move, [
                          x2(x_domain[1] - 40 * timeDiff),
                          selection[1],
                        ]);
                      } else {
                        // console.log('brush clear');
                        brush_g.call(brush.clear);
                      }
                    }
                  }
                  pre_selection = selection;
                };
                updateHandler(action);
              })
              .on("end", (event) => {
                if (!event.sourceEvent) return; // ignore brush-by-zoom
                // console.log("brush end");
                let selection = event.selection;

                if (selection) {
                  let x_domain = [
                    x2.invert(selection[0]),
                    x2.invert(selection[1]),
                  ];
                  update_xAxis(x_domain, true);
                  newData = getNewDataArr(x_domain);
                  update_yAxis(false, newData);
                  renderChart(true, newData);
                } else {
                  update_xAxis(origin_x_domain, true);
                  update_yAxis(true);
                  renderChart(true);
                  brush_g.call(brush.move, x2.range());
                }
              });

            let brush_g = svg
              .append("g")
              .attr("class", "brush")
              .attr("transform", "translate(0," + height + ")");

            brush_g.call(brush).call(brush.move, x2.range());

            // console.debug($(".selection"));
            // $(".selection").bind('change', function (event) {

            //     alert($(".selection").attr("value"));
            // });

            // console.debug(x.range());

            //***********TEST************
            // let TEST_x_domain = [95.12, 95.40];
            // brush_g.call(brush.move, [x2(TEST_x_domain[0]), x2(TEST_x_domain[1])]);
            // update_xAxis(TEST_x_domain, true);
            // update_yAxis(false, TEST_x_domain);
            // renderChart(true);
            //***********TEST************
            // //====================================zoom==================================================
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
            //================alarm
            let alarm_width = 300;
            let alarm_height = 50;

            let alarm = svg
              .append("g")
              .attr("class", "alarm")
              .attr("display", "none");

            let minimum_data = 10;
            const timeDiff = data[0].data[1].x - data[0].data[0].x; //======for limit zooming range
            // console.debug(timeDiff);

            let alarm_g_timeOut;
            let alarm_rect = alarm
              .append("rect")
              .attr("rx", 5)
              .attr("ry", 5)
              .attr(
                "x",
                margin.left +
                  (width - margin.left - margin.right - alarm_width) / 2
              )
              .attr(
                "y",
                margin.top +
                  (height - margin.bottom - margin.top - alarm_height) / 2
              )
              .attr("width", alarm_width)
              .attr("height", alarm_height)
              .attr("stroke", "#000000")
              .attr("stroke-opacity", 0)
              .attr("fill", "#D3D3D3")
              .attr("fill-opacity", 0);
            let alarm_text = alarm
              .append("text")
              .attr("x", margin.left + (width - margin.left - margin.right) / 2)
              .attr("y", margin.top + (height - margin.bottom - margin.top) / 2)
              .attr("text-anchor", "middle")
              .attr("alignment-baseline", "middle")
              .attr("opacity", 0)
              .text("It can't be less than " + minimum_data + " data points");
            //================alarm

            let dragBehavior = d3
              .drag()
              .on("start", () => {
                // console.log("dragStart");
                const p = d3.pointer(event, event_rect.node());
                selectionRect.init(p[0], margin.top);
                selectionRect.removePrevious();
              })
              .on("drag", () => {
                // console.log("dragMove");
                const p = d3.pointer(event, event_rect.node());
                if (p[0] < margin.left) p[0] = margin.left;
                else if (p[0] > width - margin.right)
                  p[0] = width - margin.right;
                // console.debug(p);
                // const xm = x.invert(p[0]);
                selectionRect.update(p[0], height - margin.bottom);
              })
              .on("end", () => {
                // console.log("dragEnd");
                // console.debug('end');
                const finalAttributes = selectionRect.getCurrentAttributes();
                // console.debug(finalAttributes);

                if (
                  finalAttributes.x2 - finalAttributes.x1 > 1 &&
                  finalAttributes.y2 - finalAttributes.y1 > 1
                ) {
                  // console.log("range selected");
                  // range selected
                  event.preventDefault();

                  //-------- Update x_domain
                  let x_domain = [
                    x.invert(finalAttributes.x1),
                    x.invert(finalAttributes.x2),
                  ];
                  // console.debug(x_domain);
                  //-------- Update Axis and paths(at less minimum_data  points)
                  if (x_domain[1] - x_domain[0] > minimum_data * timeDiff) {
                    update_xAxis(x_domain, true);
                    newData = getNewDataArr(x_domain);
                    update_yAxis(false, newData);
                    renderChart(true, newData);
                    brush_g.call(brush.move, [
                      x2(x_domain[0]),
                      x2(x_domain[1]),
                    ]);
                  } else {
                    //lower than minimum_data points alarm
                    alarm.attr("display", "inline");
                    alarm_rect
                      .transition()
                      .duration(500)
                      .attr("fill-opacity", 1)
                      .attr("stroke-opacity", 1)
                      .transition()
                      .duration(800)
                      .attr("fill-opacity", 0)
                      .attr("stroke-opacity", 0);
                    alarm_text
                      .transition()
                      .duration(500)
                      .attr("opacity", 1)
                      .transition()
                      .duration(800)
                      .attr("opacity", 0);

                    if (alarm_g_timeOut)
                      if (alarm_g_timeOut._time != Infinity)
                        alarm_g_timeOut.stop();
                    alarm_g_timeOut = d3.timeout(
                      () => alarm.attr("display", "none"),
                      1300
                    );
                    // console.debug(alarm_g_timeOut._time);
                  }
                } else {
                  //-------- reset zoom
                  // console.log("single point");
                  update_xAxis(origin_x_domain, true);
                  update_yAxis(true);
                  renderChart();
                  brush_g.call(brush.move, x2.range());
                }
                selectionRect.remove();
              });
            event_rect.call(dragBehavior);

            //zoom to pre_xdomain before normalize
            if (pre_xdomain) {
              brush_g.call(brush.move, [
                x2(pre_xdomain[0]),
                x2(pre_xdomain[1]),
              ]);
              update_xAxis(pre_xdomain, false);
              newData = getNewDataArr(pre_xdomain);
              update_yAxis(false, newData);
              renderChart(false, newData);
            }
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
          chartEvent();
          infoBoxDragEvent();
        }
        // if (data.length !== 0) svg.call(events);
        svg.call(events);
        return svg.node();
      }

      let plotType = $('input[name ="plotType"]:checked').val();
      //==test
      // plotType = "window";
      let cloneArray;
      switch (plotType) {
        default:
        case "trace":
          let chartNodes = trace();
          data.forEach((d) => {
            getChartMenu(d.fileName);
            $("#chart" + i).append(chartNodes[i - 1]);
            i++;
          });
          break;

        case "window":
          getChartMenu("wf_plot");
          cloneArray = data.slice(0).filter((d) => d.data.length !== 0);
          $("#chart" + i).append(windowChart(cloneArray.reverse()));
          contextSelectionSide();
          break;
        case "overlay":
          getChartMenu("wf_plot");
          cloneArray = data.slice(0).filter((d) => d.data.length !== 0);
          $("#chart" + i).append(overlayChart(cloneArray));
          contextSelectionSide();
          break;
      }
    }

    if (!($("#form-chart").length >= 1)) init();
    printChart();
  }

  return chart;
}
