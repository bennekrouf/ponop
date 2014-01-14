var mongo = require('mongodb');

var baseName = 'ponop';
var Server = mongo.Server
	,Db = mongo.Db
	,BSON = mongo.BSONPure;

var server = new Server('localhost', 27017,
	{auto_reconnect:true})
	, db = new Db(baseName, server);


db.open(function(err, db) {
    if(!err) {
        console.log("Connected to "+baseName+" database");
        db.collection(baseName, {strict:true}, function(err, collection) {
            if (err) {
                populateDB();
            }
        });
    }
});


var populateDB = function(){

	var presentation = ['toto', new File()];

	this.db.collection('biographies', function(err, collection){
		collection.insert(narators, {safe:true}, function(err, result){
			console.log("INSERT : ERROR : "+err);
			console.log("INSERT : RESULT : "+result);
		});
	});
};