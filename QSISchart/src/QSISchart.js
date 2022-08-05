function QSISchart() {
    let selector = 'body';
    let data = null;

    chart.selector = (vaule) => {
        selector = vaule;
        return chart;
    };
    chart.data = (vaule) => {
        data = vaule;
        return chart;
    };

    async function chart() {
        const chartContainerJQ = $(selector);
        const chartContainerD3 = d3.select(selector);


        // let getColor = (i) => {
        //     i % 3
        //     return
        // };

        function init() {
            chartContainerJQ.append(`
            <form id="form-chart">
                <div class="form-group" id="chartsOptions" style="display: inline;">
                    <div class="row">

                    </div>
                </div>
            

                <div class="form-group"  id="chartMain">

                    <div id="charts" class="row"></div>          
                
                    <div id="outerdiv"
                        style="position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);z-index:10;width:100%;height:100%;display:none;">
                        <div id="innerdiv" style=" background-color: rgb(255, 255, 255);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"></div>                      
                    </div>

                    <div id="loading"  style="display:none;">
                        <div class="spinner-border"role="status">
                            <span class="sr-only" >Loading...</span>
                        </div>
                        Loading...
                    </div>
                </div> 
            </form>
                `);

        };
        async function printChart() {
            chartContainerJQ.find('#charts').children().remove();

            let getChartMenu = (i) => {
                // console.log(d.data);
                let div = document.createElement("div");
                div.setAttribute("id", "chart" + i);
                div.setAttribute("class", "chart col-md-12 col-sm-12");
                div.setAttribute("style", "position:relative");

                let nav = document.createElement('nav');
                nav.setAttribute("id", "nav" + i);
                nav.setAttribute("class", "toggle-menu");
                nav.setAttribute("style", "position:absolute");
                nav.style.right = "0";

                let a = document.createElement('a');
                a.setAttribute("class", "toggle-nav");
                a.setAttribute("href", "#");
                a.innerHTML = "&#9776;";
                nav.append(a);

                let ul = document.createElement("ul");
                ul.classList.add("active");
                nav.append(ul);

                let chartDropDown = ['bigimg', 'svg', 'png', 'jpg'];
                chartDropDown.forEach(option => {
                    let li = document.createElement("li");
                    let item = document.createElement("a");
                    item.href = "javascript:void(0)";

                    if (option != chartDropDown[0])
                        item.innerHTML = "下載圖表爲" + option;
                    else
                        item.innerHTML = "檢視圖片";

                    item.addEventListener("click", (e, a) => {
                        let svgArr = [];
                        let svg = chartContainerJQ.find("#" + $(e.target).parents('.chart')[0].id).children('svg')[0];
                        svgArr.push(svg);

                        let fileName = 'qsis';
                        downloadSvg(svgArr, fileName, option);
                    });

                    li.append(item);
                    ul.append(li);
                });
                document.querySelector('#charts').append(div);
                document.querySelector('#chart' + i).append(nav);
            };
            let MenuEvents = () => {
                let charts = document.getElementById('charts');
                let stopPropagation = (e) => {
                    e.stopPropagation();
                };

                //start or stop DOM event capturing
                function chartEventControl(control) {
                    if (control == 'stop') {
                        // console.debug('add');
                        charts.addEventListener('mousemove', stopPropagation, true);
                        charts.addEventListener('mouseenter', stopPropagation, true);
                    }
                    else {
                        // console.debug('remove');
                        charts.removeEventListener('mousemove', stopPropagation, true);
                        charts.removeEventListener('mouseenter', stopPropagation, true);
                    };
                };

                chartContainerJQ.find('.toggle-nav').off('click');
                chartContainerJQ.find('.toggle-nav').click(function (e) {
                    // console.debug(e.target === this);//e.target===this

                    $(this).toggleClass('active');
                    $(this).next().toggleClass('active');
                    e.preventDefault();

                    //選單打開後阻止事件Capture到SVG(選單打開後svg反應mousemove,mouseenter圖片會有問題)
                    if ($(this).hasClass('active'))
                        chartEventControl('stop');
                    else
                        chartEventControl('start');


                });
                // console.debug(chartContainerJQ.find(".toggle-nav"));
                $('body').off('click');
                $('body').click(function (e) {
                    chartContainerJQ.find(".toggle-nav").each((i, d) => {
                        // console.debug(e.target == d);
                        // console.debug(e.target);
                        if (e.target != d && $(d).hasClass('active')) {
                            $(d).toggleClass('active');
                            $(d).next().toggleClass('active');

                            setTimeout(() => chartEventControl('start'), 100);
                        }
                    });
                });
            };
            let downloadSvg = (svgArr, fileName, option) => {

                function getSvgUrl(svgNode) {
                    let svgData = (new XMLSerializer()).serializeToString(svgNode);
                    let svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                    let svgUrl = URL.createObjectURL(svgBlob);
                    return svgUrl;
                }
                function getCanvas(resize) {
                    // =============== canvas init
                    let canvas = document.createElement('canvas');
                    let context = canvas.getContext('2d');

                    let svgWidth = svgArr[0].viewBox.baseVal.width;
                    let svgHeight = svgArr[0].viewBox.baseVal.height * svgArr.length;
                    let canvasWidth, canvasHeight;
                    //檢視時縮放,下載時放大
                    if (resize) {
                        let windowW = window.innerWidth;//获取当前窗口宽度 
                        let windowH = window.innerHeight;//获取当前窗口高度 

                        let width, height;
                        let scale = 0.9;//缩放尺寸
                        height = windowH * scale;
                        width = height / svgHeight * svgWidth;
                        while (width > windowW * scale) {//如宽度扔大于窗口宽度 
                            height = height * scale;//再对宽度进行缩放
                            width = width * scale;
                        }
                        canvasWidth = width;
                        canvasHeight = height;
                    }
                    else {
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
                    let outerdiv = $('#outerdiv');

                    outerdiv.fadeIn("fast");//淡入显示#outerdiv及.pimg 
                    outerdiv.off('click');
                    outerdiv.click(function (e) {//再次点击淡出消失弹出层 
                        if (e.target.id != 'outerdiv') return;
                        $(this).fadeOut("fast");
                        $(originParent).children('svg').remove();
                        originSvg.removeAttribute('width');
                        originSvg.removeAttribute('height');
                        originParent.append(originSvg);
                    });

                    let originSvg = svgArr[0];
                    let originParent = originSvg.parentNode;
                    let cloneSvg = originSvg.cloneNode(true);
                    originSvg.setAttribute('width', width);
                    originSvg.setAttribute('height', height);
                    document.querySelector('#innerdiv').append(originSvg);
                    originParent.append(cloneSvg);

                }


                if (option == 'svg') {
                    //==============merge svg
                    let newSvg = document.createElement('svg');


                    svgArr.forEach(queryStr => {
                        let svgjQobj = $(queryStr);
                        svgjQobj.clone().appendTo(newSvg);
                    });
                    // console.debug(newSvg);
                    let svgUrl = getSvgUrl(newSvg);
                    download(svgUrl, fileName + '.' + option);
                }
                else {
                    //==============each svg draw to canvas
                    let CanvasObjArr = getCanvas(option == 'bigimg');

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
                            context.drawImage(image, 0, index * imageHeight, imageWidth, imageHeight);

                            //done drawing and output
                            if (index == svgArr.length - 1) {
                                let imgUrl;
                                if (option == 'bigimg') {
                                    show(imageWidth, imageHeight);
                                }
                                else {
                                    imgUrl = canvas.toDataURL('image/' + option);
                                    download(imgUrl, fileName + '.' + option);
                                }
                            }
                        }
                    });
                }

            };

            function activeCircle(data, index) {
                console.debug(data, index);
                let width = 180, height = 180;
                const svg = d3.create("svg")
                    .attr("viewBox", [0, 0, width, height + 50]);
                const focusGroup = svg.append("g").attr('class', 'focus');
                const legendGroup = svg.append("g").attr('class', 'legendGroup');


                let x, y;
                let newDataObj;

                function getNewData(trans = false) {

                };
                function updateChart(trans = false) {
                    function init() {

                    };
                    function render() {
                        const site = data.site,
                            activeCount = data.active,
                            totalCount = data.total;
                        // animation stuff,
                        const duration = 3000;

                        // circle stuff
                        let twoPi = 2 * Math.PI,
                            radius = Math.min(width, height) / 2 - 5,
                            arcBackground = d3.arc()
                                .startAngle(0)
                                .endAngle(d => d.value * twoPi)
                                .outerRadius(radius - 10)
                                .innerRadius(radius - 35),
                            arcForeground = d3.arc()
                                .startAngle(0)
                                .endAngle(d => d.value * twoPi)
                                .outerRadius(radius)
                                .innerRadius(radius - 27);

                        let updateFocus = () => {

                            focusGroup.append('g')
                                .attr('class', 'meter')
                                .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
                                .call(g => {

                                    g.append('title').text(site);

                                    g
                                        .data([{ value: .0, index: .5 }])
                                        .append('path')
                                        .attr('class', 'backgroundCircle')
                                        .attr('fill', '#000')
                                        .attr('d', arcBackground)
                                        .attr('filter', 'url(#dropshadow)')
                                        .transition()
                                        .duration(duration)
                                        .attrTween('d', tweenArcBackground({ value: 1 }));

                                    g
                                        .data([{ value: .0, index: .5 }])
                                        .append('path')
                                        .attr('class', 'foregroundCircle')
                                        .attr('stroke', '#28FF28')
                                        .attr('fill', '#00A600')
                                        .attr('d', arcForeground)
                                        .attr('filter', 'url(#dropshadow)')
                                        .transition()
                                        .attr('stroke', '#aaa')
                                        .delay(duration / 3)
                                        .duration(duration)
                                        .attrTween('d', tweenArcForeground({ value: activeCount / totalCount }));


                                    g
                                        .data([0])
                                        .append('text')
                                        .text(`0 / ${totalCount}`)
                                        .attr('font-size', '20px')
                                        .attr('fill', '#000')
                                        .attr('text-anchor', 'middle')
                                        .attr('alignment-baseline', 'middle')
                                        .attr('filter', 'url(#dropshadow)')
                                        .transition()
                                        .delay(duration / 3)
                                        .duration(duration)
                                        .tween('text', tweenText(activeCount));

                                });

                            focusGroup.append('g')
                                .attr('class', 'text')
                                .attr('transform', 'translate(' + width / 2 + ',' + height + ')')
                                .call(g => {
                                    g
                                        .append('text')
                                        .attr('fill', '#000')
                                        .attr('x', 0)
                                        .attr('y', 20)
                                        .attr('text-anchor', 'middle')
                                        .attr('filter', 'url(#dropshadow)')
                                        .text(site);
                                });

                            // Helper functions!!!
                            function tweenArcForeground(b) {
                                return function (a) {
                                    let i = d3.interpolate(a, b);

                                    return function (t) {
                                        return arcForeground(i(t));
                                    };
                                };
                            }

                            function tweenArcBackground(b) {
                                return function (a) {
                                    let i = d3.interpolate(a, b);

                                    return function (t) {
                                        return arcBackground(i(t));
                                    };
                                };
                            }

                            function tweenText(b) {
                                return function (a) {
                                    let i = d3.interpolateRound(a, b);

                                    return function (t) {
                                        this.textContent = i(t) + ' / ' + totalCount;
                                    };
                                }
                            }
                        };

                        updateFocus();
                    };

                    if (!newDataObj) {
                        newDataObj = getNewData();
                        init();
                    };
                    render();

                };
                updateChart();

                function events(svg) {
                    const defs = svg.append('defs');

                    let spin = () => {     // filter stuff
                        /* For the drop shadow filter... */
                        let filter = defs.append('filter')
                            .attr('id', 'dropshadow')

                        filter.append('feGaussianBlur')
                            .attr('in', 'SourceAlpha')
                            .attr('stdDeviation', 2)
                            .attr('result', 'blur');
                        filter.append('feOffset')
                            .attr('in', 'blur')
                            .attr('dx', 2)
                            .attr('dy', 3)
                            .attr('result', 'offsetBlur');

                        let feMerge = filter.append('feMerge');

                        feMerge.append('feMergeNode')
                            .attr('in", "offsetBlur')
                        feMerge.append('feMergeNode')
                            .attr('in', 'SourceGraphic');
                        // end filter stuff

                        // gradient stuff    
                        let gradientBackgroundRed = defs.append('linearGradient')
                            .attr('id', 'gradientBackgroundRed')
                            .attr('x1', '0')
                            .attr('x2', '0')
                            .attr('y1', '0')
                            .attr('y2', '1');
                        gradientBackgroundRed.append('stop')
                            .attr('class', 'redBackgroundStop1')
                            .attr('offset', '0%');

                        gradientBackgroundRed.append('stop')
                            .attr('class', 'redBackgroundStop2')
                            .attr('offset', '100%');

                        let gradientBackgroundPurple = defs.append('linearGradient')
                            .attr('id', 'gradientBackgroundPurple')
                            .attr('x1', '0')
                            .attr('x2', '0')
                            .attr('y1', '0')
                            .attr('y2', '1');

                        gradientBackgroundPurple.append('stop')
                            .attr('class', 'purpleBackgroundStop1')
                            .attr('offset', '0%');

                        gradientBackgroundPurple.append('stop')
                            .attr('class', 'purpleBackgroundStop2')
                            .attr('offset', '100%');

                        let gradientBackgroundCyan = defs.append('linearGradient')
                            .attr('id', 'gradientBackgroundCyan')
                            .attr('x1', '0')
                            .attr('x2', '0')
                            .attr('y1', '0')
                            .attr('y2', '1');

                        gradientBackgroundCyan.append('stop')
                            .attr('class', 'cyanBackgroundStop1')
                            .attr('offset', '0%');

                        gradientBackgroundCyan.append('stop')
                            .attr('class', 'cyanBackgroundStop2')
                            .attr('offset', '100%');

                        let gradientForegroundRed = defs.append('linearGradient')
                            .attr('id', 'gradientForegroundRed')
                            .attr('x1', '0')
                            .attr('x2', '0')
                            .attr('y1', '0')
                            .attr('y2', '1');
                        gradientForegroundRed.append('stop')
                            .attr('class', 'redForegroundStop1')
                            .attr('offset', '0%');

                        gradientForegroundRed.append('stop')
                            .attr('class', 'redForegroundStop2')
                            .attr('offset', '100%');

                        let gradientForegroundPurple = defs.append('linearGradient')
                            .attr('id', 'gradientForegroundPurple')
                            .attr('x1', '0')
                            .attr('x2', '0')
                            .attr('y1', '0')
                            .attr('y2', '1');

                        gradientForegroundPurple.append('stop')
                            .attr('class', 'purpleForegroundStop1')
                            .attr('offset', '0%');

                        gradientForegroundPurple.append('stop')
                            .attr('class', 'purpleForegroundStop2')
                            .attr('offset', '100%');

                        let gradientForegroundCyan = defs.append('linearGradient')
                            .attr('id', 'gradientForegroundCyan')
                            .attr('x1', '0')
                            .attr('x2', '0')
                            .attr('y1', '0')
                            .attr('y2', '1');

                        gradientForegroundCyan.append('stop')
                            .attr('class', 'cyanForegroundStop1')
                            .attr('offset', '0%');

                        gradientForegroundCyan.append('stop')
                            .attr('class', 'cyanForegroundStop2')
                            .attr('offset', '100%');
                        // end gradient stuff
                    };
                    spin();
                };
                svg.call(events);


                return svg.node();
            };


            data.forEach((d, i) => {
                getChartMenu(i);
                chartContainerJQ.find('#chart' + i).append(activeCircle(d, i));
            });
            MenuEvents();

        };
        //===init once
        if (!(chartContainerJQ.find('#form-chart').length >= 1)) {
            init();
        };
        printChart();


    };
    return chart;
};