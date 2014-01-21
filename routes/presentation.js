
var fs = require('fs')
	,mkdirp = require('mkdirp')
;

var gm = require('gm');

exports.upload = function(req, res) {	
	var tmp_path = req.files.file.path;
	
	/*
	gm(tmp_path).size(function (err, size) {
		if (!err) {
			console.log('width = ' + size.width);
			console.log('height = ' + size.height);
		}
		else
		{
			console.log('error size');
		}
	});*/
	
	// set where the file should actually exists - in this case it is in the "images" directory
	var target_path = './app/uploads/' + req.files.file.name;
	
	// move the file from the temporary location to the intended location	
	fs.rename(tmp_path, target_path, function(err) {
		if (err) {
			res.send(400, 'Erreur lors de la copie sur le disque.');
		}
	    // delete the temporary file, so that the explicitly 
	    // set temporary upload dir does not get filled with unwanted files
	    fs.unlink(tmp_path, function() {
			if (err){
				res.send(400, 'Erreur lors de la suppression du répertoire temporaire.');
	        }
	        
	        var result = { 'fileName': req.files.file.name, 'url':target_path}
	        
	        res.send(200, result);  
	    });
	});	
};

var generateId = function(){
	'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;
		return v.toString(16);
	});
}

exports.createPresentation = function(req, res){

	// Générer un id de présentation
	var id = generateId();

	console.log(id);

	// Créer un répertoire local avec la présentation
	mkdirp('./'+id, function(err) { 
	    res.send(200, id);
	});

};


exports.getImage = function (req, res) {
	file = req.params.file;
	
	var img = fs.readFileSync(__dirname + "/../app/uploads/" + file);
	res.writeHead(200, {});
	res.end(img, 'binary');

};


