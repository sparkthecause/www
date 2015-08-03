var handler = StripeCheckout.configure({
    key: 'pk_test_fO3iJRyPAwmsujv8tId30Y2v',
    image: '/assets/img/checkout.png',
    token: function(token) {
        // Use the token to create the charge with a server-side script.
        // You can access the token ID with `token.id`
    }
});

$('#donateBtn').on('click', function(e) {

    var raw_donation = numeral().unformat( $("#cta input").val() || "5" );
    var donation = numeral( raw_donation );

    handler.open({
        name: 'Spark the Cause',
        description: 'Monthly Donation & Tip',
        email: $("#emailTxt").val(),
        amount: donation.multiply( 100 ).value(),
        allowRememberMe: false,
        panelLabel: "Donate"
    });
    e.preventDefault();
});

// Close Checkout on page navigation
$(window).on('popstate', function() {
    handler.close();
});
