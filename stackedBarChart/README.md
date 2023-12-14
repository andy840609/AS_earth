# DSBC

## 函數
|Property        | Usage           | Default  | Required |
|:------------- |:-------------|:-----:|:-----:|
| data | Chart data | none | yes |
| selector | DOM selector to attach the chart to | body | no |
| string | string to change subject and category default string | {} | no |
## 需要資源
* [d3.js](https://d3js.org/)
* jquery
* bootstrap

## 用法

1. 引入d3、jquery、bootstrap 和 DSBC.js、DSBC.css
```javascript
    <script src="../src/jquery/jquery-3.5.1.min.js"></script>
    <script src="../src/d3/d3.min.js"></script>
    <script src="../src/bootstrap-4.5.3-dist/js/bootstrap.bundle.min.js"></script>
    <script src="../src/DSBC.js"></script>
    <link rel="stylesheet" href="../src/bootstrap-4.5.3-dist/css/bootstrap.min.css">
    <link href="../src/DSBC.css" rel="stylesheet">
```
2. DSBC().data()裡面填入物件陣列,每個物件都當作一組圖(多圖有些互動事件可能有bug,之後要用多圖再修),
   資料的結構在example有,第二層跟第三層對調能畫出以年分析圖(ex:data(按資料庫)和data2(按年)),
   DSBC().string({ subject: '年', category: '資料庫' })是用來替換資料第二層(subject)和第三層(category)
   字串的,不填會是預設的'subject'和'category'
   
```javascript
// chart data example
 
    var title = '全體下載量';
    var obj = { data: data, title: title };
    var Data = [obj,];
        var chart = DSBC()
            .data(Data)
            .string({ subject: '資料庫', category: '年' })
            // .string({ subject: '年', category: '資料庫' })
            .selector('.container');
        chart();

```


