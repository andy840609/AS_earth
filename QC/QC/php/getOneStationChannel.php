<?php
include_once '../../owasp/csrf-protector-php/libs/csrf/csrfprotector.php';

$nw = trim(htmlspecialchars($_POST['nw']));
$st = trim(htmlspecialchars($_POST['station']));
$loc = trim(htmlspecialchars($_POST['location']));
if (isset($_POST['all_index'])){
	$all_index = $_POST['all_index'];
	if (filter_var($all_index,FILTER_SANITIZE_STRING) === false){
		HTTPStatus(400);
	}else{
		$all_index = filter_var($all_index,FILTER_SANITIZE_STRING);
	}
}

if (!isset($nw) || !isset($loc) || !isset($st) ){
	HTTPStatus(400);
	exit();
}
include("../functions.php");
if(checkNetwork($nw) != false){
	$network = checkNetwork($nw);
}else{
	HTTPStatus(400);
	exit();
}
if ($st == 'all'){
	$checkSt['code'] = 'all';
}else{
	$checkSt = checkStation($st,$network);
}

if ($checkSt == false){
	var_dump( $checkSt);
	HTTPStatus(400);
	exit();
}else{
	$station = $checkSt['code'];
	$st_id = $checkSt['id'];
}

if (getLocationStr($loc,$network) != false){
	$location = getLocationStr($loc,$network);
}else{
	HTTPStatus(400);
	exit();
}

require("../sqliconnect.php");
if($loc != 'all' && $st == 'all'){
	$sql = "SELECT DISTINCT SUBSTR(`".$network."_Instrument_list`.`channel`,1,2) 
	FROM `".$network."_Instrument_list` 
	LEFT JOIN `".$network."_station_list` 
	ON `".$network."_station_list`.`id` = `".$network."_Instrument_list`.`station_id` 
	WHERE `".$network."_Instrument_list`.`location` = ?  ORDER BY `channel`";

	$stmt = $mysqli->prepare($sql);	
	$stmt->bind_param('s',$location);	
	$stmt->execute();
	$result = $stmt->get_result();
	$stmt->close();
}
else if ($loc == 'all'){
	$sql = "SELECT DISTINCT SUBSTR(`".$network."_Instrument_list`.`channel`,1,2) 
	FROM `".$network."_Instrument_list` 
	LEFT JOIN `".$network."_station_list` 
	ON `".$network."_station_list`.`id` = `".$network."_Instrument_list`.`station_id` 
	WHERE `".$network."_station_list`.`station_code` = ? AND `".$network."_station_list`.`id` = ? ORDER BY `channel`";

	$stmt = $mysqli->prepare($sql);	
	$stmt->bind_param('si', $station,$st_id);	
	$stmt->execute();
	$result = $stmt->get_result();
	$stmt->close();
}else if ($st == 'all'){
	$sql = "SELECT DISTINCT SUBSTR(`".$network."_Instrument_list`.`channel`,1,2) 
	FROM `".$network."_Instrument_list` 
	LEFT JOIN `".$network."_station_list` 
	ON `".$network."_station_list`.`id` = `".$network."_Instrument_list`.`station_id` 
	WHERE `".$network."_station_list`.`id` = ? AND  `".$network."_Instrument_list`.`location` = ?  ORDER BY `channel`";

	$stmt = $mysqli->prepare($sql);	
	$stmt->bind_param('is', $st_id,$location);	
	$stmt->execute();
	$result = $stmt->get_result();
	$stmt->close();
}else{
	

$sql = "SELECT DISTINCT SUBSTR(`".$network."_Instrument_list`.`channel`,1,2) 
FROM `".$network."_Instrument_list` 
LEFT JOIN `".$network."_station_list` 
ON `".$network."_station_list`.`id` = `".$network."_Instrument_list`.`station_id` 
WHERE `".$network."_station_list`.`station_code` = ? AND `".$network."_station_list`.`id` = ? AND  `".$network."_Instrument_list`.`location` = ?  ORDER BY `channel`";

$stmt = $mysqli->prepare($sql);	
$stmt->bind_param('sis', $station,$st_id,$location);	
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();
}

