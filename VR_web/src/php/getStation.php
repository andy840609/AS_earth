<?php

// echo $_POST['path'];
$dataPath = '../' . $_POST['path'];
// $dataPath = "../data/";


//===ls所有資料夾名稱
$CMD = 'ls ' . $dataPath;
exec($CMD, $output, $retval);

//===ls各資料夾下檔名
$resultArr = [];
foreach ($output as $value) {
    // echo $CMD . $value . "      ";
    exec($CMD . $value, $fileNames, $reval);
    $obj = [
        'station' => $value,
        'fileNames' => $fileNames,
        // $value => $fileNames,
    ];
    $resultArr[] = $obj;
    // echo $obj['dataFile'][3] . "<br>";
    $fileNames = [];
}
// echo $resultArr[0]['dataFile'][0];

//===回傳站名和檔名json
$result = json_encode($resultArr);
echo $result;
