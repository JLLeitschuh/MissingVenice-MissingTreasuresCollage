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
			when("/map", {templateUrl: "partials/map.html", controller:"mapController"}).
			when("/map/group/:group/id/:id", {templateUrl: "partials/map.html", controller:"mapController"}).
			when("/artifacts/group/:group", {templateUrl: "partials/collage.html", controller: "artifactsGroupController"}).
			when("/artifact/group/:group/id/:id", {templateUrl: "partials/artifact.html", controller: "artifactController"}).
			otherwise({redirectTo: '/home'});
		}
	]);
