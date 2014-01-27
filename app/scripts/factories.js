panoply.factory('PanelsFactory', ['$cookies', function($cookies) {
    
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