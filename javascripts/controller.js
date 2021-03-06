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

angular.module('ArtifactFeederApp.controllers', []).

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
	controller('mapController', function($scope, $filter, $timeout, $compile, leafletData, leafletEvents, $routeParams, ArtifactService, MapLocationService){
		console.log("ArtifactFeederApp.controllers: mapController");

		$scope.convertDateValueToString = function(value){
			if(value < 0){
				return (-1 *value) +"BC";
			}
			return value + "AD";
		};

		$scope.sliderData = {};
		angular.extend($scope.sliderData, {
			minValue: -400,
			maxValue: 2014,
			stepSize: 100,
			value: [-400, 2014],
			formatter: function(value){
				return " " + $scope.convertDateValueToString(value) + " ";
			},
		});
		$scope.sliders = {
			sliderValue: $scope.sliderData.value,
		};


		var timeout;
		$scope.$watch('sliders.sliderValue', function(){
			var updateMapPaths = function(){
				console.log("Slider Change Complete");
				MapLocationService.setElementVisibiltyBasedOnDate(
					$scope.sliders.sliderValue[0],
					$scope.sliders.sliderValue[1]);
			};
			if (timeout) {
				$timeout.cancel(timeout);
			}
			timeout = $timeout(updateMapPaths, 200);
		}, true);


		angular.extend($scope, {
			center: {
				lat: 45.4375,
				lng: 12.3358,
				zoom: 13
			}
		});


		var highlightMarkerEvent = function(e, args){
			$scope.markers[args.markerName].wasClicked();
			console.log(args);
		};

		var highlightPathEvent = function(e, args){
			$scope.paths[args.pathName].wasClicked();
		};

		var resetAllElements = function(){
			for(var m in $scope.markers){
				$scope.markers[m].resetMarker();
			}
			for(var p in $scope.paths){
				$scope.paths[p].resetPath();
			}
			angular.extend($scope.infoBox, {
				title: "",
				type: "",
				data:[]
			});
		};

		$scope.$on('leafletDirectiveMarker.click', function(e, args) {
			// Args will contain the marker name and other relevant information
			console.log("Leaflet Marker Click");
			//console.log(args);
			var data = args.leafletEvent.target.options.data;
			angular.extend($scope.infoBox, {
				title: data.name,
				type: "Marker",
				data: data.pieces
			});
			highlightMarkerEvent(e, args);
		});

		$scope.$on('leafletDirectivePath.click', function(e, args) {
			// Args will contain the marker name and other relevant information
			console.log("Leaflet Path Click");
			//console.log(args);
			var data = args.leafletEvent.target.options.data;
			angular.extend($scope.infoBox, {
				title: data.piece.name,
				type: "Path",
				data: data.piece
			});
			highlightPathEvent(e, args);
		});


		var btn = document.createElement("BUTTON");        // Create a <button> element
		var t = document.createTextNode("Clear Selecton");       // Create a text node
		btn.appendChild(t);                                // Append the text to <button>
		btn.className = "btn btn-default btn-sm";
		btn['arial-label'] = "Left Align";
		btn.type = "button";

		var button = new L.Control.Button(btn, {position:'bottomright'});
		button.on('click', function () {
			//alert('you clicked the button!');
			resetAllElements();
		});


		//Animate button

		var btn2 = document.createElement("BUTTON");        // Create a <button> element
		var t2 = document.createTextNode("Animate");       // Create a text node
		btn2.appendChild(t2);                                // Append the text to <button>
		btn2.className = "btn btn-default btn-sm";
		btn2['arial-label'] = "Left Align";
		btn2.type = "button";

		var button2 = new L.Control.Button(btn2, {position:'bottomright'});
		button2.on('click', function () {
			/*
			 * XXX This is incredibly hacky and horendous code
			 * This functionalty would be nearly impossible without it however...
			 */
			var paths = document.getElementsByTagName('path');
			angular.forEach(paths, function(path){
				if(path.getAttributeNode("stroke-dasharray")){
					return;
				}

				var totalLength = path.getTotalLength();
				path.style.strokeDashoffset = totalLength;
				path.style.strokeDasharray = 0;

				setTimeout((function(path) {
					return function() {
						// setting the strokeDashoffset to 0 triggers
						// the animation.
						path.style.strokeDasharray = totalLength;
						path.style.strokeDashoffset = 0;
					};
				})(path), 5000);
			});
		});


		angular.extend($scope, {
			elementSelected: false,
			controls: {
				custom: [
					L.control.locate(),
					L.control.fullscreen(),
					button,
					button2
				]
			},
			markers: MapLocationService.markers,
			paths: MapLocationService.paths,
			infoBox: {
				title:"",
				type:"",
				data:[]
			}
		}); //end extend


		//Don't really understand why but this speeds up the map
		//Found this here: https://github.com/tombatossals/angular-leaflet-directive/issues/290
		$scope.events = {
			map : { disable : leafletEvents.getAvailableMapEvents() },
			markers : { disable : leafletEvents.getAvailableMarkerEvents() }
		};

		leafletData.getMap().then(function(map) {
			//L.DomUtil.create('map-info-box');
			var createInfoBox = function(){
				var info = L.control({position: "topright"});
				info.onAdd = function (map) {
					var htmlContent = "<map-info-box></map-info-box>";
					$scope.compiled = $compile(htmlContent)($scope);
					this._content = $scope.compiled[0];
					L.DomEvent.disableClickPropagation(this._content);
					return this._content;
				};
				return info;
			}
			var createMapKey = function(){
				var key = L.control({position: "bottomleft"});
				key.onAdd = function (map) {
					var htmlContent = "<map-key></map-key>";
					$scope.compiled = $compile(htmlContent)($scope);
					this._content = $scope.compiled[0];
					L.DomEvent.disableClickPropagation(this._content);
					return this._content;
				};
				return key;
			};

			var createMapSlider = function(){
				var slider = L.control({position: "bottomleft"});
				slider.onAdd = function (map) {
					var htmlContent = "<map-slider></map-slider>";
					$scope.compiled = $compile(htmlContent)($scope);
					this._content = $scope.compiled[0];
					L.DomEvent.disableClickPropagation(this._content);
					return this._content;
				};
				return slider;
			};

			createInfoBox().addTo(map);
			createMapSlider().addTo(map);
			createMapKey().addTo(map);


		});

		$scope.showLeaflet = function() {
			leafletData.getMap().then(function(map) {
				map.fitBounds([[40.712, -74.227], [40.774, -74.125] ]);
			});
		};

		resetAllElements();


});
