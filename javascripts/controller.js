"use strict";
/****************************************
 All of the controllers for the project.
 These are what define what happens when
 a page is loaded.
 Controllers only run once ever time
 a page is loaded
 (EG: Pressing the home button twice would
 reload its respective controller twice.)
 If you want something that runs once
 (singleton) look into using a service
 or factory (services.js).
****************************************/

angular.module('ArtifactFeederApp.controllers', ['ui.bootstrap']).

	/*
	 * Controller for the loading bar.
	 */
	controller('loadingBarController', function($scope, ArtifactService){
		$scope.percentComplete = 10;
		var groupsLoaded = [];
		/* Displays what groups have been been loaded */
		$scope.getPopOverText = function(){
			var returnString = "";
			if(groupsLoaded.length != 0){
				for(var i in groupsLoaded){
					if(i == 0){
						returnString = groupsLoaded[i];
					} else {
						returnString += ", " + groupsLoaded[i];
					}
				}
			} else {
				returnString = "None";
			}
			return "Loaded: " + returnString;
		};

		var percentPerStep = 90/ArtifactService.datasetCount;

		/* When an artifact group is loaded */
		$scope.$on( ArtifactService.artifactGroupLoadedMessage, function(event, groupName){
			//Increase the the percent complete
			$scope.percentComplete += percentPerStep;
			//Also store the name for the popup text
			groupsLoaded.push(groupName);
		});
	}).

	/**
	 * Controller for displaying the collage
	 */
	controller('artifactsController', function($scope, $rootScope, ArtifactService) {
		console.log("ArtifactFeederApp.controllers: artifactsController");
		$scope.nameFilter = null;

		$scope.searchBar = $rootScope.searchBar;

		var resizeTimer = null;
		var collageImagesFunction = function() {
			// hide all the images until we resize them
			$('.Collage .Image_Wrapper').css("opacity", 0);
			// set a timer to re-apply the plugin
			if (resizeTimer) clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function(){
				// We have to remove the caption manually or it will be left over on some images.
				$("div.Caption").remove();
				collage();
				$('.Collage').collageCaption();
			}, 250);
		};

		$scope.searchChange = collageImagesFunction;

		$scope.random = function(){
			return 0.5 - Math.random();
		};

		// This is just for the case that the browser window is resized
		$(window).bind('resize', collageImagesFunction);
		collageImagesFunction();

		$scope.$on($scope.searchBar.onChangeNotifier, function(event){
			collageImagesFunction();
		});



		$scope.artifacts = ArtifactService.artifacts;



		//Only try to load the images once all of the datasets have been retrived
		//Keep track how many groups have been loaded so far
		var groupsLoaded = 0;
		$scope.$on( 'artifacts.group.loaded', function (event){
			groupsLoaded ++;
			if( groupsLoaded == ArtifactService.datasetCount) {
				var wrappers = document.querySelector('#image_container');
				var imgLoad = imagesLoaded( wrappers );
				var onAlways = function ( instance ) {
					$scope.$apply;
					//This should only happen once all of the images have finished being loaded
					console.log("All images loaded");
					$("div.Caption").remove();
					collage();
					$('.Collage').collageCaption();
				}
				imgLoad.on( 'always', onAlways );
			}
		});

	}).

	/**
	 * Controller for displaying one of the artifacts information
	 */
	controller('artifactController', function($scope, $routeParams, ArtifactService){
		console.log("ArtifactFeederApp.controllers: artifactController");
		$scope.artifact = null;
		var tryLoad = function (event){
			$scope.artifactKey = {groupName: $routeParams.group, id: $routeParams.id};
			$scope.artifact = ArtifactService.getArtifactFromLinkData($scope.artifactKey)[0];
			console.log($scope.artifact);
			try{
				var slides = $scope.slides = $scope.artifact.imageData;
			} catch (e){

			}
		};
		//Every time a new group is loaded then the page should try to display the data
		$scope.$on( 'artifacts.group.loaded', tryLoad);

		tryLoad();

		$scope.myInterval = 5000;

	}).
	controller('listController', function($scope, $rootScope, $routeParams, ArtifactService){
		$scope.artifacts = ArtifactService.artifacts;

		$scope.searchBar = $rootScope.searchBar;

	}).


	/************************************
	 Map Controller
	*************************************/
	controller('mapController', function($scope, leafletData, $routeParams, ArtifactService, MapLocationService){
		console.log("ArtifactFeederApp.controllers: mapController");
		//Example code:

		$scope.sliderData = {
			minValue: 1000,
			maxValue: 2014,
			currentValue: 1500,
			stepSize: 10
		};


		angular.extend($scope, {
		center: {
				lat: 45.4375,
				lng: 12.3358,
				zoom: 13
			}
		});


		leafletData.getMap().then(function(map) {
			map.on('ready', function() {
					new L.Control.MiniMap(L.mapbox.tileLayer('missingvenice.ke9kdd63'))
							.addTo(map);
			});

			var myLayer = L.mapbox.featureLayer().addTo(map);


			var geoJson = { "type": "FeatureCollection",
					features: [
					{ type: "Feature",
						geometry: { "type": "Point", "coordinates": [ 12.3350504, 45.4308256]},
						properties: {
							image: "./images/bernardoNani.JPG.jpg",
							url: "http://it.wikipedia.org/wiki/Palazzo_Bernardo_Nani",
							"marker-color": "#ff8888",
							"marker-symbol": "1",
							"Location Name": "Palazzo Bernardo Nani"}
			},
				{ "type": "Feature",
					"geometry": { "type": "Point", "coordinates": [2.34027, 48.872766]},
					"properties": {
							"image": "./images/druout.JPG.jpg",
							"url": "http://en.wikipedia.org/wiki/H%C3%B4tel_Drouot",
							"marker-color": "#ff8888",
							"marker-symbol": "2",
							"Location Name": "Hotel Drouot"}
			},
				{ "type": "Feature",
					"geometry": { "type": "Point", "coordinates": [-73.9537099, 40.7662584]},
					"properties": {
							"image": "./images/sothebys.JPG.jpg",
							"url": "http://en.wikipedia.org/wiki/Sotheby%27s",
							"marker-color": "#ff8888",
							"marker-symbol": "3",
							"Location Name": "Sotheby's"}
			},
				{ "type": "Feature",
					"geometry": { "type": "Point", "coordinates": [-97.365136, 32.748612]},
					"properties": {
							"image": "./images/Kimbell.JPG.jpg",
							"url": "http://en.wikipedia.org/wiki/Kimbell_Art_Museum",
							"marker-color": "#ff8888",
							"marker-symbol": "4",
							"Location Name": "Kimbell Art Museum"}
			},
				{ "type": "Feature",
					"geometry": {"type": "LineString", "coordinates": [[ 12.3350504, 45.4308256], [2.34027, 48.872766], [-73.9537099, 40.7662584], [-97.365136, 32.748612]]},
					"properties": {"description":"Made by Lysippos",
							"stroke":"#1087bf",
							"stroke-opacity": 1,
							"stroke-width": 4,
							"title": "Head of an Athlete(Apoxyomenos)"}
					}
				]
			};
			//console.log(geoJson);


			// Start and end points, in x = longitude, y = latitude values
			//var start = { x: -122, y: 48 };
			//var end = { x: -77, y: 39 };
			//var generator = new arc.GreatCircle(start, end, { name: 'Seattle to DC' });
			//var line = generator.Arc(1, { offset: 200 });



			// Add custom popups to each using our custom feature properties
			myLayer.on('layeradd', function(e) {
					var marker = e.layer, feature = marker.feature;

					// Create custom popup content
					var popupContent =
						'<div style="width: 305px; height: 150px; overflow: scroll;"> ' +
							'<a target="_blank" class="popup" href="' + feature.properties.url + '">' +
								'<img src="' + feature.properties.image + '" />' +
							'</a>' +
							"<b>" + feature.properties["Location Name"] + "</b></br>" +
							"Pieces At Location (" + feature.properties["item count"] + "): </br>"
							+ feature.properties["Pieces At Location"] +
						'</div>';

					// http://leafletjs.com/reference.html#popup
					marker.bindPopup(popupContent,{
							closeButton: false,
							minWidth: 320
					});
			});

			L.control.fullscreen().addTo(map);

			L.control.locate().addTo(map);

			$scope.$on(MapLocationService.addedMessage, function(event){
				console.log(MapLocationService.geoJson);
				myLayer.setGeoJSON(MapLocationService.geoJson);
			});
			myLayer.setGeoJSON(MapLocationService.geoJson);

			//L.geoJson(line.json()).addTo(map);

			// Add features to the map
		});



		$scope.showLeaflet = function() {
			leafletData.getMap().then(function(map) {
				map.fitBounds([[40.712, -74.227], [40.774, -74.125] ]);
			});
		};


});
