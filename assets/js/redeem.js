$('#redeemBtn').on( 'click', function( e ) {

    $.ajax({
        "type": "POST",
        "url": "https://api.sparkthecause.com/v0/giveday/redeem",
        "dataType": 'json',
        "data": {
            "code": queryObject.code
        }
    }).done( function( code ) {
        location.reload();
    });

    e.preventDefault();

});

$(document).ready( function(){

    queryObject = {}

    if ( window.location.search.length > 1 ) {
        for (var aItKey, nKeyId = 0, aCouples = window.location.search.substr(1).split("&"); nKeyId < aCouples.length; nKeyId++) {
            aItKey = aCouples[nKeyId].split("=");
            queryObject[decodeURIComponent(aItKey[0])] = aItKey.length > 1 ? decodeURIComponent(aItKey[1]) : "";
        }
    }

    if ( moment().isBetween( '2015-05-06', '2015-05-14') ) {

        $.ajax({
            "type": "GET",
            "url": "https://api.sparkthecause.com/v0/giveday/redeem?code=" + queryObject.code
        }).done( function( data ) {

            if ( data.redeemed_at ) {

                $('.footer').hide();
                $('.instructions').html('<h4>Sorry, this coupon has already been redeemed.</h4>');
                $('.header').css( 'background-color', '#f0625a');
                $('body').css( 'background-color', '#f0625a');

            } else {

                $('#redeemBtn').text( "Use Coupon on " + moment().format( "MMM Do" ) );

            }

        }).fail( function( error ) {

            $('.footer').hide();
            $('.instructions').html('<h4>Sorry, we cant seem to find a coupon with that code.</h4>');
            $('.header').css( 'background-color', '#f0625a');
            $('body').css( 'background-color', '#f0625a');

        });

    } else {

        $('.footer').hide();

        if ( moment().isBefore( '2015-05-06' ) ) {

            $('.instructions').html('<h4> You can use this coupon from<br>May 6 - May 14, see you then!</h4>');

        } else {

            $('.instructions').html('<h4>Sorry, this coupon has expired.</h4>');

        }

        $('.header').css( 'background-color', '#f0625a');
        $('body').css( 'background-color', '#f0625a');

    }

});
