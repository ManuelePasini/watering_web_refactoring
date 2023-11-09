<?php
include('constants_postgres.php');
$result = array();
$sql = "select distinct \"refStructureName\", \"companyName\", \"fieldName\", \"plantNum\", \"plantRow\", 
    \"timestamp\", \"count\", \"umidity_bin\", \"is_left\", \"is_top\" "
        . " from humidity_bins "
        . " where \"timestamp\" >= " . $_GET["time_filter"]
            . " and \"refStructureName\" = '" . pg_escape_string($_GET["refStructureName"]) . "'"
            . " and \"companyName\" = '" . pg_escape_string($_GET["companyName"]) . "'"
            . " and (\"fieldName\" = '' or \"fieldName\" = '" . pg_escape_string($_GET["fieldName"]) . "')"
            . " and \"plantNum\" = " . $_GET["plantNum"] . " "
            . " and \"plantRow\" = '" . $_GET["plantRow"] . "'"
        . " order by \"fieldName\" asc, \"timestamp\" asc, \"umidity_bin\" asc, \"is_top\" desc, \"is_left\" asc";
//echo $sql;
$query_result = run_query($dbconn, $sql);
$res = Array();
while ($row = fetch_row($query_result)) {
    $res[] = $row; // array_values($row);
}
echo json_encode($res);
?>