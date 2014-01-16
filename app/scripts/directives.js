panoply.directive('draggable', [function() { 
	
	return {
		restrict: 'A',
		replace: true,
		link: function(scope, element, attrs)  {
			
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
				 	//$('#iconInfos').show();
				 	
				 	//$('#iconeProgress .progress-bar').css('width','0%');
				 					 	
				 	
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
						scope.iconSelected(ui.draggable.attr('id'));
						scope.iconIdUploaded = undefined;
						
						ui.draggable.remove();

						if(!scope.$$phase && !scope.$root.$$phase)
							scope.$apply();
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


panoply.directive('trash', [function() {
	
	return {
		restrict: 'A',
		replace: true,
		//transclude: false,
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
					
					/*
					$.ajax({
			            type: "POST",
			            url: repoFiles+"delete_file.php",
			            dataType: 'json',
			            data: { 
			            	file: iconSelected.fileName
			            }
			        });*/
			        
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