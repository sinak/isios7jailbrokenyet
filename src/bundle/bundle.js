// Import Libraries
var Q = require('q');

// Init Mongo Database
var mongo = require('mongodb').MongoClient,
    mongoURI = process.env.MONGOHQ_URL,
    ObjectID = require('mongodb').ObjectID;

/******

Homepage Logic

******/
module.exports = function(app){


	    app.get("/",function(request,response){
	        response.send("Coming soon!");
	    });

	app.get("/secret-page",function(request,response){

		getTransactions().then( function(transactions){
			response.render("jailbreak/index.ejs",{
		
				transactions: transactions,
		
				environment:{
					/*PAYPAL_ACTION: process.env.PAYPAL_ACTION,
					PAYPAL_RECEIVER_EMAIL: process.env.PAYPAL_RECEIVER_EMAIL,*/
					STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY
				}
		
			});
		});

	});

	/*
	app.get("/unlocked",function(request,response){

		getTransactions().then( function(transactions){
			response.render("bundle/unlocked.ejs",{
				transactions: transactions
			});
		});
		
	});
	
	app.get("/bio/:name",function(request,response){
		response.render("bundle/biography.ejs",{
			name: request.params.name
		});
	});*/

	/*app.get("/survey",function(request,response){

		// Makes sure the query _id is valid
	    var _id = request.query.id;
	    var query = {};
	    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
	    query._id = checkForHexRegExp.test(_id) ? new ObjectID(_id) : -1;

		// Get current survey, if any.
		getSurvey(query).then(function(survey){

			if(!survey){
				survey = { _id: request.query.id };
			};

			// Render page with survey answers, if any.
		    response.render("bundle/survey.ejs",{
				survey_id: survey._id,
				survey_answer1: survey.answer1 || "",
				survey_answer2: survey.answer2 || "",
				survey_answer3: survey.answer3 || "",
				survey_answer4: survey.answer4 || "",
				survey_answer5: survey.answer5 || ""
			});

		});

	});*/

	/*app.post("/survey/save",function(request,response){

		// Make sure _id is valid
		var _id = request.body.id;
		var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
		if(!checkForHexRegExp.test(_id)){
			response.send("failure");
			return;
		}

		// Only these vars. Don't care much for structure right now.
		var survey = {
			_id: new ObjectID(_id),
			answer1: request.body.answer1,
			answer2: request.body.answer2,
			answer3: request.body.answer3,
			answer4: request.body.answer4,
			answer5: request.body.answer5
		};

	    // Upsert on _id
	    upsertSurvey(survey).then(function(){
	    	response.send("success");
	    });

	});*/

};

function getTransactions(){
	
	var deferred = Q.defer();

	mongo.connect(mongoURI,function(err,db){
		if(err){ return console.log(err); }
		db.collection('transactions').find(

			// The Open Bundle transactions
			//{ item_id:"0" },
			{}, // WHATEVER

			// Amount & Custom Data Only
			{ amount:1, custom:1 }

		).toArray(function(err,docs){
            if(err){ return console.log(err); }
            deferred.resolve(docs);
            db.close();
		});
	});

	return deferred.promise;

}
/*
function upsertSurvey(survey){
	
	var deferred = Q.defer();

	mongo.connect(mongoURI,function(err,db){
		if(err){ return console.log(err); }
		db.collection('surveys').update( {_id:survey._id}, survey, { upsert: true }, function(err){
	        if(err){ return deferred.reject(err); }
            deferred.resolve();
            db.close();
		});
	});

	return deferred.promise;

}

function getSurvey(query){
	
	var deferred = Q.defer();

	mongo.connect(mongoURI,function(err,db){
		if(err){ return console.log(err); }
		db.collection('surveys').find(query).toArray(function(err,docs){
	        if(err){ return deferred.reject(err); }
	        if(docs.length>0){
            	deferred.resolve(docs[0]);
            }else{
            	deferred.resolve(null);
            }
            db.close();
		});
	});

	return deferred.promise;

}
*/


