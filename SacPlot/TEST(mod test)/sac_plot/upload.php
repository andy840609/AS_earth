<?php
# 取得上傳檔案數量
$fileCount = count($_FILES['input-zone']['name']);
// echo json_encode('$fileCount');
$paths = array();
for ($i = 0; $i < $fileCount; $i++) {
    # 檢查檔案是否上傳成功
    if ($_FILES['input-zone']['error'][$i] === UPLOAD_ERR_OK) {

        $file = $_FILES['input-zone']['tmp_name'][$i];

        # 去除空格ㄝ,否則指令出錯
        $fileName = str_replace(' ', '', $_FILES['input-zone']['name'][$i]);
        # 檢查檔案是否已經存在
        // echo '檔名 : ' . $fileName . '<br/>';

        if (file_exists('upload/' . $_FILES['input-zone']['name'][$i])) {
            $fileName = substr($fileName, 0, -4);
            $j = 1;
            while (file_exists('upload/' . $fileName . '_' . $j . '.sac'))
                $j++;
            $dest = 'upload/' . $fileName . '_' . $j . '.sac';
        } else
            $dest = 'upload/' . $fileName;

        # 將檔案移至指定位置
        move_uploaded_file($file, $dest);
        array_push($paths, $dest);
        # sac2xy
        $sacCMD = '/home/andy/bin/sac2xy ' . $dest . ' ' . $dest;
        // $strr = ' 2>&1';
        $exportSACAUX = 'export SACAUX=/home/andy/pgm/sac/aux';
        // echo '指令 : ' . $sacCMD . '<br/>';
        # normalize false
        exec($exportSACAUX . ';' . $sacCMD . '.n0xy 0', $output, $retval);
        # normalize true
        exec($exportSACAUX . ';' . $sacCMD . '.n1xy 1', $output, $retval);
        // echo  "狀態碼 :  $retval  <br/>";

    } else {
        echo json_encode('錯誤代碼：' . $_FILES['input-zone']['error'] . '<br/>');
    }
}
echo json_encode($paths);
// sac2xy 201602051950.TW.0000549.BN1.sac 201602051950.TW.0000549.BN1.sac.xy 0
