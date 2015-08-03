$('#cta').on('click', function(e) {

    var donation = numeral( numeral().unformat( $("#donationTxt").val() ) );
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
        });
    }
});

$('#donateBtn').on('click', function(e) {

    if ( validateDonationForm() ) {

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
        alert( "Please enter a valid email address" );
        return false;
    }
    else if ( $("#passwordTxt").val() === "" ) {
        alert( "Please enter a valid password" );
        return false;
    }
    else if ( $("#donationTxt").val() === "" || numeral( numeral().unformat( $("#donationTxt").val() ) ).multiply( 100 ).value() < 100 ) {
        alert( "Please enter a valid donation of $1 or more" );
        return false;
    }
    else {
        alert( "Please be sure you entered a valid email address, password, and donation" );
        return false;
    }

}

// Close Checkout on page navigation
$(window).on('popstate', function() {
    handler.close();
});
