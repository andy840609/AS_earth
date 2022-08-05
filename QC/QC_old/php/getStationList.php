<?php

$network = $_POST['network_code'];

if (isset($_POST['col'])){
	$col = $_POST['col'];
}


//$network = "TSMIP";

if(!isset($network)){exit();}
require("./sqliconnect.php");
if (isset($_POST['col']) && $col == 'cd'){
	
	$sql = "SELECT `station_code` FROM `".$network."_station_list` WHERE `visible` = 1 ORDER BY `station_code`";
	
}else{
	$sql = "SELECT * FROM `".$network."_station_list` WHERE `visible` = 1 ORDER BY `station_code`";
}

$result = mysqli_query ($link, $sql) or die("Couldn't execute query.".mysqli_error());
$rtArray=array();
if (isset($col)){
	$colArray = explode(",",$col);
}


while ($data = mysqli_fetch_assoc($result)) {
	
	if (isset($colArray) and sizeof($colArray) == 1){
		if ($col == 'cd'){
			$rtArray[] = $data['station_code'];
		}else{
			$data['lat']=round($data['lat'],5);
			$data['lon']=round($data['lon'],5);
			$rtArray[] = $data;
		}
		
	}else{
		$data['lat']=round($data['lat'],5);
		$data['lon']=round($data['lon'],5);
		$rtArray[] = $data;
	}
	
}
echo json_encode($rtArray);
?>