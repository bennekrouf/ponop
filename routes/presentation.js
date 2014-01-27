
var fs = require('fs')
	,mkdirp = require('mkdirp')
;

exports.upload = function(req, res) {	
	
	var presentationId = req.body.presentationId;	
	var tmp_path = req.files.file.path;
	
	// set where the file should actually exists - in this case it is in the "images" directory
	var target_path = './app/uploads/'+ presentationId + '/' + req.files.file.name;
	
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
	var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
}

exports.createPresentation = function(req, res){

	// Générer un id de présentation
	var id = generateId();
	
	// Créer un répertoire local avec la présentation
	mkdirp('./app/uploads/'+id, function(err) { 
	    res.send(200, id);
	});

};


exports.getImage = function (req, res) {

	id = req.params.id
	file = req.params.file;
	
	var img = fs.readFileSync(__dirname + "/../app/uploads/"+ id +'/' + file);
	res.writeHead(200, {});
	res.end(img, 'binary');
};


exports.json = function (req, res) {
	
	var presentationId = req.body.presentationId;
	var json = req.body.json;
	
	fs.appendFile('./app/uploads/' + presentationId + '/JSON_Input.json', json, function(err) {
        if(err) 
            res.send(500, 'Problème JSON');
        else 
            res.send(200, 'JSON created');
    }); 
}

var AdmZip = require('adm-zip');
var archiver = require('archiver');
var EasyZip = require('easy-zip').EasyZip;

exports.zip = function (req, res) {

	var presentationId = req.headers.cookie.substr(req.headers.cookie.lastIndexOf('=') + 1);
	var path_files = require('path').normalize(__dirname + '/../app/uploads/'+ presentationId);
	
	var zip = new AdmZip();	
	zip.addLocalFolder(path_files);	
	zip.writeZip(path_files + '/archive.zip');
	res.download(path_files + '/archive.zip');
};


exports.remove = function (req, res) {
	var file = req.body.fileName;
	var presentationId = req.body.presentationId;
	
	var tmp_path = './app/uploads/' + presentationId;
	
	fs.unlink(tmp_path + '/' + file, function (err) {
		if (err) console.log('error delete');
		console.log('successfully deleted icon');
	});
}

exports.reinitialization = function (req, res) {
	
	var presentationId = req.body.presentationId;	
	
	console.log(req.body);
	var path_files = require('path').normalize(__dirname + '/../app/uploads/'+ presentationId);
	
	if( fs.existsSync(path_files) ) 
	{
		files = fs.readdirSync(path_files);
        files.forEach(function(file,index){
            var curPath = path_files + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
		
		res.send(200, 'Folder was reinit');
	}
	else
		res.send(500, 'Folder not found');
}



