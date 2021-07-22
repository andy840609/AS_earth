function waveXdist() {
    var selector = 'body';
    var data;
    var stringObj;

    chart.selector = (value) => {
        selector = value;
        return chart;
    }
    chart.dataPath = (value) => {
        let fileXY_paths = value.data;
        let staAz_paths = value.az;
        let staDist_paths = value.dist;

        const dataKey = ['station', 'channel', 'data', 'dist', 'az'];
        const stationIndex = 0;
        const channelIndex = 2;

        //==異步讀檔,回傳一個promise而非結果
        var readTextFile = (file, fileDataKey) => {

            return new Promise((resolve, reject) => {
                var rawFile = new XMLHttpRequest();
                rawFile.open("GET", file, true);
                // rawFile.open("GET", file, false);
                rawFile.onreadystatechange = function () {
                    if (rawFile.readyState === 4) {
                        if (rawFile.status === 200 || rawFile.status == 0) {
                            var rows = rawFile.responseText.split("\n");
                            // console.debug(rows);
                            var tmpData = [];
                            rows.forEach(row => {
                                if (row != '') {
                                    var col = row.trim().split(/\s+/);
                                    // console.debug(col);
                                    let obj = {};
                                    col.forEach((c, index) => obj[fileDataKey[index]] = (isNaN(c) ? c : parseFloat(c)));
                                    tmpData.push(obj);
                                }

                            })
                            var startStr = '/';
                            var startIndex = file.lastIndexOf(startStr) + startStr.length;
                            var fileName = file.substring(startIndex);
                            var fileData = { fileName: fileName, data: tmpData };
                            // console.debug(fileData);
                            resolve(fileData);
                        }
                        else {
                            reject(new Error(req))
                        }
                    }
                }
                rawFile.send(null);
            });

        }

        //==需要以下3種檔案
        //==1.xy檔案可能有多個,異步讀取完後還要將陣列長度拉成一樣
        async function getXYData() {
            const dataKey_xy = ['time', 'amplipude'];

            //===兩種同步資料方法            
            //A.每個測站資料的時間點都要相同，如果其他測站少時間點就要補上時間點並給undefine值(event讀同個時間資料才不出錯)
            var syncALLDataTiming = (fileData) => {
                // console.debug(fileData);
                let chartData;

                let Datakey_time = fileData[0].column[0];
                let Datakey_vaule = fileData[0].column[1];
                let dataArr = fileData.map(() => []);
                let timeArr = [];

                var syncALL = () => {


                    let i = 0;
                    let min = undefined;
                    let indexArr = fileData.map(() => 0);
                    // console.debug(indexArr);

                    // console.debug(dataArr);


                    let done = false;
                    while (!done) {
                        for (let j = 0; j < fileData.length - 1; j++) {
                            let A = (fileData[j].data[indexArr[j]] ? fileData[j].data[indexArr[j]][Datakey_time] : undefined),
                                B = (fileData[j + 1].data[indexArr[j + 1]] ? fileData[j + 1].data[indexArr[j + 1]][Datakey_time] : undefined);
                            if (A != B) {
                                if (isNaN(min)) {
                                    // A & B
                                    if (!isNaN(A) && !isNaN(B))
                                        min = (A < B ? A : B);
                                    else if (!isNaN(A))
                                        min = A;
                                    else if (!isNaN(B))
                                        min = B;
                                }
                                else {
                                    if (B < min)
                                        min = B;
                                }
                            }
                            if (j == fileData.length - 2) {
                                if (min) {
                                    timeArr.push(min);
                                    dataArr.forEach((arr, index) => {
                                        if (fileData[index].data[indexArr[index]] && fileData[index].data[indexArr[index]][Datakey_time] == min) {
                                            arr.push(fileData[index].data[indexArr[index]][Datakey_vaule]);
                                            indexArr[index]++;
                                        }
                                        else
                                            arr.push(undefined);
                                    });

                                }
                                else {
                                    timeArr.push(A);
                                    dataArr.forEach((arr, index) => {
                                        arr.push(fileData[index].data[indexArr[index]][Datakey_vaule]);
                                        indexArr[index]++;
                                    });
                                }
                            }
                        }
                        min = undefined;
                        for (let k = 0; k < indexArr.length; k++) {
                            // console.debug(k, indexArr, fileData[k]);
                            if (indexArr[k] < fileData[k].data.length) {
                                done = false;
                                break;
                            }
                            else if (k == indexArr.length - 1)
                                done = true;
                        }
                    }

                }

                //只有一個測站會死迴圈,所以另外整理資料結構
                if (fileData.length > 1)
                    syncALL();
                else {
                    fileData[0].data.forEach((d, i) => {
                        dataArr[0].push(d[Datakey_vaule]);
                        timeArr.push(d[Datakey_time]);
                    })
                    // console.debug(dataArr);
                    // console.debug(timeArr);
                }

                chartData = fileData.map((d, i, arr) => {
                    let tmp = {};
                    tmp[arr.column[0]] = d[arr.column[0]];
                    tmp[arr.column[1]] = d[arr.column[1]];
                    tmp[arr.column[2]] = dataArr[i];
                    tmp.column = d.column.slice(1);
                    // console.debug(tmp);
                    return tmp;
                });

                chartData.timeArr = timeArr;
                chartData.yAxisName = fileData[0].column[0];
                chartData.column = fileData.column;
                // chartData.referenceTime = fileData.referenceTime;
                // console.debug(chartData);
                return chartData;
            }

            //B.先找第一點時間漂亮的測站當標準來取時間陣列(沒有則選第一個讀取的檔案)，在用最少點的測站當標準資料點數
            var sliceSamePoint = (fileData) => {
                let Datakey_time = fileData[0].column[0];
                let Datakey_vaule = fileData[0].column[1];
                // console.debug(fileData);
                //選標準規則（沒有才用下個條件）：尾數0整數>整數>第一個測站資料
                let standardDataIndex = undefined;
                for (let i = 0; i < fileData.length; i++) {
                    let firstTiming = fileData[i].data[0][Datakey_time];
                    if (firstTiming % 1 === 0)//判斷第一點時間爲整數
                    {
                        if (isNaN(standardDataIndex)) {
                            standardDataIndex = i;
                            continue;
                        }
                        if (firstTiming % 10 === 0) {
                            standardDataIndex = i;
                            break;
                        }
                    }
                    else if (i == fileData.length - 1 && isNaN(standardDataIndex))
                        standardDataIndex = 0;
                }
                // console.debug(standardDataIndex);
                let standardDataLength = Math.min(...fileData.map(d => d.data.length));
                // console.debug(standardDataLength);

                let chartData = fileData.map((d, i, arr) => {
                    // console.debug(d, i, arr);
                    let tmp = {};
                    tmp[arr.column[0]] = d[arr.column[0]];//station
                    tmp[arr.column[1]] = d[arr.column[1]];//channel
                    let dataArr = d.data.length > standardDataLength ? d.data.slice(0, standardDataLength) : d.data;
                    tmp[arr.column[2]] = dataArr.map(d => d[Datakey_vaule]);
                    // tmp[arr.column[1]] = d.data.slice(0, standardDataLength).map(d => d[Datakey_vaule]);
                    tmp.column = d.column.slice(1);
                    return tmp;
                });
                let dataArr = (fileData[standardDataIndex].data.length > standardDataLength ? fileData[standardDataIndex].data.slice(0, standardDataLength) : fileData[standardDataIndex].data);
                chartData.timeArr = dataArr.map(d => d[Datakey_time]);
                chartData.yAxisName = fileData[0].column[0];
                chartData.column = fileData.column;
                // chartData.referenceTime = fileData.referenceTime;
                // console.debug(chartData);
                return chartData;
            }

            //==所有測站檔案讀取完畢才同步各測站資料陣列長度
            let originData = await Promise.all(
                fileXY_paths.map(async path => {
                    // let d = readTextFile(path, dataKey_xy, fileXY_callback);
                    let tmp = {};
                    try {
                        const success = await readTextFile(path, dataKey_xy);
                        // console.debug(success);
                        let d = success;
                        tmp[dataKey[0]] = d.fileName.split('.')[stationIndex];
                        tmp[dataKey[1]] = d.fileName.split('.')[channelIndex];
                        tmp[dataKey[2]] = d.data;
                        tmp.column = dataKey_xy;
                    }
                    catch (fail) {
                        console.debug('read xy file error');
                        console.debug(fail);
                    }
                    return tmp;
                })
            );
            // console.debug(originData);
            originData.column = dataKey;
            // originData.referenceTime = referenceTime;
            // console.log("originData = ");
            // console.log(originData);
            //return syncALLDataTiming(originData);
            return sliceSamePoint(originData);
        }

        //==2.az、3.dist 都是單個檔案
        const dataKey_staAz = [dataKey[0], dataKey[4]];
        const dataKey_staDist = [dataKey[0], dataKey[3]];
        var azPromise = readTextFile(staAz_paths, dataKey_staAz);
        var distPromise = readTextFile(staDist_paths, dataKey_staDist);

        //3種檔案都讀取完才能整理成圖表要的完整資料
        data = Promise.all([getXYData(), azPromise, distPromise]).then(success => {
            // console.debug(success);
            var xyData = success[0];
            var sta_az = success[1];
            var sta_dist = success[2];
            console.log("xyData = ");
            console.log(xyData);
            console.log("sta_az = ");
            console.log(sta_az);
            console.log("sta_dist = ");
            console.log(sta_dist);

            //將每個測站資料加上az、dist
            xyData.forEach(d => {
                // console.log(d[dataKey[0]]);
                let key = d[dataKey[0]];
                let distData = sta_dist.data;
                let azData = sta_az.data;
                for (let i = 0; i < distData.length; i++)
                    if (distData[i][dataKey_staDist[0]] == key) {
                        d[dataKey_staDist[1]] = distData[i][dataKey_staDist[1]];
                        break;
                    }
                    else if (i == distData.length - 1)
                        d[dataKey_staDist[1]] = undefined;

                for (let i = 0; i < azData.length; i++)
                    if (azData[i][dataKey_staAz[0]] == key) {
                        d[dataKey_staAz[1]] = azData[i][dataKey_staAz[1]];
                        break;
                    }
                    else if (i == azData.length - 1)
                        d[dataKey_staAz[1]] = undefined;
                return d;
            });
            // console.debug(xyData)
            return xyData;
        });


        // console.debug(data)
        // data.then(s => console.debug(s))


        return chart;
    }
    chart.string = (value) => {
        stringObj = value;
        return chart;
    }

    function chart() {

        const chartContainerJQ = $(selector);
        const chartContainerD3 = d3.select(selector);

        //===append chart options
        function init() {

            chartContainerJQ.append(`
                <form id="form-chart">
                <div class="form-group" id="chartsOptions" style="display: inline;">
                <div class="row">
                
                <!-- ... catalog 
                <div class="form-group col-lg-3 col-md-4 col-sm-6 d-flex flex-row align-items-start">
                     <label for="catalog" class="col-form-label col-4" >Catalog</label>
                     <div class="form-group col-8">
                         <select class="form-control" id="catalog">
                     
                         </select>
                </div>
                </div>
                ... -->


                <!-- ... channel selector ... -->    
                <div class="form-group col-lg-3 col-md-4 col-sm-6 d-flex flex-row align-items-start">
                    <label for="channelSelectButton" class="col-form-label col-4" >Channel</label>
                    <div class="btn-group btn-group-toggle col-8" role="group">
                        <button id="channelSelectButton" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            select
                        </button>
                        <div class="dropdown-menu" id="channelMenu" aria-labelledby="channelSelectButton">
                            <div class="d-flex flex-row flex-wrap" id="channelDropDownMenu">
                                <div class="form-check col-4" style="text-align: center;">
                                    <input class="form-check-input  col-4" type="checkbox" id="channel_Z" name="channel" value="Z" checked>
                                    <label class="form-check  col-8" for="channel_Z" style="display: block; text-indent: -10px;">Z</label>
                                </div>
                                <div class="form-check col-4" style="text-align: center;">
                                    <input class="form-check-input  col-4" type="checkbox" id="channel_N" name="channel" value="N">
                                    <label class="form-check  col-8" for="channel_N" style="display: block; text-indent: -10px;">N</label>
                                </div>
                                <div class="form-check col-4" style="text-align: center;">
                                    <input class="form-check-input  col-4" type="checkbox" id="channel_E" name="channel" value="E">
                                    <label class="form-check  col-8" for="channel_E" style="display: block; text-indent: -10px;">E</label>
                                </div>
                                <div class="form-check col-4" style="text-align: center;">
                                    <input class="form-check-input  col-4" type="checkbox" id="channel_1" name="channel" value="1">
                                    <label class="form-check  col-8" for="channel_1" style="display: block; text-indent: -10px;">1</label>
                                </div>
                                <div class="form-check col-4" style="text-align: center;">
                                    <input class="form-check-input  col-4" type="checkbox" id="channel_2" name="channel" value="2">
                                    <label class="form-check  col-8" for="channel_2" style="display: block; text-indent: -10px;">2</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>  


                <!-- ... xAxisScale ... -->                
                <div class="form-group col-lg-3 col-md-4 col-sm-6 d-flex flex-row align-items-start">
                <label for="xAxisScale" class="col-form-label col-4" >Scale</label>
                <div class="btn-group btn-group-toggle col-8" data-toggle="buttons">
                    <label class="btn btn-secondary">
                        <input type="radio" name ="xAxisScale" id="linear" value="linear" checked> linear
                    </label>
                    <label class="btn btn-secondary active">
                        <input type="radio" name ="xAxisScale" id="band" value="band"> station
                    </label>
                </div>
                </div>   

                <!-- ... xAxisName ... --> 
                <div class="form-group col-lg-3 col-md-4 col-sm-6 d-flex flex-row align-items-start">
                <label for="xAxisName" class="col-form-label col-4" >SortBy</label>
                    <div class="btn-group btn-group-toggle col-8" data-toggle="buttons"  id="xAxisName_radioGroup">
                        <label class="btn btn-secondary dropdown-toggle active" >
                            <input  type="radio" name ="xAxisName" id="dist" value="dist" checked> dist


                            <div class="dropdown-menu dropdown-menu-right" id="distMenu" aria-labelledby="xAxisName">
                                <div class="form-group col-12 d-flex flex-row flex-wrap align-items-start" >       
                                <label class="" for="distRange">distance range</label>
                                    <div class="d-flex flex-column  align-items-center">
                                        <input class="" type="range" id="distRange" style="width: 200px;"/>                                       
                                        <datalist  class="d-flex flex-row flex-wrap" id="distList">
                                        
                                        </datalist>

                                        <div class="d-flex flex-row  flex-nowrap justify-content-around align-items-stretch"  style="margin-top: 15px;">
                                            <input class="form-control col-5" type="text" id="distRange_min" name="xAxisRange">
                                            <input class="form-control col-5" type="text" id="distRange_max" name="xAxisRange">       
                                        </div>           
                                    </div>
                                </div>
                            </div>               


                        </label>
                        <label class="btn btn-secondary dropdown-toggle">
                            <input type="radio" name ="xAxisName" id="az" value="az"> azim

                            <div class="dropdown-menu dropdown-menu-right " id="azMenu" aria-labelledby="xAxisName">
                            <div class="form-group col-12 d-flex flex-row flex-wrap align-items-start" >       
                            <label class="" for="azRange">azimuth range</label>
                                <div class="d-flex flex-column  align-items-center">
                                    <input class="form-range" type="range" id="azRange" list="distList" style="margin-bottom: 15px; width: 200px;" disabled>
                                    <datalist  class="d-flex flex-row flex-wrap" id="distList">
                                    
                                    </datalist>

                                    <div class="d-flex flex-row  flex-nowrap justify-content-around align-items-stretch"  style="margin-top: 15px;">
                                        <input class="form-control col-5" type="text" id="azRange_min" name="xAxisRange">
                                        <input class="form-control col-5" type="text" id="azRange_max" name="xAxisRange">       
                                    </div>           
                                </div>
                            </div>
                        </div>       
                        </label>
                        
               
                        
                    </div>                    
                </div>              
            

                
                <!-- ... display selector ... -->    
                <div class="form-group col-lg-3 col-md-4 col-sm-6 d-flex flex-row align-items-start">
                    <label for="displaySelectButton" class="col-form-label col-4" >Display</label>
                    <div class="btn-group btn-group-toggle col-8" role="group">
                        <button id="displaySelectButton" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            select
                        </button>
                        <div class="dropdown-menu" id="displayMenu" aria-labelledby="displaySelectButton">
                            <div class="d-flex flex-row flex-wrap" id="displayDropDownMenu">

                            </div>
                        </div>
                    </div>
                </div>  

                
                <!-- ... normalize ...  --> 
                <div
                class="form-group col-lg-3 col-md-4 col-sm-6 d-flex justify-content-start  align-items-center flex-row flex-nowrap">               
                    <div id="normalize-group" class="form-check" >
                        <input class="form-check-input  col-4" type="checkbox" id="normalize" name="normalize">
                        <label class="form-check-label  col-8" for="normalize" data-lang="">
                            normalize
                        </label>                        
                    </div>
                    <label for="normalizeScale" class="col-form-label" >x</label>            
                    <div class="col-5">                                              
                            <input class="form-control" type="text" id="normalizeScale" name="normalize" disabled>    
                            <div class="dropdown-menu dropdown-menu-left" id="normalizeScaleMenu">
                                <div class="d-flex flex-row flex-wrap justify-content-center" >       
                                    <label for="NSRange">normalize scale</label>
                                    <div >
                                        <input type="range" id="NSRange" list="NSList">
                                        <datalist  class="d-flex flex-row flex-wrap" id="NSList">
                                           
                                        </datalist>                     
                                    </div>
                                </div>
                            </div>                                        
                    </div>
                   
                    </div>
                    </div>
                </div>


                <div class="form-group"  id="chartMain">

                    <div id="charts"></div>          
                    <div id="outerdiv"
                        style="position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);z-index:999;width:100%;height:100%;display:none;">
                        <div id="innerdiv" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
                            <img id="bigimg" style=" background-color: rgb(255, 255, 255);" src="" />
                        </div>
                    </div>

                    <div id='loading'>
                        <div class="spinner-border"role="status">
                            <span class="sr-only" >Loading...</span>
                        </div>
                        Loading...
                    </div>

                </div> 
                </form>

               
                `);
            //================dropdown-menu內元素被點擊不關閉menu

            let All_dropdownMenu = chartContainerJQ.find('.dropdown-menu');

            All_dropdownMenu.on("click.bs.dropdown", function (e) {
                e.stopPropagation();
                if (this.getAttribute('aria-labelledby') == 'xAxisName')//防止改變範圍也同時改變radio按鈕選擇
                    e.preventDefault();
                // console.debug(e.target);
            });
            // All_dropdownMenu.on("mousemove", function (e) {
            //     // e.stopPropagation();
            //     // e.preventDefault();
            //     // console.debug("blur");

            // });

            //用來關閉dropdown menu
            $(window).on('click', function (e) {
                // console.debug(e.target);
                if (e.target.id != "normalizeScale" && e.target.name != "xAxisName")
                    All_dropdownMenu.removeClass('show');
            });

            //====================xAxisName

            // $('input[name ="xAxisName"]').on("mouseover", function (e) {
            //     console.debug("AAA");
            //     console.debug(e.target.id);
            //     // $('#xAxisNameMenu')
            // });
            // console.debug($('#xAxisName_radioGroup>label>input'));

            let xAxisName_dropdownMenu = chartContainerJQ.find('#xAxisName_radioGroup .dropdown-menu');
            xAxisName_dropdownMenu
                .on('mouseover', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                });


            chartContainerJQ.find('input[name ="xAxisName"]')
                .on('click', function (e) {
                    // console.debug($(e.target).siblings().filter('.dropdown-menu'));
                    $(e.target).siblings().filter('.dropdown-menu').addClass('show');
                })

            chartContainerJQ.find('#xAxisName_radioGroup>label')
                .on('mouseover', function (e) {
                    // console.debug('mouseover');
                    // if ($(e.target).hasClass('active'))//暫時只能條當前的xAsixName
                    $(e.target.childNodes).filter('.dropdown-menu').addClass('show');
                })
                .on('mouseleave', function (e) {
                    // console.debug('mouseleave');
                    xAxisName_dropdownMenu.removeClass('show');
                });


            chartContainerJQ.find('#distRange').on("change", function (e) {
                // console.debug('distRange change');
                // console.debug(e.target.value);
                let range = e.target.getAttribute('value').split(',');
                $(e.target.parentNode).find('#distRange_min').val(range[0]);
                $(e.target.parentNode).find('#distRange_max').val(range[1]);
                chartContainerD3.selectAll('#distRange_min').dispatch("input");
            });

            chartContainerJQ.find('#azRange').on("change", function (e) {
                // console.debug(e.target.parentNode);
                // console.debug(e.target.value);
                let range = e.target.getAttribute('value').split(',');
                $(e.target.parentNode).find('#azRange_min').val(range[0]);
                $(e.target.parentNode).find('#azRange_max').val(range[1]);
                chartContainerD3.selectAll('#azRange_min').dispatch("input");
            });

            //====================normalize
            chartContainerJQ.find('#normalize').on("change", function (e) {
                // console.debug(e.target.checked);
                if (e.target.checked)
                    chartContainerJQ.find('#normalizeScale').prop('disabled', false);
                else
                    chartContainerJQ.find('#normalizeScale').prop('disabled', true);
            });

            chartContainerJQ.find('#normalizeScale').on("focus", function (e) {
                chartContainerJQ.find('#normalizeScaleMenu').addClass('show');
                // e.preventDefault();
            });
            //====================normalize
            var normalizeScale = [1, 2, 5, 10];

            var default_normalizeScaleIdx = 2;

            chartContainerJQ.find('#normalizeScale')
                .val(normalizeScale[default_normalizeScaleIdx])
                .on('input', function (e) {
                    // console.debug('normalizeScale input');
                    // console.debug(e.target.value);
                    let inputVal = parseFloat(e.target.value);
                    if (normalizeScale.includes(inputVal))
                        chartContainerJQ.find('#NSRange').attr("value", normalizeScale.indexOf(inputVal));
                    else
                        chartContainerJQ.find('#NSRange').attr("value", 0);
                });

            // let 
            chartContainerJQ.find('#NSRange')
                .attr("min", 0)
                .attr("max", normalizeScale.length - 1)
                .attr("value", default_normalizeScaleIdx)
                .on("input propertychange", function (e) {
                    // console.debug('NSRange change');
                    let NSIndex = e.target.value;
                    let scale = normalizeScale[NSIndex];
                    chartContainerJQ.find('#normalizeScale').val(scale);
                    chartContainerD3.selectAll('#normalizeScale').dispatch("input");
                });

            normalizeScale.forEach((d, i) => {
                chartContainerJQ.find('#NSList').append($("<option></option>").attr("value", i).text(d));
            });

        };
        function WD_Charts(xAxisScale = 'linear', xAxisName = 'dist') {
            // console.debug(data);
            // console.debug(xAxisName)
            var colorPalette = {};//to fixed color for each station
            const dataKeys = data.column;//0:"station", 1: "channel", 2: "data", 3: "dist", 4:"az"

            var referenceTime = '2000-01-01T00:00:00', title = referenceTime;
            if (stringObj) {
                referenceTime = stringObj.referenceTime ? stringObj.referenceTime : referenceTime;
                title = stringObj.title ?
                    stringObj.title :
                    (referenceTime.includes('.') ?
                        referenceTime.substring(0, referenceTime.lastIndexOf('.')) : referenceTime) + " (UTC)";
            }

            const getMargin = (yAxisDomain = null) => {
                // console.debug(yAxisDomain);
                var top = 30, right = 30, bottom = 70, left = 50;
                if (yAxisDomain) {
                    let yAxisMaxTick = parseInt(Math.max(...yAxisDomain.map(domain => Math.abs(domain))));
                    let tickLength = yAxisMaxTick.toString().length;
                    // console.debug(tickLength);
                    left = tickLength >= 7 ? 60 : tickLength >= 5 ? 50 : 45;
                }
                return { top: top, right: right, bottom: bottom, left: left };
            }
            const getColor = (key) => {
                var color;
                if (colorPalette[key])
                    color = colorPalette[key];
                else {
                    let data = newDataObj.newData;
                    let index = undefined;
                    for (i = 0; i < data.length; i++)
                        if (data[i][dataKeys[0]] == key) {
                            index = i;
                            break;
                        }

                    switch (index % 6) {
                        case 0:
                            color = "#AE0000";
                            break;
                        case 1:
                            color = "#006030";
                            break;
                        case 2:
                            color = "steelblue";
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
            }
            const getString = (key) => {
                let keyName, keyUnit = '';
                switch (key) {
                    case 'dist':
                        keyName = 'Distance(km)';
                        keyUnit = 'km';
                        break;
                    case 'az':
                        keyName = 'Azimuth(°)';
                        keyUnit = '°';
                        break;
                    case 'time':
                        keyName = 'Time(s)';
                        keyUnit = 's';
                        break;
                    case 'station':
                        keyName = 'Station';
                        break;
                    default:
                        keyName = key;
                        break;
                }
                return { keyName: keyName, keyUnit: keyUnit };
            };

            const width = 800;
            const height = 500;
            const svg = d3.create("svg")
                .attr("viewBox", [0, 0, width, height]);
            const xAxis = svg.append("g").attr("class", "xAxis");
            const yAxis = svg.append("g").attr("class", "yAxis");
            const pathGroup = svg.append("g").attr('class', 'paths').attr("clip-path", "url(#clip)");
            const loadingGroup = chartContainerD3.selectAll('#loading');

            var margin, x, y, path_x;
            var newDataObj;
            var distRange_slider, azRange_slider;//for event control slider
            var unselected_band = [];
            // channel_selectArr = ['Z'];
            function getNewData(controlObj = {}) {
                // console.debug(data);
                let normalize = controlObj.normalize ? controlObj.normalize : false,
                    yAxis_domain = controlObj.yAxis_domain ? controlObj.yAxis_domain : null,
                    xAxis_domainObj = controlObj.xAxis_domainObj ? controlObj.xAxis_domainObj : {};

                let channel_selectArr = controlObj.channel_selectArr ? controlObj.channel_selectArr : newDataObj.channel_selectArr;

                // console.debug(normalize, yAxis_domain, xAxis_domainObj, channel_selectArr);

                var newData, newTimeArr;
                // console.debug(xAxis_domainObj);
                var newData_normalize = (newData) => {
                    // console.debug('normalize...');
                    newData.forEach(d => {
                        let normalize = d3.scaleLinear()
                            .domain(d3.extent(d.data))
                            .range([-1, 1])

                        let firstPointValue = undefined;
                        let tmpArr = d.data.map(amp => {
                            let tmp = amp;
                            if (tmp) {
                                tmp = normalize(tmp);
                                if (isNaN(firstPointValue))
                                    firstPointValue = tmp;
                                tmp -= firstPointValue;//make firstPointValue = 0;
                            };
                            return tmp;
                        });
                        d.data = tmpArr;
                    })

                }
                var getArr_of_channel_select = (data, channel_selectArr) => {

                    //用filter會傳回個物件的同樣參考,造成後續切割newData陣列也動到data
                    //所以用forEach push物件展開
                    let newData = [];
                    data.forEach(d => {
                        let channel = d[dataKeys[1]];
                        // console.debug(channel[channel.length - 1]);
                        // console.debug(channel_selectArr.includes(channel[channel.length - 1]));

                        if (channel_selectArr.includes(channel[channel.length - 1]))
                            newData.push({ ...d });
                    })

                    // console.debug(newData);
                    return newData;
                }



                var get_newData = (xAxis_domainObj) => {
                    let newData = [];

                    if (!newDataObj) {
                        console.debug("A for first time");
                        //把沒有同時有az.dist的資料刪除

                        for (let i = 0; i < data.length; i++)
                            if (isNaN(data[i][dataKeys[3]]) || isNaN(data[i][dataKeys[4]])) {
                                data.splice(i, 1);
                                i--;
                            }

                        // console.debug(data);
                        newData = getArr_of_channel_select(data, channel_selectArr);
                        // console.debug(newData);
                    }
                    else if (Object.keys(xAxis_domainObj).length !== 0 || (!normalize && newDataObj.normalize) || controlObj.channel_selectArr) {
                        console.debug("B data reset");
                        let dist_key = dataKeys[3];
                        let az_key = dataKeys[4];
                        // let data = newDataObj.newData;


                        //先選channel
                        newData = getArr_of_channel_select(data, channel_selectArr);


                        newData = newData.filter(d => {
                            let inDistRange = true, inAzRange = true;
                            if (xAxis_domainObj[dist_key]) {
                                let min = xAxis_domainObj[dist_key][0];
                                let max = xAxis_domainObj[dist_key][1];
                                // console.debug(min, max);                                
                                inDistRange = (d[dist_key] >= min && d[dist_key] <= max);
                                // console.debug(d[dist_key] >= min && d[dist_key] <= max);
                            }
                            if (xAxis_domainObj[az_key]) {
                                let min = xAxis_domainObj[[az_key]][0];
                                let max = xAxis_domainObj[[az_key]][1];
                                inAzRange = (d[az_key] >= min && d[az_key] <= max);
                            }

                            if (inDistRange && inAzRange)
                                // newData.push({ ...d });
                                return true;
                        });

                        // console.debug(newData);

                        if (normalize)
                            newData_normalize(newData);

                    }
                    else {
                        console.debug("C");
                        // console.debug(newDataObj.newData);
                        newData = newDataObj.newData;

                        // if (normalize && !newDataObj.normalize)
                        //     newData_normalize(newData);
                    }

                    // console.debug(newData[0].data);
                    return newData;
                }
                var get_newTimeArr_and_update_newData = (yAxis_domain) => {
                    let newTimeArr;
                    //3.根據y軸的時間選擇範圍重新選擇newData陣列裡各物件的data數值陣列
                    if (yAxis_domain) {
                        console.debug('1');
                        // console.debug(yAxis_domain);
                        let i1 = d3.bisectCenter(newDataObj.newTimeArr, yAxis_domain[0]);
                        let i2 = d3.bisectCenter(newDataObj.newTimeArr, yAxis_domain[1]) + 1;//包含最大範圍
                        // console.debug(i1, i2);
                        newData.forEach(d => d[dataKeys[2]] = d[dataKeys[2]].slice(i1, i2));
                        newTimeArr = newDataObj.newTimeArr.slice(i1, i2);
                        // console.debug(newTimeArr);
                    }
                    else {
                        // console.debug('2 data reset');
                        if (!newDataObj) {
                            console.debug('2-1');
                            if (normalize) newData_normalize(newData);
                        }
                        else if (newDataObj && (newDataObj.newTimeArr.length < data.timeArr.length)) {
                            console.debug('2-2 data reset');
                            newData.forEach(d => d[dataKeys[2]] = data.find(od => od[dataKeys[0]] == d[dataKeys[0]])[dataKeys[2]]);
                            if (normalize) newData_normalize(newData);
                        }
                        else {
                            console.debug('2-3');
                            if (normalize && !newDataObj.normalize) newData_normalize(newData);
                        }
                        newTimeArr = data.timeArr;

                    }
                    return newTimeArr;
                }

                newData = get_newData(xAxis_domainObj);
                newTimeArr = get_newTimeArr_and_update_newData(yAxis_domain);
                // sort_newData(newData, xAxisName);
                // console.debug(newData);

                // if (normalize && !newDataObj.normalize)
                //     newData_normalize(newData);

                // console.debug(channel_selectArr);
                // if (channel_selectArr.length > 0)
                //     channel_select(newData, channel_selectArr);
                // console.debug(newData);

                return {
                    newData: newData,
                    newTimeArr: newTimeArr,
                    normalize: normalize,
                    yAxis_domain: yAxis_domain,
                    xAxis_domainObj: xAxis_domainObj,
                    channel_selectArr: channel_selectArr,
                };

            }
            function updateChart(trans = false) {
                // console.debug(channel_selectArr)

                function init() {
                    let newData = newDataObj.newData;
                    svg
                        .append("g")
                        .attr("class", "title")
                        .append('text')
                        .attr("fill", "currentColor")
                        // .attr("align", "center")
                        .attr("text-anchor", "middle")
                        .attr("alignment-baseline", "middle")
                        .attr("font-weight", "bold")
                        .attr("font-size", "15")
                        .text(title);

                    xAxis
                        .append('text')
                        .attr("class", "axis_name")
                        .attr("fill", "black")
                        .attr("font-weight", "bold");
                    yAxis
                        .append('text')
                        .attr("class", "axis_name")
                        .attr("fill", "black")
                        .attr("font-weight", "bold")
                        .attr("font-size", "10")
                        .style("text-anchor", "middle")
                        .attr("alignment-baseline", "text-before-edge")
                        .attr("transform", "rotate(-90)")
                        .call(g => g.text(getString(data.yAxisName).keyName));

                    //===loadingGroup

                    // loadingGroup
                    //     .call(g => {
                    //         const loading_width = 100, loading_height = 100;
                    //         g.append('rect')
                    //             .attr("fill", "currentColor")
                    //             // .attr('x', margin.left)
                    //             // .attr('y', margin.top)
                    //             .attr('width', loading_width)
                    //             .attr('height', loading_height);
                    //     })
                    //     .attr('display', 'none');



                    //===create display dropdown option
                    chartContainerD3.selectAll('#displayDropDownMenu')
                        .selectAll('div')
                        .data(newData)
                        .join('div')
                        .attr('class', 'form-check col-6')
                        .style("text-align", "left")
                        .call(menu => {
                            // console.debug(div.nodes());
                            menu.each(function (d, i) {
                                // console.debug(d);
                                let div = d3.select(this);
                                let stationName = d[dataKeys[0]];
                                div
                                    .append('input')
                                    .attr('class', 'form-check-input  col-4')
                                    .attr('type', 'checkbox')
                                    .attr('id', 'display_' + stationName)
                                    .attr('name', 'display')
                                    .attr('value', stationName)
                                    .property('checked', true);
                                div
                                    .append('label')
                                    .attr('class', '  col-8')
                                    .attr('for', 'display_' + stationName)
                                    .style("display", "block")
                                    .style("text-indent", "-10px")
                                    .text(stationName);
                            });


                        })

                    // console.debug(newData);
                    var sliderInit = function () {
                        var get_niceDomain = (domain) => {
                            return d3.scaleLinear().domain(domain).nice().domain();
                        }
                        let dist_domain = get_niceDomain(d3.extent(newData, d => d[dataKeys[3]]));
                        let az_domain = [0, 360];//方位角最大360
                        // console.debug(dist_domain, az_domain)

                        distRange_slider = new Slider('#distRange', {
                            id: "distRange_slider",
                            min: dist_domain[0],
                            max: dist_domain[1],
                            value: dist_domain,
                            tooltip: 'hide',
                        });
                        azRange_slider = new Slider('#azRange', {
                            id: "azRange_slider",
                            min: az_domain[0],
                            max: az_domain[1],
                            value: az_domain,
                            tooltip: 'hide',
                        });
                        chartContainerD3.selectAll('#distRange_min').property('value', dist_domain[0]);
                        chartContainerD3.selectAll('#distRange_max').property('value', dist_domain[1]);
                        chartContainerD3.selectAll('#azRange_min').property('value', az_domain[0])
                        chartContainerD3.selectAll('#azRange_max').property('value', az_domain[1]);
                    }();


                }
                function render() {
                    console.debug(newDataObj);
                    //==物件依照xAxisName的值由小排到大
                    const sort_newData = (data, sortingKey) => {
                        // console.debug(data, sortingKey)
                        data.sort((a, b) => {
                            return a[sortingKey] - b[sortingKey];
                        });
                        // data.forEach(d => console.debug(d[sortingKey]))
                        return data;
                    };
                    const newData = sort_newData(newDataObj.newData, xAxisName);
                    const newTimeArr = newDataObj.newTimeArr;
                    const xAxis_domainObj = newDataObj.xAxis_domainObj;
                    const normalize = newDataObj.normalize;

                    const xAxisDomain = xAxis_domainObj[xAxisName] ?
                        xAxis_domainObj[xAxisName] :
                        (xAxisName == 'az' ? [0, 360] : d3.extent(newData, d => d[xAxisName]));


                    // var xAxisDomain = xAxis_domainObj[xAxisName] ?
                    //     xAxis_domainObj[xAxisName] :
                    //     d3.extent(newData, d => d[xAxisName]);

                    // console.debug();
                    const yAxisDomain = d3.extent(newTimeArr, d => d);
                    margin = getMargin(yAxisDomain); //== 由y軸tick字串長度來決定左邊預留空間


                    const xScale = { band: 'scaleBand', linear: 'scaleLinear' }[xAxisScale];
                    x = d3[xScale]()
                        .domain({
                            band: newData.map(d => (d[dataKeys[0]])),
                            linear: xAxisDomain,
                        }[xAxisScale])
                        .range([margin.left, width - margin.right]);
                    if (xScale == 'scaleLinear' && Object.keys(xAxis_domainObj).length === 0 && xAxisName != 'az')//方位角最大360
                        x.nice();

                    y = d3.scaleLinear()
                        .domain(yAxisDomain)
                        // .nice()
                        .range([height - margin.bottom, margin.top]);
                    // console.debug(x.domain())
                    var refreshText = () => {
                        xAxis
                            .select('.axis_name')
                            .attr('x', width / 2)
                            .attr("y", margin.bottom - 20)
                            .text({ band: getString(dataKeys[0]), linear: getString(xAxisName) }[xAxisScale].keyName);

                        yAxis
                            .select('.axis_name')
                            .attr('x', -height / 2)
                            .attr("y", -margin.left + 8);

                        //==title
                        svg
                            .select('.title text')
                            .attr("x", width / 2)
                            .attr("y", margin.top / 2);

                    }
                    var updateAxis = () => {
                        var makeXAxis = g => g
                            .attr("transform", `translate(0,${height - margin.bottom})`)
                            .call(
                                d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0)
                                // d3.axisBottom(x).ticks(width / 80).tickValues(d3.range(0, 361, 60)).tickSizeOuter(0)
                            )
                            .call(g => {
                                if (xAxisScale == 'band')
                                    g.selectAll("g.xAxis g.tick text")
                                        .attr('x', 9)
                                        .attr("y", 0)
                                        .attr("dy", ".35em")
                                        .attr("text-anchor", "start")
                                        .attr("transform", "rotate(90)");
                            });

                        var makeYAxis = g => g
                            .attr("transform", `translate(${margin.left},0)`)
                            .call(d3.axisLeft(y)
                                .ticks(height / 30))
                            .call(g => g.select(".domain").remove())
                            .call(g => g.selectAll("g.yAxis g.tick line")
                                .attr("x2", d => width - margin.left - margin.right)
                                .attr("stroke-opacity", 0.2)
                            );

                        xAxis.call(makeXAxis);
                        yAxis.call(makeYAxis);
                    }
                    var updatePaths = () => {

                        var transitionDuration = 500;
                        var dataDomain = {
                            true: [-1, 1],
                            false: d3.extent([].concat(...data.map(d => d3.extent(d.data)))),
                        }[normalize];
                        var dataDomainMean = (dataDomain[1] + dataDomain[0]) * 0.5;//linear時將第一點移至正中間
                        // var xAxisLength = width - margin.left - margin.right;//or =x.range()[1] - x.range()[0];
                        var xAxisLength = x.range()[1] - x.range()[0];

                        const eachDataGap = xAxisLength / data.length;

                        if (normalize) {
                            let textBoxValue = chartContainerD3.selectAll('#normalizeScale').node().value;
                            var normalizeScale = (textBoxValue == '') ? 1 : textBoxValue;
                        }
                        var dataRange = {
                            true: [-0.5 * eachDataGap * normalizeScale, 0.5 * eachDataGap * normalizeScale],
                            false: [-0.5 * eachDataGap, 0.5 * eachDataGap],
                        }[normalize];

                        // console.debug(eachDataGap);
                        // console.debug(dataDomain);
                        // console.debug(dataRange);
                        // console.debug(newDataObj.newData[0].data);

                        var transLine = (data, translate_x, gapPath = false) => {
                            var pathAttr;

                            let firstPointIndex = 0;
                            while (isNaN(data[firstPointIndex]))
                                firstPointIndex++;
                            let shiftMean = dataDomainMean - data[firstPointIndex];
                            // console.debug(data[firstPointIndex]);
                            // console.debug(shift);

                            path_x = d3.scaleLinear()
                                .domain(dataDomain)
                                .range(dataRange);

                            let segmentLine = d3.line()
                                .defined(d => !isNaN(d))
                                .x(d => path_x(d + shiftMean) + translate_x)
                                .y((d, i) => y(newTimeArr[i]));

                            if (gapPath) {
                                let livingTimeIndex = [];
                                let filteredData = data.filter((d, i) => {
                                    if (segmentLine.defined()(d)) {
                                        livingTimeIndex.push(i);
                                        return d;
                                    }
                                });
                                let gapLine = d3.line()
                                    .x((d, i) => path_x(d + shiftMean) + translate_x)
                                    .y((d, i) => y(newTimeArr[livingTimeIndex[i]]));

                                // console.debug(livingTimeIndex);
                                // console.debug(filteredData);
                                pathAttr = gapLine(filteredData);
                            }
                            else
                                pathAttr = segmentLine(data);

                            return pathAttr;
                        }

                        var makePaths = pathGroup => pathGroup
                            .selectAll("g")
                            .data(newData)
                            .join("g")
                            .call(() =>
                                pathGroup.selectAll("g").each(function (d, i) {
                                    // console.debug(this, d, i);
                                    // console.debug(d[dataKeys[0]]);                       
                                    let isUnselected = unselected_band.includes(d[dataKeys[0]]);

                                    let g = d3.select(this);
                                    let color = isUnselected ? 'grey' : getColor(d[dataKeys[0]]);
                                    let opacity = isUnselected ? .3 : .8;
                                    let translate_x = {
                                        // band: (i + 0.5) * eachDataGap + margin.left,
                                        band: (i + 0.5) * (xAxisLength / newData.length) + margin.left,
                                        linear: x(newData[i][xAxisName])
                                    }[xAxisScale];

                                    let path = g
                                        .selectAll("path")
                                        .data([d])
                                        .join("path");
                                    if (trans)
                                        path.transition().duration(transitionDuration);
                                    path
                                        .style("mix-blend-mode", "normal")
                                        .attr("fill", "none")
                                        .attr("stroke-width", 1)
                                        .attr("stroke-linejoin", "round")
                                        .attr("stroke-linecap", "round")
                                        .attr("stroke-opacity", opacity)
                                        .attr("stroke", color)
                                        .attr("d", transLine(d.data, translate_x))
                                    // .attr("transform", `translate(${translate_x},0)`);

                                    let text = g
                                        .selectAll("text")
                                        .data([d])
                                        .join("text");
                                    if (trans)
                                        text.transition().duration(transitionDuration);
                                    text
                                        .attr("text-anchor", "start")
                                        .attr('alignment-baseline', 'after-edge')
                                        .attr("fill", color)
                                        .attr("fill-opacity", opacity)
                                        .attr("font-size", "10")
                                        .attr("transform", `translate(${translate_x},${margin.top}) rotate(90)`)
                                        .text({
                                            band: newData[i][xAxisName] + (xAxisName == 'az' ? '' : ' ') + getString(xAxisName).keyUnit,
                                            linear: newData[i][dataKeys[0]]
                                        }[xAxisScale]
                                        );

                                })
                            );

                        pathGroup.call(makePaths);
                    }
                    updateAxis();
                    updatePaths();
                    refreshText();
                }

                if (!newDataObj) {
                    newDataObj = getNewData({ normalize: true, yAxis_domain: null, xAxis_domainObj: {}, channel_selectArr: ['Z'] });
                    init();
                }
                render();
                loadingEffect('hide');
            };

            let hideLoading_flag = true;
            let hideLoading_timeOut = null;

            function loadingEffect(action = 'hide') {
                const transitionDuration = 200;

                if (!hideLoading_flag)
                    hideLoading_timeOut.stop();

                switch (action) {
                    case 'show':
                        loadingGroup
                            .style('opacity', 1)
                            .style('display', 'inline');
                        break;
                    case 'hide':

                        hideLoading_timeOut = d3.timeout(() => {
                            loadingGroup
                                .transition().duration(transitionDuration)
                                .style('opacity', 0);
                            d3.timeout(() => loadingGroup.style('display', 'none'), transitionDuration);
                            hideLoading_flag = true;
                        }, transitionDuration);

                        hideLoading_flag = false;
                        break;
                }

            }
            updateChart();

            function events() {
                var yAxis_domain = null,
                    normalize = chartContainerD3.selectAll('#normalize').property("checked"),
                    normalizeScale = chartContainerD3.selectAll('#normalizeScale').property("value"),
                    xAxis_domainObj = {},
                    channel_selectArr = newDataObj.channel_selectArr;

                const updateDelay = 10;
                var updateFlag = true;
                var updateTimeOut = null;

                // console.debug(normalizeScale)
                // var unselected_band = null;
                // unselected_band = ["GWUB", "TPUB"];
                // yAxis_domain = [0, 60];

                function pathEvent() {
                    //====================================mouse move==================================================
                    function mouseMove() {
                        // const datesArr = data.timeArr;
                        var newTimeArr = newDataObj.newTimeArr;
                        var newData = newDataObj.newData;

                        const lineStroke = "2px";
                        const lineStroke2 = "0.5px";

                        const mouseG = svg.append("g")
                            .attr("class", "mouse-over-effects");

                        mouseG.append("path") // create vertical line to follow mouse
                            .attr("class", "mouse-line")
                            .style("stroke", "#A9A9A9")
                            .style("stroke-width", lineStroke)
                            .style("opacity", "0");

                        // console.debug(data);
                        const mousePerLineCollection = mouseG.selectAll('.mouse-per-line')
                            .data(newData)
                            .join("g")
                            .attr("class", "mouse-per-line");
                        // console.debug(mousePerLineCollection);


                        const circleAmount = 3;
                        mousePerLineCollection
                            .selectAll('circle')
                            .data(d3.range(circleAmount))
                            .join("circle")
                            .call(() => {
                                mouseG.selectAll("circle").each(function (d, i) {

                                    let circle = d3.select(this);
                                    let mainCircle = (d % 2 != 0);
                                    let station = this.parentNode.__data__[dataKeys[0]];

                                    circle
                                        .attr("r", d + 3)
                                        .style("stroke", mainCircle ? getColor(station) : "white")
                                        .style("fill", "none")
                                        .style("stroke-width", mainCircle ? lineStroke : lineStroke2)
                                        .style("opacity", "0");

                                });
                            });


                        // mousePerLineCollection.append("circle")
                        //     .attr("r", 3)
                        //     .style("stroke", "white")
                        //     .style("fill", "none")
                        //     .style("stroke-width", lineStroke2)
                        //     .style("opacity", "0");
                        // mousePerLineCollection.append("circle")
                        //     .attr("r", 4)
                        //     .style("stroke", d => getColor(d[dataKeys[0]]))
                        //     .style("fill", "none")
                        //     .style("stroke-width", lineStroke)
                        //     .style("opacity", "0");
                        // mousePerLineCollection.append("circle")
                        //     .attr("r", 5)
                        //     .style("stroke", "white")
                        //     .style("fill", "none")
                        //     .style("stroke-width", lineStroke2)
                        //     .style("opacity", "0");

                        svg
                            .append("defs")
                            .append("clipPath")
                            .attr("id", "clip")
                            .append("rect")
                            .attr("id", "chartRenderRange")
                            .attr('x', margin.left)
                            .attr('y', margin.top)
                            .attr('width', width - margin.right - margin.left)
                            .attr('height', height - margin.top - margin.bottom)
                            .attr('fill', 'none')
                            .attr('pointer-events', 'all');

                        // append a rect to catch mouse movements on canvas
                        // console.debug(data);
                        var event_rect =
                            mouseG
                                .append("use")
                                .attr('class', "eventRect")
                                // .attr('id', "er_" + data.yName)
                                .attr('xlink:href', "#chartRenderRange")
                                .on('mouseleave', function () { // on mouse out hide line, circles and text
                                    // console.log('mouseleave');
                                    var action = () => {
                                        svg.select(".mouse-line")
                                            .style("opacity", "0");
                                        svg.selectAll(".mouse-per-line circle")
                                            .style("opacity", "0");
                                        svg.selectAll(".mouse-per-line text")
                                            .style("opacity", "0");
                                        // tooltip
                                        //     // .transition().duration(500)
                                        //     // .style("opacity", 0)
                                        //     .style("display", "none");

                                    }

                                    if (!updateFlag)
                                        updateTimeOut.stop();

                                    updateTimeOut = d3.timeout(() => {
                                        action();
                                        updateFlag = true;
                                    }, updateDelay);

                                    updateFlag = false;


                                })
                                .on('mousemove', function (e) { // update tooltip content, line, circles and text when mouse moves
                                    // console.log(event.target);

                                    var action = () => {
                                        e.preventDefault();
                                        const pointer = d3.pointer(e, this);
                                        const ym = y.invert(pointer[1]);

                                        const idy = d3.bisectCenter(newTimeArr, ym);
                                        const sortedIndex = d3.range(newData.length);
                                        console.debug();

                                        function getPointTranslateX(stationIdex, dataIndex) {
                                            // let paths = svg.selectAll('.paths path');
                                            // let transform = paths.nodes()[index].getAttribute('d');
                                            // let pointArr = transform.split('L');



                                            console.debug(aaa, bbb);
                                            // let point = transform.substring(transform.indexOf('M') + 1, transform.indexOf('L'))
                                            // console.debug();
                                            // let translateX = transform.substring(transform.indexOf('(') + 1, transform.indexOf(','));
                                            return aaa + 100 + "," + bbb;
                                        }

                                        svg.select(".mouse-line")
                                            .attr("d", function () {
                                                let yPos = y(newTimeArr[idy]);
                                                let p1 = (width - margin.right) + "," + yPos;
                                                let p2 = margin.left + "," + yPos;
                                                let d = "M" + p1 + " L" + p2;
                                                return d;
                                            })
                                            .style("opacity", "0.7");
                                        svg.selectAll(".mouse-per-line circle")
                                            .style("opacity", "1");
                                        // svg.selectAll(".mouse-per-line")
                                        //     .attr("transform", function (d, i) {
                                        //         // let pos = getPointTranslateX(i, idy);
                                        //         var translate = null;
                                        //         if (isNaN(newData[i].data[idy]))
                                        //             d3.select(this).selectAll('circle').style("opacity", "0");
                                        //         else {
                                        //             d3.select(this).selectAll('circle').style("opacity", "1");
                                        //             let pathX = path_x(newData[i].data[idy]);
                                        //             let pathY = y(newTimeArr[idy]);
                                        //             let transX = {
                                        //                 band: (i + 0.5) * ((width - margin.left - margin.right) / newData.length) + margin.left,
                                        //                 linear: x(newXAxis_data[i][xAxisName])
                                        //             }[xAxisScale];
                                        //             translate = `translate(${pathX + transX},${pathY})`;
                                        //         }
                                        //         return translate;
                                        //     });

                                        // let timeStr = new Date(newTimeArr[idy]).toISOString();
                                        // const divHtml = "Time : <br/><font size='5'>" + timeStr + "</font><br/>" + data.yName + " : <br/>";
                                        // tooltip
                                        //     // .transition().duration(200)
                                        //     // .style("opacity", .9)
                                        //     .style("display", "inline");
                                        // tooltip.html(divHtml)
                                        //     .style("left", (event.pageX + 20) + "px")
                                        //     .style("top", (event.pageY - 20) + "px")
                                        //     .selectAll()
                                        //     .data(newData).enter()
                                        //     .append('div')
                                        //     .call(() => {
                                        //         // console.debug('=============');
                                        //         for (let i = 0; i < newData.length - 1; i++)
                                        //             for (let j = 0; j < newData.length - 1 - i; j++)
                                        //                 // console.debug(data[sortedIndex[j]].data[idy].y, data[sortedIndex[j + 1]].data[idy].y);
                                        //                 if (newData[sortedIndex[j]].values[idy] < newData[sortedIndex[j + 1]].values[idy]) {
                                        //                     let tmp = sortedIndex[j];
                                        //                     sortedIndex[j] = sortedIndex[j + 1];
                                        //                     sortedIndex[j + 1] = tmp;
                                        //                 }
                                        //         // console.debug(sortedIndex);
                                        //     })
                                        //     .style('color', (d, i) => getColor(sortedIndex[i]))
                                        //     .style('font-size', 10)
                                        //     .html((d, i) => {
                                        //         // console.debug(d.data);
                                        //         let y = newData[sortedIndex[i]].values[idy];

                                        //         let html = "<font size='5'>" + (isNaN(y) ? 'no data' : y) + "</font>";

                                        //         return html;
                                        //     });
                                    }

                                    if (!updateFlag)
                                        updateTimeOut.stop();

                                    updateTimeOut = d3.timeout(() => {
                                        action();
                                        updateFlag = true;
                                    }, updateDelay);

                                    updateFlag = false;



                                });


                        // //====================================zoom==================================================
                        var selectionRect = {
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
                                var x = this.currentX < this.originX ? this.currentX : this.originX;
                                var y = this.currentY < this.originY ? this.currentY : this.originY;
                                var width = Math.abs(this.currentX - this.originX);
                                var height = Math.abs(this.currentY - this.originY);
                                return {
                                    x: x,
                                    y: y,
                                    width: width,
                                    height: height
                                };
                            },
                            getCurrentAttributes: function () {
                                // use plus sign to convert string into number
                                var x = +this.element.attr("x");
                                var y = +this.element.attr("y");
                                var width = +this.element.attr("width");
                                var height = +this.element.attr("height");
                                return {
                                    x1: x,
                                    y1: y,
                                    x2: x + width,
                                    y2: y + height
                                };
                            },
                            // getCurrentAttributesAsText: function () {
                            //     var attrs = this.getCurrentAttributes();
                            //     return "x1: " + attrs.x1 + " x2: " + attrs.x2 + " y1: " + attrs.y1 + " y2: " + attrs.y2;
                            // },
                            init: function (newX, newY) {
                                var rectElement = svg
                                    .append("rect")
                                    .attr('rx', 0)
                                    .attr('ry', 0)
                                    .attr('x', 0)
                                    .attr('y', 0)
                                    .attr('width', 0)
                                    .attr('height', 0)
                                    // .attr('stroke', '#545454')
                                    // .attr('stroke-width', ' 2px')
                                    .attr('stroke-opacity', 1)
                                    .attr('fill', '#97CBFF')
                                    .attr('fill-opacity', 0.5);
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
                                    .attr('x', newAttr.x)
                                    .attr('y', newAttr.y)
                                    .attr('width', newAttr.width)
                                    .attr('height', newAttr.height);
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
                            }
                        };
                        var dragBehavior = d3.drag()
                            .on("start", e => {
                                console.log("dragStart");
                                const p = d3.pointer(e, event_rect.node());
                                selectionRect.init(margin.left, p[1]);
                                // const xm = x.invert(p[0]);
                                // console.debug(p);
                                selectionRect.removePrevious();
                                d3.select(window).dispatch("click");//關閉dropdown
                            })
                            .on("drag", e => {
                                console.log("dragMove");
                                const p = d3.pointer(e, event_rect.node());
                                // console.debug(p);
                                if (p[1] < margin.top)
                                    p[1] = margin.top;
                                else if (p[1] > height - margin.bottom)
                                    p[1] = height - margin.bottom;
                                // console.debug(p);
                                // const xm = x.invert(p[0]);
                                selectionRect.update(width - margin.right, p[1]);
                            })
                            .on("end", e => {
                                loadingEffect('show');
                                console.log("dragEnd");
                                // console.debug('end');

                                const finalAttributes = selectionRect.getCurrentAttributes();
                                // console.debug(finalAttributes);

                                if (finalAttributes.y2 - finalAttributes.y1 > 1 && finalAttributes.y2 - finalAttributes.y1 > 1) {
                                    console.log("range selected");
                                    // range selected
                                    // e.preventDefault();
                                    yAxis_domain = [y.invert(finalAttributes.y2), y.invert(finalAttributes.y1)];
                                    // console.debug(yAxis_domain);        
                                }
                                else {
                                    //-------- reset zoom
                                    console.log("single point");
                                    yAxis_domain = null;
                                }

                                newDataObj = getNewData({ normalize: normalize, yAxis_domain: yAxis_domain });
                                updateChart();
                                selectionRect.remove();

                            })
                        event_rect.call(dragBehavior);
                    }

                    mouseMove();
                }
                function chartOptionEvent() {

                    // //====================channel
                    // let channel_checkboxs = chartContainerJQ.find('input[name ="channel"]');
                    // channel_checkboxs.on("change", function (e) {
                    //     //只能單選所以取消其他的checked
                    //     channel_checkboxs.filter((i, checkbox) => checkbox !== e.target).prop("checked", false);
                    // });
                    //=====change channel
                    let channel = chartContainerD3.selectAll('input[name ="channel"]');
                    channel
                        .on('click', e => {
                            loadingEffect('show');
                            let tmp = [];

                            //＝＝＝多選                           
                            // channel.each(function (d, i) {
                            //     if (this.checked == true)
                            //         tmp.push(this.value);
                            // });

                            //＝＝＝單選

                            channel.nodes().filter(chkbox => chkbox !== e.target).forEach(chkbox => chkbox.checked = false);
                            if (e.target.checked) tmp = [e.target.value];

                            // channel_selectArr = tmp;
                            newDataObj = getNewData({ normalize: normalize, xAxis_domainObj: xAxis_domainObj, channel_selectArr: tmp });
                            // newDataObj = getNewData({ normalize: normalize, channel_selectArr: tmp });
                            // newDataObj.unselected_band = unselected_band;
                            updateChart();
                        });
                    //=====change sortBy dist/az

                    // console.debug(chartContainerD3.selectAll('input[name ="xAxisName"]'))
                    chartContainerD3.selectAll('input[name ="xAxisName"]')
                        .on('click', e => {
                            loadingEffect('show');
                            xAxisName = e.target.value;
                            updateChart();

                        });
                    chartContainerD3.selectAll('input[name ="xAxisScale"]')
                        .on('click', e => {
                            loadingEffect('show');
                            xAxisScale = e.target.value;
                            updateChart();

                        });


                    //====change xAxisRange
                    chartContainerD3.selectAll('input[name ="xAxisRange"]')
                        .on('input', e => {
                            if (updateFlag)
                                loadingEffect('show');
                            // console.debug(e.target);
                            //==========================target vaule check=================================
                            let dataMin = distRange_slider.getAttribute('min');
                            let dataMax = distRange_slider.getAttribute('max');
                            let eleID = (e.target.id).split('_');
                            let name = eleID[0];
                            let rangeIndex = eleID[1] == 'min' ? 0 : 1;
                            let key = name.substring(0, name.indexOf('Range'));

                            // console.debug((e.target.value));
                            if (isNaN(e.target.value) || e.target.value == '')
                                e.target.value = xAxis_domainObj[key] ? xAxis_domainObj[key][rangeIndex] : [dataMin, dataMax][rangeIndex];
                            // else if ([e.target.value < dataMin, e.target.value > dataMax][rangeIndex])
                            else if (e.target.value < dataMin || e.target.value > dataMax)
                                e.target.value = [dataMin, dataMax][rangeIndex];

                            //======================================================================
                            let parentNode = e.target.parentNode;
                            let minRange = parentNode.querySelector('#' + name + '_min').value;
                            let maxRange = parentNode.querySelector('#' + name + '_max').value;
                            // console.debug(minRange, maxRange);

                            minRange = parseFloat(minRange);
                            maxRange = parseFloat(maxRange);

                            if (minRange > maxRange) {
                                let tmp = minRange;
                                minRange = maxRange;
                                maxRange = tmp;
                            }

                            //==========================同步slider=================================
                            let domain = [minRange, maxRange];
                            switch (name) {
                                case 'distRange':
                                    distRange_slider.setValue(domain);
                                    break;
                                case 'azRange':
                                    azRange_slider.setValue(domain);
                                    break;
                            }
                            xAxis_domainObj[key] = domain;



                            //避免更新太頻繁LAG
                            // console.log(updateFlag);
                            if (!updateFlag)
                                updateTimeOut.stop();

                            updateTimeOut = d3.timeout(() => {
                                newDataObj = getNewData({ normalize: normalize, yAxis_domain: yAxis_domain, xAxis_domainObj: xAxis_domainObj });
                                updateChart();
                                updateFlag = true;
                            }, updateDelay);

                            updateFlag = false;

                        });

                    //=====change normalize
                    chartContainerD3.selectAll('#normalize')
                        .on('change', e => {
                            loadingEffect('show');
                            // console.debug(e.target.checked);
                            normalize = e.target.checked;
                            newDataObj = getNewData({ normalize: normalize, yAxis_domain: yAxis_domain, xAxis_domainObj: xAxis_domainObj });
                            // console.debug(xAxis_domainObj);

                            updateChart();

                        });
                    chartContainerD3.selectAll('#normalizeScale')
                        .on('input', e => {

                            // console.debug(e.target);
                            if (!isNaN(e.target.value)) {
                                if (updateFlag)
                                    loadingEffect('show');
                                else
                                    updateTimeOut.stop();

                                updateTimeOut = d3.timeout(() => {
                                    normalizeScale = e.target.value;
                                    updateChart();
                                    updateFlag = true;
                                }, updateDelay);

                                updateFlag = false;

                            }
                            else
                                e.target.value = normalizeScale;


                        });

                    //=====select station
                    let display = chartContainerD3.selectAll('input[name ="display"]');
                    display
                        .on('change', e => {
                            let tmp = [];
                            display.each(function (d, i) {
                                if (this.checked == false)
                                    tmp.push(this.value);
                            });
                            unselected_band = tmp;
                            // console.debug(unselected_band);
                            // newDataObj = getNewData(normalize, yAxis_domain);
                            // newDataObj.unselected_band = unselected_band;
                            updateChart();
                        });


                }


                chartOptionEvent();
                pathEvent();
            }
            svg.call(events);

            // var all_xdomain = [];
            // const tooltip = d3.select("#charts").append("div")
            //     .attr("id", "tooltip")
            //     .style('position', 'absolute')
            //     .style('z-index', '1')
            //     .style("background-color", "#D3D3D3")
            //     .style('padding', '20px 20px 20px 20px')
            //     .style("opacity", " .9")
            //     .style('display', 'none');
            return svg.node();
        }
        async function printChart() {
            chartContainerJQ.find('#distRange_slider').remove();
            chartContainerJQ.find('#azRange_slider').remove();
            chartContainerJQ.find('#displayDropDownMenu').children().remove();
            chartContainerJQ.find('#normalize').prop("checked", true);
            chartContainerJQ.find('#normalizeScale').prop('disabled', false);
            chartContainerJQ.find('#charts').children().remove();

            var i = 1;

            var getChartMenu = () => {
                // console.log(d.data);
                var div = document.createElement("div");
                div.setAttribute("id", "chart" + i);
                div.setAttribute("class", "chart col-md-12 col-sm-12");
                div.setAttribute("style", "position:relative");

                var nav = document.createElement('nav');
                nav.setAttribute("id", "nav" + i);
                nav.setAttribute("class", "toggle-menu");
                nav.setAttribute("style", "position:absolute");
                nav.style.right = "0";

                var a = document.createElement('a');
                a.setAttribute("class", "toggle-nav");
                a.setAttribute("href", "#");
                a.innerHTML = "&#9776;";
                nav.append(a);

                var ul = document.createElement("ul");
                ul.classList.add("active");
                nav.append(ul);

                var chartDropDown = ['bigimg', 'svg', 'png', 'jpg'];
                chartDropDown.forEach(option => {
                    var li = document.createElement("li");
                    var item = document.createElement("a");
                    item.href = "javascript:void(0)";

                    if (option != chartDropDown[0])
                        item.innerHTML = "下載圖表爲" + option;
                    else
                        item.innerHTML = "檢視圖片";

                    item.addEventListener("click", (e, a) => {
                        let chartIDArr = [];

                        // if (zoomAll)
                        //     for (let i = 1; i <= chartsCount; i++)
                        //         chartIDArr.push("#chart" + i + " svg");
                        // else
                        chartIDArr.push("#" + $(e.target).parents('.chart')[0].id + " svg");
                        // console.log(chartIDArr);

                        let xAxisName = document.querySelector('input[name ="xAxisName"]:checked').value;
                        let xAxisScale = document.querySelector('input[name ="xAxisScale"]:checked').value;
                        let referenceTime = data.referenceTime;
                        let fileName = 'WF_by_' + xAxisName + (xAxisScale == 'band' ? '-sta' : '') + '_' + referenceTime + 'Z';
                        // console.debug(fileName);
                        downloadSvg(chartIDArr, fileName, option);
                    });

                    li.append(item);
                    ul.append(li);
                });
                document.querySelector('#charts').append(div);
                document.querySelector('#chart' + i).append(nav);
            }
            var MenuEvents = () => {
                var charts = document.getElementById('charts');
                var stopPropagation = (e) => {
                    e.stopPropagation();
                }

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
                    }
                }

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
            }
            var downloadSvg = (chartQueryStrs, fileName, option) => {

                function getSvgUrl(svgNode) {
                    var svgData = (new XMLSerializer()).serializeToString(svgNode);
                    var svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                    var svgUrl = URL.createObjectURL(svgBlob);
                    return svgUrl;
                }
                function getCanvas(resize) {
                    // =============== canvas init
                    let canvas = document.createElement('canvas');
                    let context = canvas.getContext('2d');

                    var svgWidth = $(chartQueryStrs[0])[0].viewBox.baseVal.width;
                    var svgHeight = $(chartQueryStrs[0])[0].viewBox.baseVal.height * chartQueryStrs.length;
                    var canvasWidth, canvasHeight;
                    //檢視時縮放,下載時放大
                    if (resize) {
                        var windowW = $(window).width();//获取当前窗口宽度 
                        var windowH = $(window).height();//获取当前窗口高度 
                        // console.debug(windowW, windowH);
                        // console.debug(svgW, svgH);
                        var width, height;
                        var scale = 0.9;//缩放尺寸
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
                        var scale = 1.5;
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
                    var downloadLink = document.createElement("a");
                    downloadLink.href = href;
                    downloadLink.download = name;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }
                function show(img) {
                    chartContainerJQ.find('#bigimg').attr("src", img);//设置#bigimg元素的src属性 
                    chartContainerJQ.find('#outerdiv').fadeIn("fast");//淡入显示#outerdiv及.pimg 
                    chartContainerJQ.find('#outerdiv').off('click');
                    chartContainerJQ.find('#outerdiv').click(function () {//再次点击淡出消失弹出层 
                        $(this).fadeOut("fast");
                    });
                }

                if (option == 'svg') {
                    //==============merge svg
                    var newSvg = document.createElement('svg');


                    chartQueryStrs.forEach(queryStr => {
                        var svgjQobj = $(queryStr);
                        svgjQobj.clone().appendTo(newSvg);
                    });
                    // console.debug(newSvg);
                    var svgUrl = getSvgUrl(newSvg);
                    download(svgUrl, fileName + '.' + option);
                }
                else {
                    //==============each svg draw to canvas
                    var CanvasObjArr = getCanvas(option == 'bigimg');

                    var canvas = CanvasObjArr[0];
                    var context = CanvasObjArr[1];
                    var imageWidth = canvas.width;
                    var imageHeight = canvas.height / chartQueryStrs.length;


                    chartQueryStrs.forEach((queryStr, index) => {
                        var svgNode = $(queryStr)[0];
                        var svgUrl = getSvgUrl(svgNode);
                        var image = new Image();
                        image.src = svgUrl;
                        image.onload = () => {
                            context.drawImage(image, 0, index * imageHeight, imageWidth, imageHeight);

                            //done drawing and output
                            if (index == chartQueryStrs.length - 1) {
                                var imgUrl;
                                if (option == 'bigimg') {
                                    imgUrl = canvas.toDataURL();// default png
                                    show(imgUrl);
                                }
                                else {
                                    imgUrl = canvas.toDataURL('image/' + option);
                                    download(imgUrl, fileName + '.' + option);
                                }
                            }
                        }
                    });
                }

            }

            let xAxisName = document.querySelector('input[name ="xAxisName"]:checked').value;
            let xAxisScale = document.querySelector('input[name ="xAxisScale"]:checked').value;

            // console.debug(xAxisName, xAxisScale)
            getChartMenu();

            data = await data;//等data處理完才能畫圖
            chartContainerJQ.find('#chart' + i).append(WD_Charts(xAxisScale, xAxisName));
            MenuEvents();
        }
        //===init once
        if (!(chartContainerJQ.find('#form-chart').length >= 1)) {
            init();
        }
        printChart();
    }
    return chart;
}