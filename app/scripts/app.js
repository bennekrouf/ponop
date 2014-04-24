/*

DESCRIPTION DES VARIABLES

panels : liste des panneaux
selectedPanelIndex : index du panneau sélectioné

iconIdUpload : l'id de l'icone tout juste transmise par l'utilisateur
iconid : l'id de l'icone sélectionné (ne prends en compte que les icones droppé dans le workspace)
icons : liste des icones du panneaux

*/


var panoply = angular.module('Panoply', ['angularFileUpload', 'ngCookies', 'LocalStorageModule'])

panoply.run(['$rootScope', '$http', '$cookies',  function ($rootScope, $http, $cookies) {
  	
  	browserWidthChange();
  	
  	if ($cookies.presentationId == undefined)
  	{
	  	$http({url: 'createPresentation',method: "POST"})
			.then(function(response) {
        		$cookies.presentationId = response.data;
			}, function(error) {});
  	}

}]);


panoply.controller('PanoplyCtrl', ["$scope", "$compile", "$upload", '$cookies', '$http', '$window', 'PanelsFactory', 'IconsFactory', 'BackgroundFactory', function($scope, $compile, $upload, $cookies, $http, $window, PanelsFactory, IconsFactory, BackgroundFactory) {

    //trigger lorsque l'utilisateur s'apprete à quitter la page
    $scope.$on('$locationChangeStart', function( event ) {
    	$scope.saveActualPanel();
	});


    $scope.reinitialize = function() {
	    var answer = confirm("Attention, toutes les modifications apportés à la présentation seront supprimées")
	    if (answer)
	    {
		    PanelsFactory.clearPanelsInMemory()
		    $scope.panels = PanelsFactory.panelsInit();
		    
		    $scope.presentationTitle = undefined;
		    $scope.selectedPanelIndex = 0;
			$scope.icons = $scope.panels[$scope.selectedPanelIndex].icons;
			$scope.iconId = undefined;
			$scope.iconIdUploaded = $scope.panels[$scope.selectedPanelIndex].iconIdUploaded
			
			$http({
				url: 'reinitialization', 
				method: "POST", 
				data: {'presentationId': $cookies.presentationId},
				headers: {'Content-Type': 'application/json'}
			})
			.then(function(response) {
				console.log('ok');
        		$cookies.presentationId = response.data;
			}, function(error) {
				console.log('nok');
			});
			
			if(!$scope.$$phase && !$scope.$root.$$phase)
	    		$scope.$apply();   
	    }
    }
    
    
    /* FILE UPLOAD */
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
    	else if (idSender === 'imageBackgroundUpload')
    	{
    		//cas d'une image en background quand le background est une vidéo
    		acceptedType = ['kImage'];
    		typeOfUpload = 'backgroundImage';
    	}
    	else if (idSender === 'iconLinkUpload')
    	{
    		acceptedType = ['kImage', 'kVideo', 'kPDF'];
    		typeOfUpload = 'file';
    	}
    	else if (idSender === 'presentationUpload')
    	{
	    	acceptedType = ['kLoad'];
	    	typeOfUpload = 'zip';
    	}
    	
    	console.log(file);
    	console.log(file.type);
    	
    	var fileExtension = file.type.substr(file.type.lastIndexOf('/') + 1);		
		var fileType = ifFileIsAccepted(fileExtension, acceptedType);
		
		console.log('extension : '+fileExtension);
		console.log('file type : '+fileType);
		
		if (!fileType)
			alert("Ce format de fichier n'est pas autorisé");
		else
			$scope.upload(file, typeOfUpload, fileType)
	};
	
	
	$scope.upload = function (file, typeOfUpload, fileType) {
		$upload
			.upload({
				url: 'upload',
				method: 'POST',
				data: {'presentationId': $cookies.presentationId},
				file: file,
			})
			.progress(function(evt) {
				if (typeOfUpload === 'icon')
					$scope.progressBarIcon = parseInt(100.0 * evt.loaded / evt.total);
				else if (typeOfUpload === 'background')
					$scope.progressBarBackground = parseInt(100.0 * evt.loaded / evt.total);
				else if (typeOfUpload === 'backgroundImage')
					$scope.progressBarImageBackground = parseInt(100.0 * evt.loaded / evt.total);
				else if (typeOfUpload === 'file')
					$scope.progressBarFile = parseInt(100.0 * evt.loaded / evt.total);
				else if (typeOfUpload === 'zip'){
					console.log('progress : '+parseInt(100.0 * evt.loaded / evt.total))
					$scope.progressBarPresentation= parseInt(100.0 * evt.loaded / evt.total);
				}
			})
			.success(function(data, status, headers, config) {
				if (typeOfUpload === 'icon')
					$scope.addIcon(data.url);
				else if (typeOfUpload === 'background')
					$scope.addBackground(data.url, fileType);
				else if (typeOfUpload === 'backgroundImage')
					$scope.addBackgroundImage(data.url, fileType);
				else if (typeOfUpload === 'file')
					$scope.addIconFile(data.url, fileType)
				else if (typeOfUpload === 'zip')
				{
					$scope.panels = PanelsFactory.loadPanelsFromData(data);
					
					$scope.selectedPanelIndex = 0;
					$scope.icons = $scope.panels[$scope.selectedPanelIndex].icons;
					$scope.iconId = undefined;
					$scope.iconIdUploaded = $scope.panels[$scope.selectedPanelIndex].iconIdUploaded
					
					PanelsFactory.savedPanelsInMemory($scope.panels);
	    	    	  
					if(!$scope.$$phase && !$scope.$root.$$phase)
						$scope.$apply();
				}
				
				if(!$scope.$$phase && !$scope.$root.$$phase)
					$scope.$apply();
			})
			.error(function (error) {
				console.log(error);
			})
			.then(function (success, error, progress) {				
				if (typeOfUpload === 'icon')
					$scope.progressBarIcon = parseInt(0);
				else if (typeOfUpload === 'background')
					$scope.progressBarBackground = parseInt(0);
				else if (typeOfUpload === 'backgroundImage')
					$scope.progressBarImageBackground = parseInt(0);
				else if (typeOfUpload === 'file')
					$scope.progressBarFile = parseInt(0);
				else if (typeOfUpload === 'zip')
					$scope.progressBarPresentation = parseInt(0);
			})
	}
    
    
    
    
    /* PANELS */
    $scope.panels = PanelsFactory.panelsInit();
    $scope.selectedPanelIndex = 0;
    
    $scope.addPanel = function () {
	    $scope.panels.push(PanelsFactory.generatePanel());
	    $scope.panelSelected($scope.panels.length - 1, undefined);
    }
    
    $scope.removePanel = function() {
	    $scope.panels.remove($scope.selectedPanelIndex);
	    
	    $scope.selectedPanelIndex = 0;
		$scope.icons = $scope.panels[$scope.selectedPanelIndex].icons;
		$scope.iconId = undefined;
		$scope.iconIdUploaded = $scope.panels[$scope.selectedPanelIndex].iconIdUploaded
		
		if(!$scope.$$phase && !$scope.$root.$$phase)
	    	$scope.$apply();
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
    	
    	PanelsFactory.savedPanelsInMemory($scope.panels);
    }
    
    /* ICON */
    $scope.icons = $scope.panels[$scope.selectedPanelIndex].icons;
    
    $scope.addIcon = function (src) {
	    var icon = IconsFactory.generateIcon(src);
	    if (src === 'img/button_clear.png')
	    	icon.isClear = true;

	    $scope.icons[icon.id] = icon;
	    $scope.iconIdUploaded = icon.id;
	    $scope.iconId = undefined;
		
		$scope.saveActualPanel();
		
		if(!$scope.$$phase && !$scope.$root.$$phase)
		    $scope.$apply();
    }

    $scope.iconSelected = function (id, sender) {	    	    
	    
	    if ($scope.iconId != undefined) {
		    $scope.checkHeight();
			$scope.checkWidth();
	    }
	    
	    $scope.iconId = id;
    }
    
    $scope.addIconFile = function (src, fileType) {
	    $scope.icons[$scope.iconId].link = src;
	    $scope.icons[$scope.iconId].linkFileName = src.substr(src.lastIndexOf('/') + 1);
	    $scope.icons[$scope.iconId].type = fileType+'File';
	    
	    $scope.saveActualPanel();
    }
    
    $scope.removeIconFile = function () {
    	
    	 $http({
				url: 'remove', 
				method: "POST",
				data: {fileName: $scope.icons[$scope.iconId].linkFileName, presentationId: $cookies.presentationId},
				headers: {'Content-Type': 'application/json'}
			})
    	
    	$scope.icons[$scope.iconId].link = undefined;
	    $scope.icons[$scope.iconId].linkFileName = undefined;
	    
	    $scope.saveActualPanel();
    }
    
    $scope.removeIcon = function (id) {  
	    delete $scope.icons[id];
	    $scope.iconId = undefined;
	    
	    $scope.saveActualPanel();
	    
	    if(!$scope.$$phase && !$scope.$root.$$phase)
	    	$scope.$apply();   
    }
    
    
    $scope.checkWidth = function () {
	    
	    var width = $scope.icons[$scope.iconId].width
	    
	    
	    if (width == '' || isNaN(width)) { //si l'utilisateur laisse une valeur vide dans l'input on remet la largeur de l'image affichée
		    $scope.icons[$scope.iconId].width = angular.element($('#'+ $scope.iconId)).find('img')[0].width;
		    //$scope.icons[$scope.iconId].width = angular.element(document.querySelector('#'+ $scope.iconId)).find('img')[0].width;
	    }
	    
    }
    
    $scope.checkHeight = function () {
	    
	    var height = $scope.icons[$scope.iconId].height
	    
	    if (height == '' || isNaN(height)) { //si l'utilisateur laisse une valeur vide dans l'input on remet la largeur de l'image affichée
		    $scope.icons[$scope.iconId].height = angular.element($('#'+ $scope.iconId)).find('img')[0].height;
		    //$scope.icons[$scope.iconId].height = angular.element(document.querySelector('#'+ $scope.iconId)).find('img')[0].height;
	    }
    }
    
    
    /* BACKGROUND */
    $scope.addBackground = function (src, fileType) {
	    var background = BackgroundFactory.generateBackground(src, fileType);
	    $scope.panels[$scope.selectedPanelIndex].background = background;
	    
	    $scope.saveActualPanel();
    }
    
    $scope.removeBackground = function () {
    	
    	$http({
				url: 'remove', 
				method: "POST",
				data: {fileName: $scope.panels[$scope.selectedPanelIndex].background.fileName, presentationId: $cookies.presentationId},
				headers: {'Content-Type': 'application/json'}
			})

	    $scope.panels[$scope.selectedPanelIndex].background = undefined;
	    
	    $scope.saveActualPanel();
    }

    $scope.addBackgroundImage = function (src, fileType) {
    	//on sauvegarde l'image de bg 
	    $scope.panels[$scope.selectedPanelIndex].background.videoBackgroundSrc = src;
		$scope.panels[$scope.selectedPanelIndex].background.videoBackground = src.substr(src.lastIndexOf('/') + 1);
	    $scope.saveActualPanel();
    }

    $scope.removeBackgroundImage = function () {
    	
    	$http({
				url: 'remove', 
				method: "POST",
				data: {fileName: $scope.panels[$scope.selectedPanelIndex].background.videoBackground, presentationId: $cookies.presentationId},
				headers: {'Content-Type': 'application/json'}
			})

	    $scope.panels[$scope.selectedPanelIndex].background.videoBackground = undefined;
	    $scope.panels[$scope.selectedPanelIndex].background.videoBackgroundSrc = undefined;
	    
	    $scope.saveActualPanel();
    }
    
    $scope.getPanelBackground = function($index) {
    	var style = {};
    	    	
    	//dans le cas ou un imageBackgroundSrc est définit, on l'affiche
    	if ($scope.panels[$index].background != undefined) 
    	{    		
			if ($scope.panels[$index].background.videoBackgroundSrc && $scope.panels[$index].background.videoBackgroundSrc.length != 0) 
			{
				console.log('vidéo passe');
				
				style = {
					'backgroundImage': 'url(\''+$scope.panels[$index].background.videoBackgroundSrc+'\')',
					'filter':'progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true,src='+$scope.panels[$index].background.videoBackgroundSrc+',sizingMethod="scale")',
				};
			}
			else
			{
				console.log('vidéo no passe');
				
				style = {
					'backgroundImage': 'url(\''+$scope.panels[$index].background.src+'\')',
					'filter':'progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true,src='+$scope.panels[$index].background.src+',sizingMethod="scale")',
				};
			}
		}
		
		return style;
	}

	$scope.getWorkSpaceBackground = function($index) {
    	var style = {};
    	
    	//dans le cas ou un imageBackgroundSrc est définit, on l'affiche
    	if ($scope.panels[$index].background != undefined) {
			if ($scope.panels[$index].background.videoBackgroundSrc != undefined) {
				style = {'backgroundImage': 'url(\''+$scope.panels[$index].background.videoBackgroundSrc+'\')'};
			}
			else{
				style = {'backgroundImage': 'url(\''+$scope.panels[$index].background.src+'\')'};
			}
		}
		return style;
	}
    
    /*JSON */
    $scope.generateZip = function (event)
    {	 
	    if ($scope.presentationTitle == undefined || $scope.presentationTitle == "") {
	    	alert("You need to name your presentation before downloading it !");
	    }
	    else{
	    	//Piwik  
	    	_paq.push(['setCustomVariable','1','Save','save', 'visit']);
	    	_paq.push(['trackPageView']);

		    $scope.saveActualPanel();
		    //alert($scope.presentationTitle);
		    $cookies.presentationTitle = $scope.presentationTitle;
		    var JSONFile = generateJSON($scope.panels, $scope.presentationTitle);
					
			$http({
					url: 'json', 
					method: "POST", 
					data: {json: angular.toJson(JSONFile), presentationId: $cookies.presentationId, presentationTitle : $scope.presentationTitle},
					headers: {'Content-Type': 'application/json'}
				})
			.success(function (data, status, headers, config) {
				location.href = './zip';	
	        })
	        .error(function (data, status, headers, config) {
	        	console.log(data);
	        });	
	    }
    }
}]);