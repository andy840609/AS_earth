<?php

// echo $_POST['path'];
$dataPath = '../' . $_POST['path'];
$folderStr = $_POST['folderStr'];
// $folderStr = 'xy_';



//===ls所有目錄名稱
$CMD = 'ls ' . $dataPath;
exec($CMD, $output, $retval);

//===ls各目錄下資料夾
$resultArr = [];
foreach ($output as $catalog) {
    // echo $CMD . $value . "      ";
    // echo $catalog . '  ';
    exec($CMD . $catalog, $folders, $reval);

    foreach ($folders as $f)
        if (substr($f, 0, strlen($folderStr)) === $folderStr) {
            // echo $catalog . '  ';
            $folder = $f;
            exec($CMD . $catalog . '/' . $folder, $fileXY, $rev);
            // echo $fileXY . '  ';
        }
    $obj = [
        'catalog' => $catalog,
        'folder' => $folder,
        'fileXY' => $fileXY,
    ];
    $resultArr[] = $obj;
    unset($folders);
    unset($fileXY);

    // echo $obj['dataFile'][3] . "<br>";
    // $fileNames = [];
}
// echo $resultArr[0]['dataFile'][0];

//===回傳目錄、資料夾和xy檔案名稱
$result = json_encode($resultArr);
echo $result;
