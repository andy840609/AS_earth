<?php
$network = $_POST['nw'];
if (isset($_POST['st'])){
	$station = $_POST['st'];
}
//$network = "CWBSN";
if (!isset($network)){
	exit();
}
require("./sqliconnect.php");

$sqllocList="SELECT DISTINCT `location` FROM `".$network."_Instrument_list` ORDER BY `location`";
if (isset($station)){
	$sqllocList =  "SELECT DISTINCT `".$network."_Instrument_list`.`location`
					FROM `".$network."_Instrument_list` 
					LEFT JOIN `".$network."_station_list` 
					ON `".$network."_station_list`.`id` = `".$network."_Instrument_list`.`station_id` 
					WHERE `".$network."_station_list`.`station_code` = '".$station."' ORDER BY `".$network."_Instrument_list`.`location`";
}


$result1 = mysqli_query ($link, $sqllocList) or die("Couldn't execute query.".mysqli_error());

$locArray = array();
while ($data = mysqli_fetch_array($result1)) {
	//var_dump($data);
	$locArray[]= $data['location'];
	
}


echo json_encode($locArray);



?>