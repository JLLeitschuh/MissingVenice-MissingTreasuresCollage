"use strict";
angular.module('ArtifactFeederApp.view', []).
	controller('headerDisplay', function($scope) {
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
		$scope.allNavs = [
			new NavTag("Art"),
			new NavTag("Churches"),
			new NavTag("Convents"),
			new NavTag("Rio Tera'"),
			new NavTag("Repurposed"),
			new NavTag("Demolished")
		];
	});
