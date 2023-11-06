<?php
header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
// tecdb2 資料庫
$hostname = '192.168.211.124';
$user = 'andy';
$pass = 'Tecdb@7005';

$dbname = 'seis';
global $link;
$link = mysqli_connect($hostname, $user, $pass, $dbname); //or die('Could not connect to MySQL: ' . mysqli_error()); 
$mysqli = new mysqli($hostname, $user, $pass, $dbname);
mysqli_set_charset($link, "utf8"); //設定編碼為utf-8
mysqli_set_charset($mysqli, "utf8");
date_default_timezone_set("Asia/Taipei");

//mysqli_query("SET NAMES utf8", $link); 
//mysqli_query("SET character set utf-8",$link);
//mysqli_query("SET CHARACTER_SET_database= utf8",$link);
//mysqli_query("SET CHARACTER_SET_CLIENT= utf8",$link);
//mysqli_query("SET CHARACTER_SET_RESULTS= utf8",$link);
