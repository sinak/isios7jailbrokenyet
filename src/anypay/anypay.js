// Import Libraries
var Q = require('q');
var httpRequest = require('request');

// Init Mongo Database
var mongo = require('mongodb').MongoClient,
    mongoURI = process.env.MONGO_URI,
    ObjectID = require('mongodb').ObjectID;


/*******

ANYPAY.JS
Lets users pay what they want, however they want.

1) Payment & Completion pages
2) Logging transactions
3) Different payment methods

*******/
module.exports = function(app){


	// Various methods of payment
	require('./coinbase')(app);
	//require('./paypal')(app);
	require('./stripe')(app);


	// Log transactions, with promise.
	app.logTransaction = function(transaction){

		/**
		Transaction:
		{
			item_id: ID of item
			amount: How much the user paid, in USD Dollars
			custom: JSON object of custom variables

			payment_method: What external payments service the user chose
			payment_data: Raw data from the payment service
		}
		**/

		var deferred = Q.defer();
		transaction._id = new ObjectID();

		mongo.connect(mongoURI,function(err,db){
			if(err){ return deferred.reject(err); }
			db.collection('transactions').insert(transaction,function(err){
	            if(err){ return deferred.reject(err); }
				deferred.resolve(transaction);
				_sendEmail(transaction);
				db.close();
			});
		});

		return deferred.promise;

	}

	// Render page from transaction query
	app.renderTransaction = function(query,response){
		
		var deferred = Q.defer();

		mongo.connect(mongoURI,function(err,db){
			if(err){ return deferred.reject(err); }
			db.collection('transactions').find(query).toArray(function(err,docs){
	            if(err){ return deferred.reject(err); }

	            var transaction = docs[0];
				
				// No Transaction
				if(!transaction){
					deferred.resolve(false);
					response.send("For some reason your payment failed. If you continue to receive this message and think you shouldn't please send us an email at prize@isios7jailbrokenyet.com.");
					return;
				}

				// Render Transaction
				response.render("jailbreak/thanks.ejs",{
					transaction: transaction
				});
				deferred.resolve(true);

				// Close
				db.close();
				return;

			});
		});

		return deferred.promise;

	};

	/*
	// Pay What You Want page
	app.get("/buy",function(request,response){
		response.render("anypay/buy.ejs",{
			environment:{
				PAYPAL_ACTION: process.env.PAYPAL_ACTION,
				PAYPAL_RECEIVER_EMAIL: process.env.PAYPAL_RECEIVER_EMAIL,
			}
		});
	});*/


	// A General Payment Complete Page	
	app.get("/paid",function(request,response){

	    request.assert('id', 'A valid item id is required').isNumeric();  //Validate item_id

		// Makes sure the query _id is valid
	    var _id = request.query.id;
	    var query = {};
	    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
	    query._id = checkForHexRegExp.test(_id) ? new ObjectID(_id) : -1;

	    // Display the transaction
		app.renderTransaction(query, response);

	});

};

// Send an email to the buyer, with permalink.
var SendGrid = require('sendgrid').SendGrid;
var sendgrid = new SendGrid( process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD );
//var fs = require('fs');
function _sendEmail(transaction){
    
    var toEmail = transaction.custom.email;
    var id = transaction._id;
    if(toEmail){

    	// TODO: EJS!
    	//fs.readFile('./static/bundle/email.html', 'utf8', function (err,data) {
		//if(err){ return console.log(err); }

		sendgrid.send({

		    to: toEmail,
		    from: 'prize@isios7jailbrokenyet.com',
		    subject: 'Thank you for backing the Device Freedom Fund!',
		    text: "Thanks so much for contributing. We'll be in touch with any news, or if the prize has been successfully claimed. \n\n"+
		    	  "Feel free to email us with any comments or questions.\n\n"+
                  "- The Device Freedom Fund team."
		    //html: data

		}, function(success, message) {
		    if(success){
		    	console.log("sent!");
		    }else{
		    	console.log(message);
		    }
		});	

		//});

    }
            
}