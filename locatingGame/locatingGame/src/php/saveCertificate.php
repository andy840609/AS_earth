<?php
header("Strict-Transport-Security: max-age=31536000; includeSubDomains; preload");
// 驗證和過濾文件名，僅允許字母、數字、下劃線、中文字符
function filter($str)
{
    // 移除非中文、字母、數字和下劃線的字符
    $filteredStr = preg_replace("/[^\x{4e00}-\x{9fa5}A-Za-z0-9_]/u", '', $str);

    // 確保文件名不為空
    if (empty($filteredStr)) {
        // 可以根據實際需求，這裡可以拋出異常或返回錯誤信息
        die("文件名無效");
    }

    return $filteredStr;
}

try {
    // 驗證和過濾輸入
    $dataUrl = filter($_POST['imgUrl']);
    $imgType = filter($_POST['imgType']);
    $fileName = filter($_POST['fileName']);

    // 移除圖片格式標頭
    $img = str_replace('data:image/' . $imgType . ';base64,', '', $dataUrl);

    // 使用絕對路徑來構造文件路徑
    $filePath = realpath("../../certificate") . '/' . $fileName . '.' . $imgType;

    // 寫入文件
    if (file_put_contents($filePath, base64_decode($img)) === false) {
        // 寫入失敗，可以根據實際需求，這裡可以拋出異常或返回錯誤信息
        die("無法寫入文件");
    }

    echo $fileName;
} catch (Exception $e) {
    // 捕獲和處理潛在的異常
    die("發生錯誤：" . $e->getMessage());
}
