$(window).bind("resize", browserWidthChange);

var initialPanels = [generatePanel(), generatePanel(), generatePanel()];
var panoplyTypes = 	{ 	
						'kImage': ['jpg', 'jpeg', 'png', 'bmp'],
						'kVideo': ['mp4'],
						'kPDF':	['pdf'],
						'kLoad': ['zip']	
					};


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
	var panel = {};
	
	panel.id = generateUUID();
	panel.icons = {};
	panel.background = undefined;
	panel.iconIdUploaded = undefined;
	
	return panel;
}

function generateIcon(src) {
	
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

function generateBackground(src, type)
{
	var background = {};
		
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


function generateJSON(userPanels) {
	
	var panels = new Array();
		
	for (var i=0; i<userPanels.length; i++)
	{
		var icons = new Array();
		
		for (var tmpIconId in userPanels[i].icons)
		{				
			var tmpIcon = userPanels[i].icons[tmpIconId]
			
			if (tmpIcon.dropped != undefined)
			{
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
			
		}
		
		var tmpBackground = userPanels[i].background;
		
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
		
		
		var panel = {
			"id" : userPanels[i].id,
			"icons" : icons,
			"background" : background
		}
		
		panels.push(panel);
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
	
	return JSONFile;
}


/* --------    Méthodes annexes -------- */
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};