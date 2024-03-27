<?php
require("./sqliconnect.php");

$eddate = date("Y-m-d");
// $sql = "SELECT * FROM `event` WHERE `date` >= '1990-01-01' AND `latitude` >= '21' AND `latitude` <= '26' AND `longitude` >= '118' AND `longitude` <= '124' AND `ML` >= '4'";

$sql = "SELECT * FROM `event` WHERE `date` >= '2022-01-01' AND `latitude` >= '21' AND `latitude` <= '26' AND `longitude` >= '118' AND `longitude` <= '124' AND `ML` >= '4'";

// echo json_encode($sql);
$result = mysqli_query($link, $sql) or die("Couldn't execute query." . mysqli_error());

$rtArray = array();
while ($data = mysqli_fetch_assoc($result)) {
	$rtArray[] = $data;
}
echo json_encode($rtArray);
