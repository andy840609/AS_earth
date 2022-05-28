

let ajaxReadFile = (dataObj) => {
    return $.ajax({
        url: dataObj.url ? dataObj.url : '',
        dataType: dataObj.dataType ? dataObj.dataType : 'text',
        async: dataObj.async == undefined ? true : dataObj.async,
        // success: function (d) { },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error(jqXHR, textStatus, errorThrown);
        },
    });
};


const recordsDir = '../data/datafile/rank/records.txt';
ajaxReadFile({ url: recordsDir }).then(success => {
    let data;
    data = success.split("\n").filter(d => d !== '').map(row => {
        let col = row.split(' ');
        return {
            player: col[0],
            timeUse: parseFloat(col[1]),
            // score: parseInt(col[2])
        };
    }).sort((a, b) => a.timeUse - b.timeUse);
    console.debug(data);


    $('#tableArray').DataTable({
        "data": data,
        "columns": [ // 列的標題一般是從DOM中讀取（也可以使用這個屬性為表格創建列標題)
            { data: 'player', title: "勇者名" },
            { data: 'timeUse', title: "消耗時間" },
        ],
        "paging": false,
    })


})
