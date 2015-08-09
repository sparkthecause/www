$(document).ready(function() {

    Handlebars.registerHelper('dollars', function( value ) {
        return numeral( value ).divide( 100 ).format('0,0.00');
    });

    Handlebars.registerHelper('selected', function( value1, value2 ) {
        return ( value1.toString() === value2.toString() ) ? ' selected' : '';
    });

    var emailCookie = Cookies.get( "email" );
    var passwordCookie =Cookies.get( "password" );

    if ( emailCookie && passwordCookie ) {
        login( emailCookie, passwordCookie );
    }

});

$('#loginBtn').on('click', function(e) {

    if ( validateLoginForm() ) {

        e.preventDefault();

        login( $("#emailTxt").val(), $("#passwordTxt").val() );

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

function login( email, password ) {

    $.ajax({
        "type": "POST",
        "url": "https://api.sparkthecause.com/v1/login",
        "dataType": 'json',
        "data": {
            "email": email,
            "password": password
        }
    }).done( function( user_id ) {

        Cookies.set( "email", email, { expires: 14 } );
        Cookies.set( "password", password, { expires: 14 } );

        $.ajax({
            "type": "GET",
            "url": "https://api.sparkthecause.com/v1/users/" + user_id.user_id,
            "dataType": 'json',
            headers: {
              "Authorization": "Basic " + btoa( email + ':' + password )
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

$(document).on( 'click', '#logoutBtn', function() {

    Cookies.remove( "email" );
    Cookies.remove( "password" );

    location.reload();

});

var handler = StripeCheckout.configure({
    key: 'pk_test_fO3iJRyPAwmsujv8tId30Y2v',
    image: '/assets/img/checkout.png',
    token: function(token) {

        $("#tokenTxt").val( token.id );
        $("#paymentTxt").text( token.card.brand + " ending in ..." + token.card.last4 );

    }
});

$(document).on( 'click', '#newCardBtn', function() {

    if ( validateAccountForm() ) {

        handler.open({
            name: 'Spark the Cause',
            description: 'Monthly Donation & Tip',
            email: $("#emailTxt").val(),
            amount: 0,
            allowRememberMe: false,
            panelLabel: "Save Card"
        });

    }

});

$(document).on( 'click', '#updateBtn', function() {

    if ( validateAccountForm() ) {

        var jsonData = {
            "email": $("#emailTxt").val(),
            "password": $("#passwordTxt").val() || undefined,
            "token": $("#tokenTxt").val() || undefined,
            "donation": numeral( numeral().unformat( $("#donationTxt").val() ) ).multiply( 100 ).value(),
            "tip": numeral( numeral().unformat( $("#tipSelect").val() ) ).multiply( 100 ).value()
        };

        console.log(jsonData);

        $.ajax({
            "type": "PUT",
            "url": "https://api.sparkthecause.com/v1/users/",
            "dataType": 'json',
            "data": jsonData
        }).done( function() {
            sweetAlert({
                "title": "Success!",
                "text": "Your account has been updated, give yourself a hi-five.",
                "type": "success"
            });
        })
        .fail( function() {
            sweetAlert("Whoops!", "Something went wrong. Refresh the page and try again, or contact us - we would be happy to help you out.", "warning");
        });

    }

});

function validateAccountForm() {

    if ( document.getElementById("accountForm").checkValidity() ) {
        return true;
    }
    else if ( $("#emailTxt").val() === "" ) {
        sweetAlert("Whoops!", "Please enter a valid email address", "warning");
        return false;
    }
    else if ( $("#donationTxt").val() === "" || numeral( numeral().unformat( $("#donationTxt").val() ) ).multiply( 100 ).value() < 100 ) {
        sweetAlert("Whoops!", "Please enter a valid donation of $1 or more", "warning");
        return false;
    }
    else {
        sweetAlert("Whoops!", "Please be sure you entered a valid email address and donation", "warning");
        return false;
    }

}

// Close Checkout on page navigation
$(window).on('popstate', function() {
    handler.close();
});
