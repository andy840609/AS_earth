<?php
header("Strict-Transport-Security: max-age=31536000; includeSubDomains; preload");
// 驗證和過濾數據，僅允許字母、數字、下劃線、中文字符
function filter($str)
{
    return preg_replace("/[^\x{4e00}-\x{9fa5}A-Za-z0-9_]/u", '', $str);
}

// 過濾並合併數據
// $dataArr = array_map("filter", $_POST);
// $newStr = implode(" ", $dataArr);

echo $newStr . "  " . $filePath;
echo "\n" . implode(" ", $dataArr);
try {
    // 使用絕對路徑來構造文件路徑
    $filePath = realpath("../../data/datafile/rank/records.txt");

    // 寫入文件
    if (file_put_contents($filePath, "\n" . $newStr, FILE_APPEND) === false) {
        // 寫入失敗，可以根據實際需求，這裡可以拋出異常或返回錯誤信息
        throw new Exception("無法寫入文件");
    }

    // 寫入成功的操作，可以根據需要添加

    // 最後，可以返回成功的消息或其他信息
    echo "寫入成功！";
} catch (Exception $e) {
    // 捕獲和處理潛在的異常
    die("發生錯誤：" . $e->getMessage());
}
