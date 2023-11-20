<?php
// 驗證和過濾文件名，僅允許字母、數字、下劃線、中文字符
function filter($str)
{
    return preg_replace("/[^\x{4e00}-\x{9fa5}A-Za-z0-9_]/u", '', $str);
}

$dataUrl = filter($_POST['imgUrl']);
$imgType = filter($_POST['imgType']);
$fileName = filter($_POST['fileName']);
$img = str_replace('data:image/' . $imgType . ';base64,', '', $dataUrl);
// 使用絕對路徑來構造文件路徑
$filePath = realpath("../../certificate") . '/' . $fileName . '.' . $imgType;
// 寫入文件
file_put_contents($filePath, base64_decode($img));

echo $fileName;
