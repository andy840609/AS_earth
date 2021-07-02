<?php

// echo $_POST['path'];
$dataPath = '../' . $_POST['path'];
// $folderStr = $_POST['folderStr'];
// $folderStr = 'xy_';



//===ls所有目錄名稱
$CMD = 'ls ' . $dataPath;
exec($CMD, $output, $retval);

//===ls各目錄下資料夾
$resultArr = [];
foreach ($output as $catalog) {
    // echo $catalog;
    exec($CMD . $catalog, $file, $reval);
    // echo  $CMD;
    $obj = [
        'catalog' => $catalog,
        'file' => $file,
    ];
    $resultArr[] = $obj;
    unset($file);
}


//===回傳目錄、資料夾和xy檔案名稱
$result = json_encode($resultArr);
echo $result;
