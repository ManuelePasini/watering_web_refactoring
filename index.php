<?php

session_start();

if(isset($_SESSION["userId"]))
    header("Location: monitoring.php");
?>

<!doctype html>
<html lang="en">
<head>
    <link rel="shortcut icon" type='image/x-icon' href="favicon.ico"/>
    <title>Monitoraggio idrico Login</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Libraries CSS -->
    <link rel="stylesheet" href="css/lib/bootstrap.min.css">

    <!-- Own CSS -->
    <link rel="stylesheet" href="css/index.css">

</head>
<body>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark d-flex justify-content-between">
    <a class="navbar-brand flex-fill" href="#"> Monitoraggio idrico </a>
    <a class="navbar-brand" href="http://big.csr.unibo.it"> <img src="img/10simple.png" height="40" alt=""> </a>
</nav>
<div id="loginContainer">
    <form id="formLogin" class="form-signin">
        <img class="mb-4" src="img/big2018.png" alt="" width="100"><br>
        <h4 class="h4 mb-3 font-weight-normal">Inserisci le credenziali</h4>
        <label for="inputEmail" class="sr-only">Email</label>
        <input type="text" id="inputEmail" class="form-control" placeholder="Email" required autofocus>
        <label for="inputPassword" class="sr-only">Password</label>
        <input type="password" id="inputPassword" class="form-control" placeholder="Password" required>
        <div id="alertCredentials" class="alert alert-danger" role="alert" style="display:none">
            Email e/o Password errate.
        </div>
        <button class="btn btn-lg btn-primary btn-block" type="submit">Login</button>
    </form>
</div>


<!-- Libraries JS -->
<script src="js/lib/jquery-3.4.1.min.js"></script>
<script src="js/lib/popper.min.js"></script>
<script src="js/lib/bootstrap.min.js"></script>
<script src="js/lib/sha512.min.js"></script>

<!-- Own JS -->
<script type="text/javascript">
    var url = "<?php echo $_SESSION['url']; ?>";
</script>
<script src="js/index.js"></script>

</body>
</html>