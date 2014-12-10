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
	directive('mapboxMap', function(){
		return {
			restrict: 'E',
			replace: false,
			link: function(scope, element, attrs){
				//This runs every time the page loads
				L.mapbox.accessToken = 'pk.eyJ1IjoibWlzc2luZ3ZlbmljZSIsImEiOiI3a1NDNmZBIn0.Mm_zu86pzLH-wZlNRKsYIw';
				var map = L.mapbox.map(element[0], 'missingvenice.ke9kdd63')
						.setView([40,-40], 3)
						//.on('ready', function() {
								//new L.Control.MiniMap(L.mapbox.tileLayer('missingvenice.ke9kdd63'))
								//		.addTo(map);
						//});

				var myLayer = L.mapbox.featureLayer().addTo(map);


				var geoJson = { "type": "FeatureCollection",
						"features": [
						{ "type": "Feature",
							"geometry": { "type": "Point", "coordinates": [ 12.3350504, 45.4308256]},
							"properties": {
								"image": "./images/bernardoNani.JPG.jpg",
								"url": "http://it.wikipedia.org/wiki/Palazzo_Bernardo_Nani",
								"marker-color": "#ff8888",
								"marker-symbol": "1",
								"city": "Palazzo Bernardo Nani"}
				},
					{ "type": "Feature",
						"geometry": { "type": "Point", "coordinates": [2.34027, 48.872766]},
						"properties": {
								"image": "./images/druout.JPG.jpg",
								"url": "http://en.wikipedia.org/wiki/H%C3%B4tel_Drouot",
								"marker-color": "#ff8888",
								"marker-symbol": "2",
								"city": "Hotel Drouot"}
				},
					{ "type": "Feature",
						"geometry": { "type": "Point", "coordinates": [-73.9537099, 40.7662584]},
						"properties": {
								"image": "./images/sothebys.JPG.jpg",
								"url": "http://en.wikipedia.org/wiki/Sotheby%27s",
								"marker-color": "#ff8888",
								"marker-symbol": "3",
								"city": "Sotheby's"}
				},
					{ "type": "Feature",
						"geometry": { "type": "Point", "coordinates": [-97.365136, 32.748612]},
						"properties": {
								"image": "./images/Kimbell.JPG.jpg",
								"url": "http://en.wikipedia.org/wiki/Kimbell_Art_Museum",
								"marker-color": "#ff8888",
								"marker-symbol": "4",
								"city": "Kimbell Art Museum"}
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


				// Start and end points, in x = longitude, y = latitude values
				//var start = { x: -122, y: 48 };
				//var end = { x: -77, y: 39 };
				//var generator = new arc.GreatCircle(start, end, { name: 'Seattle to DC' });
				//var line = generator.Arc(1, { offset: 200 });



				// Add custom popups to each using our custom feature properties
				myLayer.on('layeradd', function(e) {
						var marker = e.layer,
								feature = marker.feature;

						// Create custom popup content
						var popupContent =  '<a target="_blank" class="popup" href="' + feature.properties.url + '">' +
																		'<img src="' + feature.properties.image + '" />' +
																		feature.properties.city +
																'</a>';

						// http://leafletjs.com/reference.html#popup
						marker.bindPopup(popupContent,{
								closeButton: false,
								minWidth: 320
						});
				});

				//L.control.fullscreen().addTo(map);

				//L.control.locate().addTo(map);

			//	myLayer.setGeoJSON(geoJson);

				//L.geoJson(line.json()).addTo(map);

				// Add features to the map
			}
		}
	});
