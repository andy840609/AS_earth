# sacPlot

![sp](https://raw.githubusercontent.com/andy840609/sacPlot/main/example/ex.png)

## 函數

|Property        | Usage           | Default  | Required |
|:------------- |:-------------|:-----:|:-----:|
| data | Chart data | none | yes |
| selector | DOM selector to attach the chart to | body | no |
| title | String to put on chart's title (network.location.station)| none | no |
| legend | each chart's channel | none | no |

## 需要資源
* [d3.js](https://d3js.org/)
* jquery
* bootstrap

## 用法

1. 引入d3、jquery、bootstrap 和 sacPlot.js、sacPlot.css
```javascript
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" crossorigin="anonymous">
<script src="https://code.jquery.com/jquery-3.3.1.min.js" crossorigin="anonymous"></script>
<script src="https://d3js.org/d3.v6.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
<link href="path/to/sacPlot.css" rel="stylesheet">
<script src="path/to/sacPlot.js"></script>
```
2. 呼叫sacPlots().data()以路徑陣列當引數填入(title、legend可不呼叫),最後回傳回一個函數，呼叫後圖表會掛在指定節點下(預設body)

```javascript
// chart data example
	var paths = ['../data/A002.10.HLE', '../data/A002.10.HLN', '../data/A002.10.HLZ'];

	var chart = sacPlots()
            .data(paths)
            .title("TSMIP 10 A002 2020-01-01T00:00:00")
            .legend("HLE HLN HLZ")
            .selector('.container');
        chart();

