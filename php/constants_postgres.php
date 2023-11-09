<?php
$constants = array(
    'raw_data' => array(
        'sql' => 'select distinct geojson, significativeid '
            . 'from [table] '
            . 'where repetition = 1 and [date_from_date_to_filter] and [hour_from_hour_to_filter] and [accuracy_from_accuracy_to_filter] and [device_filter] and [custom_query_filter]',
    ),
);

# %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
# DO NOT MODIFY THE FUNCTIONS BELOW
# %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
include('credentials_postgres.php');
$conn   = 'dbname=' . $db . ' host=' . $servername . ' port=5432 user=' . $username . ' password=' . $password;
$dbconn = pg_connect($conn);

function run_query($dbconn, $sql)
{
    return pg_query("set bytea_output='escape'; " . $sql);
}

function key_convention($key)
{
    return strtolower($key);
}

function fetch_row($result)
{
    return pg_fetch_assoc($result);
}

function conn_close($dbconn, $query_result, $output)
{
    echo pg_unescape_bytea($output);
    pg_free_result($query_result);
    pg_close($dbconn);
}

function handle_geom($geom)
{
    return $geom;
}
?>