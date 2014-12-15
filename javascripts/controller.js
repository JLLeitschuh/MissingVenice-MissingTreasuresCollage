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
	controller('mapController', function($scope, $filter, $timeout, leafletData, leafletEvents, $routeParams, ArtifactService, MapLocationService){
		console.log("ArtifactFeederApp.controllers: mapController");

		$scope.sliderData = {};
		angular.extend($scope.sliderData, {
			minValue: -400,
			maxValue: 2014,
			stepSize: 100,
			value: [-400, 2014],
			formatter: function(value){
				if(value < 0){
					return " " + (-1 *value) +"BC ";
				}
				return " " +  value + "AD ";
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

		var button = new L.Control.Button(btn);
		button.on('click', function () {
			//alert('you clicked the button!');
			resetAllElements();
		});


		angular.extend($scope, {
			elementSelected: false,
			controls: {
				custom: [
					L.control.locate(),
					L.control.fullscreen(),
					button
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

		$scope.showLeaflet = function() {
			leafletData.getMap().then(function(map) {
				map.fitBounds([[40.712, -74.227], [40.774, -74.125] ]);
			});
		};

		resetAllElements();


});
