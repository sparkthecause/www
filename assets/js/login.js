$(document).ready(function() {

    Handlebars.registerHelper('dollars', function( item, options ) {
        return numeral( item ).divide( 100 ).format('$0,0.00');
    });

});

$('#loginBtn').on('click', function(e) {

    if ( validateLoginForm() ) {

        e.preventDefault();

        $.ajax({
            "type": "POST",
            "url": "https://api-dev.sparkthecause.com/v1/login",
            "dataType": 'json',
            "data": {
                "email": $("#emailTxt").val(),
                "password": $("#passwordTxt").val()
            }
        }).done( function( user_id ) {

            $.ajax({
                "type": "GET",
                "url": "https://api-dev.sparkthecause.com/v1/users/" + user_id.user_id,
                "dataType": 'json',
                headers: {
                  "Authorization": "Basic " + btoa( $("#emailTxt").val() + ':' + $("#passwordTxt").val() )
                }
            }).done( function( user ) {

                // Load UI data with handlebars
                $("#content").render( "account", user );

            })
            .fail( function() {
                sweetAlert("Whoops!", "We ran into an issue grabbing your account info. We're really sorry! Please refresh the page and try again or contact us for a helping hand.", "warning");
            });

        })
        .fail( function() {
            sweetAlert("Whoops!", "That email address and password don't seem to match", "warning");
        });

    }

});

function validateLoginForm() {

    if ( document.getElementById("loginForm").checkValidity() ) {
        return true;
    }
    else if ( $("#emailTxt").val() === "" ) {
        sweetAlert("Whoops!", "Please enter a valid email address", "warning");
        return false;
    }
    else if ( $("#passwordTxt").val() === "" ) {
        sweetAlert("Whoops!", "Please enter a valid password", "warning");
        return false;
    }
    else {
        sweetAlert("Whoops!", "Please be sure you entered a valid email address and password", "warning");
        return false;
    }

}

$('#logoutBtn').on('click', function(e) {

    // clear cookies

    $("#login").removeClass("hidden");
    $("#manage").addClass("hidden");
    $("#cause-history").addClass("hidden");
    $("#social").addClass("hidden");

});