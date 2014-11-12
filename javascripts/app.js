"use strict";
console.log('loading app');
angular.
	module('ArtifactFeederApp', [
		'ArtifactFeederApp.controllers',
		'ArtifactFeederApp.services',
		'ArtifactFeederApp.view',
		'ckServices',
		'ngRoute'
	]).
	/** Defines page navigation */
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
			when("/home", {templateUrl: "partials/collage.html", controller: "artifactsController"}).
			when("/artifact/group/:group/id/:id", {templateUrl: "partials/artifact.html", controller: "artifactController"}).
			otherwise({redirectTo: '/home'});
		}
	]);
