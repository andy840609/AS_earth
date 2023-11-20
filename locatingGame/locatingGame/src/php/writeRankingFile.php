<?php
// 驗證和過濾文件名，僅允許字母、數字、下劃線、中文字符
function filter($str)
{
    return preg_replace("/[^\x{4e00}-\x{9fa5}A-Za-z0-9_]/u", '', $str);
}

$dataArr = array_map("filter", $_POST);
$newStr = implode(" ", $dataArr);

// 使用絕對路徑來構造文件路徑
$filePath = realpath("../../data/datafile/rank/records.txt");

// 寫入文件
$result = file_put_contents($filePath, "\n" . $newStr, FILE_APPEND);


// if ($result === false) {
//     echo "寫入檔案失敗！";
// } else {
//     echo "寫入成功！";
// }
// echo $newStr . "  " . $filePath;
// echo "\n" . implode(" ", $dataArr);
