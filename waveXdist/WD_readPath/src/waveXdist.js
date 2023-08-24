function waveXdist() {
  let selector = "body";
  let data;
  let stringObj;

  chart.selector = (value) => {
    selector = value;
    return chart;
  };
  chart.dataPath = (value) => {
    // console.debug(value);
    let fileXY_paths = value.data;
    let staAz_paths = value.az;
    let staDist_paths = value.dist;
    let Taxis_paths = value.Taxis;
    let eventlist_paths = value.eventlist;
    let staCoord_paths = value.sta_coord;

    const dataKey = [
      "network",
      "station",
      "channel",
      "data",
      "dist",
      "az",
      "coord",
    ];
    //==test
    const stationIndex = 7;
    const channelIndex = 9;

    //==異步讀檔,回傳一個promise而非結果
    let readTextFile = (file, fileDataKey) => {
      // console.debug(fileDataKey);
      let tmpData = [];

      let pushData;
      if (fileDataKey.length > 1) {
        //一行有兩列以上的資料則作物件陣列
        pushData = (row) => {
          let col = row.trim().split(/\s+/);
          // console.debug(col);
          let obj = {};
          col.forEach(
            (c, index) =>
              (obj[fileDataKey[index]] = isNaN(c) ? c : parseFloat(c))
          );
          tmpData.push(obj);
        };
      } else {
        //一行有一列直接作數值陣列
        pushData = (row) => {
          tmpData.push(isNaN(row) ? row : parseFloat(row));
        };
      }

      return new Promise((resolve, reject) => {
        let rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, true);
        // rawFile.open("GET", file, false);
        rawFile.onreadystatechange = function () {
          if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
              let rows = rawFile.responseText.split("\n");
              rows.forEach((row) => {
                if (row != "") {
                  pushData(row);
                }
              });
              let startStr = "/";
              let startIndex = file.lastIndexOf(startStr) + startStr.length;
              let fileName = file.substring(startIndex);
              let fileData = { fileName: fileName, data: tmpData };
              // console.debug(fileData);
              resolve(fileData);
            } else {
              reject(new Error(req));
            }
          }
        };
        rawFile.send(null);
      });
    };

    //==需要以下檔案
    //==1.振幅y 檔案可能有多個
    async function getXYData() {
      // const dataKey_xy = ['time', 'amplipude'];
      const dataKey_xy = ["amplipude"]; //新檔案只給振幅
      //===ex:  ./event/2021/20210804215628/xyFiles/TSMIP/F036.10.HLE.y
      const getNetwork = (path) => {
        let lastIndex = path.lastIndexOf("/");
        return path.substring(
          path.lastIndexOf("/", lastIndex - 1) + 1,
          lastIndex
        );
      };

      //===(不用了)
      //===兩種同步資料方法
      //A.每個測站資料的時間點都要相同，如果其他測站少時間點就要補上時間點並給undefine值(event讀同個時間資料才不出錯)
      let syncALLDataTiming = (fileData) => {
        // console.debug(fileData);
        let chartData;

        let Datakey_time = fileData[0].column[0];
        let Datakey_vaule = fileData[0].column[1];
        let dataArr = fileData.map(() => []);
        let timeArr = [];

        let syncALL = () => {
          let i = 0;
          let min = undefined;
          let indexArr = fileData.map(() => 0);
          // console.debug(indexArr);

          // console.debug(dataArr);

          let done = false;
          while (!done) {
            for (let j = 0; j < fileData.length - 1; j++) {
              let A = fileData[j].data[indexArr[j]]
                  ? fileData[j].data[indexArr[j]][Datakey_time]
                  : undefined,
                B = fileData[j + 1].data[indexArr[j + 1]]
                  ? fileData[j + 1].data[indexArr[j + 1]][Datakey_time]
                  : undefined;
              if (A != B) {
                if (isNaN(min)) {
                  // A & B
                  if (!isNaN(A) && !isNaN(B)) min = A < B ? A : B;
                  else if (!isNaN(A)) min = A;
                  else if (!isNaN(B)) min = B;
                } else {
                  if (B < min) min = B;
                }
              }
              if (j == fileData.length - 2) {
                if (min) {
                  timeArr.push(min);
                  dataArr.forEach((arr, index) => {
                    if (
                      fileData[index].data[indexArr[index]] &&
                      fileData[index].data[indexArr[index]][Datakey_time] == min
                    ) {
                      arr.push(
                        fileData[index].data[indexArr[index]][Datakey_vaule]
                      );
                      indexArr[index]++;
                    } else arr.push(undefined);
                  });
                } else {
                  timeArr.push(A);
                  dataArr.forEach((arr, index) => {
                    arr.push(
                      fileData[index].data[indexArr[index]][Datakey_vaule]
                    );
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
              } else if (k == indexArr.length - 1) done = true;
            }
          }
        };

        //只有一個測站會死迴圈,所以另外整理資料結構
        if (fileData.length > 1) syncALL();
        else {
          fileData[0].data.forEach((d, i) => {
            dataArr[0].push(d[Datakey_vaule]);
            timeArr.push(d[Datakey_time]);
          });
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
      };
      //B.先找第一點時間漂亮的測站當標準來取時間陣列(沒有則選第一個讀取的檔案)，在用最少點的測站當標準資料點數
      let sliceSamePoint = (fileData) => {
        let Datakey_time = fileData[0].column[0];
        let Datakey_vaule = fileData[0].column[1];
        // console.debug(fileData);
        //選標準規則（沒有才用下個條件）：尾數0整數>整數>第一個測站資料
        let standardDataIndex = undefined;
        for (let i = 0; i < fileData.length; i++) {
          let firstTiming = fileData[i].data[0][Datakey_time];
          if (firstTiming % 1 === 0) {
            //判斷第一點時間爲整數
            if (isNaN(standardDataIndex)) {
              standardDataIndex = i;
              continue;
            }
            if (firstTiming % 10 === 0) {
              standardDataIndex = i;
              break;
            }
          } else if (i == fileData.length - 1 && isNaN(standardDataIndex))
            standardDataIndex = 0;
        }
        // console.debug(standardDataIndex);
        let standardDataLength = Math.min(
          ...fileData.map((d) => d.data.length)
        );
        // console.debug(standardDataLength);

        let chartData = fileData.map((d, i, arr) => {
          // console.debug(d, i, arr);
          let tmp = {};
          tmp[arr.column[0]] = d[arr.column[0]]; //station
          tmp[arr.column[1]] = d[arr.column[1]]; //channel
          let dataArr =
            d.data.length > standardDataLength
              ? d.data.slice(0, standardDataLength)
              : d.data;
          tmp[arr.column[2]] = dataArr.map((d) => d[Datakey_vaule]);
          // tmp[arr.column[1]] = d.data.slice(0, standardDataLength).map(d => d[Datakey_vaule]);
          tmp.column = d.column.slice(1);
          return tmp;
        });
        let dataArr =
          fileData[standardDataIndex].data.length > standardDataLength
            ? fileData[standardDataIndex].data.slice(0, standardDataLength)
            : fileData[standardDataIndex].data;
        chartData.timeArr = dataArr.map((d) => d[Datakey_time]);
        chartData.yAxisName = fileData[0].column[0];
        chartData.column = fileData.column;
        // chartData.referenceTime = fileData.referenceTime;
        // console.debug(chartData);
        return chartData;
      };
      //===(不用了)

      //==由路徑中的network來分開資料陣列（{TSMIP:[...],CWSN:[...]}）
      let originData = {};
      await Promise.all(
        fileXY_paths.map(async (path, i) => {
          // let d = readTextFile(path, dataKey_xy, fileXY_callback);
          // console.debug(getNetwork(path));
          let network = getNetwork(path);
          let tmp = {};
          try {
            const success = await readTextFile(path, dataKey_xy);
            let d = success;
            tmp[dataKey[0]] = network;
            tmp[dataKey[1]] = d.fileName.split(".")[stationIndex];
            tmp[dataKey[2]] = d.fileName.split(".")[channelIndex];
            tmp[dataKey[3]] = d.data;
            tmp.column = dataKey_xy;
          } catch (fail) {
            console.debug("read xy file error");
            console.debug(fail);
          }

          if (!originData[network]) originData[network] = new Array();
          originData[network].push(tmp);
          return tmp;
        })
      );
      // console.debug(originData);

      return originData;
    }

    //==2.az、3.dist 都是單個檔案
    const dataKey_staAz = [dataKey[1], dataKey[5]];
    const dataKey_staDist = [dataKey[1], dataKey[4]];
    const dataKey_staCoord = [dataKey[1], dataKey[6]];
    let azPromise = readTextFile(staAz_paths, dataKey_staAz);
    let distPromise = readTextFile(staDist_paths, dataKey_staDist);

    //==4.時間x
    const dataKey_Taxis = ["time"];
    let TaxisPromise = readTextFile(Taxis_paths, dataKey_Taxis);

    //==5.eventlist.txt
    let eventlistPromise = readTextFile(eventlist_paths, [
      "date",
      "time",
      "lat",
      "lng",
      "depth",
      "ML",
      "catalog",
    ]);

    //==6.sta_coord.txt
    let staCoordPromise = readTextFile(staCoord_paths, [
      "station",
      "lat",
      "lng",
    ]);

    //檔案都讀取完才能整理成圖表要的完整資料
    data = Promise.all([
      getXYData(),
      azPromise,
      distPromise,
      TaxisPromise,
      eventlistPromise,
      staCoordPromise,
    ]).then((success) => {
      // console.debug(success);
      let xyData = success[0];
      let sta_az = success[1];
      let sta_dist = success[2];
      let Taxis = success[3];
      let eventlist = success[4];
      let sta_coord = success[5];

      console.log("xyData = ");
      console.log(xyData);
      console.log("sta_az = ");
      console.log(sta_az);
      console.log("sta_dist = ");
      console.log(sta_dist);
      console.log("Taxis = ");
      console.log(Taxis);
      console.log("eventlist = ");
      console.log(eventlist);
      console.log("sta_coord = ");
      console.log(sta_coord);

      //將每個測站資料加上az、dist、coord,並push到各cha分組
      const distData = sta_dist.data;
      const azData = sta_az.data;
      const coordData = sta_coord.data;
      const networkKey = Object.keys(xyData);

      let dataNet = {};
      networkKey.forEach((net) => {
        let channelData = {};
        xyData[net].forEach((d) => {
          // console.log(d[dataKey[0]]);
          let sta = d[dataKey[1]];
          let channel = d[dataKey[2]];

          let obj = { ...d };
          let cha = channel[channel.length - 1];
          if (!channelData[cha]) channelData[cha] = new Array();

          for (let i = 0; i < distData.length; i++)
            if (distData[i][dataKey_staDist[0]] == sta) {
              obj[dataKey_staDist[1]] = distData[i][dataKey_staDist[1]];
              break;
            } else if (i == distData.length - 1)
              obj[dataKey_staDist[1]] = undefined;

          for (let i = 0; i < azData.length; i++)
            if (azData[i][dataKey_staAz[0]] == sta) {
              obj[dataKey_staAz[1]] = azData[i][dataKey_staAz[1]];
              break;
            } else if (i == azData.length - 1)
              obj[dataKey_staAz[1]] = undefined;

          for (let i = 0; i < coordData.length; i++)
            if (coordData[i][dataKey_staCoord[0]] == sta) {
              obj[dataKey_staCoord[1]] = [coordData[i].lat, coordData[i].lng];
              break;
            } else if (i == coordData.length - 1)
              obj[dataKey_staCoord[1]] = undefined;

          //==沒有同時有az.dist的資料不要放入
          if (!isNaN(obj[dataKey_staDist[1]]) && !isNaN(obj[dataKey_staAz[1]]))
            channelData[cha].push(obj);
        });
        dataNet[net] = channelData;
      });
      dataNet.column = networkKey;

      let compositeData = {};
      compositeData.dataNet = dataNet;
      compositeData.timeArr = Taxis.data;
      compositeData.yAxisName = dataKey_Taxis[0];
      compositeData.column = dataKey;

      Object.assign(compositeData, eventlist.data[0]);
      // console.debug(eventlist.data[0]);
      console.debug(compositeData);

      return compositeData;
    });

    // console.debug(data)
    // data.then(s => console.debug(s))
    return chart;
  };
  chart.string = (value) => {
    stringObj = value;
    return chart;
  };

  function chart(catalog_get = null) {
    const chartContainerJQ = $(selector);
    const chartContainerD3 = d3.select(selector);

    //===loadingEffect
    let hideLoading_flag = true;
    let hideLoading_timeOut = null;
    function loadingEffect(action = "hide") {
      const loadingGroup = chartContainerD3.selectAll("#loading");
      // console.debug(loadingGroup);
      const transitionDuration = 200;

      if (!hideLoading_flag) hideLoading_timeOut.stop();

      switch (action) {
        case "show":
          d3.timeout(() => {
            loadingGroup.style("opacity", 1).style("display", "inline");
          }, 0);
          break;
        case "hide":
          hideLoading_timeOut = d3.timeout(() => {
            loadingGroup
              .transition()
              .duration(transitionDuration)
              .style("opacity", 0);
            d3.timeout(
              () => loadingGroup.style("display", "none"),
              transitionDuration
            );
            hideLoading_flag = true;
          }, transitionDuration);

          hideLoading_flag = false;
          break;
      }
    }

    //===append chart options
    function init() {
      chartContainerJQ.append(`
                <form id="form-chart">
                <div class="form-group" id="chartsOptions" style="display: inline;">
                <div class="row">
                
                <!-- ... catalog ... -->
                <div class="form-group col-lg-3 col-md-4 col-sm-6 d-flex flex-row align-items-start">
                    <label for="catalog" class="col-form-label col-4" >Catalog</label>
                    <div class="form-group col-8">
                         <select class="form-control" id="catalog">
                            <option disabled selected value> -- select an option -- </option>
                         </select>
                    </div>
                </div>

                <!-- ... network selector ... -->    
                <div class="form-group col-lg-3 col-md-4 col-sm-6 d-flex flex-row align-items-start">
                    <label for="networkSelectButton" class="col-form-label col-5" >Network</label>
                    <div class="btn-group btn-group-toggle col-7" role="group">
                        <button id="networkSelectButton" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            select
                        </button>
                        <div class="dropdown-menu" id="networkMenu" aria-labelledby="networkSelectButton">
                            <div class="d-flex flex-row flex-wrap" id="networkDropDownMenu">
                            </div>
                        </div>
                    </div>
                </div>  


                                
                <!-- ... display selector ... -->    
                <div class="form-group col-lg-3 col-md-4 col-sm-6 d-flex flex-row align-items-start">
                    <label for="displaySelectButton" class="col-form-label col-4" >Station</label>
                    <div class="btn-group btn-group-toggle col-8" role="group">
                        <button id="displaySelectButton" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            select
                        </button>
                        <div class="dropdown-menu" id="displayMenu" aria-labelledby="displaySelectButton">
                            <div class="" id="displayDropDownMenu">

                                <div class='controller d-flex'>
                                    <div class='form-check col-6 d-flex align-items-center'>
                                        <input type='checkbox' class='form-check-input  col-4' id='staionSelectMode'>
                                        <label for='staionSelectMode' class='form-check-label  col-8' id='staionSelectMode' style='display:block;text-indent:-5px;white-space:nowrap;'>
                                        select mode(S)
                                        </label>
                                    </div>
                                    <div class='form-check col-6  d-flex justify-content-end'>
                                        <button type="button" class="btn btn-outline-secondary btn-sm" id="staionReset">reset</button>
                                    </div>
                                </div>

                                <hr style='border:1px solid;color:gray;opacity: 0.33;width:90%;'>

                                <div class='stations d-flex flex-row flex-wrap'></div>
                               
                                <div class='pageController'>
                                    <div class='d-flex flex-row justify-content-center'>
                                        <label> page </label>
                                    </div>
                                    <div class='d-flex flex-row flex-nowrap justify-content-around'>
                                        <button type="button" class="prePage col-2 btn btn-outline-secondary btn-sm"><</button>
                                        <div class='col-6 d-flex flex-row flex-nowrap  align-items-center'>                            
                                            <input class="currentPage form-control col-8" type="text">
                                            <label class="totalPage col-form-label col-4" style='white-space:nowrap;padding:0 0px;'>/ 0</label>
                                        </div>
                                        <button type="button" class="nextPage col-2 btn btn-outline-secondary btn-sm">></button>
                                    </div>
                                </div>
                            
                            </div>
                        </div>
                    </div>           
                </div>  


                <!-- ... channel selector ... -->    
                <div class="form-group col-lg-3 col-md-4 col-sm-6 d-flex flex-row align-items-start">
                    <label for="channelSelectButton" class="col-form-label col-5" >Channel</label>
                    <div class="btn-group btn-group-toggle col-7" role="group">
                        <button id="channelSelectButton" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            select
                        </button>
                        <div class="dropdown-menu" id="channelMenu" aria-labelledby="channelSelectButton">
                            <div class="d-flex flex-row flex-wrap" id="channelDropDownMenu">

                            <!-- ... 
                                <div class="form-check col-4" style="text-align: center;">
                                    <input class="form-check-input col-3" type="checkbox" id="channel_Z" name="channel" value="Z" checked>
                                    <label  for="channel_Z">Z</label>
                                </div>
                                <div class="form-check col-4" style="text-align: center;">
                                    <input class="form-check-input col-3" type="checkbox" id="channel_N" name="channel" value="N/1">
                                    <label for="channel_N">N/1</label>
                                </div>
                                <div class="form-check col-4" style="text-align: center;">
                                    <input class="form-check-input col-3" type="checkbox" id="channel_E" name="channel" value="E/2">
                                    <label  for="channel_E">E/2</label>
                                </div>
                            ... -->  

                            </div>
                        </div>
                    </div>
                </div>  


                <!-- ... xAxisName ... --> 
                <div class="form-group col-lg-3 col-md-4 col-sm-6 d-flex flex-row align-items-start">
                <label for="xAxisName" class="col-form-label col-4" >Range</label>
                    <div class="btn-group btn-group-toggle col-8" data-toggle="buttons"  id="xAxisName_radioGroup">
                        <label class="btn btn-secondary dropdown-toggle active" >
                            <input  type="radio" name ="xAxisName" id="dist" value="dist" checked> Dist.


                            <div class="dropdown-menu dropdown-menu-right" id="distMenu" aria-labelledby="xAxisName">
                                <div class="form-group col-12 d-flex flex-row flex-wrap align-items-start justify-content-between" >       
                                <label class="" for="distRange">distance range</label>
                                <button type="button" class="btn btn-outline-secondary btn-sm" name="rangeReset" value='dist'>reset</button>

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

                            <sub class='dist' style="position:absolute; left:50%; bottom:5px; transform: translate(-50%, -50%);"></sub>
                    
                        </label>
                        <label class="btn btn-secondary dropdown-toggle">
                            <input type="radio" name ="xAxisName" id="az" value="az"> Az.

                            <div class="dropdown-menu dropdown-menu-right " id="azMenu" aria-labelledby="xAxisName">
                            <div class="form-group col-12 d-flex flex-row flex-wrap align-items-start justify-content-between" >       
                            <label class="" for="azRange">azimuth range</label>
                            <button type="button" class="btn btn-outline-secondary btn-sm" name="rangeReset" value='az'>reset</button>

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

                        <sub class='az' style="position:absolute; left:50%; bottom:5px; transform: translate(-50%, -50%);"></sub>
                        </label>
                        
               
                        
                    </div>                    
                </div>              
            

                <!-- ... xAxisScale ... -->                
                <div class="form-group col-lg-3 col-md-4 col-sm-6 d-flex flex-row align-items-start">
                <label for="xAxisScale" class="col-form-label col-4" >Order</label>
                <div class="btn-group btn-group-toggle col-8" data-toggle="buttons">
                    <label class="btn btn-secondary active">
                        <input type="radio" name ="xAxisScale" id="linear" value="linear" checked> Linear
                    </label>
                    <label class="btn btn-secondary">
                        <input type="radio" name ="xAxisScale" id="band" value="band"> Station
                    </label>
                </div>
                </div>   


                <!-- ... normalize ...  --> 
                <div
                class="form-group col-lg-3 col-md-4 col-sm-6 d-flex justify-content-start  align-items-center flex-row flex-nowrap">               
                    <div id="normalize-group" class="form-check" >
                        <input class="form-check-input  col-4" type="checkbox" id="normalize" name="normalize">
                        <label class="form-check-label  col-8" for="normalize">
                            Normalization
                        </label>                        
                    </div>
                    <label for="normalizeScale" class="col-form-label" >x</label>            
                    <div class="col-5">                                              
                            <input class="form-control" type="text" id="normalizeScale" name="normalize" disabled>    
                            <div class="dropdown-menu dropdown-menu-left" id="normalizeScaleMenu">
                                <div class="d-flex flex-row flex-wrap justify-content-center" >       
                                    <label for="NSRange">Normalization scale</label>
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
                        style="position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);z-index:1200;width:100%;height:100%;display:none;">
                        <div id="innerdiv" style=" background-color: rgb(255, 255, 255);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"></div>                      
                    </div>

                    <div id='loading'>
                        <div class="spinner-border"role="status">
                            <span class="sr-only" >Loading...</span>
                        </div>
                        Loading...
                    </div>

                </div> 
                </form>

                <div id='stationInfo' class="row">
                    <div id='stationMap' class="col-8"></div> 
                    <div id='stationList' class="col-4"></div> 
               </div> 
                `);
      //================dropdown-menu內元素被點擊不關閉menu

      let All_dropdownMenu = chartContainerJQ.find(".dropdown-menu");

      All_dropdownMenu.on("click.bs.dropdown", function (e) {
        // console.debug(e.target);
        e.stopPropagation();
        if (this.getAttribute("aria-labelledby") == "xAxisName")
          //防止改變範圍也同時改變radio按鈕選擇
          e.preventDefault();
      });
      // .on("shown.bs.dropdown", function (e) {
      //     console.debug(e.target);
      // })

      //================
      let mousedownFlag = false;
      let windowJQ = $(window);
      windowJQ
        //==用來關閉dropdown menu
        .on("click", (e) => {
          // console.debug(e.target);
          if (e.target.id != "normalizeScale" && e.target.name != "xAxisName")
            All_dropdownMenu.removeClass("show");
        })
        //==用來判斷range是否拖曳中(不要關dropdown)
        .on("mousedown", (e) => (mousedownFlag = true))
        .on("mouseup", (e) => (mousedownFlag = false));
      // .on('resize', e => {
      //     let chartW = windowJQ.width() * 0.8;
      //     let chartH = windowJQ.height() * 0.6;

      //     console.debug(chartW, chartH);
      //     chartContainerJQ.find("#chart1 svg")
      //         .attr({
      //             viewBox: `0 0 ${chartW} ${chartH}`,
      //             width: chartW + 'px',
      //             height: chartH + 'px',
      //         });

      // });

      //================station list數量變畫會自動捲動（還沒找到解法）
      // let pageController = chartContainerJQ.find('.pageController');

      // pageController.on('focus', e => { console.debug(e.target); })
      // pageController.find('button')
      //     .on('focus', e => {
      //         // console.debug(e.target);
      //         // e.stopPropagation();
      //         // e.preventDefault();
      //         // $(e.target).trigger('blur');
      //     });
      // pageController.find('input')
      //     .on('focus', e => {
      //         // console.debug(e.target);
      //         // e.stopPropagation();
      //         // e.preventDefault();
      //         // $(e.target).trigger('blur');
      //     });

      //====================xAxisName
      let xAxisName_radioGroup = chartContainerJQ.find("#xAxisName_radioGroup");
      let xAxisName_dropdownMenu = xAxisName_radioGroup.find(".dropdown-menu");
      xAxisName_dropdownMenu.on("mouseover", function (e) {
        e.stopPropagation();
        e.preventDefault();
      });

      //==用來判斷 rangeTextBox是否Focus(不要關dropdown)
      let rangeTextBoxFocus = false;
      xAxisName_dropdownMenu
        .find('input[name ="xAxisRange"]')
        .on("focus", (e) => (rangeTextBoxFocus = true))
        .on("blur", (e) => (rangeTextBoxFocus = false));

      xAxisName_radioGroup
        .find('input[name ="xAxisName"]')
        .on("click", function (e) {
          // console.debug($(e.target).siblings().filter('.dropdown-menu'));
          $(e.target).siblings().filter(".dropdown-menu").addClass("show");
        });

      xAxisName_radioGroup
        .children("label")
        .on("mouseover", function (e) {
          // console.debug(this);
          xAxisName_dropdownMenu.removeClass("show"); //先全關避免兩個dropdown同時出現
          $(this.childNodes).filter(".dropdown-menu").addClass("show");
        })
        .on("mouseleave", function (e) {
          if (!mousedownFlag && !rangeTextBoxFocus)
            xAxisName_dropdownMenu.removeClass("show");
        });

      xAxisName_radioGroup.find("#distRange").on("change", function (e) {
        // console.debug('distRange change');

        let range = e.target.getAttribute("value").split(",");
        $(e.target.parentNode).find("#distRange_min").val(range[0]);
        $(e.target.parentNode).find("#distRange_max").val(range[1]);
        chartContainerD3.selectAll("#distRange_min").dispatch("input");
      });

      xAxisName_radioGroup.find("#azRange").on("change", function (e) {
        // console.debug(e.target.parentNode);
        // console.debug(e.target.value);
        let range = e.target.getAttribute("value").split(",");
        $(e.target.parentNode).find("#azRange_min").val(range[0]);
        $(e.target.parentNode).find("#azRange_max").val(range[1]);
        chartContainerD3.selectAll("#azRange_min").dispatch("input");
      });

      //====================normalize
      chartContainerJQ.find("#normalize").on("change", function (e) {
        // console.debug(e.target.checked);
        if (e.target.checked)
          chartContainerJQ.find("#normalizeScale").prop("disabled", false);
        else chartContainerJQ.find("#normalizeScale").prop("disabled", true);
      });

      chartContainerJQ.find("#normalizeScale").on("focus", function (e) {
        chartContainerJQ.find("#normalizeScaleMenu").addClass("show");
        // e.preventDefault();
      });
      //====================normalize
      let normalizeScale = [1, 2, 5, 10];

      let default_normalizeScaleIdx = 1;

      chartContainerJQ
        .find("#normalizeScale")
        .val(normalizeScale[default_normalizeScaleIdx])
        .on("input", function (e) {
          // console.debug('normalizeScale input');
          // console.debug(e.target.value);
          let inputVal = parseFloat(e.target.value);
          if (normalizeScale.includes(inputVal))
            chartContainerJQ
              .find("#NSRange")
              .attr("value", normalizeScale.indexOf(inputVal));
          else chartContainerJQ.find("#NSRange").attr("value", 0);
        });

      // let
      chartContainerJQ
        .find("#NSRange")
        .attr("min", 0)
        .attr("max", normalizeScale.length - 1)
        .attr("value", default_normalizeScaleIdx)
        .on("input propertychange", function (e) {
          // console.debug('NSRange change');
          let NSIndex = e.target.value;
          let scale = normalizeScale[NSIndex];
          chartContainerJQ.find("#normalizeScale").val(scale);
          chartContainerD3.selectAll("#normalizeScale").dispatch("input");
        });

      // normalizeScale.forEach((d, i) => {
      //     chartContainerJQ.find('#NSList').append($("<option></option>").attr("value", i).text(d));
      // });

      let normalizeScale_html = normalizeScale
        .map((d, i) => `<option value="${i}">${d}</option>`)
        .join("");
      chartContainerJQ.find("#NSList").append(normalizeScale_html);

      //====================catalog
      function getFileData() {
        //===get floder name(catalog) to make option
        let catalogArr;
        const dataPath = "../data/";
        const folderStr = "xy_";

        // const staAz_fileName = 'sta_az.txt';
        // const staDist_fileName = 'sta_dist.txt';

        const pathsKey = [
          "data",
          "az",
          "dist",
          "Taxis",
          "eventlist",
          "sta_coord",
        ];
        const fileExtension = ".txt";

        $.ajax({
          url: "../src/php/getFile.php",
          data: { path: dataPath, folderStr: folderStr },
          method: "POST",
          dataType: "json",
          async: false,
          success: function (result) {
            catalogArr = result;
            console.log("catalogArr = ");
            console.log(catalogArr);
            catalogArr.forEach((r, i) => {
              let catalog = r.catalog;
              // console.debug(catalog);
              $("#catalog").append(
                $("<option></option>").attr("value", i).text(catalog)
              );
            });
          },
          error: function (jqXHR, textStatus, errorThrown) {
            // console.error(jqXHR, textStatus, errorThrown);
            console.error(jqXHR.responseText);
          },
        });

        let getPaths = (optionValue) => {
          console.debug("optionValue= " + optionValue);
          let event = catalogArr[optionValue];
          let catalog = event.catalog;

          let pathObj = {};
          pathsKey.forEach((key, i) => {
            if (i === 0) {
              // pathObj[key] = event.fileXY.map(file => dataPath + catalog + "/" + event.folder + "/" + file)
              let tmp = Object.keys(event.network).map((network) =>
                event.network[network].map(
                  (file) =>
                    dataPath +
                    catalog +
                    "/" +
                    event.xyFolder +
                    "/" +
                    network +
                    "/" +
                    file
                )
              );
              pathObj[key] = [].concat.apply([], tmp);
            } else {
              pathObj[key] = dataPath + catalog + "/" + key + fileExtension;
            }
          });

          return pathObj;
        };

        // console.debug(catalogArr);
        // console.debug(catalogArr.findIndex(obj => obj.catalog == catalog_get));

        let catalogSelectValue = catalog_get
          ? catalogArr.findIndex((obj) => obj.catalog === catalog_get)
          : undefined;
        chartContainerJQ
          .find("#catalog")
          .val(catalogSelectValue) //===show first data charts when onload
          .change((e) => {
            // console.debug(e.target.value);
            loadingEffect("show");
            let paths = getPaths(e.target.value);
            chart.dataPath(paths)();
          });
        catalogSelectValue
          ? chart.dataPath(getPaths(catalogSelectValue))
          : loadingEffect("hide");
      }

      getFileData();
    }
    function WD_Charts(xAxisScale = "linear", xAxisName = "dist") {
      console.debug(data);
      // console.debug(xAxisName)
      let colorPalette = {}; //to fixed color for each station
      const dataKeys = data.column; //0: "network", 1: "station", 2: "channel", 3: "data", 4: "dist", 5:"az"
      // console.debug(dataKeys);

      //＝＝按channelGroups組別分好資料(要分開network)
      const channelGroups = ["Z", "N/1", "E/2"]; //用來 1.getNewData()原始資料分類 2.init()時產生cha選擇框
      const networkKey = data.dataNet.column;
      const groupData = {};
      networkKey.forEach((net) => {
        let tmp = channelGroups.map((string) =>
          [].concat(
            ...string
              .split("/")
              .map((cha) =>
                data.dataNet[net][cha] ? data.dataNet[net][cha] : []
              )
          )
        );
        groupData[net] = tmp;
      });
      const timeArr = data.timeArr;
      // console.debug(groupData);

      let referenceTime = `${data.date}T${data.time}`,
        title = `${referenceTime}(UTC)  M${data.ML}`;

      if (stringObj) {
        referenceTime = stringObj.referenceTime
          ? stringObj.referenceTime
          : referenceTime;
        title = stringObj.title
          ? stringObj.title
          : (referenceTime.includes(".")
              ? referenceTime.substring(0, referenceTime.lastIndexOf("."))
              : referenceTime) + " (UTC)";
      }

      const getMargin = (yAxisDomain = null) => {
        // console.debug(yAxisDomain);
        let top = 30,
          right = 30,
          bottom = 70,
          left = 50;
        if (yAxisDomain) {
          let yAxisMaxTick = parseInt(
            Math.max(...yAxisDomain.map((domain) => Math.abs(domain)))
          );
          let tickLength = yAxisMaxTick.toString().length;
          // console.debug(tickLength);
          left = (tickLength >= 7 ? 60 : tickLength >= 5 ? 50 : 45) + 40;
        }
        return { top: top, right: right, bottom: bottom, left: left };
      };
      const getColor = (key) => {
        let color;
        if (colorPalette[key]) color = colorPalette[key];
        else {
          // let data = newDataObj.newData;
          // let index = data.findIndex(d => d[dataKeys[1]] === key);
          // let index = undefined;
          // for (let i = 0; i < data.length; i++)
          //     if (data[i][dataKeys[1]] == key) {
          //         index = i;
          //         break;
          //     };
          // data[index].colorIdx = index;

          let networkArr = newDataObj.network_selectArr;
          let channelGroup = newDataObj.channel_selectGroup;

          //==每次選net顏色都重置，不管net怎麼選都要按照距離6色輪流
          let data = []
            .concat(...networkArr.map((net) => groupData[net][channelGroup]))
            .sort((a, b) => a[dataKeys[4]] - b[dataKeys[4]]);
          let index = data.findIndex((d) => d[dataKeys[1]] === key);
          // console.debug(data);

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
      };
      const getString = (key) => {
        let keyName,
          keyUnit = "";
        switch (key) {
          case "dist":
            keyName = "Distance(km)";
            keyUnit = "km";
            break;
          case "az":
            keyName = "Azimuth(°)";
            keyUnit = "°";
            break;
          case "time":
            keyName = "Time(s)";
            keyUnit = "s";
            break;
          case "station":
            keyName = "Station";
            break;
          default:
            keyName = key;
            break;
        }
        return { keyName: keyName, keyUnit: keyUnit };
      };
      const width = window.innerWidth;
      const height = window.innerHeight * 0.95;
      // const width = 800;
      // const height = 500;
      // console.debug(width, height)

      const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);
      const xAxis = svg.append("g").attr("class", "xAxis");
      const yAxis = svg.append("g").attr("class", "yAxis");
      const pathGroup = svg
        .append("g")
        .attr("class", "paths")
        .attr("clip-path", "url(#clip)");

      let margin, x, y, path_x;
      let newDataObj;

      //===for range
      let distRange_slider, azRange_slider; //for event control slider
      let dist_domain, az_domain; //range選擇範圍

      //===for station select
      let unselected_band = [];
      const unselected_color = "grey",
        unselected_opacity = 0.3;
      const staionDropDownMenu = chartContainerD3.selectAll(
        "#displayDropDownMenu"
      );

      let staionSelectPage = 0; //當前頁數
      let updateStaionDropDownMenu = () => {
        // console.debug(xAxisName);
        let sortingKey = xAxisName;
        let data = newDataObj.newData.sort(
          (a, b) => a[sortingKey] - b[sortingKey]
        );

        //===分頁
        const NumOfEachPage = 10; //一頁顯示筆數
        let totalPages = Math.ceil(data.length / NumOfEachPage) - 1;

        // //頁數超出範圍要修正
        if (staionSelectPage > totalPages) staionSelectPage = totalPages;
        else if (staionSelectPage < 0 && totalPages >= 0) staionSelectPage = 0;

        let startIndex = staionSelectPage * NumOfEachPage;
        let endIndex = startIndex + NumOfEachPage - 1;
        // console.debug(startIndex, endIndex);
        //===分頁
        // console.debug(staionSelectPage + '/' + totalPages);

        let stationsDiv = staionDropDownMenu
          .select(".stations")
          .selectAll("div")
          .data(data)
          .join("div")
          .attr("class", "form-check col-6")
          .style("text-align", "left")
          .call((menu) => {
            // console.debug(div.nodes());
            menu.each(function (d, i) {
              // console.debug(d, i);
              let div = d3.select(this);
              //==分頁顯示
              let display = i >= startIndex && i <= endIndex;
              div.style("display", display ? "inline" : "none");
              // if (!display) return;

              let stationName = d[dataKeys[1]];
              div
                .selectAll("input")
                .data([d])
                .join("input")
                .attr("class", "form-check-input  col-4")
                .attr("type", "checkbox")
                .attr("id", "display_" + stationName)
                .attr("name", "display")
                .attr("value", stationName)
                .property("checked", !unselected_band.includes(stationName));

              div
                .selectAll("label")
                .data([d])
                .join("label")
                .attr("class", "  col-8")
                .attr("for", "display_" + stationName)
                .style("display", "block")
                .style("text-indent", "-5px")
                .text(stationName);
            });
          });

        staionDropDownMenu.select(".pageController").call((div) => {
          div.select(".currentPage").property("value", staionSelectPage + 1);
          div
            .select(".totalPage")
            .text("/ " + (totalPages + 1))
            .attr("value", totalPages + 1);
        });

        //===所有checkbox監聽點擊事件
        stationsDiv.selectAll('input[name ="display"]').on("change", (e) => {
          let check = e.target.checked;
          let check_station = e.target.value;

          if (check)
            unselected_band = unselected_band.filter((d) => d != check_station);
          else unselected_band.push(check_station);

          // console.debug(unselected_band);

          let pathGCollection = pathGroup.selectAll("g").nodes();
          pathGCollection.forEach((pathG) => {
            let path_station = pathG.__data__[dataKeys[1]];
            if (path_station == check_station) {
              let color = !check ? unselected_color : getColor(path_station);
              let opacity = !check ? unselected_opacity : 1;

              let g = d3.select(pathG);
              g.select("path")
                .attr("stroke-opacity", opacity)
                .attr("stroke", color);

              g.select("text")
                .attr("fill", color)
                .attr("fill-opacity", opacity);
            }
          });

          //==更新下面地圖
          let chartData = newDataObj.newData.filter(
            (d) => !unselected_band.includes(d[dataKeys[1]])
          );
          chartContainerJQ
            .find("#stationtable")
            .trigger("updateData", [chartData, colorPalette]);
        });
      };
      //==================

      function getNewData(controlObj = {}) {
        // console.debug(controlObj);
        let normalize = controlObj.hasOwnProperty("normalize")
            ? controlObj.normalize
            : false,
          yAxis_domain = controlObj.hasOwnProperty("yAxis_domain")
            ? controlObj.yAxis_domain
            : null,
          xAxis_domainObj = controlObj.hasOwnProperty("xAxis_domainObj")
            ? controlObj.xAxis_domainObj
            : {},
          network_selectArr = controlObj.hasOwnProperty("network_selectArr")
            ? controlObj.network_selectArr
            : newDataObj.network_selectArr,
          channel_selectGroup = controlObj.hasOwnProperty("channel_selectGroup")
            ? controlObj.channel_selectGroup
            : newDataObj.channel_selectGroup;

        let newData, newTimeArr;
        // console.debug(xAxis_domainObj);

        let newData_normalize = (newData) => {
          // console.debug('***normalize...***');
          newData.forEach((d) => {
            let originData = groupData[d[dataKeys[0]]][
              channel_selectGroup
            ].find((od) => od[dataKeys[1]] == d[dataKeys[1]]);
            let domain = d3.extent(originData.data);
            let normalize = d3.scaleLinear().domain(domain).range([-1, 1]);
            let tmpArr = d.data.map((amp) =>
              !isNaN(amp) ? normalize(amp) : amp
            );
            d.data = tmpArr;
          });
        };
        let getArr_of_channel_select = (channel_selectGroup) => {
          return isNaN(channel_selectGroup)
            ? []
            : [].concat(
                ...network_selectArr.map((net) =>
                  groupData[net][channel_selectGroup].map((d) => ({ ...d }))
                )
              );
        };

        let dataBeenReset = false;
        let get_newData = (xAxis_domainObj) => {
          let newData = getArr_of_channel_select(channel_selectGroup);

          if (Object.keys(xAxis_domainObj).length !== 0) {
            let dist_key = dataKeys[4];
            let az_key = dataKeys[5];

            newData = newData.filter((d) => {
              let inDistRange = true,
                inAzRange = true;

              if (xAxis_domainObj[dist_key]) {
                let min = xAxis_domainObj[dist_key][0];
                let max = xAxis_domainObj[dist_key][1];
                // console.debug(min, max);
                inDistRange = d[dist_key] >= min && d[dist_key] <= max;
                // console.debug(d[dist_key] >= min && d[dist_key] <= max);
              }
              if (xAxis_domainObj[az_key]) {
                let min = xAxis_domainObj[[az_key]][0];
                let max = xAxis_domainObj[[az_key]][1];
                inAzRange = d[az_key] >= min && d[az_key] <= max;
              }

              // console.debug(inDistRange, inAzRange);

              if (inDistRange && inAzRange) return true;
            });
          }
          dataBeenReset = true;
          // console.debug(newData);
          return newData;
        };
        let get_newTimeArr_and_update_newData = (yAxis_domain) => {
          let newTimeArr;

          //3.根據y軸的時間選擇範圍重新選擇newData陣列裡各物件的data數值陣列
          if (yAxis_domain) {
            let i1 = d3.bisectCenter(timeArr, yAxis_domain[0]);
            let i2 = d3.bisectCenter(timeArr, yAxis_domain[1]) + 1; //包含最大範圍
            newData.forEach(
              (d) => (d[dataKeys[3]] = d[dataKeys[3]].slice(i1, i2))
            );
            newTimeArr = timeArr.slice(i1, i2);
          } else {
            if (newDataObj && newDataObj.newTimeArr.length < timeArr.length) {
              // console.debug('2-2 data reset');
              newData.forEach((d) => {
                //===原data裡找sta跟cha都一樣的資料來複製amp陣列
                let originData = groupData[d[dataKeys[0]]][
                  channel_selectGroup
                ].find((od) => od[dataKeys[1]] == d[dataKeys[1]]);
                d[dataKeys[3]] = originData[dataKeys[3]];
              });
              dataBeenReset = true;
            }
            newTimeArr = timeArr;
          }
          return newTimeArr;
        };

        newData = get_newData(xAxis_domainObj);
        newTimeArr = get_newTimeArr_and_update_newData(yAxis_domain);

        //＝＝資料從data重新取得時或者開關normalize時
        if (
          (dataBeenReset && normalize) ||
          (normalize && !newDataObj.normalize)
        )
          newData_normalize(newData);
        // console.debug(newData);
        // console.debug(newTimeArr);
        return {
          newData: newData,
          newTimeArr: newTimeArr,
          normalize: normalize,
          yAxis_domain: yAxis_domain,
          xAxis_domainObj: xAxis_domainObj,
          network_selectArr: network_selectArr,
          channel_selectGroup: channel_selectGroup,
        };
      }
      function updateChart(trans = false) {
        function init() {
          svg
            .append("g")
            .attr("class", "title")
            .append("text")
            .attr("fill", "currentColor")
            // .attr("align", "center")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("font-weight", "bold")
            .attr("font-size", "15")
            .text(title);

          xAxis
            .append("text")
            .attr("class", "axis_name")
            .attr("fill", "black")
            .attr("font-weight", "bold")
            .attr("x", width / 2);
          yAxis
            .append("text")
            .attr("class", "axis_name")
            .attr("fill", "black")
            .attr("font-weight", "bold")
            .attr("font-size", "10")
            .style("text-anchor", "start")
            .attr("alignment-baseline", "text-before-edge")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .call((g) => g.text(getString(data.yAxisName).keyName));

          //===create networkDropDownMenu
          let network_selectArr = newDataObj.network_selectArr;
          chartContainerD3
            .selectAll("#networkDropDownMenu")
            .selectAll("div")
            .data(networkKey)
            .join("div")
            .attr("class", "form-check col-12")
            .style("text-align", "center")
            .call((menu) =>
              menu.each(function (d, i) {
                let div = d3.select(this);

                div
                  .append("input")
                  .attr("class", "form-check-input  col-4")
                  .attr("type", "checkbox")
                  .attr("id", "network_" + d)
                  .attr("name", "network")
                  .attr("value", d)
                  .property("checked", network_selectArr.includes(d));

                div
                  .append("label")
                  .attr("class", "col-8")
                  .attr("for", "network_" + d)
                  .text(d);
              })
            );

          chartContainerD3
            .selectAll("#networkSelectButton")
            .text(
              network_selectArr.length == networkKey.length
                ? "All"
                : network_selectArr.join(" ")
            );

          //====================channel 產生各組選項

          let channel_selectGroup = newDataObj.channel_selectGroup;
          chartContainerD3
            .selectAll("#channelDropDownMenu")
            .selectAll("div")
            .data(channelGroups)
            .join("div")
            .attr("class", "form-check col-4")
            .style("text-align", "center")
            .call((menu) =>
              menu.each(function (d, i) {
                let div = d3.select(this);

                div
                  .append("input")
                  .attr("class", "form-check-input col-3")
                  .attr("type", "checkbox")
                  .attr("id", "channel_group" + i)
                  .attr("name", "channel")
                  .attr("value", i)
                  .property("checked", i == channel_selectGroup);

                div
                  .append("label")
                  .attr("for", "channel_group" + i)
                  .text(d);
              })
            );

          chartContainerD3
            .selectAll("#channelSelectButton")
            .text(channelGroups[channel_selectGroup]);

          //===create StaionDropDownMenu
          updateStaionDropDownMenu();

          // console.debug(groupData);
          let rangeInit = (function () {
            let get_niceDomain = (domain) => {
              return d3.scaleLinear().domain(domain).nice().domain();
            };

            //===dist是所有分量裡最大的
            // dist_domain = get_niceDomain([0,
            //     d3.max([].concat(...networkKey.map(net => [].concat(...groupData[net].map(d => d)))
            //     ), d => d[dataKeys[4]])]);
            dist_domain = get_niceDomain(
              d3.extent(
                [].concat(
                  ...networkKey.map((net) =>
                    [].concat(...groupData[net].map((d) => d))
                  )
                ),
                (d) => d[dataKeys[4]]
              )
            );

            // az_domain = [0, 360];//方位角最大360
            az_domain = get_niceDomain(
              d3.extent(
                [].concat(
                  ...networkKey.map((net) =>
                    [].concat(...groupData[net].map((d) => d))
                  )
                ),
                (d) => d[dataKeys[5]]
              )
            );
            // console.debug(dataKeys);
            // console.debug(newData)
            // console.debug(dist_domain, az_domain)

            distRange_slider = new Slider("#distRange", {
              id: "distRange_slider",
              min: dist_domain[0],
              max: dist_domain[1],
              value: dist_domain,
              tooltip: "hide",
            });
            azRange_slider = new Slider("#azRange", {
              id: "azRange_slider",
              min: az_domain[0],
              max: az_domain[1],
              value: az_domain,
              tooltip: "hide",
            });
            chartContainerD3
              .selectAll("#distRange_min")
              .property("value", dist_domain[0]);
            chartContainerD3
              .selectAll("#distRange_max")
              .property("value", dist_domain[1]);
            chartContainerD3
              .selectAll("#azRange_min")
              .property("value", az_domain[0]);
            chartContainerD3
              .selectAll("#azRange_max")
              .property("value", az_domain[1]);
          })();
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
          const network_selectArr = newDataObj.network_selectArr;
          const channel_selectGroup = newDataObj.channel_selectGroup;

          const xAxisDomain = xAxis_domainObj[xAxisName]
            ? xAxis_domainObj[xAxisName]
            : xAxisName == "az"
            ? az_domain
            : dist_domain;

          const yAxisDomain = d3.extent(newTimeArr, (d) => d);
          margin = getMargin(yAxisDomain); //== 由y軸tick字串長度來決定左邊預留空間

          // let data = isNaN(channel_selectGroup) ? [] : [].concat(...network_selectArr.map(net => groupData[net][channel_selectGroup]));
          let data = isNaN(channel_selectGroup)
            ? []
            : [].concat(
                ...networkKey.map((net) => groupData[net][channel_selectGroup])
              );

          const xScale = { band: "scaleBand", linear: "scaleLinear" }[
            xAxisScale
          ];
          x = d3[xScale]()
            .domain(
              {
                band: newData.map((d) => d[dataKeys[1]]),
                linear: xAxisDomain,
              }[xAxisScale]
            )
            .range([margin.left, width - margin.right]);
          if (
            xScale == "scaleLinear" &&
            Object.keys(xAxis_domainObj).length === 0 &&
            xAxisName != "az"
          )
            //方位角最大360
            x.nice();

          y = d3
            .scaleLinear()
            .domain(yAxisDomain)
            // .nice()
            .range([height - margin.bottom, margin.top]);
          // console.debug(x.domain())
          let refreshText = () => {
            xAxis
              .select(".axis_name")
              .attr("y", margin.bottom - 20)
              .text(
                { band: getString(dataKeys[1]), linear: getString(xAxisName) }[
                  xAxisScale
                ].keyName
              );

            yAxis
              .select(".axis_name")
              .attr("y", -margin.left + 8)
              .attr("opacity", function (d, i) {
                let tickLength = d3
                  .select(this.parentNode)
                  .select(".tick>text")
                  .text().length;
                return tickLength > 3 ? 0.3 : 1;
              });

            //==title
            svg
              .select(".title text")
              .attr("x", width / 2)
              .attr("y", margin.top / 2);
          };
          let updateAxis = () => {
            let makeXAxis = (g) =>
              g
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(
                  d3
                    .axisBottom(x)
                    .ticks(width / 80)
                    .tickSizeOuter(0)
                )
                .call((g) => {
                  if (xAxisScale == "band")
                    g.selectAll("g.xAxis g.tick text")
                      .attr("x", 9)
                      .attr("y", 0)
                      .attr("dy", ".35em")
                      .attr("text-anchor", "start")
                      .attr("transform", "rotate(90)");
                });

            let makeYAxis = (g) =>
              g
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y).ticks(height / 30))
                .call((g) => g.select(".domain").attr("display", "none"))
                .call((g) =>
                  g
                    .selectAll("g.yAxis g.tick line")
                    .attr("x2", (d) => width - margin.left - margin.right)
                    .attr("stroke-opacity", 0.2)
                );

            xAxis.call(makeXAxis);
            yAxis.call(makeYAxis);
          };
          let updatePaths = () => {
            // let transitionDuration = 500;
            let dataDomain = {
              true: [-1, 1],
              false: d3.extent(
                [].concat(...data.map((d) => d3.extent(d.data)))
              ),
            }[normalize].reverse(); //改成左邊y值爲正
            let dataDomainMean = (dataDomain[1] + dataDomain[0]) * 0.5; //linear時將第一點移至正中間
            let xAxisLength = x.range()[1] - x.range()[0];

            const eachDataGap = xAxisLength / data.length;

            let normalizeScale = 1;
            if (normalize) {
              let textBoxValue = chartContainerD3
                .selectAll("#normalizeScale")
                .node().value;
              normalizeScale = textBoxValue == "" ? 1 : textBoxValue;
            }
            let dataRange = {
              true: [
                -0.5 * eachDataGap * normalizeScale,
                0.5 * eachDataGap * normalizeScale,
              ],
              false: [-0.5 * eachDataGap, 0.5 * eachDataGap],
            }[normalize];

            path_x = d3.scaleLinear().domain(dataDomain).range(dataRange);

            let line = (data, gapPath = false) => {
              let pathAttr;

              let segmentLine = d3
                .line()
                .defined((d) => !isNaN(d))
                .x((d) => path_x(d))
                .y((d, i) => y(newTimeArr[i]));

              if (gapPath) {
                let livingTimeIndex = [];
                let filteredData = data.filter((d, i) => {
                  if (segmentLine.defined()(d)) {
                    livingTimeIndex.push(i);
                    return d;
                  }
                });
                let gapLine = d3
                  .line()
                  .x((d, i) => path_x(d))
                  .y((d, i) => y(newTimeArr[livingTimeIndex[i]]));

                // console.debug(livingTimeIndex);
                // console.debug(filteredData);
                pathAttr = gapLine(filteredData);
              } else pathAttr = segmentLine(data);

              return pathAttr;
            };

            let makePaths = (pathGroup) =>
              pathGroup
                .selectAll("g")
                .data(newData)
                .join("g")
                .call(() =>
                  pathGroup.selectAll("g").each(function (d, i) {
                    // console.debug(this, d, i);
                    // console.debug(d[dataKeys[1]]);
                    let isUnselected = unselected_band.includes(d[dataKeys[1]]);

                    let g = d3.select(this);
                    let color = isUnselected
                      ? unselected_color
                      : getColor(d[dataKeys[1]]);
                    let opacity = isUnselected ? unselected_opacity : 1;

                    //波形移到x軸位置(1.dist/az 2.波形第一點離中心點偏移位置修正)
                    let getTransX = () => {
                      // console.debug('getTransX');
                      let getDataFirstPointIndex = () => {
                        let firstPointIndex = 0;
                        // console.debug(i, firstPointIndex);
                        while (isNaN(d.data[firstPointIndex])) {
                          firstPointIndex++;
                          if (firstPointIndex >= d.data.length) break;
                        }
                        // console.debug(i, firstPointIndex);
                        return firstPointIndex;
                      };

                      //===1.
                      let translate_x = {
                        // band: (i + 0.5) * eachDataGap + margin.left,
                        band:
                          (i + 0.5) * (xAxisLength / newData.length) +
                          margin.left,
                        linear: x(newData[i][xAxisName]),
                      }[xAxisScale];

                      //===2.
                      let shiftMean =
                        path_x(dataDomainMean) -
                        path_x(d.data[getDataFirstPointIndex()]);
                      // console.debug(i, shiftMean);

                      return translate_x + shiftMean;
                    };

                    g.attr("transform", `translate(${getTransX()},${0})`);

                    g.selectAll("path")
                      .data([d])
                      .join("path")
                      .style("mix-blend-mode", "normal")
                      .attr("fill", "none")
                      .attr("stroke-width", 2)
                      .attr("stroke-linejoin", "round")
                      .attr("stroke-linecap", "round")
                      .attr("stroke-opacity", opacity)
                      .attr("stroke", color)
                      .attr("d", line(d.data));
                    // .attr("transform", `translate(${translate_x},0)`);
                    // .attr("stroke-linecap", 'round')

                    g.selectAll("text")
                      .data([d])
                      .join("text")
                      .attr("text-anchor", "start")
                      // .attr('alignment-baseline', 'after-edge')
                      .attr("alignment-baseline", "before-edge")
                      .attr("fill", color)
                      .attr("fill-opacity", opacity)
                      .attr("font-size", "10")
                      .attr(
                        "transform",
                        `translate(${path_x(d.data[d.data.length - 1])},${
                          margin.top
                        }) rotate(90)`
                      )
                      .text(
                        {
                          band:
                            parseFloat(newData[i][xAxisName].toFixed(2)) +
                            (xAxisName == "az" ? "" : " ") +
                            getString(xAxisName).keyUnit,
                          linear: newData[i][dataKeys[1]],
                        }[xAxisScale]
                      );
                  })
                );

            pathGroup.call(makePaths);
          };
          updateAxis();
          updatePaths();
          refreshText();

          //==更新下面地圖
          let chartData = newDataObj.newData.filter(
            (d) => !unselected_band.includes(d[dataKeys[1]])
          );
          chartContainerJQ
            .find("#stationtable")
            .trigger("updateData", [chartData, colorPalette]);
        }

        if (!newDataObj) {
          //===預設選項
          newDataObj = getNewData({
            normalize: true,
            yAxis_domain: null,
            xAxis_domainObj: {},
            network_selectArr: [networkKey[0]],
            channel_selectGroup: 0,
          });
          init();
        }

        render();
        loadingEffect("hide");
      }

      updateChart();

      function events() {
        let yAxis_domain = null,
          normalize = chartContainerD3
            .selectAll("#normalize")
            .property("checked"),
          normalizeScale = chartContainerD3
            .selectAll("#normalizeScale")
            .property("value"),
          xAxis_domainObj = {};

        //===分開updateObj讓圖表更新不受到mousemove...事件影響
        let chartUpdateObj = {
          updateFlag: true,
          updateTimeOut: null,
          updateDelay: 10,
        };
        let updateHandler = (
          action,
          updateObj = chartUpdateObj,
          parameter = null,
          mustDone = false
        ) => {
          // console.debug(parameter)
          // console.debug(chartUpdateObj.updateFlag);

          if (!updateObj.updateFlag) updateObj.updateTimeOut.stop();

          updateObj.updateTimeOut = d3.timeout(() => {
            parameter ? action(...parameter) : action();
            updateObj.updateFlag = true;
          }, updateObj.updateDelay);

          updateObj.updateFlag = mustDone;
        };

        //===event eles
        const eventRect = svg.append("g").attr("class", "eventRect");
        const defs = svg.append("defs");
        //====================================tooltip==================================================
        const tooltip = chartContainerD3
          .selectAll("#charts")
          .append("div")
          .attr("id", "tooltip");

        //== tooltip init 分區好控制css
        tooltip.call((div) => {
          div
            .append("div")
            .attr("class", "timeArea")
            .html("Time : <font size='5'></font> s<br />");

          div
            .append("div")
            .attr(
              "class",
              "stationArea d-flex flex-row justify-content-around"
            );

          //===page hint col-lg-3 col-md-4 col-sm-6 d-flex flex-row align-items-start
          div
            .append("div")
            .attr("class", "pageArea")
            .style("color", "black")
            .style("min-width", "150px")
            .call((div) => {
              let textAlign = ["text-left", "text-center", "text-right"];
              let text = ["↼ 🄰", "", "🄳 ⇀"];

              div
                .append("div")
                .attr("class", "d-flex flex-nowrap")
                .append("text")
                .style("font-size", "18px")
                .attr("class", "col-12 text-center")
                .text("Page");

              div
                .append("div")
                .attr("class", "d-flex flex-nowrap")
                // .style('display', 'inline-block')
                .selectAll("text")
                .data(d3.range(3))
                .join("text")
                .style("white-space", "nowrap")
                .style("font-size", "18px")
                .style("padding", "0 0px")
                .attr("class", (d) => "col-4 align-bottom " + textAlign[d])
                // .style("text-anchor", "middle")
                .text((d) => text[d]);
            });
        });

        //===tooltip分頁控制
        const NumOfEachPage = 4; //一頁顯示筆數
        let totalPages,
          currentPage = 0; //當前頁數
        let startIndex, endIndex, pageData; //當前頁的i1,i2和資料(用來畫mousemove的圈圈)
        let mouseOnIdx = 0; //資料陣列的索引(滑鼠移動控制)

        //用來判斷tooltip應該在滑鼠哪邊
        const chart_center = [
          x.range().reduce((a, b) => a + b) * 0.5,
          y.range().reduce((a, b) => a + b) * 0.5,
        ];
        const tooltipMouseGap = 50; //tooltip與滑鼠距離

        let tooltipUpdateObj = {
          updateFlag: true,
          updateTimeOut: null,
          updateDelay: 10,
        };
        //===更新tooltip和圓圈
        let updateTooltip = () => {
          let newTimeArr = newDataObj.newTimeArr;
          let newData = newDataObj.newData;
          let network_selectArr = newDataObj.network_selectArr;
          let channel_selectGroup = newDataObj.channel_selectGroup;

          //==沒選中的挑掉不顯示資料
          let selectedData = newData.filter(
            (d) => !unselected_band.includes(d[dataKeys[1]])
          );
          // console.debug(selectedData);
          // console.debug(newData);
          let floatShorter = (val, digit) => parseFloat(val.toFixed(digit)); //小數後幾位四捨五入

          let getCurrentPageData = (function () {
            totalPages = Math.ceil(selectedData.length / NumOfEachPage) - 1;
            // console.debug(currentPage + '/' + totalPages)
            // //頁數超出範圍要修正
            if (currentPage < 0 && currentPage != totalPages) currentPage = 0;
            else if (currentPage > totalPages) currentPage = totalPages;

            startIndex = currentPage * NumOfEachPage;
            endIndex = startIndex + NumOfEachPage;
            pageData = selectedData.slice(startIndex, endIndex);
          })();

          let timming = newTimeArr[mouseOnIdx];

          tooltip.call((tooltip) => {
            tooltip.select(".timeArea>font").text(timming.toFixed(3));

            tooltip
              .select(".pageArea text:nth-child(2)")
              .text(currentPage + 1 + " / " + (totalPages + 1));

            // console.debug(pageData);
            tooltip
              .select(".stationArea")
              .selectAll("div")
              .data(pageData)
              .join("div")
              .style("margin-left", (d, i) => (i == 0 ? "0px" : "5px"))
              .style("padding", "10px")
              .style("color", "white")
              .style("background-color", (d, i) => getColor(d[dataKeys[1]])) //getColor(sortedIndex[i])
              .style("font-size", 10)
              .html((d, i) => {
                let sta = d[dataKeys[1]];
                let dist = floatShorter(d[dataKeys[4]], 2);
                let az = floatShorter(d[dataKeys[5]], 2);
                // let ampN = floatShorter(d.data[mouseOnIdx], 5);

                //====振幅改顯示原值(要從原data裡找資料,由時間點找到原資料的索引值)
                let cha = d[dataKeys[2]];
                let originData = groupData[d[dataKeys[0]]][
                  channel_selectGroup
                ].find((od) => od[dataKeys[1]] == d[dataKeys[1]]);
                // console.debug(originData);
                let indexOf_originData = d3.bisectCenter(timeArr, timming);
                let amp = floatShorter(originData.data[indexOf_originData], 1);

                let html = `<text style="font-size:23px;">${sta}</text><br>
                                    <text style='font-size:13px;white-space:nowrap;'>${dist} km / ${az}°</text><br>
                                    <text style='font-size:25px;'> ${
                                      isNaN(amp) ? "no data" : amp
                                    }</text>`;

                return html;
              });
          });

          //===更新圓圈

          const lineStroke = "2px";
          const lineStroke2 = "0.5px";

          //==用來取得dist/az和第一點偏差的位移值,挑掉未選的
          let pathGCollection = pathGroup
            .selectAll("g")
            .nodes()
            .filter((g) => !unselected_band.includes(g.__data__[dataKeys[1]]));
          // console.debug(pathGCollection)

          eventRect
            .select(".mouse-over-effects")
            .selectAll(".mouse-per-line")
            .data(pageData)
            .join("g")
            .attr("transform", (d) => {
              //( let indexOf_newData = startIndex + i;)不能用index判斷了

              //==select mode造成pathGCollection順序沒規則,所以比對站名資料
              //===如果不只一個比對cha
              let pathG = pathGCollection.filter(
                (g) => d[dataKeys[1]] == g.__data__[dataKeys[1]]
              );
              pathG =
                pathG.length > 1
                  ? pathG.filter(
                      (g) => d[dataKeys[2]] == g.__data__[dataKeys[2]]
                    )
                  : pathG[0];
              // console.debug(pathG)
              //==取得該條path_g的transform x
              let transX = pathG.transform.baseVal[0].matrix.e;
              let transY = y(newTimeArr[mouseOnIdx]);
              return `translate(${transX},${transY})`;
            })
            .attr("class", "mouse-per-line")
            .call((gCollection) => {
              gCollection.each(function (d, i) {
                // console.debug(this);

                const circleAmount = 3;
                let g = d3.select(this);
                let station = d[dataKeys[1]];

                let circleTransX = path_x(d.data[mouseOnIdx]);
                // console.debug(d.data[mouseOnIdx]);
                // console.debug(path_x.domain(), path_x.range());
                g.selectAll("circle")
                  .data(d3.range(circleAmount))
                  .join("circle")
                  .attr("transform", `translate(${circleTransX},0)`)
                  .call((circlesCollection) =>
                    circlesCollection.each(function (d) {
                      let circle = d3.select(this);
                      let mainCircle = d % 2 != 0;

                      circle
                        .attr("r", d + 3)
                        .style(
                          "stroke",
                          mainCircle ? getColor(station) : "white"
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
        };

        //===select Mode controll
        let dragBehavior, mouseMoveBehavior;

        function pathEvent() {
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

          //====================================mouse move==================================================
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

            mouseMoveBehavior = (use) =>
              use
                .on("mouseleave", (e) => {
                  // on mouse out hide line, circles and text
                  // console.log('mouseleave');
                  // console.debug(e);
                  let action = () => {
                    mouseG.style("display", "none");
                    tooltip.style("display", "none");
                  };
                  updateHandler(action, tooltipUpdateObj, null, !e.isTrusted);
                })
                .on("mousemove", function (e) {
                  // update tooltip content, line, circles and text when mouse moves
                  // console.debug(e.target);
                  // console.debug(e);
                  let action = () => {
                    e.preventDefault();

                    let newTimeArr = newDataObj.newTimeArr;
                    const pointer = d3.pointer(e, this);
                    const ym = y.invert(pointer[1]);
                    mouseOnIdx = d3.bisectCenter(newTimeArr, ym);

                    mouseLine.attr("d", () => {
                      // let yPos = y(newTimeArr[mouseOnIdx]);
                      let yPos = pointer[1];
                      let p1 = x.range()[1] + "," + yPos;
                      let p2 = x.range()[0] + "," + yPos;
                      let d = "M" + p1 + " L" + p2;
                      return d;
                    });

                    let mouseX = e.offsetX,
                      mouseY = e.offsetY;
                    let fullWidth = svg.property("clientWidth");

                    tooltip.style("display", "inline").call((tooltip) => {
                      //tooltip換邊
                      let left, right, top;

                      if (pointer[0] < chart_center[0]) {
                        //滑鼠未過半,tooltip在右
                        left = mouseX + tooltipMouseGap + "px";
                        right = null;
                      } else {
                        //tooltip在左
                        left = null;
                        right = fullWidth - mouseX + tooltipMouseGap + "px";
                      }

                      if (pointer[1] < chart_center[1])
                        //tooltip在下
                        top = mouseY + tooltipMouseGap + "px";
                      //tooltip在上
                      else
                        top =
                          mouseY -
                          tooltip.property("clientHeight") -
                          tooltipMouseGap +
                          "px";

                      tooltip
                        .style("top", top)
                        .style("left", left)
                        .style("right", right);
                    });

                    updateTooltip();
                    mouseG.style("display", "inline");
                  };

                  updateHandler(action, tooltipUpdateObj);
                });
            eventRect.call(mouseMoveBehavior);
          }
          // //====================================zoom==================================================
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
            dragBehavior = d3
              .drag()
              .on("start", (e) => {
                // console.log("dragStart");
                const p = d3.pointer(e, eventRect.node());
                selectionRect.init(margin.left, p[1]);
                // const xm = x.invert(p[0]);
                // console.debug(p);
                selectionRect.removePrevious();
                d3.select(window).dispatch("click"); //關閉dropdown
                eventRect.dispatch("mouseleave"); //tooltip取消
              })
              .on("drag", (e) => {
                // console.log("dragMove");
                let action = () => {
                  const p = d3.pointer(e, eventRect.node());
                  // console.debug(p);
                  if (p[1] < margin.top) p[1] = margin.top;
                  else if (p[1] > height - margin.bottom)
                    p[1] = height - margin.bottom;
                  // console.debug(p);
                  // const xm = x.invert(p[0]);
                  selectionRect.update(width - margin.right, p[1]);
                  // console.debug(selectionRect.getNewAttributes());
                };
                updateHandler(action, tooltipUpdateObj);
              })
              .on("end", (e) => {
                loadingEffect("show");
                // console.log("dragEnd");
                // console.debug('end');

                const finalAttributes = selectionRect.getCurrentAttributes();
                // console.debug(finalAttributes);

                if (finalAttributes.y2 - finalAttributes.y1 > 1) {
                  // console.log("range selected");
                  // range selected
                  // e.preventDefault();
                  yAxis_domain = [
                    y.invert(finalAttributes.y2),
                    y.invert(finalAttributes.y1),
                  ];
                  // console.debug(yAxis_domain);
                } else {
                  //-------- reset zoom
                  // console.log("single point");
                  yAxis_domain = null;
                }

                newDataObj = getNewData({
                  normalize: normalize,
                  xAxis_domainObj: xAxis_domainObj,
                  yAxis_domain: yAxis_domain,
                });
                updateChart();
                selectionRect.remove();

                //==drag end時處理draging行爲的timeout還沒到,而selectionRect被刪除了
                //導至計時器回播函式執行selectionRect.update()出錯,所以要停止計時器
                tooltipUpdateObj.updateTimeOut.stop();
              });
            eventRect.call(dragBehavior);
          }
          mouseMove();
          mouseDrag();
        }
        function chartOptionEvent() {
          //===製造path的陰影
          defs
            .append("filter")
            .attr("id", "pathShadow")
            .attr("x", "0")
            .attr("y", "0")
            .call((filter) => {
              filter
                .append("feOffset")
                .attr("result", "offOut")
                .attr("in", "SourceAlpha")
                .attr("dx", "0")
                .attr("dy", "0");

              filter
                .append("feGaussianBlur")
                .attr("result", "blurOut")
                .attr("in", "offOut")
                .attr("stdDeviation", "2");

              filter
                .append("feBlend")
                .attr("in", "SourceGraphic")
                .attr("in2", "blurOut")
                .attr("mode", "normal");
            });

          //=====select network
          let network = chartContainerD3.selectAll('input[name ="network"]');
          let networkText = chartContainerD3.selectAll("#networkSelectButton");
          network.on("click", function (e) {
            loadingEffect("show");

            let network_selectArr = [];

            // 多選,所有選中network放入陣列中
            network
              .nodes()
              .forEach((chkbox) =>
                chkbox.checked ? network_selectArr.push(chkbox.value) : false
              );

            // ===改變按鈕text
            let text =
              network_selectArr.length == networkKey.length
                ? "All"
                : network_selectArr == 0
                ? "select"
                : network_selectArr.join(" ");
            networkText.text(text);

            // console.debug(network_selectArr);
            newDataObj = getNewData({
              normalize: normalize,
              xAxis_domainObj: xAxis_domainObj,
              network_selectArr: network_selectArr,
            });
            colorPalette = {};
            updateChart();
            updateStaionDropDownMenu();
          });

          //=====select station
          let displayText = chartContainerD3.selectAll("#displaySelectButton");
          staionDropDownMenu.select(".controller").call((controllerDiv) => {
            //==A-1.select mode
            controllerDiv.select("#staionSelectMode").on("change", (e) => {
              let check = e.target.checked;
              // console.debug(check);
              let mousemoveEventOff = (g) => {
                g.on("mousemove", null);
                g.dispatch("mouseleave") //恢復上個模式mousemove造成的改變
                  .on("mouseleave", null);

                //==dispatch('mouseleave')的timeout可能被下個模式的mousemove取消
                //造成上個模式的東西留在畫面上(tooltip.圓圈.mouseline.path陰影淡出等)
                //所以 updateFlag = true保證dispatch('mouseleave')的timeout不取消
                // updateFlag = true; 改成傳參數給updateHandler()控制
              };
              let buttonText;
              //勾選時取消mousedrag和mouseMove
              if (check) {
                buttonText = "select mode on";

                eventRect.on("mousedown.drag", null).call(mousemoveEventOff);

                //selcet mode事件
                pathGroup.raise();
                pathGroup
                  .on("mousemove", (e) => {
                    updateHandler(hover, tooltipUpdateObj, [e.target]);
                  })
                  .on("mouseleave", (e) => {
                    // console.debug(e);
                    updateHandler(leave, tooltipUpdateObj, null, !e.isTrusted);
                  })
                  .on("click", (e) => {
                    let action = () => {
                      let thisG = e.target.parentNode;
                      let thisStation = thisG.__data__[dataKeys[1]];

                      let show;
                      //===不在未選名單中則隱藏波形並列入名單
                      if (!unselected_band.includes(thisStation)) {
                        show = false;
                        unselected_band.push(thisStation);
                        leave();
                      } else {
                        show = true;
                        unselected_band = unselected_band.filter(
                          (d) => d != thisStation
                        );
                        hover(e.target);
                      }

                      d3.select(thisG).call((thisG) => {
                        let color = !show
                          ? unselected_color
                          : getColor(thisStation);
                        let opacity = !show ? unselected_opacity : 1;

                        thisG
                          .select("path")
                          .attr("stroke-opacity", opacity)
                          .attr("stroke", color);

                        thisG
                          .select("text")
                          .attr("fill", color)
                          .attr("fill-opacity", opacity);
                      });

                      //===同步ckb
                      let stationCheckbox = staionDropDownMenu.selectAll(
                        `input[value =${thisStation}]`
                      );
                      stationCheckbox.property("checked", show);

                      //==更新下面地圖
                      let chartData = newDataObj.newData.filter(
                        (d) => !unselected_band.includes(d[dataKeys[1]])
                      );
                      chartContainerJQ
                        .find("#stationtable")
                        .trigger("updateData", [chartData, colorPalette]);
                    };
                    updateHandler(action);
                  });

                let hover = (target) => {
                  let thisG = target.parentNode;
                  let thisStation = thisG.__data__[dataKeys[1]];
                  if (unselected_band.includes(thisStation)) return; //未選的不用處理

                  //==改變其他path透明度
                  pathGroup
                    .selectAll("g")
                    //==未選的濾掉
                    .filter((d) => !unselected_band.includes(d[dataKeys[1]]))
                    .call((g) =>
                      g.each(function (d, i) {
                        let g = d3.select(this);
                        let station = d[dataKeys[1]];
                        let hover = station == thisStation;
                        let opacity = hover ? 1 : 0.5;

                        g.select("path").attr("stroke-opacity", opacity);
                        g.select("text").attr("fill-opacity", opacity);

                        //===加陰影和上移圖層
                        if (hover) g.attr("filter", "url(#pathShadow)").raise();
                      })
                    );
                };

                let leave = () => {
                  //==恢復所有除了未選中path透明度
                  pathGroup
                    .selectAll("g")

                    .attr("filter", null) //所有包含隱藏的path陰影都取消
                    //==未選的濾掉不條透明度
                    .filter((d) => !unselected_band.includes(d[dataKeys[1]]))
                    .call((g) => {
                      g.select("path").attr("stroke-opacity", 1);
                      g.select("text").attr("fill-opacity", 1);
                    });
                };
              } else {
                buttonText = "select";

                pathGroup.on("click", null).call(mousemoveEventOff);

                eventRect.raise();
                eventRect.call(dragBehavior).call(mouseMoveBehavior);
              }

              //===改變按鈕text
              displayText.text(buttonText);
            });

            //==A-2.reset
            controllerDiv.select("#staionReset").on("click", (e) => {
              let stationCheckboxs = staionDropDownMenu.selectAll(
                'input[name ="display"]'
              );
              stationCheckboxs.property("checked", true);
              stationCheckboxs.dispatch("change");
              unselected_band = []; //==沒在圖表上的站也要reset
            });
          });

          //==B.分頁控制
          staionDropDownMenu
            .select(".pageController")
            .call((pageController) => {
              // console.debug(pageController)
              let pageInput = pageController
                .select(".currentPage")
                .on("input", (e) => {
                  let inputVal = e.target.value;
                  let totalPage = pageController
                    .select(".totalPage")
                    .attr("value");
                  // console.debug(inputVal)
                  //======textBox空值或超過限制範圍處理
                  if (inputVal < 1 || isNaN(inputVal) || inputVal == "")
                    e.target.value = 1;
                  else if (inputVal > parseInt(totalPage))
                    e.target.value = totalPage;

                  staionSelectPage = e.target.value - 1;
                  updateStaionDropDownMenu();
                });

              pageController.select(".prePage").on("click", (e) => {
                let inputVal = parseInt(pageInput.property("value"));
                // console.debug(inputVal)
                pageInput.property("value", inputVal - 1);
                pageInput.dispatch("input");
              });

              pageController.select(".nextPage").on("click", (e) => {
                let inputVal = parseInt(pageInput.property("value"));
                // console.debug(inputVal)
                pageInput.property("value", inputVal + 1);
                pageInput.dispatch("input");
              });
            });

          //=====change channel
          let channel = chartContainerD3.selectAll('input[name ="channel"]');
          let channelText = chartContainerD3.selectAll("#channelSelectButton");
          channel.on("click", function (e) {
            loadingEffect("show");

            let value = e.target.value;
            let checked = e.target.checked;
            //＝＝＝單選,其他勾拿掉
            channel
              .nodes()
              .filter((chkbox) => chkbox !== e.target)
              .forEach((chkbox) => (chkbox.checked = false));

            let text = checked ? channelGroups[value] : "select";

            //===改變按鈕text
            channelText.text(text);

            newDataObj = getNewData({
              normalize: normalize,
              xAxis_domainObj: xAxis_domainObj,
              channel_selectGroup: checked ? value : undefined,
            });
            updateChart();
            updateStaionDropDownMenu();
          });
          //=====change sortBy dist/az

          // console.debug(chartContainerD3.selectAll('input[name ="xAxisName"]'))
          chartContainerD3
            .selectAll('input[name ="xAxisName"]')
            .on("click", (e) => {
              loadingEffect("show");
              xAxisName = e.target.value;
              updateChart();
              updateStaionDropDownMenu();
            });
          chartContainerD3
            .selectAll('input[name ="xAxisScale"]')
            .on("click", (e) => {
              loadingEffect("show");
              xAxisScale = e.target.value;
              updateChart();
            });

          //====change xAxisRange
          chartContainerD3
            .selectAll("#xAxisName_radioGroup")
            .call((xAxisName_radioGroup) => {
              const rangeObj = { dist: dist_domain, az: az_domain };

              // console.debug(dist_domain, az_domain);
              // range drag
              xAxisName_radioGroup
                .selectAll('input[name ="xAxisRange"]')
                .on("input", (e) => {
                  if (chartUpdateObj.updateFlag) loadingEffect("show");
                  // console.debug(e.target);
                  //==========================target vaule check=================================
                  let eleID = e.target.id.split("_");
                  let name = eleID[0];
                  let rangeIndex = eleID[1] == "min" ? 0 : 1;
                  let key = name.substring(0, name.indexOf("Range"));
                  let rangeData = rangeObj[key];
                  let rangeMin = rangeData[0];
                  let rangeMax = rangeData[1];

                  //======textBox空值或超過限制範圍處理
                  if (isNaN(e.target.value) || e.target.value == "")
                    e.target.value = xAxis_domainObj[key]
                      ? xAxis_domainObj[key][rangeIndex]
                      : [rangeMin, rangeMax][rangeIndex];
                  // else if ([e.target.value < rangeMin, e.target.value > rangeMax][rangeIndex])
                  else if (
                    e.target.value < rangeMin ||
                    e.target.value > rangeMax
                  )
                    e.target.value = [rangeMin, rangeMax][rangeIndex];

                  //======textBox最小最大輸入相反處理===================================
                  let parentNode = e.target.parentNode;
                  let minRange = parentNode.querySelector(
                    "#" + name + "_min"
                  ).value;
                  let maxRange = parentNode.querySelector(
                    "#" + name + "_max"
                  ).value;
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
                    case "distRange":
                      distRange_slider.setValue(domain);
                      break;
                    case "azRange":
                      azRange_slider.setValue(domain);
                      break;
                  }

                  let inRangeMin = minRange == rangeMin;
                  let inRangeMax = maxRange == rangeMax;

                  // if (inRangeMin && inRangeMax)
                  //     delete xAxis_domainObj[key];
                  // else
                  xAxis_domainObj[key] = domain;

                  //==========================更新按鈕文字=================================
                  let sub = xAxisName_radioGroup.select(`sub[class =${key}]`);
                  //在最大範圍時不顯示文字
                  let text =
                    inRangeMin && inRangeMax
                      ? ""
                      : `( ${minRange} - ${maxRange} )`;
                  sub.text(text);

                  //避免更新太頻繁LAG
                  let action = () => {
                    newDataObj = getNewData({
                      normalize: normalize,
                      yAxis_domain: yAxis_domain,
                      xAxis_domainObj: xAxis_domainObj,
                    });
                    updateChart();
                    updateStaionDropDownMenu();
                  };
                  updateHandler(action);
                });
              // reset button
              xAxisName_radioGroup
                .selectAll('button[name ="rangeReset"]')
                .on("click", (e) => {
                  // console.debug(e.target.parentNode);
                  // distRange_slider.setValue([10, 100]);
                  let key = e.target.value;
                  let rangeData = rangeObj[key];
                  let parentNode = e.target.parentNode;

                  parentNode.querySelector("#" + key + "Range_min").value =
                    rangeData[0];
                  parentNode.querySelector("#" + key + "Range_max").value =
                    rangeData[1];
                  chartContainerD3
                    .selectAll("#" + key + "Range_min")
                    .dispatch("input");
                });
            });

          //=====change normalize
          chartContainerD3.selectAll("#normalize").on("change", (e) => {
            loadingEffect("show");
            // console.debug(e.target.checked);
            normalize = e.target.checked;
            newDataObj = getNewData({
              normalize: normalize,
              yAxis_domain: yAxis_domain,
              xAxis_domainObj: xAxis_domainObj,
            });
            // console.debug(xAxis_domainObj);

            updateChart();
          });
          chartContainerD3.selectAll("#normalizeScale").on("input", (e) => {
            // console.debug(e.target);
            if (!isNaN(e.target.value)) {
              loadingEffect("show");
              let action = () => {
                normalizeScale = e.target.value;
                updateChart();
              };
              updateHandler(action);
            } else e.target.value = normalizeScale;
          });
        }
        function keyboardEvent() {
          let hotkeyPressFlag = true; //avoid from trigger event too often

          let staionMenu = chartContainerD3.selectAll("#displayMenu"); //for check display

          d3.select(window).on("keydown", (e) => {
            if (!hotkeyPressFlag) return;
            // console.debug(e.code)

            //==翻頁快捷鍵
            if (e.code == "KeyA" || e.code == "KeyD") {
              let tooltipIsShow = tooltip.style("display") == "inline";
              let staionMenuIsShow = staionMenu.classed("show");
              // console.debug(staionMenuIsShow)

              let updatePage;
              if (tooltipIsShow) {
                updatePage = (nextPage) => {
                  //頁數超出範圍要修正,否則刷新tooltip
                  currentPage = nextPage ? currentPage + 1 : currentPage - 1;
                  if (currentPage < 0) currentPage = 0;
                  else if (currentPage > totalPages) currentPage = totalPages;
                  else updateTooltip();
                };
              } else if (staionMenuIsShow) {
                let pageController =
                  staionDropDownMenu.select(".pageController");
                updatePage = (nextPage) => {
                  let button = nextPage ? ".nextPage" : ".prePage";
                  pageController.select(button).dispatch("click");
                };
              } else return; //都沒顯示不作分頁控制

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
              let selectMode_ckb =
                chartContainerD3.selectAll("#staionSelectMode");
              let selectMode_checked = selectMode_ckb.property("checked");
              selectMode_ckb.property("checked", !selectMode_checked);
              selectMode_ckb.dispatch("change");
            }

            hotkeyPressFlag = false;
            d3.timeout(() => (hotkeyPressFlag = true), 10);
          });
        }

        chartOptionEvent();
        pathEvent();
        keyboardEvent();
      }
      svg.call(events);

      return svg.node();
    }
    function stationInfo() {
      const highlightPath = (station, focus = true) => {
        //==除了選中都隱藏
        let paths = chartContainerJQ.find("#chart1 svg>.paths").children();

        focus
          ? paths
              .filter(function () {
                let g = $(this);
                return g[0].__data__.station !== station;
              })
              .css("opacity", 0.2)
          : paths.css("opacity", "");
      };
      let initMap = () => {
        const getIconSrc = (type = 1, width, color = "black") => {
          let svg;

          if (type)
            //測站三角  倒三角在transform加：rotate(180 640.036 564.147)
            svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" viewBox="0 0 1280 1128" preserveAspectRatio="xMidYMid meet" version="1.0"> <metadata>Created by potrace 1.15, written by Peter Selinger 2001-2017</metadata> <g> <title>Layer 1</title> <g fill="#000000" transform="translate(0 1128) scale(0.1 -0.1)"> <path d="m6303,11266c-76,-18 -188,-75 -247,-127c-24,-21 -64,-69 -89,-106c-25,-38 -558,-957 -1185,-2043c-627,-1086 -1946,-3372 -2932,-5080c-1166,-2019 -1802,-3129 -1818,-3175c-103,-293 59,-608 368,-712c53,-17 251,-18 5978,-21c5276,-2 5931,0 5989,13c152,35 295,145 366,281c91,175 89,350 -7,529c-38,72 -450,793 -3096,5415c-433,756 -1225,2140 -1760,3075c-535,935 -990,1723 -1012,1752c-64,84 -169,155 -277,189c-69,22 -205,26 -278,10zm261,-196c118,-45 127,-57 534,-770c355,-620 1584,-2769 3202,-5595c422,-737 1108,-1936 1525,-2665c470,-821 766,-1348 778,-1385c53,-169 -39,-362 -211,-443l-57,-27l-5885,-3c-3750,-1 -5908,1 -5948,7c-86,13 -147,45 -213,111c-75,74 -102,144 -103,260c0,66 4,95 21,132c12,26 974,1698 2139,3715c1165,2017 2487,4309 2940,5093c552,957 837,1442 868,1477c48,53 128,100 195,114c55,12 151,2 215,-21z"/> <path fill="${color}" opacity="0.9" d="m6368,10911c-59,-19 -98,-54 -142,-124c-86,-140 -5839,-10113 -5854,-10147c-9,-22 -13,-55 -10,-91c5,-73 40,-128 105,-166l48,-28l5865,-3c4394,-2 5876,0 5907,9c96,26 160,119 151,222c-5,59 238,-370 -2573,4542c-532,930 -1476,2579 -2097,3665c-621,1086 -1145,1998 -1164,2026c-19,28 -52,60 -74,73c-44,25 -121,35 -162,22z"/> </g> </g> </svg>`;
          //震央圖
          else
            svg = `<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" id="svg2" version="1.1" inkscape:version="0.91 r13725" width="302.83594" height="302.83594" viewBox="0 0 302.83594 302.83594" sodipodi:docname="Epicenter_map_sign_by_Juhele.svg" inkscape:export-filename="/media/sdb1/_GRAFIKA/2017_OCAL/Missile_camera/Epicenter_map_sign_by_Juhele.png" inkscape:export-xdpi="152.16159" inkscape:export-ydpi="152.16159">
                        <title id="title7791">Epicenter map symbol / sign</title>
                        <metadata id="metadata8">
                          <rdf:RDF>
                            <cc:Work rdf:about="">
                              <dc:format>image/svg+xml</dc:format>
                              <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage"/>
                              <dc:title>Epicenter map symbol / sign</dc:title>
                              <dc:subject>
                                <rdf:Bag>
                                  <rdf:li>earthquake</rdf:li>
                                  <rdf:li>disaster</rdf:li>
                                  <rdf:li>epicenter</rdf:li>
                                  <rdf:li>epicentre</rdf:li>
                                  <rdf:li>circle</rdf:li>
                                  <rdf:li>concentric</rdf:li>
                                  <rdf:li>mark</rdf:li>
                                  <rdf:li>symbol</rdf:li>
                                  <rdf:li>map</rdf:li>
                                  <rdf:li>mapping</rdf:li>
                                </rdf:Bag>
                              </dc:subject>
                              <dc:description>Simple concentric circles map sign used to mark an earthquake epicenter</dc:description>
                              <cc:license rdf:resource="http://creativecommons.org/publicdomain/zero/1.0/"/>
                              <dc:creator>
                                <cc:Agent>
                                  <dc:title>Jan Helebrant</dc:title>
                                </cc:Agent>
                              </dc:creator>
                              <dc:rights>
                                <cc:Agent>
                                  <dc:title>Jan Helebrant</dc:title>
                                </cc:Agent>
                              </dc:rights>
                              <dc:publisher>
                                <cc:Agent>
                                  <dc:title>Jan Helebrant</dc:title>
                                </cc:Agent>
                              </dc:publisher>
                            </cc:Work>
                            <cc:License rdf:about="http://creativecommons.org/publicdomain/zero/1.0/">
                              <cc:permits rdf:resource="http://creativecommons.org/ns#Reproduction"/>
                              <cc:permits rdf:resource="http://creativecommons.org/ns#Distribution"/>
                              <cc:permits rdf:resource="http://creativecommons.org/ns#DerivativeWorks"/>
                            </cc:License>
                          </rdf:RDF>
                        </metadata>
                        <defs id="defs6"/>
                        <sodipodi:namedview pagecolor="#ffffff" bordercolor="#666666" borderopacity="1" objecttolerance="10" gridtolerance="10" guidetolerance="10" inkscape:pageopacity="0" inkscape:pageshadow="2" inkscape:window-width="1920" inkscape:window-height="1125" id="namedview4" showgrid="false" inkscape:zoom="0.71830983" inkscape:cx="-72.287923" inkscape:cy="188.71783" inkscape:window-x="0" inkscape:window-y="0" inkscape:window-maximized="1" inkscape:current-layer="svg2" fit-margin-top="5" fit-margin-left="5" fit-margin-right="5" fit-margin-bottom="5" showguides="false"/>
                        <g id="g7783" transform="translate(-104.58203,-104.58203)">
                          <path id="path6947" d="m 271,256 a 15,15 0 0 1 -15,15 15,15 0 0 1 -15,-15 15,15 0 0 1 15,-15 15,15 0 0 1 15,15 z" style="opacity:1;fill:#ff0000;fill-opacity:1;stroke:none;stroke-width:8;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1" inkscape:connector-curvature="0"/>
                          <path inkscape:connector-curvature="0" id="circle7761" d="m 256,139.28906 c -64.43944,0 -116.71094,52.2715 -116.71094,116.71094 0,64.43944 52.2715,116.71094 116.71094,116.71094 64.43944,0 116.71094,-52.2715 116.71094,-116.71094 0,-64.43944 -52.2715,-116.71094 -116.71094,-116.71094 z m 0,3 c 62.81812,0 113.71094,50.89282 113.71094,113.71094 0,62.81812 -50.89282,113.71094 -113.71094,113.71094 -62.81812,0 -113.71094,-50.89282 -113.71094,-113.71094 0,-62.81812 50.89282,-113.71094 113.71094,-113.71094 z" style="color:#000000;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:medium;line-height:normal;font-family:sans-serif;text-indent:0;text-align:start;text-decoration:none;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000000;letter-spacing:normal;word-spacing:normal;text-transform:none;direction:ltr;block-progression:tb;writing-mode:lr-tb;baseline-shift:baseline;text-anchor:start;white-space:normal;clip-rule:nonzero;display:inline;overflow:visible;visibility:visible;opacity:1;isolation:auto;mix-blend-mode:normal;color-interpolation:sRGB;color-interpolation-filters:linearRGB;solid-color:#000000;solid-opacity:1;fill:#ff0000;fill-opacity:0.55474453;fill-rule:nonzero;stroke:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;color-rendering:auto;image-rendering:auto;shape-rendering:auto;text-rendering:auto;enable-background:accumulate"/>
                          <path inkscape:connector-curvature="0" id="circle7765" d="m 256,214.26562 c -22.99636,0 -41.73438,18.73802 -41.73438,41.73438 0,22.99636 18.73802,41.73438 41.73438,41.73438 22.99636,0 41.73438,-18.73802 41.73438,-41.73438 0,-22.99636 -18.73802,-41.73437 -41.73438,-41.73438 z m 0,9 c 18.1324,0 32.73438,14.60198 32.73438,32.73438 0,18.1324 -14.60198,32.73438 -32.73438,32.73438 -18.1324,0 -32.73438,-14.60198 -32.73438,-32.73438 0,-18.1324 14.60198,-32.73437 32.73438,-32.73438 z" style="color:#000000;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:medium;line-height:normal;font-family:sans-serif;text-indent:0;text-align:start;text-decoration:none;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000000;letter-spacing:normal;word-spacing:normal;text-transform:none;direction:ltr;block-progression:tb;writing-mode:lr-tb;baseline-shift:baseline;text-anchor:start;white-space:normal;clip-rule:nonzero;display:inline;overflow:visible;visibility:visible;opacity:1;isolation:auto;mix-blend-mode:normal;color-interpolation:sRGB;color-interpolation-filters:linearRGB;solid-color:#000000;solid-opacity:1;fill:#ff0000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:9;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;color-rendering:auto;image-rendering:auto;shape-rendering:auto;text-rendering:auto;enable-background:accumulate"/>
                          <path inkscape:connector-curvature="0" id="circle7767" d="m 256,189.67773 c -36.59352,0 -66.32227,29.72875 -66.32227,66.32227 0,36.59352 29.72875,66.32227 66.32227,66.32227 36.59352,0 66.32227,-29.72875 66.32227,-66.32227 0,-36.59352 -29.72875,-66.32227 -66.32227,-66.32227 z m 0,6 c 33.35088,0 60.32227,26.97139 60.32227,60.32227 0,33.35088 -26.97139,60.32227 -60.32227,60.32227 -33.35088,0 -60.32227,-26.97139 -60.32227,-60.32227 0,-33.35088 26.97139,-60.32227 60.32227,-60.32227 z" style="color:#000000;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:medium;line-height:normal;font-family:sans-serif;text-indent:0;text-align:start;text-decoration:none;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000000;letter-spacing:normal;word-spacing:normal;text-transform:none;direction:ltr;block-progression:tb;writing-mode:lr-tb;baseline-shift:baseline;text-anchor:start;white-space:normal;clip-rule:nonzero;display:inline;overflow:visible;visibility:visible;opacity:1;isolation:auto;mix-blend-mode:normal;color-interpolation:sRGB;color-interpolation-filters:linearRGB;solid-color:#000000;solid-opacity:1;fill:#ff0000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:6;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;color-rendering:auto;image-rendering:auto;shape-rendering:auto;text-rendering:auto;enable-background:accumulate"/>
                          <path inkscape:connector-curvature="0" id="circle7769" d="m 256,166.16406 c -49.59132,0 -89.83594,40.24462 -89.83594,89.83594 0,49.59132 40.24462,89.83594 89.83594,89.83594 49.59132,0 89.83594,-40.24462 89.83594,-89.83594 0,-49.59132 -40.24462,-89.83594 -89.83594,-89.83594 z m 0,4 c 47.42956,0 85.83594,38.40638 85.83594,85.83594 0,47.42956 -38.40638,85.83594 -85.83594,85.83594 -47.42956,0 -85.83594,-38.40638 -85.83594,-85.83594 0,-47.42956 38.40638,-85.83594 85.83594,-85.83594 z" style="color:#000000;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:medium;line-height:normal;font-family:sans-serif;text-indent:0;text-align:start;text-decoration:none;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000000;letter-spacing:normal;word-spacing:normal;text-transform:none;direction:ltr;block-progression:tb;writing-mode:lr-tb;baseline-shift:baseline;text-anchor:start;white-space:normal;clip-rule:nonzero;display:inline;overflow:visible;visibility:visible;opacity:1;isolation:auto;mix-blend-mode:normal;color-interpolation:sRGB;color-interpolation-filters:linearRGB;solid-color:#000000;solid-opacity:1;fill:#ff0000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;color-rendering:auto;image-rendering:auto;shape-rendering:auto;text-rendering:auto;enable-background:accumulate"/>
                          <path inkscape:connector-curvature="0" id="circle7771" d="m 256,109.58203 c -80.85286,0 -146.41797,65.56511 -146.41797,146.41797 0,80.85286 65.56511,146.41797 146.41797,146.41797 80.85286,0 146.41797,-65.56511 146.41797,-146.41797 0,-80.85286 -65.56511,-146.41797 -146.41797,-146.41797 z m 0,2 c 79.77198,0 144.41797,64.64599 144.41797,144.41797 0,79.77198 -64.64599,144.41797 -144.41797,144.41797 -79.77198,0 -144.41797,-64.64599 -144.41797,-144.41797 0,-79.77198 64.64599,-144.41797 144.41797,-144.41797 z" style="color:#000000;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:medium;line-height:normal;font-family:sans-serif;text-indent:0;text-align:start;text-decoration:none;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000000;letter-spacing:normal;word-spacing:normal;text-transform:none;direction:ltr;block-progression:tb;writing-mode:lr-tb;baseline-shift:baseline;text-anchor:start;white-space:normal;clip-rule:nonzero;display:inline;overflow:visible;visibility:visible;opacity:1;isolation:auto;mix-blend-mode:normal;color-interpolation:sRGB;color-interpolation-filters:linearRGB;solid-color:#000000;solid-opacity:1;fill:#ff0000;fill-opacity:0.35766422;fill-rule:nonzero;stroke:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;color-rendering:auto;image-rendering:auto;shape-rendering:auto;text-rendering:auto;enable-background:accumulate"/>
                        </g>
                      </svg>`;
          return `data:image/svg+xml;base64,${window.btoa(svg)}`;
        };
        const getTileLayer = (tile) => {
          return L.tileLayer(tile.url, {
            attribution: tile.attribution,
            maxZoom: 18,
            // maxZoom: tile.maxZoom,
          });
        };
        const tileProviders = {
          OpenStreetMap: getTileLayer({
            attribution:
              '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          }),
          OpenTopoMap: getTileLayer({
            attribution:
              'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
            url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          }),
          WorldImagery: getTileLayer({
            attribution:
              "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
            url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          }),
        };
        //load the map
        let Map = L.map("stationMap", {
          // attributionControl: false,
          // zoomControl: false,
        }).setView([23, 120], 7);

        // map tiles
        L.control.layers(tileProviders).addTo(Map);
        // map sacles
        L.control.scale({ position: "topright" }).addTo(Map);
        // map default tile
        tileProviders["OpenStreetMap"].addTo(Map);

        //==marker group
        let markerGroup = L.layerGroup().addTo(Map);
        const markerSize = 15;

        chartContainerJQ
          .find("#stationMap")
          .on("updateMap", (e, chartData, colorPalette) => {
            // remove all the markers in one go
            markerGroup.clearLayers();

            chartData.forEach((d, i) => {
              let station = d.station;
              //===station icon
              let marker = L.marker(d["coord"], {
                pane: "markerPane",
                data: d,
                icon: L.icon({
                  iconUrl: getIconSrc(1, markerSize, colorPalette[station]),
                  iconSize: [markerSize, markerSize],
                  iconAnchor: [markerSize / 2, markerSize / 2],
                  tooltipAnchor: [0, -markerSize / 2],
                }),
              }).on("mouseover mouseout", (e) => {
                let hover = e.type === "mouseover";
                let tr = chartContainerJQ
                  .find("#stationtable>tbody")
                  .children()
                  .filter(function () {
                    return this.innerText.split("\t")[0] === station;
                  });
                tr.trigger(hover ? "mouseenter" : "mouseleave");
                highlightPath(station, hover);
              });

              let tooltipHtml = `<text>${station}</text><br>`;
              let popupHtml = `
                                <h1>${station}</h1>
                                <text>Distance : ${d.dist} km</text><br>
                                <text>Azimuth : ${d.az}°</text><br>
                                <text>Latitude : ${d.coord[0]}</text><br>
                                <text>Longitude : ${d.coord[1]}</text><br>
                                <text>Network : ${d.network}</text><br>`;

              marker.bindTooltip(tooltipHtml, {
                direction: "top",
                // permanent: true,
                // className: 'station-tooltip',
              });
              marker.bindPopup(popupHtml);
              marker.addTo(markerGroup);

              //==datatable才找的到marker
              marker.getElement().dataset.station = station;
            });

            epicenter.setLatLng([data.lat, data.lng]).setOpacity(1);
          });

        //==epicenter
        const epicSize = 50;
        let epicenter = L.marker([0, 0], {
          icon: L.icon({
            iconUrl: getIconSrc(0, epicSize),
            iconSize: [epicSize, epicSize],
            iconAnchor: [epicSize / 2, epicSize / 2],
          }),
          pane: "shadowPane",
          // opacity: 0,
        });

        epicenter.addTo(Map);
      };
      let initTable = () => {
        chartContainerJQ
          .find("#stationList")
          .append(
            `<table id='stationtable' class="hover" style="width:100%"></table>`
          );
        let datatable = chartContainerJQ.find("#stationtable").DataTable({
          columns: [
            // 列的標題一般是從DOM中讀取（也可以使用這個屬性為表格創建列標題)
            { title: "station" },
            { title: "network" },
            { title: "dist." },
            { title: "az." },
          ],
          order: [[2, "asc"]],
          searching: false,
          lengthChange: false,
          pageLength: 8,
          // "columnDefs": [
          //     { responsivePriority: 1, targets: 0 },
          //     { responsivePriority: 2, targets: -1 }
          // ]
          // fixedColumns: true
        });

        datatable.on("updateData", (e, chartData, colorPalette) => {
          // console.debug(e, chartData, colorPalette);
          //===更新地圖
          chartContainerJQ
            .find("#stationMap")
            .trigger("updateMap", [chartData, colorPalette]);

          let dataset = chartData.map((d) => [
            d.station,
            d.network,
            d.dist.toFixed(2),
            d.az.toFixed(2),
          ]);
          datatable.clear();
          datatable.rows.add(dataset);
          datatable.draw();

          datatable.rows().every(function (rowIdx) {
            let data = this.data();
            let tr = $(this.node());

            let station = data[0];
            let marker = chartContainerJQ
              .find("#stationMap .leaflet-marker-pane")
              .children()
              .filter(function () {
                return this.dataset.station === station;
              });

            tr.hover(
              function (e) {
                $(this).addClass("hover").css({
                  "background-color": "#9D9D9D",
                  color: "#fff",
                });
                highlightPath(station);
                // console.debug()
                if (!e.isTrigger) marker.addClass("jumpingIcon");
              },
              function (e) {
                $(this).removeClass("hover").css({
                  "background-color": "",
                  color: "",
                });
                highlightPath(station, false);
                if (!e.isTrigger) marker.removeClass("jumpingIcon");
              }
            );
            tr.children("td:first-child").css({
              "background-color": colorPalette[station],
              color: "#fff",
            });
          });
        });
      };
      if (!(chartContainerJQ.find("#stationMap>*").length >= 1)) {
        initMap();
        initTable();
      }
    }
    async function printChart() {
      chartContainerJQ.find("#distRange_slider").remove();
      chartContainerJQ.find("#azRange_slider").remove();
      chartContainerJQ.find("#networkDropDownMenu").children().remove();
      chartContainerJQ.find("#channelDropDownMenu").children().remove();
      chartContainerJQ
        .find("#displayDropDownMenu>.stations")
        .children()
        .remove();
      chartContainerJQ.find("#normalize").prop("checked", true);
      chartContainerJQ.find("#normalizeScale").prop("disabled", false);
      chartContainerJQ.find("sub.dist").text("");
      chartContainerJQ.find("sub.az").text("");
      chartContainerJQ.find("#charts").children().remove();

      let i = 1;

      let getChartMenu = () => {
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

        let chartDropDown = ["svg", "png", "jpg", "bigimg", "option"];

        let gethr = () => {
          return document.createElement("hr");
        };

        chartDropDown.forEach((option) => {
          let li = document.createElement("li");
          let item = document.createElement("a");
          item.href = "javascript:void(0)";

          switch (option) {
            case "bigimg":
              item.innerHTML = "檢視圖片";
              ul.append(gethr());
              break;
            case "option":
              item.innerHTML = "顯示/隱藏圖表選項";
              ul.append(gethr());
              break;
            default:
              item.innerHTML = "下載圖表爲" + option;
              break;
          }

          item.addEventListener("click", (e, a) => {
            if (option !== "option") {
              let svgArr = [];
              let svg = chartContainerJQ
                .find("#" + $(e.target).parents(".chart")[0].id)
                .children("svg")[0];
              svgArr.push(svg);
              let xAxisName = document.querySelector(
                'input[name ="xAxisName"]:checked'
              ).value;
              let xAxisScale = document.querySelector(
                'input[name ="xAxisScale"]:checked'
              ).value;
              let referenceTime = `${data.date}T${data.time}`;
              let fileName =
                "WF_by_" +
                xAxisName +
                (xAxisScale == "band" ? "-sta" : "") +
                "_" +
                referenceTime +
                "Z";
              downloadSvg(svgArr, fileName, option);
            } else {
              let chartsOptions = chartContainerJQ.find("#chartsOptions");
              chartsOptions.is(":visible")
                ? chartsOptions.hide()
                : chartsOptions.show();
            }
          });

          li.append(item);
          ul.append(li);
        });
        document.querySelector("#charts").append(div);
        document.querySelector("#chart" + i).append(nav);
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

        chartContainerJQ.find(".toggle-nav").off("click");
        chartContainerJQ.find(".toggle-nav").click(function (e) {
          // console.debug(e.target === this);//e.target===this

          $(this).toggleClass("active");
          $(this).next().toggleClass("active");
          e.preventDefault();

          //選單打開後阻止事件Capture到SVG(選單打開後svg反應mousemove,mouseenter圖片會有問題)
          if ($(this).hasClass("active")) chartEventControl("stop");
          else chartEventControl("start");
        });
        // console.debug(chartContainerJQ.find(".toggle-nav"));
        $("body").off("click");
        $("body").click(function (e) {
          chartContainerJQ.find(".toggle-nav").each((i, d) => {
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
      let xAxisName = document.querySelector(
        'input[name ="xAxisName"]:checked'
      ).value;
      let xAxisScale = document.querySelector(
        'input[name ="xAxisScale"]:checked'
      ).value;

      // console.debug(xAxisName, xAxisScale)
      getChartMenu();

      data = await data; //等data處理完才能畫圖
      if (chartContainerJQ.find("#chart1>svg").length === 0) {
        chartContainerJQ
          .find("#chart" + i)
          .append(WD_Charts(xAxisScale, xAxisName));
        MenuEvents();
      }
    }
    //===init once
    if (!(chartContainerJQ.find("#form-chart").length >= 1)) {
      init();
      stationInfo();
    }
    if (data) printChart();
  }
  return chart;
}
