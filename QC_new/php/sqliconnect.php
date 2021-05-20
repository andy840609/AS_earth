<?php 
// GDMS 資料庫
$hostname='140.109.80.59'; //// specify host, i.e. 'localhost'
$user='gdmsuser'; 				//// specify username
$pass='gdmsuser7005'; 				//// specify password 
 
$dbname='gdms';
global $link;
$link =mysqli_connect($hostname , $user , $pass , $dbname)or 
die('Could not connect to MySQL: ' . mysqli_error()); 

mysqli_set_charset($link, "utf8");//設定編碼為utf-8
date_default_timezone_set("Asia/Taipei");

//mysqli_query("SET NAMES utf8", $link); 
//mysqli_query("SET character set utf-8",$link);
//mysqli_query("SET CHARACTER_SET_database= utf8",$link);
//mysqli_query("SET CHARACTER_SET_CLIENT= utf8",$link);
//mysqli_query("SET CHARACTER_SET_RESULTS= utf8",$link);


?>