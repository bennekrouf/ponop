var express = require('express')
	,app = module.exports.app = express()
	,path = require('path')
//	,fs = require('fs')
	presentationProvider = require('./routes/presentation')
	;

app.configure(function () {
	app.use(express.favicon());
	app.use(express.urlencoded());
	app.use(express.logger('dev'));  //tiny, short, default
	//app.use(express.bodyParser( { keepExtensions: true, uploadDir: __dirname + '/uploads/' } ));
	app.use(express.bodyParser({limit: '2000mb'}));

	app.use(app.router);
	app.use(express.static(__dirname + '/app'));
	app.use("/bower_components", express.static(__dirname + '/bower_components'));
	app.use("/test", express.static(__dirname + '/test'));
	app.use(express.errorHandler({dumpExceptions: true, showStack: true, showMessage: true}));
});

app.post('/upload', presentationProvider.upload);
app.post('/createPresentation', presentationProvider.createPresentation);
app.get('/app/uploads/:id/:file', presentationProvider.getImage);
app.post('/json', presentationProvider.json)
app.post('/remove', presentationProvider.remove)
app.get('/zip', presentationProvider.zip)
app.post('/reinitialization', presentationProvider.reinitialization)


var port = process.argv[2] || 5000;	
	
app.listen(port, '0.0.0.0', 511, function() {
  console.log("Listening on : "+port);
  
  var open = require('open');
  open('http://localhost:' + port + '/');
  //open('http://127.0.0.1:8080/debug?port=5858');
});