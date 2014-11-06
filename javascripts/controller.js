angular.module('ArtifactFeederApp.controllers', []).
	controller('artifactsController', function($scope, ArtifactService) {
		console.log("ArtifactFeederApp.controllers: artifactsController");
		$scope.nameFilter = null;

		var resizeTimer = null;
		var collageImagesFunction = function() {
			// hide all the images until we resize them
			$('.Collage .Image_Wrapper').css("opacity", 0);
			// set a timer to re-apply the plugin
			if (resizeTimer) clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function(){
				// We have to remove the caption manually or it will be left over on some images.
				$("div.Caption").remove();
				collage();
				$('.Collage').collageCaption();
			}, 250);
		};

		$scope.searchChange = collageImagesFunction;

		// This is just for the case that the browser window is resized
		$(window).bind('resize', collageImagesFunction);
	}).
	controller('artifactController', function($scope, ArtifactService){
		console.log("ArtifactFeederApp.controllers: artifactController");


	});
