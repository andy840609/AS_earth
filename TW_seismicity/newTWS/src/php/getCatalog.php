<?php
error_log("Error message.", 3, "/var/tmp/my-errors.log");
require("./sqliconnect.php");

// $stlat = $_POST['stlat'];
// $edlat = $_POST['edlat'];
// $stlon = $_POST['stlon'];
// $edlon = $_POST['edlon'];
// $ML = $_POST['ML'];

if (isset($_POST['stdate']))
	$stdate = $_POST['stdate'];
else
	$stdate = "1990-1-1";
if (isset($_POST['eddate']))
	$eddate = $_POST['eddate'];
else
	$eddate = date("Y-m-d");

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
