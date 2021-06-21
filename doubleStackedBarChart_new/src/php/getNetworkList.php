<?php
require("./sqliconnect.php");
$sql = "SELECT * FROM `network_list` WHERE `visible` = 1";
$stmt = $mysqli->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();


$rtArray = array();
while ($data = mysqli_fetch_assoc($result)) {
	$netArray = array();
	$network = $data['network_code'];
	if (filter_var($network, FILTER_SANITIZE_STRING) === false) {
		echo '{"status":0,"error_code":"illegal character in network"}';
		exit();
	} else {
		$network = filter_var($network, FILTER_SANITIZE_STRING);
	}
	$sql2 = "SELECT COUNT(*) FROM `" . $network . "_station_list` WHERE `visible` = 1";
	$stmt2 = $mysqli->prepare($sql2);
	$stmt2->execute();
	$result2 = $stmt2->get_result();
	$stmt2->close();


	$countAr = mysqli_fetch_assoc($result2);
	$count = $countAr['COUNT(*)'];
	$netArray = array(
		"network_code"	=> $data['network_code'],
		"name"	=> 	array(
			'zh' => $data['chinese_name'],
			'en' => $data['english_name']
		),
		"description"	=> $data['description'],
		"color"			=> $data['color'],
		"image"			=> $data['image'],
		"station_number" => $count
	);
	$rtArray[] = $netArray;
}

echo json_encode($rtArray);


mysqli_close($link);
