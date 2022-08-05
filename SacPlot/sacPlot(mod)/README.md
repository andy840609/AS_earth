# sacPlot

![sp](https://raw.githubusercontent.com/andy840609/sacPlot/main/example/ex.png)

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

1.引入d3、jquery和bootstrap

2.引入sacPlot.js和sacPlot.css
`<link href="path/to/sacPlot.css" rel="stylesheet">`
`<script src="path/to/sacPlot.js"></script>`

3: 呼叫data並把路徑陣列當參數

4: 之後呼叫回傳的函數
```javascript
// chart data example
var paths = ['../data/201602051950.TW.0000549.BN3.sac', '../data/201602051950.TW.0000549.BN2.sac', '../data/201602051950.TW.0000549.BN1.sac'];

var chart = sacPlots()
            .data(paths)
            .selector('.container');
chart();

