"use strict";
angular.module('ArtifactFeederApp.view', []).
	controller('headerDisplay', function($scope, $modal, $log) {
		/**
		* Holds the data for the NavTag
		* @param <String> name The nav button to add
		*/
		function NavTag(name){
			this.name = name;
			this.linkName = name.replace(/ /g, "_");
			this.link = "./#/artifacts/group/" + this.linkName;
		}
		//The list of nav tags to have
		$scope.allNavs =[];
		// $scope.allNavs = [
		// 	new NavTag("Art"),
		// 	new NavTag("Churches"),
		// 	new NavTag("Convents"),
		// 	new NavTag("Rio Tera'"),
		// 	new NavTag("Repurposed"),
		// 	new NavTag("Demolished")
		// ];

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
