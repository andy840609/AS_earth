<?php
// ini_set('memory_limit', '-1');
header('Access-Control-Allow-Origin:*');
header("Access-Control-Allow-Credentials:true");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT,DELETE,OPTIONS');
header("Content-type: text/json; charset=utf-8");
require("./sqliconnect.php");


// 111.195*SQRT(POWER(`Latitude`- ? ,2)+POWER(COS(PI()/180  ?)(`Longitude` - ? ),2)) <= ?";

// 	$dbname = 'seis';
// 	$sql =  "SELECT * FROM `event` WHERE `date` >= ? AND `date` <= ?";
// 	$sql.= " AND 111.195*SQRT(POWER(`Latitude`- ? ,2)+POWER(COS(PI()/180  ?)(`Longitude` - ? ),2)) <= ?";
// 	$sql .= " AND `ML` <= ?";
// 	$sql .= " AND `ML` >= ?";
// 	$sql .= " AND `depth` <= ?";
// 	$sql .= " AND `depth` >= ?";

// bind_param('ssdddddddd', $stdate,$eddate,$circlelat,$circlelat,$circlelon,$radius,$maxMag,$minMag,$maxdep,$mindep);	//帶入參數

if (isset($_POST['stdate']))
	$stdate = $_POST['stdate'];
else
	$stdate = "1990-01-01";
if (isset($_POST['eddate']))
	$eddate = $_POST['eddate'];
else
	$eddate = "1990-05-05";

$sql = "SELECT * FROM `event` WHERE `date` >= '" . $stdate . "' AND `date` <= '" . $eddate . "'";

if (isset($_POST['stlat'])) {
	$stlat = $_POST['stlat'];
	$sql .= "AND `latitude` >= '" . $stlat 	. "'";
}
if (isset($_POST['edlat'])) {
	$edlat = $_POST['edlat'];
	$sql .= "AND `latitude` <= '" . $edlat . "'";
}
if (isset($_POST['stlon'])) {
	$stlon = $_POST['stlon'];
	$sql .= "AND `longitude` >= '" . $stlon . "'";
}
if (isset($_POST['edlon'])) {
	$edlon = $_POST['edlon'];
	$sql .= "AND `longitude` <= '" . $edlon . "'";
}
if (isset($_POST['ML'])) {
	$ML = $_POST['ML'];
	$sql .= "AND `ML` >= '" . $ML . "'";
}
// echo json_encode($sql);

$result = mysqli_query($link, $sql) or die("Couldn't execute query." . mysqli_error());

$rtArray = array();
while ($data = mysqli_fetch_assoc($result)) {
	$rtArray[] = $data;
}

echo json_encode($rtArray);
