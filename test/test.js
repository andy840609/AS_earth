async function getWaveImg(stationData, timeDomain = null) {

    let waveData = await (stationData.waveData ? stationData.waveData : data[0].waveData);
    // console.debug(waveData);

    function getSvgUrlArr(data) {
        //==max min要一樣起始點才會落在同位置(避免波形間隔看起來不同)
        const xAxisDomain = timeDomain ? timeDomain : d3.extent(data[0].data.map(d => d.x));
        const yAxisDomain = d3.extent([].concat(...data.map(d => d3.extent(d.data, d => d.y))));
        // console.debug(xAxisDomain, yAxisDomain);

        var getSvgObj = (d, axisSvg = false) => {
            var svgObj = {};

            const chaData = d.data;
            const getColor = () => {
                let index = data.indexOf(d);
                let color;
                switch (index % 3) {
                    case 0:
                        color = "steelblue";
                        break;
                    case 1:
                        color = "red";
                        break;
                    case 2:
                        color = "green";
                        break;
                    default:
                        color = "steelblue";
                        break;
                };
                return color;
            };
            const width = 800;
            const height = 300;
            const margin = { top: 30, right: 30, bottom: 40, left: 30 };
            const svg = d3.create("svg")
                .attr("viewBox", [0, 0, width, height]);
            const xAxis = svg.append("g").attr("class", "xAxis");
            // const yAxis = svg.append("g").attr("class", "yAxis");
            const pathGroup = svg.append("g").attr('class', 'paths');

            //==陰影
            ~function initShadowDefs() {
                svg.append("defs")
                    .append("filter")
                    .attr("id", "pathShadow")
                    .attr("x", "-0.5")
                    .attr("y", "-0.5")
                    .attr("width", "300%")
                    .attr("height", "300%")
                    .call(filter => {
                        filter
                            .append("feOffset")
                            .attr("result", "offOut")
                            .attr("in", "SourceAlpha")
                            .attr("dx", "1")
                            .attr("dy", "1");

                        filter
                            .append("feGaussianBlur")
                            .attr("result", "blurOut")
                            .attr("in", "offOut")
                            .attr("stdDeviation", "2")

                        filter
                            .append("feBlend")
                            .attr("in", "SourceGraphic")
                            .attr("in2", "blurOut")
                            .attr("mode", "normal");

                    });

            }();

            function getChart() {
                function getNewData(timeDomain) {
                    let timeArr = chaData.map(d => d.x);
                    let i1 = d3.bisectCenter(timeArr, timeDomain[0]);
                    let i2 = d3.bisectCenter(timeArr, timeDomain[1]) + 1;//包含最大範圍
                    let newData = chaData.slice(i1, i2);
                    return newData;
                };
                function getSvgUrl(svgNode) {
                    let svgData = (new XMLSerializer()).serializeToString(svgNode);
                    let svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                    let svgUrl = URL.createObjectURL(svgBlob);
                    return svgUrl;
                };

                let newData = timeDomain ? getNewData(timeDomain) : chaData;

                let x = d3.scaleLinear()
                    .domain(xAxisDomain)
                    .range([margin.right, width - margin.left]);

                var updateAxis = () => {
                    var makeXAxis = g => g
                        // .style('font', '20px sans-serif')
                        // .style('font', 'italic small-caps bold 20px/2 cursive')
                        .style('font', 'small-caps bold 20px/1 sans-serif')

                        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
                        .call(g => g.append('text')
                            .attr('fill', '#FBFBFF')
                            .attr("font-weight", "bold")
                            .attr("textLength", "150")
                            .attr("lengthAdjust", "spacingAndGlyphs")
                            .attr('stroke', 'grey')
                            .attr("stroke-width", "0.5px")
                            .attr('x', width / 2)
                            .attr("y", margin.bottom)
                            .text('Time(s)')
                        )
                        .call(g => g.selectAll('path,line')
                            // .attr("stroke", "red")
                            .attr("stroke-width", "5px")
                            .attr("shape-rendering", "crispEdges")
                        )
                    // .call(g => g.select('text'))

                    xAxis.call(makeXAxis);



                }
                var updatePaths = () => {

                    let y = d3.scaleLinear()
                        .domain(yAxisDomain)
                        .range([height, 0]);

                    var line = d3.line()
                        .defined(d => !isNaN(d.x))
                        .x(d => x(d.x))
                        .y(d => y(d.y));


                    var makePaths = pathGroup => pathGroup
                        .attr("filter", "url(#pathShadow)")
                        .append("path")
                        .style("mix-blend-mode", "luminosity")
                        .attr("fill", "none")
                        .attr("stroke-width", 2)
                        .attr("stroke-linejoin", "bevel")//arcs | bevel |miter | miter-clip | round
                        .attr("stroke-linecap", "butt")//butt,square,round
                        // .attr("stroke-opacity", 0.9)
                        .attr("stroke", getColor(d))
                        .attr("d", line(newData))


                    pathGroup.call(makePaths);

                };
                if (axisSvg) {
                    updateAxis();
                    Object.assign(svgObj, {
                        x: x,
                        margin: margin,
                    });
                }
                else
                    updatePaths();

                svgObj.svg = getSvgUrl(svg.node());

            };

            getChart();
            return svgObj;
        };

        //==get ENZ channel svg
        let svgArr = data.map(d => Object.assign({ svgName: d.channel }, getSvgObj(d)));
        //==get xAxis svg
        svgArr.push(Object.assign({ svgName: 'xAxis' }, getSvgObj(data[0], true)));
        // console.debug(svgArr);
        return svgArr;
    };

    var SvgUrlArr = getSvgUrlArr(waveData);
    // console.debug(SvgUrlArr);
    return SvgUrlArr;
};