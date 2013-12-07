// Import Libraries
var Q = require('q');

// Init Mongo Database
var mongo = require('mongodb').MongoClient,
	mongoURI = process.env.MONGOHQ_URL,
	ObjectID = require('mongodb').ObjectID;


// Homepage Logic

module.exports = function(app){

	app.get("/",function(request,response){
		getTransactions().then( function(transactions){
			response.render("jailbreak/index.ejs",{
				transactions: transactions,
				environment:{
					STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY
				}
			});
		});
	});


	app.get("/no",function(request,response){
		getTransactions().then( function(transactions){
			response.render("jailbreak/index-alt.ejs",{
				transactions: transactions,
				environment:{
					STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY
				}
			});
		});
	});

	app.get("/privacy",function(request,response){
		response.render("jailbreak/privacy.ejs");
	});

};

function getTransactions(){
	
	var deferred = Q.defer();

	mongo.connect(mongoURI,function(err,db){
		if(err){ return console.log(err); }
		db.collection('transactions').find(
			{}, // Everything
			// Amount & Custom Data Only:
			{ amount:1, custom:1 }

		).toArray(function(err,docs){
			if(err){ return console.log(err); }
			deferred.resolve(docs);
			db.close();
		});
	});

	return deferred.promise;
}


