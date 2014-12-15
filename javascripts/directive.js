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


	//Map Info Box
	directive('mapInfoBox', function(){
		return {
			restrict: 'E',
			replace: false,
			templateUrl: 'directives/mapInfoBox.html',
			link: function(scope, element, attrs){
			}
		}
	}).

	//Used to generate the key
	directive('dashedLine', function(){
		return {
			restrict: 'E',
			replace: true,
			template: '<canvas width="20" height="10">Dashed:</canvas>',
			link: function(scope, element, attrs){
				var c = element[0];
				var ctx = c.getContext("2d");
				ctx.setLineDash([3,3]);
				ctx.moveTo(0,5);
				ctx.lineTo(20, 5);
				ctx.stroke();
			}
		}
	}).

	directive('solidLine', function(){
		return {
			restrict: 'E',
			replace: true,
			template: '<canvas width="20" height="10">Dashed:</canvas>',
			link: function(scope, element, attrs){
				var c = element[0];
				var ctx = c.getContext("2d");
				ctx.moveTo(0,5);
				ctx.lineTo(20, 5);
				ctx.stroke();
			}
		}
	}).

	directive('mapKey', function(){
		return {
			restrict: 'E',
			replace: true,
			template: '<div class="well well-sm">' +
						'<dashed-line></dashed-line> Date Moved Unknown '+
						'<solid-line></solid-line> Date Moved Known'+
					  '</div>',
			link: function(scope, element, attrs){
			}
		}
	});
