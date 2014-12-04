"use strict";
angular.module('ArtifactFeederApp.view', []).
	controller('headerDisplay', function($scope, $modal, $location, $log) {

		$scope.path = function(){
			return $location.path();
		}

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
