$('#formLogin').submit(function(e){
    e.preventDefault();
    $('#alertCredentials').hide();

    $.ajax({
        data: {
            email: $('#inputEmail').val(),
            password: sha512($('#inputPassword').val()),
        },
        type: 'post',
        url: "php/login.php",
        error: function(e){
            $('#alertCredentials').html('Si è verificato un errore.').show();
        },
        success: function(data) {
            var jsonData = JSON.parse(data);
            if(Object.keys(jsonData).length !== 0){
                if(url !== '')
                    window.location = url;
                else
                    $(location).attr('href', 'monitoring.php');
            }
            else
                $('#alertCredentials').html('Credenziali errate.').show();
        }
    });
})