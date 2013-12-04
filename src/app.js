var util = require('util');	
var express = require('express');
var expressValidator = require('express-validator'); 
var app = express();

app.use('/', express.static('./static'));
app.use(express.bodyParser());
app.use(expressValidator());
var port = process.env.PORT || 80;
app.listen(port);
console.log('Express server started on port '+port);

app.configure('production', function(){
	app.get('*',function(req,res,next){
	  if(req.headers['x-forwarded-proto']!='https')
	    res.redirect('https://isios7jailbrokenyet.com'+req.url)
	  else
	    next() /* Continue to other routes if we're not redirecting */
	});
});

require('./anypay/anypay')(app);
require('./bundle/bundle')(app);


///////////////////
// Misc API Stuff.

var mongo = require('mongodb').MongoClient;
var mongoURI = process.env.MONGOHQ_URL;

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
