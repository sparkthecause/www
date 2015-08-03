$('#cta').on('click', function(e) {

    var raw_donation = numeral().unformat( $("#cta input").val() || "5" );
    var donation = numeral( raw_donation );

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
});

// Close Checkout on page navigation
$(window).on('popstate', function() {
    handler.close();
});
