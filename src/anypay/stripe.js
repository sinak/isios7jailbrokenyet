// Import Libraries
var Q = require('q');
var httpRequest = require('request');

// Environment Variables
var STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;


/*******
Stripe payments
*******/

module.exports = function(app){

    // Charge a card and log the transaction
    app.post("/pay/stripe",function(request,response){

        request.assert('amount', 'Name is required').isDecimal();   //Validate amount
        request.assert('custom', 'Custom value is confused').isAlphanumeric();  //Validate custom field
        request.assert('item_id', 'A valid item id is required').equals(0);  //Validate item_id
        request.assert('custom[email]', 'A valid item email is required').isEmail();  //Validate item_id
        request.assert('custom[newsletter]', 'A valid newsletter boolean is required').isAlpha();  //Validate newsletter boolean
        request.assert('custom[name]', 'A valid name is required').isAlphanumeric();  //Validate name
        request.assert('custom', 'A valid custom response is required').isAlphanumeric();  //Validate custom
        
        Q.fcall(function(){

            // Charge card
            return callStripe("charges",{
                card: request.body.stripeToken,
                amount: Math.round(request.body.amount*100), // Converting to USD cents.
                currency: "usd"
            });

        }).then(function(chargeData){

            // It gets returned as a JSON string, ugh.
            chargeData = JSON.parse(chargeData);

            // Log transaction with Custom Vars
            return app.logTransaction({

                item_id: request.body.item_id,
                amount: (chargeData.amount/100), // Converting to USD dollars
                custom: request.body.custom,

                payment_method: "stripe",
                payment_data: chargeData

            });

        }).then(function(transaction){
            response.redirect("/paid?id="+transaction._id);
        },function(err){
            console.log(err);
            response.end();
        });

    });

};


// Helper method: Make a Stripe API call, with promise.
function callStripe(url,params){

    var deferred = Q.defer();

    httpRequest.post({
        
        url: "https://api.stripe.com/v1/"+url,
        auth: {
            user: STRIPE_SECRET_KEY,
            pass: "",
            sendImmediately: true
        },
        form: params

    }, function(error,response,body){

        if(error){
            return deferred.reject(new Error());
        }

        deferred.resolve(body);

    });

    return deferred.promise;

}
