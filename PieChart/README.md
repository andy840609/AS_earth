# PieChart

## 函數
|Property        | Usage           | Default  | Required |
|:------------- |:-------------|:-----:|:-----:|
| data | Chart data | none | yes |
| selector | DOM selector to attach the chart to | body | no |

## 需要資源
* [d3.js](https://d3js.org/)
* jquery
* bootstrap

## 用法

1. 引入d3、jquery、bootstrap 和 pie.js、pie.css
```javascript
    <script src="../src/jquery/jquery-3.5.1.min.js"></script>
    <script src="../src/d3/d3.min.js"></script>
    <script src="../src/bootstrap-4.5.3-dist/js/bootstrap.bundle.min.js"></script>
    <script src="../src/pie.js"></script>
    <link rel="stylesheet" href="../src/bootstrap-4.5.3-dist/css/bootstrap.min.css">
    <link href="../src/pie.css" rel="stylesheet">
```
2. pieChart().data()裡面填入物件陣列,每個物件都當作一組pie圖（不同年份的圖要分開畫的時候）

```javascript
// chart data example
    var data = {
                "count": {
                    "CWBSN": 1032,
                    "MAGNET": 68,
                    "GNSS": 72,
                    "GW": 27,
                    "TSMIP": 228,
                    "total": 1427
                },
                "file_size": {
                    "CWBSN": "153.17 GB",
                    "MAGNET": "7.91 GB",
                    "GNSS": "39.85 GB",
                    "GW": "3.93 GB",
                    "TSMIP": "138.34 GB",
                    "total": "343.21 GB"
                }
            };
    var title = '全體下載量';
    var obj = { data: data, title: title };
    
    var Data = [obj, obj];

    var chart = pieChart()
        .data(Data)
        .selector('.container');
    chart();
```
## 更新
2021/6/16 : 
* 資料值爲0的不顯示了
* 小於1的值自動轉換到值會大於1的單位(轉換極限到bit)
