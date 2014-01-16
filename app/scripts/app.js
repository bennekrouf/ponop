/*

DESCRIPTION DES VARIABLES

panels : liste des panneaux
selectedPanelIndex : index du panneau sélectioné

iconIdUpload : l'id de l'icone tout juste transmise par l'utilisateur
iconid : l'id de l'icone sélectionné (ne prends en compte que les icones droppé dans le workspace)
icons : liste des icones du panneaux

*/


var panoply = angular.module('Panoply', [])


panoply.controller('PanoplyCtrl', ["$scope", "$compile", function($scope, $compile){

	$scope.savePresentation = function ($event)
    {
        console.log($event);
        $event.stopPropagation();
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
    	$scope.panels[$scope.selectedPanelIndex].icons = $scope.icons;
    	$scope.panels[$scope.selectedPanelIndex].iconIdUploaded = $scope.iconIdUploaded;
    	
    	//changement de la vue actuelle pour prendre en compte le panneau sélectionné
	    $scope.selectedPanelIndex = $index;
	    $scope.icons = $scope.panels[$scope.selectedPanelIndex].icons;
	    $scope.iconId = undefined;
	    $scope.iconIdUploaded = $scope.panels[$scope.selectedPanelIndex].iconIdUploaded
	    	    	    
	    if(!$scope.$$phase && !$scope.$root.$$phase)
	    	$scope.$apply();
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
	    $scope.icons[$scope.iconId].linkFileName = 'img/angularJS.pdf';
    }
    
    $scope.removeIconFile = function () {
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

}]);




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