<?php

// Check that user is logged in

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Save url
$url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
$_SESSION["url"] = $url;

// If not logged go to login
if(!isset($_SESSION["userId"]))
    header("Location: index.php");
    session_write_close();
?>

<!doctype html>
<html lang="en">
<head>
    <link rel="shortcut icon" type='image/x-icon' href="favicon.ico"/>
    <title>Monitoraggio idrico</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="css/lib/bootstrap.min.css">
    <link rel="stylesheet" href="css/lib/ol.css">
    <link rel="stylesheet" href="css/lib/Chart.min.css">
    <link rel="stylesheet" href="css/monitoring.css">

    <style id="compiled-css" type="text/css">
        th, td { border: 1px dotted; }
        th { font-weight : bold }
        .line {
            fill: none;
            stroke-width: 1px;
        }
        .dot {
            stroke: #fff;
            stroke-width: 1px;
        }
        .legend rect {
            fill:white;
            stroke:black;
            opacity:0.8;
        }
    </style>
</head>
<body>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark d-flex justify-content-between">
    <a class="navbar-brand flex-fill" href="#"> Monitoraggio idrico </a>
    <a class="navbar-brand" href="http://big.csr.unibo.it"> <img src="img/10simple.png" height="40" alt=""></a>
    <span class="navbar-text"  style="margin-right: 20px;">
      <?php echo $_SESSION['name'] . " " . $_SESSION['surname']; ?>
    </span>
    <a href="logout.php" class="btn btn-outline-info" role="button"> Logout </a>
</nav>
<div class="container">
    <div class="row" style="margin-top:10px;">
        <div class="col d-flex justify-content-center">
            <span style="margin-right:10px;">Show:</span>
            <div class="btn-group-toggle" data-toggle="buttons">
                <label class="btn btn-sm btn-secondary"><input type="radio" name="timefilter" value="timefilter_1_hour"  autocomplete="off">Ultime 24h</label>
                <label class="btn btn-sm btn-secondary active"><input type="radio" name="timefilter" value="timefilter_7_day" autocomplete="off" checked>Ultima settimana</label>
                <label class="btn btn-sm btn-secondary"><input type="radio" name="timefilter" value="timefilter_30_day"  autocomplete="off" >Ultimo mese</label>
                <label class="btn btn-sm btn-secondary"><input type="radio" name="timefilter" value="timefilter_700_day" autocomplete="off">Tutti i dati</label>
            </div>
        </div>
    </div>
    <div class="row" style="margin-top:10px;">
        <div class="col d-flex justify-content-center" >
            <span style="margin-right:10px;">Field:</span>
            <div class="dropdown">
                <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">refStructureId; companyName; fieldName; Installazione plantNum Fila plantRow; colture coltureType;</button>
                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" id="dropdown_fields"></div>
            </div>
        </div>
    </div>
    
    <div class="row" style="margin-top:10px;">
        <div id="my_dataviz" class="col col-12"></div>
    </div>
</div>

<!-- Libraries JS -->
<script src="js/lib/jquery-3.4.1.min.js"></script>
<script src="js/lib/underscore.1.10.2.js"></script>
<script src="js/lib/popper.min.js"></script>
<script src="js/lib/bootstrap.min.js"></script>
<script src="js/lib/d3.v4.min.js"></script>
<script src="js/lib/feather.min.js"></script>
<script src="js/lib/ol.js"></script>
<script src="js/lib/proj4.js"></script>
<script src="js/lib/moment.min.js"></script>
<script src="js/lib/Chart.min.js"></script>
<!--<script src="js/lib/d3-interpolate.1.4.0.js"></script>-->
<!--<script src="js/lib/d3-scale.3.2.1"></script>-->

<script src="https://d3js.org/d3-array.v2.min.js"></script>
<script src="https://d3js.org/d3-color.v1.min.js"></script>
<script src="https://d3js.org/d3-scale-chromatic.v1.min.js"></script>
<script src="https://d3js.org/d3-format.v1.min.js"></script>
<script src="https://d3js.org/d3-interpolate.v1.min.js"></script>
<script src="https://d3js.org/d3-time.v1.min.js"></script>
<script src="https://d3js.org/d3-time-format.v2.min.js"></script>
<script src="https://d3js.org/d3-scale.v3.min.js"></script>

<!-- Own JS -->
<script type="text/javascript">
    var loggedUserId = "<?php echo $_SESSION['userId']; ?>";
    <?php
        $queryStr = parse_url($_SESSION['url'], PHP_URL_QUERY);
        parse_str($queryStr, $queryParams);
        $queryParamsJson = json_encode($queryParams,JSON_HEX_APOS|JSON_HEX_QUOT);
    ?>
    var jsonAdvice = <?php echo $queryParamsJson ?>;
    for (var key of Object.keys(jsonAdvice)) {
        if(jsonAdvice[key]=="null")
            jsonAdvice[key]=null;
    }
    <?php
        unset($_SESSION['userId']);
        unset($_SESSION['url']);
    ?>
</script>
<script src="js/monitoring.js" charset="UTF-8"></script>
<script src="js/chart-multiline.js"></script>
<script src="js/chart-choose.js"></script>
<script src="js/chart-heatmap.js"></script>
</body>
</html>