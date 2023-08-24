<?php
include_once '../../owasp/csrf-protector-php/libs/csrf/csrfprotector.php';

require("../functions.php");
if (!isset($_POST['network_code']) || empty($_POST['network_code'])){
	HTTPStatus(400);
	exit();
}else{
	$nw = $_POST['network_code'];
	if (checkNetwork($nw) != false){
		$network = checkNetwork($nw);
	}else{
		HTTPStatus(400);
		exit();
	}
}


if (isset($_POST['col'])){
	$col = $_POST['col'];
}


//$network = "TSMIP";

if(!isset($network)){exit();}
require("../sqliconnect.php");
if (isset($_POST['col']) && $col == 'cd'){
	
	$sql = "SELECT `station_code` FROM `".$network."_station_list` WHERE `visible` = 1 ORDER BY `station_code`";
	
}else{
	$sql = "SELECT * FROM `".$network."_station_list` WHERE `visible` = 1 ORDER BY `station_code`";
}
$stmt = $mysqli->prepare($sql);	
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();
$rtArray=array();
if (isset($col)){
	$colArray = explode(",",$col);
}
if ($result->num_rows == 0){
	HTTPStatus(204);
	exit();
}

while ($data = mysqli_fetch_assoc($result)) {
	$st_id = filter_var($data['id'],FILTER_SANITIZE_NUMBER_INT);
	unset($stmt);
	$sql2 = "SELECT MAX(`end_time`) FROM `".$network."_Instrument_list` WHERE `station_id` =?";
	$stmt = $mysqli->prepare($sql2);
	$stmt->bind_param('i', $st_id);	
	$stmt->execute();
	$result_maxdate = $stmt->get_result();
	$stmt->close();
	$dataMDT = mysqli_fetch_array($result_maxdate);
	$MAXdatetime = explode(" ",$dataMDT[0]);
	
	if (isset($colArray) and sizeof($colArray) == 1){
		if ($col == 'cd'){
			$rtArray[] = $data['station_code'];
		}else{
			$data['lat']=round($data['lat'],5);
			$data['lon']=round($data['lon'],5);
			$rtArray[] = $data;
		}
		
	}else{
		if ($network == "TSMIP"){
			$data['station_code_show'] = $data['station_code']."(".$data['TSMIP_code'].")";
		}else{
			$data['station_code_show'] = $data['station_code'];
		}
		$data['lat']=round($data['lat'],5);
		$data['lon']=round($data['lon'],5);
		$data['end_time'] = $MAXdatetime[0];
		$rtArray[] = $data;
	}
	
}
echo json_encode($rtArray);
?>