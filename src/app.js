var express = require('express');
var app = express();
app.use('/', express.static('./static'));
app.use(express.bodyParser());
var port = process.env.PORT || 80;
app.listen(port);
console.log('Express server started on port '+port);

require('./anypay/anypay')(app);
require('./bundle/bundle')(app);


///////////////////
// Misc API Stuff.

var mongo = require('mongodb').MongoClient,
    mongoURI = process.env.MONGOHQ_URL;

app.get("/api/transactions",function(request,response){

	var showAll = (request.query.full==1);
	var fieldLimit = showAll ? {} : { amount:1, custom:1, payment_method:1 };

	mongo.connect(mongoURI,function(err,db){
		if(err){ return console.log(err); }
		db.collection('transactions')
		.find( {}, fieldLimit )
		.sort( {_id:-1} )
		.toArray(function(err,docs){
            if(err){ return console.log(err); }
            
            // Pretty print JSON
            response.setHeader('Content-Type', 'text/plain');
            response.send( JSON.stringify(docs,null,4) );

            db.close();

		});
	});

});

app.get("/api/surveys",function(request,response){

	mongo.connect(mongoURI,function(err,db){
		if(err){ return console.log(err); }
		db.collection('surveys').find({}).sort({_id:-1}).toArray(function(err,docs){
            if(err){ return console.log(err); }
            
            // Pretty print JSON
            response.setHeader('Content-Type', 'text/plain');
            response.send( JSON.stringify(docs,null,4) );

            db.close();

		});
	});

});