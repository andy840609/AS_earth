<?php
$newStr = implode(" ", $_POST);
file_put_contents("../../data/datafile/rank/records.txt", "\n" . $newStr, FILE_APPEND);
