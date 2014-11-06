angular.module('ArtifactFeederApp.controllers', []).
	controller('artifactsController', function($scope, ArtifactService) {
		console.log("ArtifactFeederApp.controllers: artifactsController");
		$scope.nameFilter = null;

	}).
	controller('artifactController', function($scope, ArtifactService){
		console.log("ArtifactFeederApp.controllers: artifactController");


	});
