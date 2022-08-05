<?php

// echo $_POST['path'];
$dataPath = '../' . $_POST['path'];
$folderStr = $_POST['folderStr'];
// $folderStr = 'xy_';
// echo $dataPath;


//===ls所有目錄名稱
$CMD = 'ls ' . $dataPath;
exec($CMD, $output, $retval);
// echo $CMD . $output . $retval;

//===ls各目錄下資料夾
$resultArr = [];
foreach ($output as $catalog) {
    // echo $CMD . $value . "      ";
    // echo $output . '  ';
    exec($CMD . $catalog, $folders, $reval);

    foreach ($folders as $f)
        if (substr($f, 0, strlen($folderStr)) === $folderStr) {
            // echo $catalog . '  ';
            $xyFolder = $f;
            exec($CMD . $catalog . '/' . $xyFolder, $networkDir, $rev);
            // echo $fileXY[0] . '  ';

            $networkList = [];
            foreach ($networkDir as $network) {
                exec($CMD . $catalog . '/' . $xyFolder .  '/' . $network, $xyFiles, $r);
                $networkList[$network] = $xyFiles;
                unset($xyFiles);
            };

            $resultArr[] = [
                'catalog' => $catalog,
                'xyFolder' => $xyFolder,
                'network' => $networkList,
            ];

            unset($networkDir);
            unset($folders);
        }


    // echo $obj['dataFile'][3] . "<br>";
    // $fileNames = [];
}
// echo $resultArr[0]['dataFile'][0];

//===回傳目錄、資料夾和xy檔案名稱
$result = json_encode($resultArr);
echo $result;
