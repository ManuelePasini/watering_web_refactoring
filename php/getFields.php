<?php
include('constants_postgres.php');
$result = array();
$sql = "select distinct tf.\"refStructureName\", tf.\"companyName\", tf.\"fieldName\", tf.\"plantNum\", tf.\"plantRow\", \"colture\", \"coltureType\" "
    . "from transcoding_field as tf join ("
        . "select \"refStructureName\", \"companyName\", \"fieldName\", \"plantNum\", \"plantRow\" "
        . "from user_in_plant where \"userId\" = " . $_POST["userId"] . ") as sq "
    . "on tf.\"refStructureName\" = sq.\"refStructureName\" "
    . "and tf.\"companyName\" = sq.\"companyName\" "
    . "and (tf.\"fieldName\" is null or tf.\"fieldName\" = sq.\"fieldName\") "
    . "and tf.\"plantNum\" = sq.\"plantNum\" "
    . "and tf.\"plantRow\" = sq.\"plantRow\" "
    . "order by tf.\"refStructureName\", tf.\"companyName\", tf.\"fieldName\", tf.\"plantNum\", tf.\"plantRow\"";
//echo $sql;
$query_result = run_query($dbconn, $sql);
$res = Array();
while ($row = fetch_row($query_result)) {
    $res[] = $row;
}
echo json_encode($res);
?>