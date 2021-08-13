<?php
require("./mysqlConnect.php");


$sql = "CALL `leafletSEARCH`('" .  $_POST["whereStr"] . "')";
// $result = mysqli_query($link, $sql);
$stmt = $mysqli->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();


$rtArray = array();
while ($data = mysqli_fetch_assoc($result)) {
    // $rtArray[] = $data;
    $rtArray[] = array(
        'no' =>  $data['no'],
        'station' => $data['name'],
        'county' => $data['city'],
        // 'lat' => $data['lat'],
        // 'lng' => $data['lng'],
        'coordinate' => array($data['lat'], $data['lng']),
    );
}
echo json_encode($rtArray);


mysqli_close($link);
