/*

DESCRIPTION DES VARIABLES

panels : liste des panneaux
selectedPanelIndex : index du panneau sélectioné

iconIdUpload : l'id de l'icone tout juste transmise par l'utilisateur
iconid : l'id de l'icone sélectionné (ne prends en compte que les icones droppé dans le workspace)
icons : liste des icones du panneaux

*/

var panoplyTypes = 	{ 	
						'kImage': ['jpg', 'jpeg', 'png', 'bmp'],
						'kVideo': ['mp4'],
						'kPDF':	['pdf'] 	
					};

var panoply = angular.module('Panoply', ['angularFileUpload'])


panoply.run(function() {
  browserWidthChange();
});


panoply.controller('PanoplyCtrl', ["$scope", "$compile", "$upload", function($scope, $compile, $upload){

    $scope.onFileSelect = function($files, sender) {
    	//$files: an array of files selected, each file has name, size, and type.
    	var file = $files[0];
    	
    	var acceptedType = [];
    	var typeOfUpload;
    	
		var idSender = sender.currentTarget.id;
		if (idSender === 'iconeUpload')
		{
			acceptedType = ['kImage'];
			typeOfUpload = 'icon';
		}
    	else if (idSender === 'backgroundUpload')
    	{
    		acceptedType = ['kImage', 'kVideo'];
    		typeOfUpload = 'background';
    	}
    	else if (idSender === 'iconLinkUpload')
    	{
    		acceptedType = ['kImage', 'kVideo', 'kPDF'];
    		typeOfUpload = 'file';
    	}
    		
    	var fileExtension = file.type.substr(file.type.lastIndexOf('/') + 1);		
		var fileType = ifFileIsAccepted(fileExtension, acceptedType);

		if (!fileType)
			alert("Ce format de fichier n'est pas autorisé");
		else
			$scope.upload(file, typeOfUpload, fileType)
	};
	
	
	$scope.upload = function (file, typeOfUpload, fileType) {
		$upload
			.upload({
				url: '/upload', //upload.php script, node.js route, or servlet url
				method: 'POST',
				// headers: {'headerKey': 'headerValue'}, withCredential: true,
				file: file,
				// file: $files, //upload multiple files, this feature only works in HTML5 FromData browsers
				/* set file formData name for 'Content-Desposition' header. Default: 'file' */
				//fileFormDataName: myFile,
				/* customize how data is added to formData. See #40#issuecomment-28612000 for example */
				//formDataAppender: function(formData, key, val){} 
			})
			.progress(function(evt) {
				//console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
			})
			.success(function(data, status, headers, config) {
				// file is uploaded successfully
				if (typeOfUpload === 'icon')
					$scope.addIcon(data.url);
				else if (typeOfUpload === 'background')
					$scope.addBackground(data.url, fileType)
				else if (typeOfUpload === 'file')
					$scope.addIconFile(data.url, fileType)
			})
			.error(function (error) {
				//console.log(error);
			});
			//.then(success, error, progress);
	}
    
    
    
    
    /* PANELS */
    $scope.panels = [generatePanel(), generatePanel(), generatePanel()];
    
    $scope.selectedPanelIndex = 0;
    
    $scope.addPanel = function () {
	    $scope.panels.push(generatePanel());
    }
    
    $scope.removePanel = function() {
	    $scope.panels.remove($scope.selectedPanelIndex);
    }
    
    $scope.panelSelected = function ($index, $event) {
       	//sauvegarde des icones courante dans le panneau
    	$scope.saveActualPanel();
    	
    	//changement de la vue actuelle pour prendre en compte le panneau sélectionné
	    $scope.selectedPanelIndex = $index;
	    $scope.icons = $scope.panels[$scope.selectedPanelIndex].icons;
	    $scope.iconId = undefined;
	    $scope.iconIdUploaded = $scope.panels[$scope.selectedPanelIndex].iconIdUploaded
	    	    	    
	    if(!$scope.$$phase && !$scope.$root.$$phase)
	    	$scope.$apply();
    }
    
    $scope.saveActualPanel = function () {
	    $scope.panels[$scope.selectedPanelIndex].icons = $scope.icons;
    	$scope.panels[$scope.selectedPanelIndex].iconIdUploaded = $scope.iconIdUploaded;
    }
    
    /* ICON */
    $scope.icons = {};
    
    $scope.addIcon = function (src) {
	    var bindedImg = generateIcon(src);
	    
	    $scope.icons[bindedImg.id] = bindedImg;
	    $scope.iconIdUploaded = bindedImg.id;
	    $scope.iconId = undefined;
	    	    
	    if(!$scope.$$phase && !$scope.$root.$$phase)
	    	$scope.$apply();	    
    }

    $scope.iconSelected = function (id, $event) {
	    $scope.iconId = id;
	    
	    //var idSender = sender.currentTarget.id;
    }
    
    $scope.addIconFile = function (src, fileType) {
	    $scope.icons[$scope.iconId].link = src;
	    $scope.icons[$scope.iconId].linkFileName = src.substr(src.lastIndexOf('/') + 1);
	    $scope.icons[$scope.iconId].type = fileType+'File';
    }
    
    $scope.removeIconFile = function () {
    	$scope.icons[$scope.iconId].link = undefined;
	    $scope.icons[$scope.iconId].linkFileName = undefined;
    }
    
    $scope.removeIcon = function (id) {  
	    $scope.icons[id] = undefined;
	    $scope.iconId = undefined;
	    
	    if(!$scope.$$phase && !$scope.$root.$$phase)
	    	$scope.$apply();   
    }
    
    
    /* BACKGROUND */
    $scope.addBackground = function (src, fileType) {
	    var background = generateBackground(src, fileType);
	    $scope.panels[$scope.selectedPanelIndex].background = background;
    }
    
    $scope.removeBackground = function () {
	    $scope.panels[$scope.selectedPanelIndex].background = undefined;
    }
    
    
    /*JSON */
    $scope.savePresentation = function ($event)
    {
	    $scope.saveActualPanel();
	    
	    var panels = new Array();
		
		for (var i=0; i<$scope.panels.length; i++)
		{
			var icons = new Array();
			
			for (var tmpIconId in $scope.panels[i].icons)
			{				
				var tmpIcon = $scope.panels[i].icons[tmpIconId]
				
				var scaleX = tmpIcon.width / tmpIcon.nWidth;
				var scaleY = tmpIcon.height / tmpIcon.nHeight;
				
				var icon = {
					"id" : tmpIcon.id,
					"type" : tmpIcon.type,
					"posX": (tmpIcon.left * 2) + scaleX*tmpIcon.nWidth,
					"posY": 1536 - ((tmpIcon.top * 2)+ scaleY*tmpIcon.nHeight),
					"scaleX": scaleX * 2,
					"scaleY": scaleY * 2,
					"imageUp": tmpIcon.fileName,
					"imageDown": tmpIcon.fileName,
					"link": tmpIcon.linkFileName
				}
				icons.push(icon);
			}
			
			var tmpBackground = $scope.panels[i].background;
			
			if (tmpBackground == undefined)
			{
				tmpBackground = new Array();
				tmpBackground.type = '';
				tmpBackground.fileName = '';
				tmpBackground.src = '';
			}
				
			
			var background = {
				"type": tmpBackground.type,
				"fileName": tmpBackground.fileName,
				"videoBackground": tmpBackground.fileName
			}
			
			
			var pano = {
				"id" : $scope.panels[i].id,
				"icons" : icons,
				"background" : background
			}
			
			panels.push(pano);
		}
		
		var JSONFile = {
			"appSettings":
			{
					"cubeOffsetY":				 0,
					"defaultShift":				 0,
					"skewAngle":				 10,
					"shiftSpeed":				 1.2,
					"shift-to-nextThreshold":	 300,
					"shiftBackThreshold":		 20,
					"shiftBackCoef":			 8,
					"shiftBackCanBeCancelled":	 0
			},
			"panos": panels
		}
		
		console.log(JSON.stringify(JSONFile));
		
    }

}]);



