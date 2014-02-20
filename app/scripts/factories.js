panoply.factory('PanelsFactory', ['$cookies', 'IconsFactory', 'BackgroundFactory', 'localStorageService', function($cookies, IconsFactory, BackgroundFactory, localStorageService) {
    
    //var panels = undefined;
    
    return {
    
        panelsInit: function() {
            if (localStorageService.isSupported && localStorageService.get('panels') != undefined) 
            {
	            var panels = angular.fromJson(localStorageService.get('panels')).panels;
            }
            else if ($cookies.panels != undefined)
            {
	            var panels = $.parseJSON($cookies.panels).panels;
            }
			else
			{
				var panels = [this.generatePanel(), this.generatePanel(), this.generatePanel()];
				this.savedPanelsInMemory(panels);
			}
			
			return panels;
        },
        
        generatePanel: function () {
	        var panel = {};
	
			panel.id = generateUUID();
			panel.icons = {};
			panel.background = undefined;
			panel.iconIdUploaded = undefined;
	
			return panel;
        },
        
        savedPanelsInMemory: function(panelsToSaved) {
	        
	        if (localStorageService.isSupported) 
	        {
		        //local storage saving
				localStorageService.clearAll();
				localStorageService.add('panels', angular.toJson({panels :panelsToSaved}));
	        }
	        else 
	        {
		        //cookies saving
				$cookies.panels = angular.toJson({panels :panelsToSaved});
	        }
	        
        },        
        
        clearPanelsInMemory: function () {
	      
	      if (localStorageService.isSupported) 
			localStorageService.clearAll();
	      else
			$cookies.panels = undefined;

        },
        
        loadPanelsFromData: function (data) {
	        	        
	        var target_path = './app/uploads/'+ $cookies.presentationId + '/' ;
	        var iOSPanels = data.json.panos;
	        var jsPanels = new Array();
	        
	        var imgDimensions = data.imgDimension;
	        
	        for (var i=0; i<iOSPanels.length; i++)
	        {
		        var panel = this.generatePanel();
		        
		        var iOSBackground = iOSPanels[i].background;

		        var background = BackgroundFactory.generateBackground(target_path + iOSBackground.fileName, iOSBackground.type, target_path + iOSBackground.videoBackground);
		        
		        var iOSIcons = iOSPanels[i].icons;

		        var icons = {};
		        if (iOSIcons != undefined) {
			        for (var j=0; j<iOSIcons.length; j++)
			        {
				        var iOSIcon = iOSIcons[j];
				        var icon = IconsFactory.generateIcon(target_path + iOSIcon.imageUp)
						
				        icon.dropped = true;
				        icon.title = iOSIcon.title;
				        icon.type = iOSIcon.type;
				        icon.link = target_path + iOSIcon.link;
				        icon.linkFileName = iOSIcon.link;
				        
				        if (iOSIcon.imageUp === 'button_clear.png')
				        	icon.isClear = true;
				        console.log('icon link : '+icon.link);
				        icon.nWidth = imgDimensions[iOSIcon.imageUp].width;
				        icon.nHeight = imgDimensions[iOSIcon.imageUp].height;
				        
				        icon.width = iOSIcon.scaleX * icon.nWidth / 2;
				        icon.height = iOSIcon.scaleY * icon.nHeight / 2;
				        
				        icon.left = iOSIcon.posX/2 - icon.width/2;
				        icon.top = (1536-iOSIcon.posY)/2 - icon.height/2;
				        
	 			        icons[icon.id] = icon;
			        }
		    	}
		        
		        panel.icons = icons;
		        panel.background = background;
		        jsPanels.push(panel);
	        }
									
	        return jsPanels;
        }
    };
}]);


panoply.factory('IconsFactory', function() {
	
	
	return {
		
		generateIcon: function(src) {
			var icon = {};

			icon.id = generateUUID();	//titre
			icon.title = "";
			icon.fileName = src.substr(src.lastIndexOf('/') + 1);;
			icon.src = src;
			
			icon.dropped = undefined;
			
			icon.width = 200;
			icon.nWidth = undefined;
			icon.nHeight = undefined;		
			
			//lien
			icon.type = "kImageFile";
			icon.link = undefined;
			icon.linkFileName = undefined;
			
			//position
			icon.top = undefined;
			icon.left = undefined;
			
			icon.isClear = undefined;
			
			return icon;
		}
	}
	
});


panoply.factory('BackgroundFactory', function() {
	
	return {
	
		generateBackground: function(src, type, imgSrc) {
			var background = {};
		
			background.type = type;
			background.fileName = src.substr(src.lastIndexOf('/') + 1);
			background.src = src;

			videoBackGround = undefined;

			if (imgSrc != undefined && imgSrc != '') {
				videoBackGround = imgSrc.substr(imgSrc.lastIndexOf('/') + 1)
			}

			console.log('videobg : '+videoBackGround);

			if (background.type == 'kVideo' && videoBackGround != '' && videoBackGround != 'undefined' && videoBackGround != undefined) {
				background.videoBackgroundSrc = imgSrc;
				background.videoBackground = imgSrc.substr(imgSrc.lastIndexOf('/') + 1);
			}
			else{
				background.videoBackgroundSrc = undefined;
				background.videoBackground = undefined;
			}

			return background;
		}
	}
	
});