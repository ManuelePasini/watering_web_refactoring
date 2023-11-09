<?php
include('constants_postgres.php');
$result = array();
$sql =  "select \"refStructureName\", \"companyName\", \"fieldName\", umidity_bin, timestamp, sum(count) as count " .
        "from umidity_bins " .
        "where \"timestamp\" >= " . $_GET["time_filter"] 
                        . " and \"refStructureName\" = '" . $_GET["refStructureName"] . "'"
                        . " and \"companyName\" = '"    . $_GET["companyName"] . "'"
                        . " and \"fieldName\" = '"      . $_GET["fieldName"] . "'"
                        . " and \"timestamp\" = "       . $_GET["timestamp"];
        "group by \"refStructureName\", \"companyName\", \"fieldName\", umidity_bin, timestamp " .
        "order by \"refStructureName\", \"companyName\", \"fieldName\", timestamp, umidity_bin";
$query_result = run_query($dbconn, $sql);
$res = Array();
while ($row = fetch_row($query_result)) {
    $res[] = $row; // array_values($row);
}
echo json_encode($res);
?>