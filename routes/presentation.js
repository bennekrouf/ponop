
var fs = require('fs')
	,mkdirp = require('mkdirp')
;

exports.fileUpload = function(req, res) {

	var tmp_path = req.files.thumbnail.path;
	    // set where the file should actually exists - in this case it is in the "images" directory
	    var target_path = './uploads/' + req.files.thumbnail.name;
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
	            res.send(200, 'File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes');
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


