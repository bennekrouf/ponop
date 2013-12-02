var express = require('express')
	,app = module.exports.app = express()
	,presentationProvider = require('./routes/presentation')
	;

app.configure(function () {
	app.use(express.favicon());
	app.use(express.urlencoded());
	app.use(express.logger('dev'));  //tiny, short, default
	app.use(app.router);
	app.use(express.static(__dirname + '/app'));
	app.use("/bower_components", express.static(__dirname + '/bower_components'));
	app.use("/test", express.static(__dirname + '/test'));
	app.use(express.errorHandler({dumpExceptions: true, showStack: true, showMessage: true}));
});

app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

app.get('/api/presentation', presentationProvider.findAll);
app.get('/api/presentation/:id', presentationProvider.findById);

app.post('/api/presentation', presentationProvider.addBiography);
app.put('/api/presentation/:id', presentationProvider.updateBiography);

app.delete('/api/presentation/:id', presentationProvider.deleteBiography);

var port = process.argv[2] || 5000;
	
app.listen(port, '0.0.0.0', 511, function() {
  console.log("Listening on : "+port);
  
  var open = require('open');
  open('http://localhost:' + port + '/');
});