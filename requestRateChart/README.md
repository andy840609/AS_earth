# requestRateChart

## 函數
|Property        | Usage           | Default  | Required |
|:------------- |:-------------|:-----:|:-----:|
| selector | DOM selector to attach the chart to | body | no |
| dataObj | Chart data | none | yes |
| typeNameObj | Chart data | none | yes |
| typesOfException | types that don't show in chart | [] | no |

## 需要資源
* [d3.js](https://d3js.org/)
* jquery
* bootstrap

## 用法

1. 引入d3、jquery、bootstrap 和 requestRateChart.js、requestRateChart.css
```javascript
    <script src="../src/jquery/jquery-3.5.1.min.js"></script>
    <script src="../src/d3/d3.min.js"></script>
    <script src="../src/bootstrap-4.5.3-dist/js/bootstrap.bundle.min.js"></script>
    <script src="../src/requestRateChart.js"></script>
    <link rel="stylesheet" href="../src/bootstrap-4.5.3-dist/css/bootstrap.min.css">
    <link href="../src/requestRateChart.css" rel="stylesheet">
```
2. requestRate().dataObj()填json結構的資料,typeNameObj()是用來作legend字串的,typesOfException()填入一個陣列去除不要的type

```javascript
// chart data example
  var dataObj=[
            {
                "user_id": 33,
                "datetime": "2021-05-30 13:33:29",
                "complete_time": "2021-05-30 13:49:31",
                "finish_process_time": "2021-05-30 13:36:40",
                "tmp_server_time": "2021-05-30 13:40:26",
                "id": 4,
                "parameters": "{\"network\":\"CWBSN\",\"stations\":\"ALS,ANP,BAC,CHK,CHKH,CHN8,CHY,EAH,EAS,ECB,ECL,ECS,EDH,EGC,EGFH,EGS,EHD,EHP,EHYH,ELD,ENA,ESA,ESL,ETLH,ETM,EWT,EYUL,HEN,HSN,HSN1,HWA,ILA,KAU,KNM,KSHI,LAY,LDU,MSU,NCU,NCUH,NDS,NFF,NHDH,NHW,NJD,NJN,NMLH,NNS,NOU,NSK,NST,NSY,NTS,NWF,NWL,PCY,PNG,SCK,SCL,SCS,SCZ,SEB,SGL,SGS,SHUL,SML,SMS,SNJ,SPT,SSD,SSH,SSP,STY,STYH,TAI,TAI1,TAP,TAW,TAWH,TCU,TIPB,TTN,WCH1,WCHH,WCKO,WCS,WDG,WDJ,WDL,WDLH,WGK,WHY,WLC,WNT,WPL,WRL,WSF,WSL,WTC,WTK,WTP,WYL,YUS,ZUZH,WWC\",\"startTime\":\"2021-05-24T00:00:00\",\"endTime\":\"2021-05-24T23:59:59\",\"scriptID\":4,\"scriptName\":\"quest_seis.csh\",\"locations\":\"10,11,00\",\"channels\":\"HN1,HN2,HNE,HNN,HNZ\",\"output_fmt\":\"mseed\",\"label\":\"202\"}",
                "final_status": 1,
                "file_size": 2095104,
                "script_type": "地震 (資料)",
                "t1": "00:03:11",
                "t2": "00:06:57",
                "t3": "00:16:02",
                "dt1": 191,
                "v1": 10969.13,
                "dt2": 226,
                "v2": 9270.37,
                "dt3": 545,
                "v3": 3844.23,
                "dt_final": 962,
                "v_final": 2177.86,
                "network": "CWBSN",
                "stations": "ALS,ANP,BAC,CHK,CHKH,CHN8,CHY,EAH,EAS,ECB,ECL,ECS,EDH,EGC,EGFH,EGS,EHD,EHP,EHYH,ELD,ENA,ESA,ESL,ETLH,ETM,EWT,EYUL,HEN,HSN,HSN1,HWA,ILA,KAU,KNM,KSHI,LAY,LDU,MSU,NCU,NCUH,NDS,NFF,NHDH,NHW,NJD,NJN,NMLH,NNS,NOU,NSK,NST,NSY,NTS,NWF,NWL,PCY,PNG,SCK,SCL,SCS,SCZ,SEB,SGL,SGS,SHUL,SML,SMS,SNJ,SPT,SSD,SSH,SSP,STY,STYH,TAI,TAI1,TAP,TAW,TAWH,TCU,TIPB,TTN,WCH1,WCHH,WCKO,WCS,WDG,WDJ,WDL,WDLH,WGK,WHY,WLC,WNT,WPL,WRL,WSF,WSL,WTC,WTK,WTP,WYL,YUS,ZUZH,WWC",
                "para": "<a class=\"btn btn-outline-primary\" href=\"javascript:showContent('0');\">內容</a>",
                "para_detail": "{\"network\":\"CWBSN\",\"stations\":\"ALS,ANP,BAC,CHK,CHKH,CHN8,CHY,EAH,EAS,ECB,ECL,ECS,EDH,EGC,EGFH,EGS,EHD,EHP,EHYH,ELD,ENA,ESA,ESL,ETLH,ETM,EWT,EYUL,HEN,HSN,HSN1,HWA,ILA,KAU,KNM,KSHI,LAY,LDU,MSU,NCU,NCUH,NDS,NFF,NHDH,NHW,NJD,NJN,NMLH,NNS,NOU,NSK,NST,NSY,NTS,NWF,NWL,PCY,PNG,SCK,SCL,SCS,SCZ,SEB,SGL,SGS,SHUL,SML,SMS,SNJ,SPT,SSD,SSH,SSP,STY,STYH,TAI,TAI1,TAP,TAW,TAWH,TCU,TIPB,TTN,WCH1,WCHH,WCKO,WCS,WDG,WDJ,WDL,WDLH,WGK,WHY,WLC,WNT,WPL,WRL,WSF,WSL,WTC,WTK,WTP,WYL,YUS,ZUZH,WWC\",\"startTime\":\"2021-05-24T00:00:00\",\"endTime\":\"2021-05-24T23:59:59\",\"scriptID\":4,\"scriptName\":\"quest_seis.csh\",\"locations\":\"10,11,00\",\"channels\":\"HN1,HN2,HNE,HNN,HNZ\",\"output_fmt\":\"mseed\",\"label\":\"202\"}"
            },....
          ];
          
       var typeNameObj = [
        { id: 1, chinese_description: "GNSS" },
        { id: 2, chinese_description: "地下水" },
        { id: 3, chinese_description: "地磁" },
        { id: 4, chinese_description: "地震 (資料)" },
        { id: 5, chinese_description: "地震 (GMT畫圖)" },
        { id: 6, chinese_description: "地震 (儀器響應檔)" },
        { id: 7, chinese_description: "地震 (儀器響應常數)" },
        { id: 8, chinese_description: "地震 (繪圖)" }
    ]

      var typesOfException = [6, 7, 99];
      
      var chart = requestRate()
            .selector('.container')
            .dataObj(dataObj)
            .typeNameObj(typeNameObj)
            .typesOfException(typesOfException)
    chart();

