var handler = StripeCheckout.configure({
    key: 'pk_test_fO3iJRyPAwmsujv8tId30Y2v',
    image: '/assets/img/purple_circle_logo.png',
    allowRememberMe: false,
    token: function(token) {
        $.ajax({
            "type": "POST",
            "url": "https://api.sparkthecause.com/v0/giveday",
            "dataType": 'json',
            "data": {
                "token": token,
                "amount": numeral( numeral().unformat( $("#giveday_input").val() ) ).value() * 100
            }
        });
    }
});

$('#donateBtn').on( 'click', function( e ) {
    var donation = numeral( numeral().unformat( $("#giveday_input").val() ) ).value() * 100;

    // Open Checkout with further options
    handler.open({
        name: 'Spark: Donation',
        description: 'Animal Coalition of Tampa',
        amount: donation,
        panelLabel: "Donate"
    });

    e.preventDefault();
});

// Close Checkout on page navigation
$(window).on('popstate', function() {
    handler.close();
});
