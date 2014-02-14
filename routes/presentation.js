
var fs = require('fs')
	,mkdirp = require('mkdirp')
;

var AdmZip = require('adm-zip');
var sizeOf = require('image-size');

exports.upload = function(req, res) {	
	
	var presentationId = req.body.presentationId;	
	var tmp_path = req.files.file.path;
	
	var extentionFile = req.files.file.name.split('.').pop();
	
	if (extentionFile === 'zip')
	{
		 var target_path = './app/uploads/'+ presentationId;
		 
		 var zip = new AdmZip(tmp_path);
		 var zipEntries = zip.getEntries();
		 
		 var json = undefined;
		 var imgDimension = {};
		 
		 zipEntries.forEach(function(zipEntry) {
		 				 	
			 if (!zipEntry.isDirectory && zipEntry.name.charAt(0) != '.') 
			 {
			 	zip.extractEntryTo(zipEntry.entryName, target_path, /*maintainEntryPath*/false, /*overwrite*/true);
			 	
			 	if (zipEntry.name === 'JSON_Input.json')
			 		json = fs.readFileSync(target_path +'/' + zipEntry.name);
			 	
			 	var extension = zipEntry.name.split('.').pop().toLowerCase();
			 	if (extension === 'jpg' || extension === 'png' || extension === 'bmp' || extension === 'jpeg')
			 	{
				 	console.log(extension);
				 	console.log(zipEntry.name);
				 	imgDimension[zipEntry.name] = sizeOf(target_path +'/' + zipEntry.name);
			 	}	
			 }
		});
		 		 
		 var result = { 'json': JSON.parse(json), 'imgDimension':imgDimension}
		 
		 res.send(200, result);
	}
	else
	{
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
	}
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
		fs.createReadStream('./app/img/button_clear.png').pipe(fs.createWriteStream('./app/uploads/'+id+'/button_clear.png'));
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
	
	var path_files = require('path').normalize(__dirname + '/../app/uploads/'+ presentationId);
	
	if(fs.existsSync(path_files + '/JSON_Input.json'))
		 fs.unlinkSync(path_files + '/JSON_Input.json');
	
	fs.appendFile('./app/uploads/' + presentationId + '/JSON_Input.json', json, function(err) {
        if(err) 
            res.send(500, 'Problème JSON');
        else 
            res.send(200, 'JSON created');
    }); 
}

exports.zip = function (req, res) {

	cookies = parseCookies(req);

	var presentationId = cookies["presentationId"];

	var path_files = require('path').normalize(__dirname + '/../app/uploads/'+ presentationId);
	
	if(fs.existsSync(path_files + '/archive.zip'))
		 fs.unlinkSync(path_files + '/archive.zip');
	
	var zip = new AdmZip();	
	zip.addLocalFolder(path_files);	
	zip.writeZip(path_files + '/archive.zip');
	res.download(path_files + '/archive.zip');
};

function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = unescape(parts.join('='));
    });

    return list;
}

exports.remove = function (req, res) {
	var file = req.body.fileName;
	var presentationId = req.body.presentationId;
	
	var tmp_path = './app/uploads/' + presentationId;
	
	fs.unlink(tmp_path + '/' + file, function (err) {
		if (err) console.log('error delete');
		res.send(200, 'file deleted');
	});
}

exports.reinitialization = function (req, res) {
	
	var presentationId = req.body.presentationId;	
	
	var path_files = require('path').normalize(__dirname + '/../app/uploads/'+ presentationId);
	
	deleteFolderRecursive(path_files);
	
	exports.createPresentation(req,res);
}


deleteFolderRecursive = function(path) 
{
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        
        fs.rmdirSync(path);
    }
};

