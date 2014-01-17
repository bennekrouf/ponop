/*

DESCRIPTION DES VARIABLES

panels : liste des panneaux
selectedPanelIndex : index du panneau sélectioné

iconIdUpload : l'id de l'icone tout juste transmise par l'utilisateur
iconid : l'id de l'icone sélectionné (ne prends en compte que les icones droppé dans le workspace)
icons : liste des icones du panneaux

*/


var panoply = angular.module('Panoply', [])


panoply.run(function() {
  browserWidthChange();
});


panoply.controller('PanoplyCtrl', ["$scope", "$compile", function($scope, $compile){

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
    
    $scope.addIcon = function () {
	     
	    var bindedImg = generateIcon('img/test.png');
	    
	    $scope.icons[bindedImg.id] = bindedImg;
	    $scope.iconIdUploaded = bindedImg.id;
	    $scope.iconId = undefined;
	    	    
	    if(!$scope.$$phase && !$scope.$root.$$phase)
	    	$scope.$apply();
	    
	 //   $('#iconPlace').append(img);
    }

    $scope.iconSelected = function (id, $event) {
	    $scope.iconId = id;
    }
    
    $scope.addIconFile = function () {
	    var src = 'img/angularJS.pdf'
	    
	    $scope.icons[$scope.iconId].link = src;
	    $scope.icons[$scope.iconId].linkFileName = src.substr(src.lastIndexOf('/') + 1);
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
    $scope.addBackground = function () {
	    var background = generateBackground('img/wallpaper.jpeg', 'kImageFile');
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
				
				var icon = {
					"id" : tmpIcon.id,
					"type" : tmpIcon.type,
					"posX": (tmpIcon.left * 2) + tmpIcon.scaleX*tmpIcon.nWidth,
					"posY": 1536 - ((tmpIcon.top * 2)+ tmpIcon.scaleY*tmpIcon.nHeight),
					"scaleX": tmpIcon.scaleX * 2,
					"scaleY": tmpIcon.scaleY * 2,
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
	
	console.log(icon.width);

	icon.height = Math.ceil(icon.nHeight*icon.width/icon.nWidth);
	
	//lien
	icon.type = "kImageFile";
	icon.link = undefined;
	icon.linkFileName = undefined;
	
	//position
	icon.top = undefined;
	icon.left = undefined;
	
		
	//échelle
	icon.scaleX = icon.width / icon.nWidth;
	icon.scaleY = icon.height / icon.nHeight;
	
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



/* --------    Méthodes annexes -------- */
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};