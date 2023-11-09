<?php
include('constants_postgres.php');
$result = array();
$sql = "select \"userId\", password, name, surname from watering_user where email = '" . pg_escape_string($_POST["email"]) . "'";
//echo $sql;
$query_result = run_query($dbconn, $sql);
$res = Array();
while ($row = fetch_row($query_result)) {
    $res[] = $row;
}
if(count($res) != 1)
    echo json_encode(array(), JSON_FORCE_OBJECT);
else{
    if($res[0]["password"] != $_POST["password"])
        echo json_encode(array(), JSON_FORCE_OBJECT);
    else{
        session_start();
        $_SESSION["userId"] = $res[0]["userId"];
        $_SESSION["name"] = $res[0]["name"];
        $_SESSION["surname"] = $res[0]["surname"];
        echo json_encode($res[0]);
    }
}
?>
