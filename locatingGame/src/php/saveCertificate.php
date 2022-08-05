<?php
$dataUrl = $_POST['imgUrl'];
$imgType = $_POST['imgType'];
$fileName = $_POST['fileName'] . '.' . $imgType;

$img = str_replace('data:image/' . $imgType . ';base64,', '', $dataUrl);
file_put_contents("../../certificate/" . $fileName, base64_decode($img));
echo $fileName;
