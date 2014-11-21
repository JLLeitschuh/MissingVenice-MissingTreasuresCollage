"use strict";
console.log('loading app');
angular.
	module('ArtifactFeederApp', [
		'ArtifactFeederApp.controllers',
		'ArtifactFeederApp.directives',
		'ArtifactFeederApp.services',
		'ArtifactFeederApp.filters',
		'ArtifactFeederApp.view',
		'ui.bootstrap-slider',
		'ckServices',
		'ngRoute'
	]).
	/** Defines page navigation */
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
			when("/home", {templateUrl: "partials/collage.html", controller: "artifactsController"}).
			when("/map", {templateUrl: "partials/map.html", controller:"mapController"}).
			when("/map/group/:group/id/:id", {templateUrl: "partials/map.html", controller:"mapController"}).
			when("/list", {templateUrl: "partials/listRaw.html", controller:"listController"}).
			when("/artifacts/group/:group", {templateUrl: "partials/collage.html", controller: "artifactsGroupController"}).
			when("/artifact/group/:group/id/:id", {templateUrl: "partials/artifact.html", controller: "artifactController"}).
			otherwise({redirectTo: '/home'});
		}
	]);
