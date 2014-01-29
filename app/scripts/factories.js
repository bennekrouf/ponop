panoply.factory('PanelsFactory', ['$cookies', 'IconsFactory', 'BackgroundFactory', function($cookies, IconsFactory, BackgroundFactory) {
    
    //var panels = undefined;
    
    return {
    
        panelsInit: function() {
            if ($cookies.panels != undefined)
				var panels = $.parseJSON($cookies.panels).panels	
			else
			{
				var panels = [this.generatePanel(), this.generatePanel(), this.generatePanel()];
				this.savedPanelsInCookie(panels);
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
        
        savedPanelsInCookie: function(panelsToSaved) {
	        $cookies.panels = JSON.stringify({panels :panelsToSaved});
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
		        var background = BackgroundFactory.generateBackground(target_path + iOSBackground.fileName, iOSBackground.type);
		        
		        var iOSIcons = iOSPanels[i].icons;
		        var icons = {};
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
			        
			        icon.nWidth = imgDimensions[iOSIcon.imageUp].width;
			        icon.nHeight = imgDimensions[iOSIcon.imageUp].height;
			        
			        icon.width = iOSIcon.scaleX * icon.nWidth / 2;
			        icon.height = iOSIcon.scaleY * icon.nHeight / 2;
			        
			        icon.left = iOSIcon.posX/2 - icon.width/2;
			        icon.top = (1536-iOSIcon.posY)/2 - icon.height/2;
			        
 			        icons[icon.id] = icon;
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
	
		generateBackground: function(src, type) {
			var background = {};
		
			background.type = type;
			background.fileName = src.substr(src.lastIndexOf('/') + 1);
			background.src = src;
	
			return background;
		}
	}
	
});