<?php
include('constants_postgres.php');
$result = array();
$sql = "select distinct \"refStructureName\", \"companyName\", \"fieldName\", \"plantNum\", \"plantRow\", 
        \"value_original\", \"value_bilinear_frame\", \"value_bilinear_cell\", \"yy\", \"xx\", \"timestamp\" " .
       "from data_interpolated " .
       "where \"refStructureName\" = '" . pg_escape_string($_GET["refStructureName"]) . "'"
            . " and \"companyName\" = '" . pg_escape_string($_GET["companyName"]) . "'"
            . " and (\"fieldName\" = '' or \"fieldName\" = '" . pg_escape_string($_GET["fieldName"]) . "')"
            . " and \"plantNum\" = " . $_GET["plantNum"] . " "
            . " and \"plantRow\" = '" . $_GET["plantRow"] . "'"
            . " and \"timestamp\" = " . $_GET["timestamp"] . " "
        . " order by \"refStructureName\", \"companyName\", \"fieldName\", \"plantNum\", \"plantRow\", \"timestamp\", \"yy\", \"xx\"";
//echo $sql;
$query_result = run_query($dbconn, $sql);
$res = Array();
while ($row = fetch_row($query_result)) {
    $res[] = $row; // array_values($row);
}
echo json_encode($res);
?>