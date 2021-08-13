<?php

$hostname = 'localhost';
$user = 'root';
$pass = '1qaz2wsx';

$dbname = 'test';
global $link;
$link = mysqli_connect($hostname, $user, $pass, $dbname); //or die('Could not connect to MySQL: ' . mysqli_error()); 
$mysqli = new mysqli($hostname, $user, $pass, $dbname);
mysqli_set_charset($link, "utf8"); //設定編碼為utf-8
mysqli_set_charset($mysqli, "utf8");
date_default_timezone_set("Asia/Taipei");
