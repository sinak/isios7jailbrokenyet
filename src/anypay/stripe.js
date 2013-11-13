// Import Libraries
var Q = require('q');
var httpRequest = require('request');

// Environment Variables
var STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;


/*******

Stripe - white-label credit card & bank account processing
http://balancedpayments.com

*******/
module.exports = function(app){

	// Charge a card and log the transaction
	app.post("/pay/stripe",function(request,response){
		
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
