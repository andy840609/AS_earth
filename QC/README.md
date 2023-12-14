# QC

1.pathArr是太陽日資料夾下的路徑陣列,channel的地方留空
(ex:pathArr[0]="./Data/RMS/TSMIP/2020/2020.275/A002.TW.10.???.2020.275.json")

2.channelArr用來替換路徑挖空部分
(ex:channelArr=['HLE','HLN','HLZ'])

3.replaceSymbol挖空部分的代號,可不填（預設???）


```javascript
        var dataObj = {
            pathArr: paths,
            channelArr: channelArr,
            // replaceSymbol: '???',
        }
        var chart = QCchart()
            .data(dataObj)
            .title("TSMIP.A002.10")
            .selector('.container');

        chart();

