"use strict";
angular.module('ArtifactFeederApp.directives', [])

	//Search
	.directive('artifactSearch', function() {
		console.log("ArtifactFeederApp.directives: artifactSearch")
		return {
			restrict: 'E',
			scope: {
				searchModel: '=searchModel',
				onChange: '='
			},
			templateUrl: 'directives/searchBar.html'
		};
	}).
	controller('searchController', function($scope, ArtifactService){
		$scope.artifacts = ArtifactService.artifacts;
		$scope.isOpen = false;
		$scope.toggleSearchArea = function(){
			$scope.isOpen = !$scope.isOpen;
		}
		$scope.typeSelectChange = function(){
			console.log($scope.typeSelect);
		}
	}).


	//Map
	directive('mapInfoBox', function(){
		return {
			restrict: 'E',
			replace: false,
			templateUrl: 'directives/mapInfoBox.html',
			link: function(scope, element, attrs){
			}
		}
	});
