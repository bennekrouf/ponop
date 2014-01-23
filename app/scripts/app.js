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

var panoply = angular.module('Panoply', ['angularFileUpload', 'ngCookies'])

var initialPanels = [generatePanel(), generatePanel(), generatePanel()];

panoply.run(['$rootScope', '$http', '$cookies',  function ($rootScope, $http, $cookies) {
  	
  	browserWidthChange();
  	
  	if ($cookies.panels != undefined)
  	{
	  	var savedPanels = $.parseJSON($cookies.panels);
	  	initialPanels = savedPanels.panels;
  	}
  	else
  	{
	  	$http({url: '/createPresentation',method: "POST"})
			.then(function(response) {
        		$cookies.presentationId = response.data;
        		$cookies.panels = JSON.stringify({panels :initialPanels});
			}, 
		function(error) {});
  	}
  	
  	
  
}]);


panoply.controller('PanoplyCtrl', ["$scope", "$compile", "$upload", '$cookies', '$http', '$window', function($scope, $compile, $upload, $cookies, $http, $window){

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
				headers: {'presentationid': $cookies.presentationId}, withCredential: true,
				file: file,
			})
			.progress(function(evt) {
				if (typeOfUpload === 'icon')
					$scope.progressBarIcon = parseInt(100.0 * evt.loaded / evt.total);
				else if (typeOfUpload === 'background')
					$scope.progressBarBackground = parseInt(100.0 * evt.loaded / evt.total);
				else if (typeOfUpload === 'file')
					$scope.progressBarFile = parseInt(100.0 * evt.loaded / evt.total);
			})
			.success(function(data, status, headers, config) {
				if (typeOfUpload === 'icon')
					$scope.addIcon(data.url);
				else if (typeOfUpload === 'background')
					$scope.addBackground(data.url, fileType);
				else if (typeOfUpload === 'file')
					$scope.addIconFile(data.url, fileType)
				
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
				else if (typeOfUpload === 'file')
					$scope.progressBarFile = parseInt(0);
			})
	}
    
    
    
    
    /* PANELS */
    $scope.panels = initialPanels;
    
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
    	
    	if(!$scope.$$phase && !$scope.$root.$$phase)
	    	$scope.$apply();
    	
    	$cookies.panels = JSON.stringify({panels :$scope.panels});
    	console.log($cookies.panels);
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

    $scope.iconSelected = function (id, sender) {	    	    
	    $scope.iconId = id;
    }
    
    $scope.addIconFile = function (src, fileType) {
	    $scope.icons[$scope.iconId].link = src;
	    $scope.icons[$scope.iconId].linkFileName = src.substr(src.lastIndexOf('/') + 1);
	    $scope.icons[$scope.iconId].type = fileType+'File';
    }
    
    $scope.removeIconFile = function () {
    	
    	 $http({
				url: '/remove', 
				method: "POST",
				data: {fileName: $scope.icons[$scope.iconId].linkFileName, presentationId: $cookies.presentationId},
				headers: {'Content-Type': 'application/json'}
			})
    	
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
    	
    	$http({
				url: '/remove', 
				method: "POST",
				data: {fileName: $scope.panels[$scope.selectedPanelIndex].background.fileName, presentationId: $cookies.presentationId},
				headers: {'Content-Type': 'application/json'}
			})
    
    
	    $scope.panels[$scope.selectedPanelIndex].background = undefined;
    }
    
    
    /*JSON */
    $scope.generateZip = function (event)
    {	    
	    $scope.saveActualPanel();
	    
	    var JSONFile = generateJSON($scope.panels);
		
		console.log(JSON.stringify(JSONFile));
		
		$http({
				url: '/json', 
				method: "POST", 
				data: {json: JSON.stringify(JSONFile), presentationId: $cookies.presentationId},
				headers: {'Content-Type': 'application/json'}
			})
		.success(function (data, status, headers, config) {
			location.href = './zip';	
        })
        .error(function (data, status, headers, config) {
        	console.log(data);
        });	
    }
    
    /*
    $scope.requestZip = function () {
	    
	    $http({
				url: '/zip', 
				method: "GET"
			})
			.success(function (data, status, headers, config) {
				console.log(data);
				console.log(headers);
			})
			.error(function (data, status, headers, config) {
				console.log(data);
				console.log(headers);
			});
	    
    }*/

}]);