"use strict";
angular.module('ArtifactFeederApp.services', []).
	/*
	 * Singelton that controls getting the artifact data from the CK-Console
	 * Collects all of the artifacts into one list.
	 *
	 */
	factory('ArtifactService', ['$rootScope', '$location', 'ckConsole', 'LocationService', 'MapLocationService', function($rootScope, $location, ckConsole, LocationService, MapLocationService) {
		console.log('ArtifactFeederApp.services: ArtifactService');

		/*******************************************
		 'ArtifactService' Deffinition:
		 This defines the elements and methods that
		 this service provides.
		*******************************************/
		var service = {
			/*
			 * All of the standardized data objects.
			 * This list should never be added to directly. Instead the
			 * service.addArtifact method should be used.
			 */
			artifacts: [],
			/*
			 * A running total of all of the datasets that are loaded.
			 * This value increments once a datasets elements have all been added
			 * to the service.
			 * This is important because the datasets are loaded asynchronysly
			 */
			datasetCount: 0,

			/*
			 * This is this is the number of datasets that the service will eventually contain.
			 * This value is set before the service is returned.
			 */
			totalDatasetLoaded: 0,

			/*
			 * This is the message that gets broadcast after every dataste is
			 * loaded into service.
			 */
			artifactGroupLoadedMessage: 'artifacts.group.loaded',
			/*
			 * Adds an artifact to the service.
			 * Also broadcasts an artifact update message.
			 */
			addArtifact: function(artifact){
				service.artifacts.push(artifact);
				$rootScope.$broadcast( 'artifacts.update' );
			},

			/*
			 * Finds the object with the given group name and id and returns objects that match.
			 * @param {Object} blob Object with the groupName and the id.
			 */
			getArtifactFromLinkData: function(blob){
				if(blob.groupName === 'undefined') throw 'groupName is undefined';
				if(blob.id === 'undefined') throw 'id is undefined';
				//Search through the array to find the groupName
				return $.grep(service.artifacts, function(e){
					return (e.id == blob.id) && (e.groupName == blob.groupName);
				});
			},
			/*
			 * Requests that the distance for all data sets be calculated.
			 * This triggers a request for the user to allow the web page to access their location.
			 * This calculation completes when the location is determined and the calculation is complete.
			 */
			calculateArtifactDistances: function(onError){
				if (service.datasetCount != service.totalDatasetLoaded) throw "Attempted to calculate artifact distances before all of the artifacts were loaded."
				LocationService.getLocation(function(position){
					for(var a in service.artifacts){
						var artifact = service.artifacts[a];
						artifact.calculateDistance(position);
					}
					console.log("calculateArtifactDistances: complete");
					console.log(service.artifacts);
				}, onError);

			}
		};

		/*******************************************
		ALL CK Console Requests Defined
		*******************************************/
		/**
		* Collects the data for a single dataset.
		* When a dataset is fully loaded from the server the inputParser method is run.
		* The inputParser method should be used to build the serice list and
		* should also be used to filter out unwanted datasets.
		* @param Pass a object containing: simpleDataName, dataName, categories, inputParser
		*/
		function DataSetCollector(blob){
			this.simpleDataName = blob.simpleDataName;
			this.dataName = blob.dataName;
			this.categories = blob.categories;
			/*
			 * This is what is run for each dataset that is collected
			 */
			this.inputParser = function(input){
				console.log(blob.dataName);
				console.log(input);
				blob.inputParser(input, this);
				//When a group is done being loaded broadcast a message
				$rootScope.$broadcast( service.artifactGroupLoadedMessage, this.simpleDataName);
			};
		}

		/************************************************
		 Logic:
		 These are defined seperately because some datasets
		 may need to filter out specific elements.
		*************************************************/

		var demolishedChurchesCollector = new DataSetCollector({
			simpleDataName:'Demolished Churches',
			dataName:'Demolished Churches with Current Locations MERGE',
			categories:['Churches'],
			inputParser:function(input, _this){
				//console.log("Adding Demolished Church data to artifactAPI.list");
				for (var property in input.members) {
					//This is the individual peice of data pulled form the list
					var church = input.members[property];
					//console.log(church);
					var dataSet = new StandardizedDataSet(_this.simpleDataName, church, property, _this.dataName, $location);
					service.addArtifact(dataSet);
				}
			}
		});

		var veniceChurchesCollector = new DataSetCollector({
			simpleDataName:'Venice Churches',
			dataName:'Venice Churches',
			categories:['Churches'],
			inputParser: function(input, _this){
				//console.log(input);
				for (var property in input.members) {
					var church = input.members[property];
					var currentUse = church.data["Current Use"];
					if(currentUse != "Active Church" &&
					   currentUse != "Closed to the Public" &&
					   currentUse != "Active Church and Art Museum"){
						try{
							//This is the individual peice of data pulled form the list
							var church = input.members[property];
							//console.log(church);
							var dataSet = new StandardizedDataSet(_this.simpleDataName, church, property, _this.dataName, $location);
							service.addArtifact(dataSet);

						} catch (e){
							console.log("A data element for " + _this.simpleDataName + " was improperly formatted");
						}
					}
				}
			}
		});

		var conventsCollector = new DataSetCollector({
			simpleDataName:'Venice Convents',
			dataName:'Venice Convents',
			categories: ['Convents'],
			inputParser: function (input, _this){
				for (var property in input.members) {
					//This is the individual peice of data pulled form the list
					var convent = input.members[property];
					var currentUse = convent.data["Current Use"];
					if(currentUse != "Convent" &&
					   currentUse != "Closed to the Public" &&
					   currentUse != "Active Church and Art Museum"){
						try{
							var dataSet = new StandardizedDataSet(_this.simpleDataName, convent, property, _this.dataName, $location);
							service.addArtifact(dataSet);
						} catch (e){
							console.log("A data element for " + _this.simpleDataName + " was improperly formatted");
						}
					}
				}
			}
		});

		var riiTeraCollector = new DataSetCollector({
			simpleDataName:'Rii Tera',
			dataName:'Rii Tera Complete MERGE',
			categories:['Rio Tera'],
			inputParser: function (input, _this){
				for (var property in input.members) {
					try {
						var riiTera = input.members[property];
						var dataSet = new StandardizedDataSet(_this.simpleDataName, riiTera, property, _this.dataName, $location);
						service.addArtifact(dataSet);
					} catch (e) {
						console.log("A data element for " + _this.simpleDataName + " was improperly formatted");
					}
				}
			}
		});

		var artCollector = new DataSetCollector({
			simpleDataName:'Missing Art',
			dataName:'Missing Art FINAL',
			categories:['Art'],
			inputParser:function(input, _this){
				for(var property in input.members){
					var painting = input.members[property];
					var dataSet = new StandardizedDataSet(_this.simpleDataName, painting, property, _this.dataName, $location);
					service.addArtifact(dataSet);
					MapLocationService.addLocationList(dataSet);
				}
				$rootScope.$broadcast( MapLocationService.addedMessage );
			}
		});

		/**
		 * This is where the actuall request to get the data from the server is
		 * made. This asks for the ck console data and returns asychronysly.
		 */
		function getDataset(aDataSetCollector){
			//The increase the number of datasets that we are retriving
			//This is used to only render the collage when all groups have been loaded
			service.datasetCount ++;


			ckConsole.getGroup(aDataSetCollector.dataName).then(
				//Asynchronys method
				//This method doesn't run until the data has loaded (this can take quite a while)
				function(inputData){
					console.log('Loading: ' + aDataSetCollector.dataName);
					try{
						aDataSetCollector.inputParser(inputData);
					} finally {
						service.totalDatasetLoaded ++;
					}
				});
		}

		getDataset(demolishedChurchesCollector);
		getDataset(veniceChurchesCollector);
		getDataset(conventsCollector);
		getDataset(riiTeraCollector);
		getDataset(artCollector);

		return service;
	}]).

	factory('LocationService', function(){
		var service = {
			position: null,
			locationSupported: (navigator.geolocation ? true : false ),
			getLocation: function(onSucsess, onError){
				if (service.locationSupported) {
					if(service.position != null){
						onSucsess(service.position);
					} else {
						navigator.geolocation.getCurrentPosition(
							function(position) {
								service.position = position;
								onSucsess(position);
							}, function(error) {
								switch(error.code) {
									case error.PERMISSION_DENIED:
										onError("User denied the request for Geolocation.");
										break;
									case error.POSITION_UNAVAILABLE:
										onError("Location information is unavailable.");
										break;
									case error.TIMEOUT:
										onError("The request to get user location timed out.");
										break;
									case error.UNKNOWN_ERROR:
										onError("An unknown error occurred.");
										break;
								}
							}
						);
					}
				} else {
					onError("Location not supported by your browser");
				}
			},
		};
		return service;
	}).

	factory('MapLocationService', function($rootScope){
		var service = {
			geoJson: {
				type: "FeatureCollection",
				features: []
			},
			addedMessage: "map.added.update",
			count: 1,
			addLocationList: function(standardizedDataObject){
				var locations = standardizedDataObject.locations;
				var cordinates = [];
				for(var l in locations){
					var location = locations[l];
					if(isNaN(location.latitude) || isNaN(location.longitude)){
						continue;
					}
					cordinates.push([location.longitude, location.latitude]);
					var existingLocation = $.grep(service.geoJson.features, function(e){
						return (angular.equals(e.geometry["coordinates"][0], location.longitude) && angular.equals(e.geometry["coordinates"][1], location.latitude));
					});
					if(existingLocation.length == 0){
						service.geoJson.features.push({
							type: "Feature",
							geometry: { "type": "Point", "coordinates": [location.longitude, location.latitude]},
							properties: {
								"marker-color": "#ff8888",
								"marker-symbol": service.count,
								"Location Name": location.name,
								"Pieces At Location": standardizedDataObject.name,
							}
						});
					} else {
						//console.log("Multiple found");
						console.log(existingLocation[0].properties["Location Name"]);
						existingLocation[0].properties["Pieces At Location"] = existingLocation[0].properties["Pieces At Location"] + " </br> " + standardizedDataObject.name;
						console.log(existingLocation[0].properties["Location Name"]);
					}
				}
				service.geoJson.features.push({
					"type": "Feature",
					"geometry": {"type": "LineString", "coordinates": cordinates},
					"properties": {
						//"description":"Made by Lysippos",
						"stroke":getRandomColor(),
						"stroke-opacity": 1,
						"stroke-width": 4,
						"title": standardizedDataObject.name
					}
				});
				service.count ++;
			}

		};
		/*
		var geoJson = {
			"type": "FeatureCollection",
			features: [{
				type: "Feature",
				geometry: { "type": "Point", "coordinates": [ 12.3350504, 45.4308256]},
				properties: {
					image: "./images/bernardoNani.JPG.jpg",
					url: "http://it.wikipedia.org/wiki/Palazzo_Bernardo_Nani",
					"marker-color": "#ff8888",
					"marker-symbol": "1",
					city: "Palazzo Bernardo Nani"
				}
			},
			{
				"type": "Feature",
				"geometry": { "type": "Point", "coordinates": [2.34027, 48.872766]},
				"properties": {
					"image": "./images/druout.JPG.jpg",
					"url": "http://en.wikipedia.org/wiki/H%C3%B4tel_Drouot",
					"marker-color": "#ff8888",
					"marker-symbol": "2",
					"city": "Hotel Drouot"
				}
			},
			{
				"type": "Feature",
				"geometry": { "type": "Point", "coordinates": [-73.9537099, 40.7662584]},
				"properties": {
					"image": "./images/sothebys.JPG.jpg",
					"url": "http://en.wikipedia.org/wiki/Sotheby%27s",
					"marker-color": "#ff8888",
					"marker-symbol": "3",
					"city": "Sotheby's"
				}
			},
			{
				"type": "Feature",
				"geometry": { "type": "Point", "coordinates": [-97.365136, 32.748612]},
				"properties": {
					"image": "./images/Kimbell.JPG.jpg",
					"url": "http://en.wikipedia.org/wiki/Kimbell_Art_Museum",
					"marker-color": "#ff8888",
					"marker-symbol": "4",
					"city": "Kimbell Art Museum"}
				},
				{
					"type": "Feature",
					"geometry": {"type": "LineString", "coordinates": [[ 12.3350504, 45.4308256], [2.34027, 48.872766], [-73.9537099, 40.7662584], [-97.365136, 32.748612]]},
					"properties": {
						"description":"Made by Lysippos",
						"stroke":"#1087bf",
						"stroke-opacity": 1,
						"stroke-width": 4,
						"title": "Head of an Athlete(Apoxyomenos)"
					}
				}
			]
		};
		*/

		return service;
	});
