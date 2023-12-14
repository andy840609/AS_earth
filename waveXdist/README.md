# WFDist

## 函數
|Property        | Usage           | Default  | Required |
|:------------- |:-------------|:-----:|:-----:|
| dataPath | Chart data | none | yes |
| string | referenceTime and title | '2000-01-01T00:00:00' | no |
| selector | DOM selector to attach the chart to | body | no |


## 需要資源
* [d3.js](https://d3js.org/)
* jquery
* bootstrap

## 用法

1. 引入d3、jquery、bootstrap、bootstrap-slider 和 waveXdist.js、waveXdist.css
```javascript
    <script src="../src/jquery/jquery-3.5.1.min.js"></script>
    <script src="../src/d3/d3.min.js"></script>
    <script src="../src/bootstrap-4.5.3-dist/js/bootstrap.bundle.min.js"></script>
    <script src="../src/bootstrap-slider-master/dist/bootstrap-slider.js"></script>
    <script src="../src/waveXdist.js"></script>
    
    <link rel="stylesheet" href="../src/bootstrap-4.5.3-dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="../src/bootstrap-slider-master/dist/css/bootstrap-slider.css">
    <link href="../src/waveXdist.css" rel="stylesheet">
```
2. waveXdist().dataPath()裡面填入物件,需要包含三個屬性data(xy檔案的路徑陣列)、az(sta_az.txt的路徑)、dist(sta_dist.txt的路徑),
   waveXdist().string()裡面填入物件,包含兩個屬性referenceTime、title(沒有這個屬性的話title會是referenceTime),不填referenceTime預設'2000-01-01T00:00:00'
```javascript
// chart data example
        const catlog = '../data/202104181414/';
        const xy_floder = catlog + 'xy_2021-04-18T14:14:37/';
        var paths = [
            xy_floder + '2021.108.14.14.34.0000.TW.GWUB..BHZ.D.xy',
            xy_floder + '2021.108.14.14.34.0000.TW.RLNB..BHZ.D.xy',
        ];
        var az = catlog + 'sta_az.txt';
        var dist = catlog + 'sta_dist.txt';


        var chart = waveXdist()
            .dataPath({ data: paths, az: az, dist: dist })
            .string({
                referenceTime: '2021-04-18T14:14:37',
                // title: 'AAA',
            })
            .selector('.container');
        chart();
```
## 更新


