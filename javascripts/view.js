"use strict";
angular.module('ArtifactFeederApp.view', []).
	controller('headerDisplay', function($scope, $modal, $location, $log, ArtifactService, LocationService) {

		$scope.path = function(){
			return $location.path();
		}

		$scope.searchBar= {
			distanceFilterButton: {
				isDisabled: function(){
					var a = ArtifactService;
					return a.datasetCount != a.totalDatasetLoaded;
				},
				clicked: function(){
					console.log("Order By Distance Clicked");
					ArtifactService.calculateArtifactDistances(function(error){
						console.log("Error: " + error);
					});
				}
			},
		};

		$scope.open = function (size) {
			var modalInstance = $modal.open({
				templateUrl: 'myModalContent.html',
				controller: 'HelpModalInstanceController',
				size: size
			});

			modalInstance.result.then(function () {}, function () {
				$log.info('Modal dismissed at: ' + new Date());
			});
		};
	})
	.controller('HelpModalInstanceController', function($scope, $modalInstance){
		$scope.ok = function () {
			$modalInstance.close();
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

	});
