<?php
header("Strict-Transport-Security: max-age=31536000; includeSubDomains; preload");

// 確保參數存在
if (isset($_POST['imgUrl']) && isset($_POST['imgType']) && isset($_POST['fileName'])) {


    // 確保檔案存在，並且不是目錄
    if (is_file($filename) && file_exists($filename) && strpos(realpath($filename), realpath($allowedDirectory)) === 0) {
        // 讀取檔案內容
        $filecontents = file($filename);

        // 處理文件內容的邏輯
        $tempArray = [];
        foreach ($filecontents as $k => $v) {
            $tempData = sscanf($filecontents[$k], "%s %s %s %s");
            $depth = filter_var($tempData[2], FILTER_SANITIZE_STRING);
            if ($depth == $plotdepth) {
                $tempArray[] = $tempData;
            }
        }

        echo json_encode($tempArray);
    } else {
        // 處理檔案不存在或不在允許的目錄中的情況
        echo "File not found or access denied!";
    }

    try {
        // 驗證和過濾輸入
        $dataUrl = filter_var($_POST['imgUrl'], FILTER_SANITIZE_STRING);
        $imgType = filter_var($_POST['imgType'], FILTER_SANITIZE_STRING);
        $fileName = filter_var($_POST['fileName'], FILTER_SANITIZE_STRING);

        // 移除圖片格式標頭
        $img = str_replace('data:image/' . $imgType . ';base64,', '', $dataUrl);

        // 檢查檔案是否在允許的目錄中
        $allowedDirectory = "../../certificate/";
        $filePath = $allowedDirectory . basename($fileName) . '.' . basename($imgType);

        // 寫入文件
        if (realpath($allowedDirectory)) {
            if (file_put_contents($filePath, base64_decode($img)) === false) {
                // 寫入失敗，可以根據實際需求，這裡可以拋出異常或返回錯誤信息
                die("無法寫入文件");
            }

            echo $fileName;
        }
    } catch (Exception $e) {
        // 捕獲和處理潛在的異常
        die("發生錯誤：" . $e->getMessage());
    }
} else {
    // 處理缺少參數的情況
    echo "Missing parameters!";
}