$(window).bind("resize", browserWidthChange);

function browserWidthChange()
{
	var winWidth = $(window).width();
	
	if (winWidth < 1565)
	{
		$("#leftColumn").append($("#rightColumn"));
		$("#leftColumn").removeClass('col-lg-2').addClass('col-lg-3');
		$("#centerColumn").removeClass('col-lg-8').addClass('col-lg-9');
		$("#rightColumn").removeClass('col-lg-2 borderLeft');
	}
	else
	{
		$("#container").append($("#rightColumn"));
		$("#leftColumn").removeClass('col-lg-3').addClass('col-lg-2');
		$("#centerColumn").removeClass('col-lg-9').addClass('col-lg-8');
		$("#rightColumn").addClass('col-lg-2 borderLeft');
	}
}




function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

function generatePanel() {
	var panel = new Array();
	
	panel.id = generateUUID();
	panel.icons = {};
	panel.background = undefined;
	panel.iconIdUploaded = undefined;
	
	return panel;
}

function generateIcon(src) {
	
	var icon = new Array();

	icon.id = generateUUID();	//titre
	icon.title = "";
	icon.fileName = src.substr(src.lastIndexOf('/') + 1);;
	icon.src = src;
	
	icon.dropped = undefined;
	
	//taille originale
	/*var t = new Image();
    t.src = src;
	icon.nWidth = t.naturalWidth;
	icon.nHeight = t.naturalHeight;	
	
	
	if (icon.nWidth > 200)
		icon.width = 200;
	else
		icon.width = icon.nWidth;*/
	
	/*SEULEMENT POUR TEST */
	icon.width = 200;
	icon.nWidth = 640;
	icon.nHeight = 1136;

	icon.height = Math.ceil(icon.nHeight*icon.width/icon.nWidth);
	
	//lien
	icon.type = "kImageFile";
	icon.link = undefined;
	icon.linkFileName = undefined;
	
	//position
	icon.top = undefined;
	icon.left = undefined;
	
	return icon;
}

function generateBackground(src, type)
{
	var background = new Array();
		
	background.type = type;
	background.fileName = src.substr(src.lastIndexOf('/') + 1);
	background.src = src;
	
	return background;
}


function ifFileIsAccepted(fileExtension, acceptedKeysType)
{
	for (var i=0; i<acceptedKeysType.length; i++)
	{			
		var keyType = acceptedKeysType[i];
		var arrayExtension = panoplyTypes[keyType];
		
		for (var j=0; j<arrayExtension.length; j++)
		{
			var extension = arrayExtension[j]
			if (extension === fileExtension)
				return keyType;
		}
	}
	
	return false;
}


/* --------    Méthodes annexes -------- */
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};