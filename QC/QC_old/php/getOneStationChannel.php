<?php

$network = $_POST['nw'];
$station = $_POST['station'];
$location = $_POST['location'];
$all_index = $_POST['all_index'];
if (!isset($network) || !isset($location) || !isset($station) ){
	exit();
}
require("./sqliconnect.php");
$sql = "SELECT DISTINCT SUBSTR(`".$network."_Instrument_list`.`channel`,1,2) 
FROM `".$network."_Instrument_list` 
LEFT JOIN `".$network."_station_list` 
ON `".$network."_station_list`.`id` = `".$network."_Instrument_list`.`station_id` 
WHERE `".$network."_station_list`.`station_code` = '".$station."' AND  `".$network."_Instrument_list`.`location` = '".$location."'  ORDER BY `channel`";


$result = mysqli_query ($link, $sql) or die("Couldn't execute query.".mysqli_error());
$cheArray = array();
while ($data = mysqli_fetch_array($result)) {
	if ($all_index == NULL || !isset($all_index)){
		$cheArray[]= $data[0]."?";
	}
	$sql2 = "SELECT DISTINCT `".$network."_Instrument_list`.`channel` 
	FROM `".$network."_Instrument_list` 
	LEFT JOIN `".$network."_station_list` 
	ON `".$network."_station_list`.`id` = `".$network."_Instrument_list`.`station_id` 
	WHERE `".$network."_station_list`.`station_code` = '".$station."' AND  `".$network."_Instrument_list`.`location` = '".$location."' 
	AND SUBSTR(`".$network."_Instrument_list`.`channel`,1,2) ='".$data[0]."' ORDER BY `channel`";

	$result2 = mysqli_query ($link, $sql2) or die("Couldn't execute query.".mysqli_error());
	while ($data = mysqli_fetch_array($result2)) {
		$cheArray[]= $data['channel'];
	}
	
	
	
}
echo json_encode($cheArray);
?>