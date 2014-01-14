var express = require('express')
	,app = module.exports.app = express()
	,path = require('path')
	,fs = require('fs')
	// ,presentationProvider = require('./routes/presentation')
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
	app.use(express.bodyParser( { keepExtensions: true, uploadDir: __dirname + '/app/uploads' } ));
});

/*app.post('/upload', function (req, res) {
    var tempPath = req.files.file.path
    	,targetPath = path.resolve('./uploads/');

    fs.rename(tempPath, targetPath, function(err) {
        if (err) throw err;
        console.log("Upload completed!");
    });
});*/


app.post('/file-upload', function(req, res) {
    var tmp_path = req.files.thumbnail.path;
    // set where the file should actually exists - in this case it is in the "images" directory
    var target_path = './uploads/' + req.files.thumbnail.name;
    // move the file from the temporary location to the intended location
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) throw err;
            res.send('File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes');
        });
    });
});

var port = process.argv[2] || 5000;	
	
app.listen(port, '0.0.0.0', 511, function() {
  console.log("Listening on : "+port);
  
  var open = require('open');
  open('http://localhost:' + port + '/');
  open('http://127.0.0.1:8080/debug?port=5858');
});