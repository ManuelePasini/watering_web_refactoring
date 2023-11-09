<?php
include('constants_postgres.php');
$result = array();
$sql = "select distinct \"refStructureName\", \"companyName\", \"fieldName\", \"detectedValueTypeDescription\", "
    . "\"plantNum\", \"plantRow\", \"colture\", \"coltureType\", timestamp, AVG(64.3 * value -15.2) as value "
    . " from view_data_original "
    . " where \"detectedValueTypeId\" = 'ELECT_COND' "
        . " and \"timestamp\" >= " . $_GET["time_filter"] 
        . " and \"refStructureName\" = '" . pg_escape_string($_GET["refStructureName"]) . "'"
        . " and \"companyName\" = '" . pg_escape_string($_GET["companyName"]) . "'"
        . " and (\"fieldName\" is null or \"fieldName\" = '" . pg_escape_string($_GET["fieldName"]) . "')"
        . " and \"plantNum\" = " . $_GET["plantNum"] . " "
        . " and \"plantRow\" = '" . $_GET["plantRow"] . "'"
        . " and \"colture\" = '" . $_GET["colture"] . "'"
        . " and \"coltureType\" = '" . $_GET["coltureType"] . "'"
    . " group by \"refStructureName\", \"companyName\", \"fieldName\", \"detectedValueTypeDescription\", "
    . "\"plantNum\", \"plantRow\", \"colture\", \"coltureType\", \"timestamp\" "
    . " order by timestamp asc";
$query_result = run_query($dbconn, $sql);
$res = Array();
while ($row = fetch_row($query_result)) {
    $res[] = $row;
}
echo json_encode($res);
?>