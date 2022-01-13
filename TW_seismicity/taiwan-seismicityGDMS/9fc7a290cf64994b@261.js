// https://observablehq.com/@mbostock/walmarts-growth@261
export default function define(runtime, observer) {
  const main = runtime.module();


  main.variable(observer()).define(["md"], function (md) {
    return (
      md`# Animation of Taiwan Seismicity`
    )
  });

  main.define("initial date", ['data'], function (data) {
    return (
      data[0].date.getTime()
    )
  });


  main.variable().define("svg", ["d3", "DOM"], function (d3, DOM) {
    // const animation = document.getElementById('animation');
    // window.alert(animation.width);
    const width = 650;
    const height = 650;
    const svg = d3.select(DOM.svg(width, height))
      .style("width", "100%")
      .style("height", "100%")
      .style("min-width", "800px")
      .style("min-height", "800px")
      .attr("transform", "translate(0,0)");
    // const svg = d3.select("body")
    //   .append("svg")
    //   .attr("viewBox", [0, 0, width, height]);
    return svg;
  });
  // ==================projection===============================aaa
  main.variable().define("projection", ["d3",], function (d3) {
    return (
      d3.geoMercator()
        .center([122.5, 24])
        .scale(6500)
    )
  });


  // ==================projection===============================


  //==========Scrubber======================================================
  main.define("delay", ["data", "d3", "speed"], function (data, d3, speed) {
    var domain = data[data.length - 1].date - data[0].date;
    var oneDayEqualMs = 86400000;
    var speedRange = parseInt(domain / (oneDayEqualMs * speed)) * 1000;
    // console.log("total time=" + speedRange);
    // window.alert(speedChange);
    // Refresh = true;

    return (
      d3.scaleTime()
        .domain([data[0].date, data[data.length - 1].date])
        .range([0, speedRange])
    )

  });

  main.variable(observer("viewof keyframe")).define("viewof keyframe", ["Scrubber", "d3", "keyframes"], function (Scrubber, d3, keyframes) {
    // console.log("keyframes=" + keyframes);
    return (
      Scrubber(d3.range(keyframes), {
        // format: i => moment(i).format(),
        delay: 1000,
        loop: false
      })
    )
  });

  var KFS = 0;
  main.variable().define("keyframes", ["delay"], function (delay) {
    // window.alert("A");
    // if (formValue)
    //   ScrubberRate = formValue / KFS;
    // console.log(formValue + "/" + KFS);
    KFS = delay.range()[1] / 1000;

    return (
      delay.range()[1] / 1000 + 1
      // delay.range()[1] / 1000
    )
  });
  main.variable().define("keyframe", ["Generators", "viewof keyframe"], (G, _) => G.input(_));

  //==============speed==================================

  main.variable().define("speeds", ["d3"], function (d3) {
    // var speeds = [
    //   [7, 'one week'],
    //   [30.4375, 'one month'],
    //   [91.3125, 'three months'],
    //   [182.625, 'six months'],
    //   [365.25, 'one year'],
    // ]
    // window.alert(speeds);
    // speeds.forEach(([speed, name], i) => {
    //   window.alert("i=" + i + " speed=" + speed + " name=" + name);
    // });
    return d3.range(5, 181);
  });

  main.variable(observer("viewof speed")).define("viewof speed", ["html", "speeds", "mutable date", "data"], function (html, speeds, $0, data) {
    // speeds.forEach(([speed, name], i) => {
    //   window.alert("i=" + i + " speed=" + speed + " name=" + name);
    // });

    // const form = html`<form style="font: 12px var(--sans-serif); display: flex; height: 33px; align-items: center;">
    //   ${speeds.map(([speed, name], i) => html`<label style="margin-right: 1em; display: inline-flex; align-items: center;">
    //     <input type="radio" name="radio" value="${i}" style="margin-right: 0.5em;" ${i === 0 ? "checked" : ""}> ${name}
    //   <sub style="font-size:50%">/s</sub></label>`)}
    // </form>`;

    // form.onchange = () => form.dispatchEvent(new CustomEvent("input")); // Safari
    // form.oninput = event => {
    //   form.onchange = null;
    //   form.value = speeds[form.radio.value][0];
    // };
    // form.value = speeds[form.radio.value][0];


    const values = Array.from(speeds);
    const initial = 30 - values[0];
    var domain = data[data.length - 1].date - data[0].date;
    const form = html`<form id="vs" style="font: 12px var(--sans-serif); display: flex; height: 33px; align-items: center;">
    <label style="margin-top: 1em;display: flex; align-items: center;">Play Speed
    <input style="margin-left: 1em;margin-top: 0.2em;" name=i id="sd" type=range min=0 max=${values.length - 1} value=${initial} step=1 style="width: 180px;">
    <output name=o style="margin-left: 0.4em;"></output> days
    <sub style="position: relative; top: 0.5em;">/s</sub>
    </label>
    </form>`;

    form.i.oninput = event => {
      // console.debug('speed change');
      // console.log("FV2=" + formValue);
      // if (formValue && formValue != 0)
      // ScrubberRate = formValue / KFS;
      // console.debug($0.value + "-" + data[0].date.getTime() + "=" + ($0.value - data[0].date.getTime()));
      // console.debug(domain);
      ScrubberRate = ($0.value - data[0].date) / domain;
      // console.debug('ScrubberRate = ');
      // console.debug(ScrubberRate);
      if (event && event.isTrusted) {
        speedChange = true;

      }
      form.value = values[form.i.valueAsNumber];
      form.o.value = form.value;
      // form.i.dispatchEvent(new CustomEvent("input", { bubbles: true }));

    };
    form.i.oninput();
    return form;

  }
  );

  main.variable().define("speed", ["Generators", "viewof speed"], (G, _) => G.input(_));

  //======================================================================

  main.variable().define("mutable date", ["Mutable", "initial date"], (M, _) => new M(_));
  main.variable(observer("date")).define("date", ["mutable date"], _ => _.generator);


  var timeOuts = [];
  var Refresh = true;
  var restart = false;
  var speedChange = false;
  var startTime, stopTime;
  var formValue;
  var ScrubberRate = 0;
  //for legendGroup
  var depth_domain, ML_range2;
  main.variable(observer("chart")).define("chart", ["d3", "data", "topojson", "tw", "mutable date", "legend", "projection", "svg", "invalidation"], function (d3, data, topojson, tw, $0, legend, projection, svg, invalidation) {
    const path = d3.geoPath().projection(
      projection
    );
    //===========range1:紅圈半徑範圍==range2：留下點半徑範圍===========================
    const range1 = [10, 100];
    const range2 = [3, 12];//[3, 8]
    //=================================================================================


    svg.append("path")
      .datum(topojson.merge(tw, tw.objects.layer1.geometries))
      .attr("fill", "#ADADAD")
      .attr("d", path);

    svg.append("path")
      .datum(topojson.mesh(tw, tw.objects.layer1, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", path);



    const ML_domain = [data[0].ML, data[0].ML];
    depth_domain = [data[0].depth, data[0].depth];
    data.forEach((v, i) => {
      if (data[i].ML < ML_domain[0])
        ML_domain[0] = data[i].ML;
      else if (data[i].ML > ML_domain[1])
        ML_domain[1] = data[i].ML;
      if (data[i].depth < depth_domain[0])
        depth_domain[1] = data[i].depth;
      else if (data[i].depth > depth_domain[1])
        depth_domain[0] = data[i].depth;
    });

    // console.log(ML_domain + "  " + depth_domain);

    const ML_range1 = d3.scaleLinear()
      .domain(ML_domain)
      .range(range1);
    ML_range2 = d3.scaleLinear()
      .domain(ML_domain)
      .range(range2);

    // var depth_range = d3.scaleSequentialSqrt([0, depth_domain[0]], d3.interpolateTurbo);
    var depth_range = d3.scaleSequentialSqrt([depth_domain[0], 0], d3.interpolateTurbo);
    // console.debug(depth_range);

    const legend_translate = [10, 400];
    const legendGroup = svg.append("g")
      .attr("transform", `translate(${legend_translate})`)
      .attr("class", "legendGroup");

    legendGroup.append("g")
      .attr("transform", `translate(0,35)`)
      .append(() => legend({
        color: d3.scaleSequentialSqrt([0, depth_domain[0]], d3.interpolateTurbo),
        // color: depth_range,
        title: "Depth (km)",
        width: 240,
        // ticks: 5,
        tickValues: [0, 50, 100, 200, 300],
      }));


    //===========rlegend=====================
    // var linearScale = d3.scaleLinear()
    //   .domain([4.5, 8])
    //   .range([0, 300]);

    // var sqrtScale = d3.scaleSqrt()
    //   .domain(ML_domain)
    //   .range(range2);
    var cx = 50;
    var legend_ML = [4.5, 5, 6, 7, 8];

    // for (const d of legend_ML)
    //   window.alert(d.index);
    // var difference = (ML_domain[1] - ML_domain[0]);
    // for (var i = 0; i <= 5; i++)
    //   myData.push(ML_domain[0] + difference / 5 * i);

    const rlegend_g = legendGroup.append("g")
      .attr("transform", `translate(10,0)`);

    rlegend_g
      .append("rect")
      .attr("height", 23)
      .attr("width", cx * 4 + 30)
      .attr("fill", "#BEBEBE")
      .attr("y", -12)
      .attr("rx", 12);

    rlegend_g
      .selectAll('circle')
      .data(legend_ML)
      .enter()
      .append('circle')
      .attr("fill", "#888")
      .attr('r', function (d) {
        return ML_range2(d);
      })
      .attr('cx', function (d, i) {
        // window.alert(i);
        return i * cx + 10;
      })
      .attr("stroke-opacity", 1)
      .attr("stroke", "white");

    // window.alert(legend_translate);

    //--------------rlegend_g text
    rlegend_g.append('text')
      .attr("x", -20)
      .attr("y", 0)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .attr("font-size", "13")
      .text("M")
      .append('tspan')
      .attr("dy", "4")
      .attr("font-size", "10")
      .text('L');

    rlegend_g.selectAll('g')
      .data(legend_ML)
      .enter()
      .append('text')
      .attr('id', 'DDDDD')
      .attr('fill', 'currentColor')
      .attr("font-weight", "lighter")
      .text(function (d) {
        return d.toFixed(1);
      })
      .attr('x', function (d, i) {
        return i * cx;
      })
      .attr('y', "25");

    //============================================


    const g = svg.append("g").attr("id", "foo");

    function putRange(d) {
      var radius1 = ML_range1(d.ML).toFixed(2);
      g.append("circle")
        .attr("transform", `translate(${d})`)
        .attr("r", radius1)
        .attr("fill", "red")
        .attr("fill-opacity", 0.3)
        .attr("stroke-opacity", 0)
        .transition()
        .delay(150)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .attr("stroke", "black");
      // console.log("ML:" + d.ML + "(radius1:" + radius1 + ")\ndepth:" + d.depth + "(color:" + color + ")" + "\ndate:" + moment(d.date).format());

    }
    function putSpot(d) {
      var radius2 = ML_range2(d.ML);
      var color = depth_range(d.depth);
      g.append("circle")
        .attr("transform", `translate(${d})`)
        .attr("r", radius2)
        .attr("fill", color)
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1)
        .attr("stroke", "white");
    }


    // var timeOuts = [];

    var dataCount = 0;
    var UserDragTime = 0;
    var DragDomainTime = 0;

    invalidation.then(() => svg.interrupt());

    return Object.assign(svg.node(), {
      update(keyframe, keyframes, delay) {

        // console.log("KF=" + keyframe);
        // console.log(dataCount);
        // console.log(keyframe / keyframes);
        // window.alert(delay.range()[1]);

        if (Refresh) {
          // window.alert(timeOuts.length);


          var gNode = document.getElementById("foo");
          while (gNode.firstChild) {
            gNode.removeChild(gNode.firstChild);
          }

          keyframe = formValue;
          // console.log("KF=" + keyframe);
          dataCount = keyframe / (keyframes - 1) * (data.length - 1);
          UserDragTime = keyframe / (keyframes - 1) * delay.range()[1];
          DragDomainTime = delay.domain()[0].getTime() + keyframe / (keyframes - 1) * (delay.domain()[1] - delay.domain()[0]);
          // console.log(UserDragTime);
          // console.log(DragDomainTime);
          // window.alert(keyframe / keyframes * (delay.domain()[1] - delay.domain()[0]));
          // window.alert(dataCount);
          // console.log("been:" + keyframe / (keyframes - 1) * 100 + "%");
          // console.log("dc=" + dataCount);

          for (var i = 0; i < dataCount; i++)
            putSpot(data[i]);

          // window.alert(dataCount);



          timeOuts.forEach(function (timeOut) {
            timeOut.stop();
          });
          timeOuts = [];
          // console.log("dataCount=" + dataCount);
          // putSpot(data[i]);
          for (const [i, d] of data.entries()) {
            if (i >= dataCount) {
              // console.log("i=" + i);
              timeOuts.push(d3.timeout(() => {
                putSpot(d);
                putRange(d);
                // console.log("T=" + moment($0.value).format());

                // console.debug("delay(d.date)=" + delay(d.date));
              }, delay(d.date) - UserDragTime));
            }
          }
          startTime = d3.now();
          // d3.timerFlush();
          // console.log("delay=" + delay.domain(), delay.range());
          // console.log("UserDragTime=" + UserDragTime);
          // var button = document.getElementsByName("b")[0];
          // console.log("KF=" + keyframe);

          svg.transition().duration(0);
          svg.transition()
            .ease(d3.easeLinear)
            .duration(delay.range()[1] - UserDragTime)
            .tween("date", () => {
              const i = d3.interpolateDate(DragDomainTime, delay.domain()[1]);
              // window.alert(d3.timeDay(data[0].date));
              return t => $0.value = d3.timeMinute(i(t));
            });

          Refresh = false;

        }
        else if (restart) {


          // dataCount = data.length - timeOuts.length;
          // window.alert(data[dataCount]);
          var TimebeenRun = stopTime - startTime;


          svg.transition()
            .ease(d3.easeLinear)
            .duration(delay.range()[1] - UserDragTime - TimebeenRun)
            .tween("date", () => {
              const i = d3.interpolateDate($0.value, delay.domain()[1]);
              // window.alert(d3.timeDay(data[0].date));       
              return t => $0.value = d3.timeMinute(i(t));
            });

          for (const [i, d] of data.entries()) {
            var restart_delay = delay(d.date) - UserDragTime - TimebeenRun;
            if (restart_delay > 0)
              timeOuts.push(d3.timeout(() => {
                putSpot(d);
                putRange(d);
                // console.log("T=" + moment($0.value).format());
              }, restart_delay));

          }



          // for (const [i, d] of data.entries()) {

          //   if (i >= dataCount)
          // timeOuts.forEach(function (timeOut) {

          //   timeOut.restart(() => {
          //     putSpot(data[dataCount]);
          //     putRange(data[dataCount]);
          //     // console.log("T=" + moment($0.value).format());
          //   }, delay(data[dataCount].date) - UserDragTime);
          //   dataCount++;

          // });

          // }
          restart = false;


        }
        else if (speedChange) {

          // var inputNode = document.getElementById("kf");
          // // window.alert(inputNode);
          // console.log(ScrubberRate + "*" + (keyframes - 1) + "=" + parseInt(ScrubberRate * (keyframes - 1)));
          // inputNode.valueAsNumber = parseInt(ScrubberRate * (keyframes - 1));
          // window.alert($0.value - delay.domain()[0]);
          // ScrubberRate = ($0.value - delay.domain()[0]) / (delay.domain()[1] - delay.domain()[0]);
          // console.log(ScrubberRate);


          timeOuts.forEach(function (timeOut) {
            timeOut.stop();
          });
          timeOuts = [];

          // stopTime = d3.now();

          // var TimebeenRun = stopTime - startTime;
          // dataCount = ScrubberRate * (data.length - 1);
          UserDragTime = ScrubberRate * delay.range()[1];
          DragDomainTime = delay.domain()[0].getTime() + ScrubberRate * (delay.domain()[1] - delay.domain()[0]);

          // console.log("UDT" + UserDragTime);

          svg.transition().duration(0);
          svg.transition()
            .ease(d3.easeLinear)
            .duration(delay.range()[1] - UserDragTime)
            .tween("date", () => {
              const i = d3.interpolateDate(DragDomainTime, delay.domain()[1]);
              // window.alert(d3.timeDay(data[0].date));       
              return t => $0.value = d3.timeMinute(i(t));
            });



          // for (var i = 0; i < dataCount; i++)
          //   putSpot(data[i]);
          // for (const [i, d] of data.entries()) {
          //   if (i >= dataCount) {
          //     timeOuts.push(d3.timeout(() => {
          //       putSpot(d);
          //       putRange(d);
          //       // console.log("T=" + moment($0.value).format());
          //     }, delay(d.date) - UserDragTime));
          //   }
          // }
          // startTime = d3.now();

          for (const [i, d] of data.entries()) {
            var restart_delay = delay(d.date) - UserDragTime;
            if (restart_delay > 0)
              timeOuts.push(d3.timeout(() => {
                putSpot(d);
                putRange(d);
                // console.log("T=" + moment($0.value).format());
              }, restart_delay));
          }
          startTime = d3.now();

          // window.alert(formValue);

          speedChange = false;
        }



      }
    });
  }
  );

  //====================legendGroup
  // main.variable(observer("a")).define("lendGroup", ["d3", "legend", "chart", "DOM", "svg"], function (d3, legend, chart, DOM, svg) {
  //   const legend_translate = [10, 60];

  //   const width = 400;
  //   const height = 150;
  //   const legendGroup = svg.append('g')
  //     // d3.create('svg')
  //     .attr('class', 'legendGroup')
  //   // .attr("viewBox", "0 0 " + width + " " + height)
  //   // .style("width", "100%")
  //   // .style("height", "100%");
  //   // .attr("transform", "translate(0,0)");
  //   // const legendGroup = d3.create('svg').attr('class', 'legendGroup');

  //   legendGroup.append("g")
  //     .attr("transform", `translate(${legend_translate})`)
  //     .append(() => legend({
  //       color: d3.scaleSequentialSqrt([0, depth_domain[0]], d3.interpolateTurbo),
  //       title: "Depth (km)",
  //       width: 240,
  //       // ticks: 5,
  //       tickValues: [0, 50, 100, 200, 300],
  //     }));
  //   //===========rlegend=====================

  //   var cx = 50;
  //   var legend_ML = [4.5, 5, 6, 7, 8];

  //   const rlegend_g = legendGroup.append("g");

  //   rlegend_g
  //     .append("rect")
  //     .attr("height", 23)
  //     .attr("width", cx * 4 + 30)
  //     .attr("fill", "#BEBEBE")
  //     .attr("y", -12)
  //     .attr("rx", 12);

  //   rlegend_g
  //     .attr("transform", `translate(${legend_translate[0] + 10},${legend_translate[1] - 35})`)
  //     .selectAll('circle')
  //     .data(legend_ML)
  //     .enter()
  //     .append('circle')
  //     .attr("fill", "#888")
  //     .attr('r', function (d) {
  //       return ML_range2(d);
  //     })
  //     .attr('cx', function (d, i) {
  //       // window.alert(i);
  //       return i * cx + 10;
  //     })
  //     .attr("stroke-opacity", 1)
  //     .attr("stroke", "white");

  //   // window.alert(legend_translate);


  //   //--------------rlegend_g text
  //   rlegend_g.append('text')
  //     .attr("x", -20)
  //     .attr("y", 0)
  //     .attr("fill", "currentColor")
  //     .attr("text-anchor", "start")
  //     .attr("font-weight", "bold")
  //     .attr("font-size", "13")
  //     .text("M")
  //     .append('tspan')
  //     .attr("dy", "4")
  //     .attr("font-size", "10")
  //     .text('L');

  //   rlegend_g.selectAll('g')
  //     .data(legend_ML)
  //     .enter()
  //     .append('text')
  //     .attr('id', 'DDDDD')
  //     .attr('fill', 'currentColor')
  //     .attr("font-weight", "lighter")
  //     .text(function (d) {
  //       return d.toFixed(1);
  //     })
  //     .attr('x', function (d, i) {
  //       return i * cx;
  //     })
  //     .attr('y', "25");

  //   // return legendGroup.node();
  // });
  //====================UD
  main.variable(observer).define(["chart", "keyframe", "keyframes", "delay"], function (chart, keyframe, keyframes, delay) {
    // console.log("KF=" + keyframe);
    // window.alert(delay);
    return (
      chart.update(keyframe, keyframes, delay)
    )
  });

  main.variable().define("data", ["d3", "projection"], async function (d3, projection) {


    // const data = await d3.csv("./data/ALVEYYE.csv", d => {
    //   // const data = await d3.csv("./data/GDMScatalog.csv", d => {
    //   if (d.lon <= 124 && d.lon >= 118 && d.lat <= 26 && d.lat >= 21) {
    //     const p = projection([parseFloat(d.lon), parseFloat(d.lat)]);

    //     if ((d.time.charAt(d.time.length - 1) == ".")) {
    //       d.time += "0";
    //     }
    //     p.date = new Date(d.date + " " + d.time);

    //     p.ML = parseFloat(d.ML);
    //     p.depth = parseFloat(d.depth);
    //     // console.log(p[0]);
    //     // console.log(p);
    //     return p;
    //   }

    // });
    function ajaxGetData(inputurl, options) {

      var url = inputurl;
      var method = 'POST';
      var inputdata;
      var dataType = 'json';

      if (options !== undefined) {
        if (options.data !== undefined) {
          inputdata = options.data;
        }

      }

      var outdata;
      $.ajax({
        url: url,
        data: inputdata,
        method: 'POST',
        dataType: 'json',
        async: false,
        success: function (rtdata) {
          //console.log('??'+rtdata);
          outdata = rtdata;
        }, error: function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR, textStatus, errorThrown);
        }

      });
      return outdata;
    }
    var stlat = 21;
    var edlat = 26;
    var stlon = 118;
    var edlon = 124;
    var ML = 4.5;
    var stdate = "1990-1-1";
    const now = new Date();
    var eddate = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
    // console.log('eddate=' + eddate);
    var url = './php/getCatalog.php';
    var Data = ajaxGetData(url, {
      data:
      {
        stlat: stlat,
        edlat: edlat,
        stlon: stlon,
        edlon: edlon,
        ML: ML,
        stdate: stdate,
        eddate: eddate
      }
    });
    console.log('===DB Data===');
    console.log(Data);
    var data = [];
    Data.forEach(d => {
      const p = projection([parseFloat(d.longitude), parseFloat(d.latitude)]);
      // if ((d.time.charAt(d.time.length - 1) == ".")) {
      //   d.time += "0";
      // }

      p.date = new Date(d.date + " " + d.time + "." + d.ms);
      // console.log(p.date);
      p.ML = parseFloat(d.ML);
      p.depth = parseFloat(d.depth);
      data.push(p);
    });
    data.sort((a, b) => a.date - b.date);
    // console.log(data);
    return data;
  }
  );

  main.variable().define("tw", ["d3"], async function (d3) {

    const tw = await d3.json("./data/twCounty2010merge.topo.json");
    tw.objects.layer1 = {
      type: "GeometryCollection",
      // geometries: tw.objects.states.geometries.filter(d => d.id !== "02" && d.id !== "15"),
      geometries: tw.objects.layer1.geometries,
    };
    // window.alert(tw.objects.layer1.geometries);
    return tw;
  }
  );
  main.variable().define("topojson", ["require"], function (require) {
    return (
      require("topojson-client@3")
    )
  });
  main.variable().define("d3", ["require"], function (require) {
    return (
      require("d3@5")
    )
  });
  //------------------------------------legend
  main.variable().define("legend", ["d3", "ramp"], function (d3, ramp) {
    return (
      function legend({
        color,
        title,
        tickSize = 6,
        // width = 320,
        // height = 44 + tickSize,
        width = 320,
        height = 44 + tickSize,
        marginTop = 18,
        marginRight = 0,
        marginBottom = 16 + tickSize,
        marginLeft = 0,
        ticks = width / 64,
        tickFormat,
        tickValues
      } = {}) {

        const svg = d3.create("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [0, 0, width, height])
          .style("overflow", "visible")
          .style("display", "block");

        let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
        let x;

        // Continuous
        // if (color.interpolate) {
        //   const n = Math.min(color.domain().length, color.range().length);

        //   x = color.copy().rangeRound(d3.quantize(d3.interpolate(marginLeft, width - marginRight), n));

        //   svg.append("image")
        //     .attr("x", marginLeft)
        //     .attr("y", marginTop)
        //     .attr("width", width - marginLeft - marginRight)
        //     .attr("height", height - marginTop - marginBottom)
        //     .attr("preserveAspectRatio", "none")
        //     .attr("xlink:href", ramp(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());
        // }

        // Sequential
        // else if (color.interpolator) {
        if (color.interpolator) {
          x = Object.assign(color.copy()
            .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
            { range() { return [marginLeft, width - marginRight]; } });

          svg.append("image")
            .attr("x", marginLeft)
            .attr("y", marginTop)
            .attr("width", width - marginLeft - marginRight)
            .attr("height", height - marginTop - marginBottom)
            .attr("preserveAspectRatio", "none")
            .attr("xlink:href", ramp(color.interpolator()).toDataURL())
            .attr("transform", `translate(${width - marginLeft - marginRight}) scale(-1,1)`);


          // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
          // if (!x.ticks) {
          //   if (tickValues === undefined) {
          //     const n = Math.round(ticks + 1);
          //     tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
          //   }
          //   if (typeof tickFormat !== "function") {
          //     tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
          //   }
          // }
        }

        // Threshold
        // else if (color.invertExtent) {
        //   const thresholds
        //     = color.thresholds ? color.thresholds() // scaleQuantize
        //       : color.quantiles ? color.quantiles() // scaleQuantile
        //         : color.domain(); // scaleThreshold

        //   const thresholdFormat
        //     = tickFormat === undefined ? d => d
        //       : typeof tickFormat === "string" ? d3.format(tickFormat)
        //         : tickFormat;

        //   x = d3.scaleLinear()
        //     .domain([-1, color.range().length - 1])
        //     .rangeRound([marginLeft, width - marginRight]);

        //   svg.append("g")
        //     .selectAll("rect")
        //     .data(color.range())
        //     .join("rect")
        //     .attr("x", (d, i) => x(i - 1))
        //     .attr("y", marginTop)
        //     .attr("width", (d, i) => x(i) - x(i - 1))
        //     .attr("height", height - marginTop - marginBottom)
        //     .attr("fill", d => d);

        //   tickValues = d3.range(thresholds.length);
        //   tickFormat = i => thresholdFormat(thresholds[i], i);
        // }

        // // Ordinal
        // else {
        //   x = d3.scaleBand()
        //     .domain(color.domain())
        //     .rangeRound([marginLeft, width - marginRight]);

        //   svg.append("g")
        //     .selectAll("rect")
        //     .data(color.domain())
        //     .join("rect")
        //     .attr("x", x)
        //     .attr("y", marginTop)
        //     .attr("width", Math.max(0, x.bandwidth() - 1))
        //     .attr("height", height - marginTop - marginBottom)
        //     .attr("fill", color);

        //   tickAdjust = () => { };
        // }

        svg.append("g")
          .attr("transform", `translate(0,${height - marginBottom}) `)
          .call(d3.axisBottom(x)
            .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
            .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
            .tickSize(tickSize)
            .tickValues(tickValues))
          .call(tickAdjust)
          .call(g => g.select(".domain").remove())
          .call(g => g.append("text")
            .attr("x", marginLeft)
            .attr("y", marginTop + marginBottom - height - 6)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(title));

        return svg.node();
      }
    )
  });

  main.variable().define("ramp", ["DOM"], function (DOM) {
    return (
      function ramp(color, n = 256) {
        const canvas = DOM.canvas(n, 1);
        const context = canvas.getContext("2d");
        for (let i = 0; i < n; ++i) {
          context.fillStyle = color(i / (n - 1));
          context.fillRect(i, 0, 1, 1);
        }
        return canvas;
      }
    )
  });

  //========================Scrubber========================
  main.variable().define("Scrubber", ["html", "disposal", "svg", "d3"], function (html, disposal, svg, d3) {
    // console.debug(ScrubberRate + "*" + KFS + "=" + (ScrubberRate * KFS))
    return (
      function Scrubber(values, {
        format = value => value,
        initial = ScrubberRate * KFS,
        // initial = 100,
        delay = null,
        autoplay = true,
        loop = true,
        loopDelay = null,
        alternate = false
      } = {}) {
        values = Array.from(values);
        // console.debug(ScrubberRate + "*" + KFS + "=" + (initial))
        const form = html`<form style="font: 12px var(--sans-serif); font-variant-numeric: tabular-nums; height: 33px; align-items: center;">
      <button id="replay" name=r type=button style="margin-right: 0.4em; width: 6em;  display:inline-flex; align-items: center;justify-content: center;"></button>
<button id="play" name=b type=button style="margin-right: 0.4em; width: 6em; display:inline-flex; align-items: center;justify-content: center;"></button>
<label style="margin-top: 2.5em;display: flex; align-items: center;">Progress
  <input style="margin-left: 2.2em;margin-top: 0.2em;" name=i id="kf" type=range min=0 max=${values.length - 1} value=${initial} step=1 style="width: 180px;" >
  <output name=o style="margin-left: 0.4em;"></output>
</label>
</form>`;
        // ===========icon
        const iconReplay = html`<i name=icreplay class='fa fa-refresh fa-2x fa-fw' aria-hidden='true'></i><span class='sr-only'>Refreshing...</span>`;
        //fa-spin
        const iconPlay = html`<i name=icplay class="fa fa-play fa-2x fa-fw"  style="margin-left:0.3em;" aria-hidden="true"></i>`;
        const iconPause = html`<i name=icpause class="fa fa-pause fa-2x fa-fw " aria-hidden="true"></i>`;

        let frame = null;
        let timer = null;
        let interval = null;
        let direction = 1;
        // console.log("KF=" + initial);
        function start() {
          form.b.textContent = "Pause";
          form.b.append(iconPause);
          if (delay === null) frame = requestAnimationFrame(tick);
          else interval = setInterval(tick, delay);
        }
        function stop() {
          form.b.textContent = "Play";
          form.b.append(iconPlay);
          if (frame !== null) cancelAnimationFrame(frame), frame = null;
          if (timer !== null) clearTimeout(timer), timer = null;
          if (interval !== null) clearInterval(interval), interval = null;
        }
        function running() {
          return frame !== null || timer !== null || interval !== null;
        }
        function tick() {
          if (form.i.valueAsNumber === (direction > 0 ? values.length - 1 : direction < 0 ? 0 : NaN)) {
            if (!loop) return stop();
            if (alternate) direction = -direction;
            if (loopDelay !== null) {
              if (frame !== null) cancelAnimationFrame(frame), frame = null;
              if (interval !== null) clearInterval(interval), interval = null;
              timer = setTimeout(() => (step(), start()), loopDelay);
              return;
            }
          }
          if (delay === null) frame = requestAnimationFrame(tick);
          step();
        }
        function step() {
          form.i.valueAsNumber = (form.i.valueAsNumber + direction + values.length) % values.length;
          form.i.dispatchEvent(new CustomEvent("input", { bubbles: true }));
        }
        form.i.oninput = event => {
          if (event && event.isTrusted && !running()) start();
          form.value = values[form.i.valueAsNumber];
          // form.o.value = format(form.value, form.i.valueAsNumber, values);
          formValue = form.i.valueAsNumber;
          // console.log("formValue=" + formValue);
          if (event && event.isTrusted) Refresh = true;
        };
        form.b.onclick = () => {
          // window.alert(form.i.valueAsNumber === values.length - 1);
          if (running()) {
            svg.transition().duration(0);
            timeOuts.forEach(function (timeOut) {
              timeOut.stop();
            });
            timeOuts = [];
            stopTime = d3.now();
            return stop();
          }
          else {
            if (form.i.valueAsNumber === values.length - 1)
              Refresh = true;
            // form.r.onclick();
            else
              restart = true;
            direction = alternate && form.i.valueAsNumber === values.length - 1 ? -1 : 1;
            form.i.valueAsNumber = (form.i.valueAsNumber + direction) % values.length;
            form.i.dispatchEvent(new CustomEvent("input", { bubbles: true }));
            start();
          }
        };
        form.r.onclick = () => {
          // stop();
          var icreplay = document.getElementsByName("icreplay")[0];
          icreplay.classList.add("fa-spin");
          var speedBar = document.getElementById("sd");
          form.i.disabled = true;
          form.b.disabled = true;
          speedBar.disabled = true;
          direction = 0;
          form.i.valueAsNumber = 0;
          ScrubberRate = 0;
          Refresh = true;

          if (!running())
            start();

          setTimeout(() => {
            direction = 1;
            form.i.disabled = false;
            form.b.disabled = false;
            speedBar.disabled = false;
            icreplay.classList.remove("fa-spin");
          }, 1000);

          // direction = 0;
          // form.i.valueAsNumber = 0;
          // Refresh = true;
          // setTimeout(() => {
          //   direction = 1;
          //   form.i.disabled = false;
          //   form.b.disabled = false;
          //   speedBar.disabled = false;
          //   icreplay.classList.remove("fa-spin");
          // }, 1000);

        };
        form.r.textContent = "RePlay";
        form.r.append(iconReplay);
        form.i.oninput();
        if (autoplay) start();
        else stop();
        disposal(form).then(stop);
        ///切分頁暫停
        document.addEventListener("visibilitychange", function () {
          if (document.visibilityState === 'visible')
            if (running()) {
              svg.transition().duration(0);
              timeOuts.forEach(function (timeOut) {
                timeOut.stop();
              });
              timeOuts = [];
              stopTime = d3.now();
              return stop();
            }
        });

        return form;
      }
    )
  });

  main.variable().define("disposal", ["MutationObserver"], function (MutationObserver) {
    return (
      function disposal(element) {
        return new Promise(resolve => {
          requestAnimationFrame(() => {
            const target = element.closest(".observablehq");
            if (!target) return resolve();
            const observer = new MutationObserver(mutations => {
              if (target.contains(element)) return;
              observer.disconnect(), resolve();
            });
            observer.observe(target, { childList: true });
          });
        });
      }
    )
  });
  return main;
}
