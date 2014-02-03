panoply.directive('resizable', [function() { 
	
	return {
		restrict: 'A',
		replace: false,
		link: function(scope, element, attrs)  {
			 $(element).resizable();	
		}
	}
	
}]);


panoply.directive('draggable', [function() { 
	
	return {
		restrict: 'A',
		replace: false,
		link: function(scope, element, attrs)  {
			
			element.bind("load" , function(event){ 
				if (scope.icons[element[0].id].nWidth == undefined)
				{
					scope.icons[element[0].id].nWidth = getNaturalSize(element[0]).naturalWidth;
					scope.icons[element[0].id].nHeight = getNaturalSize(element[0]).naturalHeight;
					
					if (scope.icons[element[0].id].isClear == true)
					{
						scope.icons[element[0].id].width = 200;
						scope.icons[element[0].id].height = 200;
					}
					else
					{
						if (element[0].naturalWidth < 200)
							scope.icons[element[0].id].width = getNaturalSize(element[0]).naturalWidth;
						
						if (scope.icons[element[0].id].height == undefined){
							scope.icons[element[0].id].height = Math.ceil(getNaturalSize(element[0]).naturalHeight*scope.icons[element[0].id].width/getNaturalSize(element[0]).naturalWidth);
						}
					}
									
					if(!scope.$$phase && !scope.$root.$$phase)
						scope.$apply();
				}
				       
            });
			
			
			return element.draggable({
				cursor: 'move',
				revert: function(valid) {
					return !valid
				},
				start : function (event, ui) 
				{			
					scope.iconSelected(ui.helper.attr('id'), event);
				},
				snap: "workspace"
			});
			
		}
	}
	
}]);


panoply.directive('droppable', [function() { 
	
	return {
		restrict: 'A',
		replace: true,
		link: function(scope, element, attrs)  {
			
			return element.droppable({
				accept: '.draggable-object',
				drop: function(event, ui) 
			  	{		 			 			 	
				 	if (ui.draggable.parent().attr('id') == 'iconPlace')
				 	{
					 	ui.draggable.css('position', 'absolute');
					 
					 	//making sure the draggable div doesn't move on its own until we're finished moving it
					 	ui.draggable.draggable( "option", "revert", 'invalid' );
					 	
						//getting current div old absolute position
						var oldPosition = ui.draggable.offset();
						
						//assigning div to new parent
						var dropTarget = $(this);
						ui.draggable.appendTo(dropTarget);
						
						//getting current div new absolute position
						var newPosition = ui.draggable.offset();
						
						//calculate correct position offset
						var leftOffset = null;
						var topOffset = null;
						
						if(oldPosition.left > newPosition.left) 
							leftOffset = (oldPosition.left - newPosition.left);
						else 
							leftOffset = -(newPosition.left - oldPosition.left);
						
						if(oldPosition.top > newPosition.top) 
							topOffset = (oldPosition.top - newPosition.top);
						else 
							topOffset = -(newPosition.top - oldPosition.top);
						
						
						scope.icons[ui.draggable.attr('id')].top = ui.draggable.position().top + topOffset;
						scope.icons[ui.draggable.attr('id')].left = ui.draggable.position().left + leftOffset;
						scope.icons[ui.draggable.attr('id')].dropped = true;
						scope.iconSelected(ui.draggable.attr('id'), event);
						scope.iconIdUploaded = undefined;
						
						ui.draggable.remove();
												
						if(!scope.$$phase && !scope.$root.$$phase)
							scope.$apply();
							
						scope.saveActualPanel();
				 	}
				 	else
				 	{
					 	scope.icons[ui.draggable.attr('id')].top = ui.draggable.position().top;
					 	scope.icons[ui.draggable.attr('id')].left = ui.draggable.position().left;					 	
				 	}
				 }
			});
			
		}
	}
	
}]);


panoply.directive('trash', ['$http', '$cookies', function($http, $cookies) {
	
	return {
		restrict: 'A',
		replace: true,
		link : function(scope, element, attrs) {
			
			return element.droppable ({
				accept: '.draggable-object',
				out: function (event, ui) {
					$(this).removeClass('highlightTrash');
				},
				over: function (event, ui) {
					$(this).addClass('highlightTrash');
				},
				drop: function (event, ui) {
					
			        var id; 
			        if (ui.draggable.attr('id') == scope.iconIdUploaded)
			        	id = scope.iconIdUploaded;
			        else
			        	id = scope.iconId
			        
			        $http({
				        url: '/remove', 
						method: "POST",
						data: {fileName: scope.icons[id].fileName, presentationId: $cookies.presentationId},
						headers: {'Content-Type': 'application/json'}
			        })
			        
			        if (scope.icons[id].linkFileName != undefined)
			        {
				        $http({
				        	url: '/remove', 
							method: "POST",
							data: {fileName: scope.icons[id].linkFileName, presentationId: $cookies.presentationId},
							headers: {'Content-Type': 'application/json'}
						})
			        }
			        
			        
			        
			        if (ui.draggable.attr('id') == scope.iconIdUploaded)
			        	scope.iconIdUploaded = undefined;
					
					scope.removeIcon(ui.draggable.attr('id'));
					ui.draggable.remove();
					$(this).removeClass('highlightTrash');
				}
			});
			
		}
	}
	
}]);