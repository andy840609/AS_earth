function barChart() {

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height]);
    const xAxis = svg.append("g").attr("class", "xAxis");
    const yAxis = svg.append("g").attr("class", "yAxis");
    const focusGroup = svg.append("g").attr('class', 'focus');
    const legendGroup = svg.append("g").attr('class', 'legendGroup');


    var x, y;
    var newDataObj;

    function getNewData(trans = false) {

    };
    function updateChart(trans = false) {
        function init() {

        };
        function render() {

            var refreshText = () => {
                xAxis
                    .select('.axis_name')
                    .text();


                yAxis
                    .select('.axis_name')
                    .text();


            };
            var updateAxis = () => {
                function formatPower(x) {
                    const e = Math.log10(x);
                    if (e !== Math.floor(e)) return; // Ignore non-exact power of ten.
                    return `10${(e + "").replace(/./g, c => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c] || "⁻")}`;
                };

                var makeXAxis = g => g
                    .attr("transform", `translate(0,${height - margin.bottom})`)
                    .call(g => {
                        let axisFun = d3.axisBottom(x).tickSizeOuter(0);
                        xAxisOption.metric == 'date' ?
                            axisFun.ticks(width / 80) :
                            xAxisOption.logScale ?
                                axisFun.ticks(Math.log10(x.domain()[1] / x.domain()[0]) + 1, formatPower) :
                                axisFun.ticks(width / 80);
                        axisFun(g);
                    });

                var makeYAxis = g => g
                    .attr("transform", `translate(${margin.left},0)`)
                    .call(g => {
                        let axisFun = d3.axisLeft(y);
                        yAxisOption.logScale ?
                            axisFun.ticks(Math.log10(y.domain()[1] / y.domain()[0]) + 1, formatPower) :
                            axisFun.ticks(height / 30);
                        axisFun(g);
                    })
                    .call(g =>
                        g.selectAll("g.yAxis g.tick line")
                            .attr("x2", d => width - margin.left - margin.right)
                            .attr("stroke-opacity", 0.2)
                    );

                xAxis.call(makeXAxis);
                yAxis.call(makeYAxis);
            };
            var updateFocus = () => {

            };


        };

        if (!newDataObj) {
            newDataObj = getNewData();
            init();
        };
        render();
    };
    updateChart();

    function events(svg) { };
    svg.call(events);


    return svg.node();
};