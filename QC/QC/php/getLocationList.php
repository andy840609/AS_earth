<?php
include_once '../../owasp/csrf-protector-php/libs/csrf/csrfprotector.php';

$nw = $_POST['nw'];
require("../functions.php");
if (!isset($nw)){
	echo '{}';
	HTTPStatus(400);
	exit();
}
if(checkNetwork($nw) != false){
	$network = checkNetwork($nw);
}else{
	echo '{}';
	HTTPStatus(400);
	exit();
}

if (isset($_POST['st'])){
	$st = $_POST['st'];
	$checkSt = checkStation($st,$network);
	if ($checkSt == false){
		echo '{}';
		HTTPStatus(400);
		exit();
	}else{
		$station = $checkSt['code'];
		$st_id = $checkSt['id'];
	}
}

//$network = "CWBSN";

require("../sqliconnect.php");

if (isset($station)){
	$sqllocList =  "SELECT DISTINCT `".$network."_Instrument_list`.`location`
		FROM `".$network."_Instrument_list` 
		LEFT JOIN `".$network."_station_list` 
		ON `".$network."_station_list`.`id` = `".$network."_Instrument_list`.`station_id` 
		WHERE `".$network."_station_list`.`station_code` = ? AND `".$network."_station_list`.`id` = ? ORDER BY `".$network."_Instrument_list`.`location`";
	$stmt = $mysqli->prepare($sqllocList);
	$stmt->bind_param('si', $station,$st_id);
}else{
	$sqllocList="SELECT DISTINCT `location` FROM `".$network."_Instrument_list` WHERE `visible` = 1 ORDER BY `location`";
	$stmt = $mysqli->prepare($sqllocList);
	
}
$stmt->execute();
$result1 = $stmt->get_result();

//$result1 = mysqli_query ($link, $sqllocList) or die("Couldn't execute query.".mysqli_error());

$locArray = array();
while ($data = mysqli_fetch_array($result1)) {
	//var_dump($data);
	$locArray[]= $data['location'];
	
}


echo json_encode($locArray);



?>