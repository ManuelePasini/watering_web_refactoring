<?php
include('constants_postgres.php');
$result = array();
$sql = "select distinct \"refStructureName\", \"companyName\", \"fieldName\", \"detectedValueTypeDescription\", "
            . "\"plantNum\", \"plantRow\", \"colture\", \"coltureType\", AVG(\"value\") as value, \"timestamp\" "
            . "from view_data_original "
            . "where "
                    . "\"detectedValueTypeId\" = 'GRND_TEMP' and \"timestamp\" >= " . $_GET["time_filter"]
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
//echo $sql;
$query_result = run_query($dbconn, $sql);
$res = Array();
while ($row = fetch_row($query_result)) {
    $res[] = $row;
}
echo json_encode($res);
?>