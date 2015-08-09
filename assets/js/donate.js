$('#cta').on('click', function(e) {

    var donation = numeral( numeral().unformat( $("#cta input").val() || "5" ) );
    $("#donationTxt").val( donation.format("0,0.00") );

});

var handler = StripeCheckout.configure({
    key: 'pk_test_fO3iJRyPAwmsujv8tId30Y2v',
    image: '/assets/img/checkout.png',
    token: function(token) {
        $.ajax({
            "type": "POST",
            "url": "https://api.sparkthecause.com/v1/register",
            "dataType": 'json',
            "data": {
                "token": token,
                "email": $("#emailTxt").val(),
                "password": $("#passwordTxt").val(),
                "donation": numeral( numeral().unformat( $("#donationTxt").val() ) ).multiply( 100 ).value(),
                "tip": numeral( numeral().unformat( $("#tipSelect").val() ) ).multiply( 100 ).value()
            }
        }).done( function() {
            sweetAlert({
                "title": "Woohoo!",
                "text": "Thank you for joining Spark the Cause!<br>You should receive a welcome email shortly.",
                "type": "success",
                "html": true
            });
        })
        .fail( function() {
            sweetAlert("Whoops!", "Something went wrong during signup. Don't worry, your card has not been charged. Try refreshing the page and trying again, or contact us and we would be happy to help you out.", "warning");
        });
    }
});

$('#donateBtn').on('click', function(e) {

    if ( validateDonationForm() ) {

        $('#donationModal').modal('hide');

        var donation = numeral( numeral().unformat( $("#donationTxt").val() ) );
        var tip = numeral( numeral().unformat( $("#tipSelect").val() ) );

        handler.open({
            name: 'Spark the Cause',
            description: 'Monthly Donation & Tip',
            email: $("#emailTxt").val(),
            amount: donation.multiply( 100 ).value() + tip.multiply( 100 ).value(),
            allowRememberMe: false,
            panelLabel: "Donate"
        });
        e.preventDefault();

    }

});

function validateDonationForm() {

    if ( document.getElementById("donationForm").checkValidity() ) {
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
    else if ( $("#donationTxt").val() === "" || numeral( numeral().unformat( $("#donationTxt").val() ) ).multiply( 100 ).value() < 100 ) {
        sweetAlert("Whoops!", "Please enter a valid donation of $1 or more", "warning");
        return false;
    }
    else {
        sweetAlert("Whoops!", "Please be sure you entered a valid email address, password, and donation", "warning");
        return false;
    }

}

// Close Checkout on page navigation
$(window).on('popstate', function() {
    handler.close();
});
