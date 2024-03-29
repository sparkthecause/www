$(document).ready(function() {

    Handlebars.registerHelper('dollars', function( value ) {
        return numeral( value ).divide( 100 ).format('0,0.00');
    });

    Handlebars.registerHelper('selected', function( value1, value2 ) {
        return ( value1.toString() === value2.toString() ) ? ' selected' : '';
    });

    queryObject = {};

    if ( window.location.search.length > 1 ) {
        for (var aItKey, nKeyId = 0, aCouples = window.location.search.substr(1).split("&"); nKeyId < aCouples.length; nKeyId++) {
            aItKey = aCouples[nKeyId].split("=");
            queryObject[decodeURIComponent(aItKey[0])] = aItKey.length > 1 ? decodeURIComponent(aItKey[1]) : "";
        }
    }

    if ( queryObject.email && queryObject.token ) { // forgotten password

        $("#content").render( "reset" );

    } else { // normal login

        var emailCookie = Cookies.get( "email" );
        var passwordCookie = Cookies.get( "password" );

        if ( emailCookie && passwordCookie ) {
            login( emailCookie, passwordCookie );
        } else {
            $("#content").render( "login" );
        }

    }

});

$(document).on( 'click', '#forgotBtn', function() {

    swal({
        title: "Forgot your password?",
        text: "Send a password reset email to:",
        type: "input",
        showCancelButton: true,
        inputValue: $("#emailTxt").val(),
        confirmButtonText: "Send Email"
    }, function( inputValue ) {

        if ( inputValue === false ) return false;

        if (inputValue === "") {
            swal.showInputError("You need to write something!");
            return false
        }

        $.ajax({
            "type": "GET",
            "url": "https://api.sparkthecause.com/v1/reset?email=" + inputValue,
        }).done( function( response ) {

            swal( "Sent!", "Check your email ( " + inputValue + " ) for a password reset link.", "success");

        })
        .fail( function() {

            sweetAlert("Whoops!", "That email address isn't in our system.", "warning");

        });

    });

});

$(document).on( 'click', '#resetPasswordBtn', function( e ) {

    e.preventDefault();

    $.ajax({
        "type": "POST",
        "url": "https://api.sparkthecause.com/v1/reset",
        "dataType": 'json',
        "data": {
            "email": queryObject.email,
            "token": queryObject.token,
            "password": $("#passwordTxt").val()
        },
    }).done( function( response ) {

        swal({
            "title": "Saved!",
            "text": "Click 'ok' to go to your account.",
            "type": "success"
        }, function() {

            login( queryObject.email, $("#passwordTxt").val() );

        });

    })
    .fail( function() {

        sweetAlert( "Whoops!", "Could not change your password. Please refresh and try again or send us an email ( support@sparkthecause.com ).", "warning" );

    });

});

$(document).on( 'click', '#loginBtn', function( e ) {

    e.preventDefault();

    if ( validateLoginForm() ) {

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
            "url": "https://api.sparkthecause.com/v1/users",
            "dataType": 'json',
            "headers": {
              "Authorization": "Basic " + btoa( email + ':' + password )
            }
        }).done( function( users ) {

            var user = users.users[0];
            // Load UI data with handlebars
            if ( user.is_monthly ) {
                $("#content").render( "account", user );
            } else {
                $("#content").render( "one-timer", user );
            }

        })
        .fail( function() {
            sweetAlert("Whoops!", "We ran into an issue grabbing your account info. We're really sorry! Please refresh the page and try again or contact us for a helping hand.", "warning");
            $("#content").render( "login" );
        });

    })
    .fail( function() {
        sweetAlert("Whoops!", "That email address and password don't seem to match", "warning");

        Cookies.remove( "email" );
        Cookies.remove( "password" );

        $("#content").render( "login", {
            "email": $("#emailTxt").val()
        });
    });

}

$(document).on( 'click', '#logoutBtn', function() {

    Cookies.remove( "email" );
    Cookies.remove( "password" );

    location.reload();

});

var handler = StripeCheckout.configure({
    key: 'pk_live_Wr0hlRAewCXSRdiL8BDTYmK8',
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
            "email": $("#emailTxt").val() || undefined,
            "password": $("#passwordTxt").val() || undefined,
            "token": $("#tokenTxt").val() || undefined,
            "donation": numeral( numeral().unformat( $("#donationTxt").val() ) ).multiply( 100 ).value(),
            "tip": numeral( numeral().unformat( $("#tipSelect").val() ) ).multiply( 100 ).value()
        };

        var emailCookie = Cookies.get( "email" );
        var passwordCookie =Cookies.get( "password" );

        $.ajax({
            "type": "PUT",
            "url": "https://api.sparkthecause.com/v1/users/",
            "dataType": 'json',
            "data": jsonData,
            "headers": {
              "Authorization": "Basic " + btoa( emailCookie + ':' + passwordCookie )
            }
        }).done( function() {

            if ( $("#emailTxt").val() ) {
                Cookies.set( "email", $("#emailTxt").val(), { expires: 14 } );
            }

            if ( $("#passwordTxt").val() ) {
                Cookies.set( "password", $("#passwordTxt").val(), { expires: 14 } );
            }

            sweetAlert({
                "title": "Success!",
                "text": "Your account has been updated, give yourself a hi-five.",
                "type": "success"
            }, function() {
                $("#accountModal").modal("hide");
                location.reload();
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

$(document).on( 'click', '#convertBtn', function() {

    var emailCookie = Cookies.get( "email" );
    var passwordCookie =Cookies.get( "password" );

    $.ajax({
        "type": "PUT",
        "url": "https://api.sparkthecause.com/v1/users/",
        "dataType": 'json',
        "data": {
            "frequency": "monthly"
        },
        "headers": {
          "Authorization": "Basic " + btoa( emailCookie + ':' + passwordCookie )
        }
    }).done( function() {

        sweetAlert({
            "title": "Success!",
            "text": "Thank you for becoming a monthly member! You just racked up some serious karma.",
            "type": "success"
        }, function() {
            location.reload();
        });

    })
    .fail( function() {
        sweetAlert("Whoops!", "Something went wrong. Refresh the page and try again, or contact us - we would be happy to help you out.", "warning");
    });

});

// Close Checkout on page navigation
$(window).on('popstate', function() {
    handler.close();
});