//$result = mysqli_query ($link, $sql) or die("Couldn't execute query.".mysqli_error());
$cheArray = array();
while ($data = mysqli_fetch_array($result)) {
	if (!isset($all_index) || $all_index == NULL ){
		$cheArray[]= $data[0]."?";
	}
	
	if($loc != 'all' && $st == 'all'){
		$sql2 = "SELECT DISTINCT `".$network."_Instrument_list`.`channel` 
		FROM `".$network."_Instrument_list` 
		LEFT JOIN `".$network."_station_list` 
		ON `".$network."_station_list`.`id` = `".$network."_Instrument_list`.`station_id` 
		WHERE   `".$network."_Instrument_list`.`location` = ? 
		AND SUBSTR(`".$network."_Instrument_list`.`channel`,1,2) = ? ORDER BY `channel`";
		
		$stmt2 = $mysqli->prepare($sql2);	
		$stmt2->bind_param('ss', $location,$data[0]);	
		$stmt2->execute();
		$result2 = $stmt2->get_result();
		$stmt2->close();
	}
	else if ($loc == 'all'){
		$sql2 = "SELECT DISTINCT `".$network."_Instrument_list`.`channel` 
		FROM `".$network."_Instrument_list` 
		LEFT JOIN `".$network."_station_list` 
		ON `".$network."_station_list`.`id` = `".$network."_Instrument_list`.`station_id` 
		WHERE `".$network."_station_list`.`station_code` = ? AND `".$network."_station_list`.`id` = ? 
		AND SUBSTR(`".$network."_Instrument_list`.`channel`,1,2) = ? ORDER BY `channel`";
		
		$stmt2 = $mysqli->prepare($sql2);	
		$stmt2->bind_param('sis', $station,$st_id,$data[0]);	
		$stmt2->execute();
		$result2 = $stmt2->get_result();
		$stmt2->close();
	}else if ($st == 'all'){
		$sql2 = "SELECT DISTINCT `".$network."_Instrument_list`.`channel` 
		FROM `".$network."_Instrument_list` 
		LEFT JOIN `".$network."_station_list` 
		ON `".$network."_station_list`.`id` = `".$network."_Instrument_list`.`station_id` 
		WHERE  `".$network."_station_list`.`id` = ? AND `".$network."_Instrument_list`.`location` = ? 
		AND SUBSTR(`".$network."_Instrument_list`.`channel`,1,2) = ? ORDER BY `channel`";
		
		$stmt2 = $mysqli->prepare($sql2);	
		$stmt2->bind_param('iss', $st_id,$location,$data[0]);	
		$stmt2->execute();
		$result2 = $stmt2->get_result();
		$stmt2->close();
	}else{
		
	
		$sql2 = "SELECT DISTINCT `".$network."_Instrument_list`.`channel` 
		FROM `".$network."_Instrument_list` 
		LEFT JOIN `".$network."_station_list` 
		ON `".$network."_station_list`.`id` = `".$network."_Instrument_list`.`station_id` 
		WHERE `".$network."_station_list`.`station_code` = ? AND `".$network."_station_list`.`id` = ? AND `".$network."_Instrument_list`.`location` = ? 
		AND SUBSTR(`".$network."_Instrument_list`.`channel`,1,2) = ? ORDER BY `channel`";
		
		$stmt2 = $mysqli->prepare($sql2);	
		$stmt2->bind_param('siss', $station,$st_id,$location,$data[0]);	
		$stmt2->execute();
		$result2 = $stmt2->get_result();
		$stmt2->close();
	}
	//$result2 = mysqli_query ($link, $sql2) or die("Couldn't execute query.".mysqli_error());
	while ($data = mysqli_fetch_array($result2)) {
		$cheArray[]= $data['channel'];
	}
	
	
	
}
echo json_encode($cheArray);
?>