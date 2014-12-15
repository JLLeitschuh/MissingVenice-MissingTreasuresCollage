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
					console.log(service.artifacts);
				});
		}


		getDataset(artCollector);
		getDataset(riiTeraCollector);
		getDataset(conventsCollector);
		getDataset(veniceChurchesCollector);
		getDataset(demolishedChurchesCollector);

		return service;
	}]).

	factory('LocationService', function(){
		var service = {
			position: null,
			locationSupported: (navigator.geolocation ? true : false ),
			getLocation: function(onSuccess, onError){
				if (service.locationSupported) {
					if(service.position != null){
						onSuccess(service.position);
					} else {
						navigator.geolocation.getCurrentPosition(
							function(position) {
								service.position = position;
								onSuccess(position);
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

	/*************************************************
	 Defines all data for displaying the timeline map.
	 *************************************************/
	factory('MapLocationService', function($rootScope){
		var service = {
			latLongFloatToPositiveString:function(value){
				return (value > 0 ? value.toString() : "neg"+ (-1*value));
			},
			setElementVisibiltyBasedOnDate: function(firstDate, secondDate){
				//console.log("service remove")
				//
				angular.forEach(service.markers, function(marker){
					marker.hideMarker();
				});
				angular.forEach(service.pathSets, function(pathSet){
					pathSet.setElementVisibiltyBasedOnDate(firstDate, secondDate);
				});
			},
			//Contains the list of markers to display on the timeline map
			markers: {},
			//Contains sets of paths that should be grouped but aren't because of functionaly reasons
			pathSets: [],
			//Contains the list of paths to display on the timeline map
			paths: {
				// test:{
				// 	type: "polyline",
				// 	latlngs: [ {lat: 40.4,lng: -3.6833333}, {lat: 41.9,lng: 12.4833333}, {lat: 51.5, lng: -0.116667} ]
				// }
			},
			addedMessage: "map.added.update",
			count: 1,
			/*
			 * Adds a standardizedDataObject's locations to the
			 * to the map service.
			 * This function generates both the paths and the
			 * markers for these loctions.
			 */
			addLocationList: function(standardizedDataObject){
				var locations = standardizedDataObject.locations;
				var locationMeta = [];
				var markerNames = [];

				/*
				 * PathSet Object
				 * Contains the data one standardized data object.
				 *
				 */
				var PathSet = function(){
					//Private
					var pathList = [];
					var markerList = [];

					/*
					* TODO: Optimization
					* Store the low and high dates for this path set. Compare
					* against the first and second dates durring the hide and
					* only run the for loop on a change
					*/

					//Public
					this.color = getRandomColor();

					/*
					 * Adds a path that is part of this path set
					 */
					this.addPath = function(path){
						pathList.push(path);
					};

					this.addMarker = function(marker){
						markerList.push(marker);
					};

					/*
					 * Hides all sub-paths for this path set if their associated
					 * dates are outside this range.
					 */
					this.setElementVisibiltyBasedOnDate = function(firstDate, secondDate){
						angular.forEach(pathList, function(path){
							path.setElementVisibiltyBasedOnDate(firstDate, secondDate);
						});
					};

					this.wasClicked = function(){
						angular.forEach(service.pathSets, function(pathSet){
							if(!angular.equals(pathSet, this)){
								pathSet.dullAllPaths();
								pathSet.dullAllMarkers();
							}
						});
						this.highlightAllPaths();
						this.resetAllMarkers();
					};

					this.dullAllMarkers = function(){
						angular.forEach(markerList, function(marker){
							marker.dullMarker();
						});
					};

					this.resetAllMarkers = function(){
						angular.forEach(markerList, function(marker){
							marker.resetMarker();
						});
					}

					this.dullAllPaths = function(){
						angular.forEach(pathList, function(path){
							path.dullPath();
						});
					};

					this.highlightAllPaths = function(){
						angular.forEach(pathList, function(path){
							path.highlightPath();
						});
					};
				}; // End PathSet Definition

				var pathSet = new PathSet();
				service.pathSets.push(pathSet);

				for(var l in locations){
					var location = locations[l];
					if(isNaN(location.latitude) || isNaN(location.longitude)){
						console.log(standardizedDataObject);
						throw "Issue with Standardized data object: " + standardizedDataObject.name;
						continue;
					}

					var latString = service.latLongFloatToPositiveString(location.latitude);
					var lngString = service.latLongFloatToPositiveString(location.longitude);
					var markerName = latString + "," + lngString;

					markerNames.push(markerName);

					var Marker = function(){
						//Private
						var startPointCount = 0;
						var midPointCount = 0;
						var endPointCount = 0;

						//Leaflet Options
						this.lat = location.latitude;
						this.lng = location.longitude;
						this.draggable = false;


						//Data
						this.data = {
							name: location.name,
							pieces: [],
							pathSets: []
						};

						this.hasPath = function(aPathName){
							for(var p in this.data.pieces){
								for(var i = 0; i < 3; i++){
									if(angular.equals("id" + this.data.pieces[p].pvid + "value" + i, aPathName)){
										return true;
									}
								}
							}
							return false;
						};
						this.hideMarker = function(){
							this.opacity = 0;
						};
						this.dullMarker = function(){
							this.opacity = .2;
						};
						this.resetMarker = function(){
							this.opacity = 1;
						};
						this.resetMarker();

						this.addPiece = function(_standardizedDataObject){
							if(this.data.pieces.indexOf(_standardizedDataObject) == -1){
								this.data.pieces.push(_standardizedDataObject);
								switch(location.place){
									/*
									 * TODO: Convert these values to different color markers.
									 * This probably wont happen for this project.. Oh well...
									 */
									case "Original":
										startPointCount ++;
										break;
									case "Second":
									case "Third":
										midPointCount ++;
										break;
									case "Current":
										endPointCount ++;
										break;
								}
								//this.generateColor();
							}
						};

						this.addPathSet = function(pathSet){
							this.data.pathSets.push(pathSet);
						};
					}; //End Marker Definition

					if(!service.markers[markerName]){
						service.markers[markerName] = new Marker();
					}
					var marker = service.markers[markerName];
					pathSet.addMarker(marker);
					marker.addPiece(standardizedDataObject);
					marker.addPathSet(pathSet);

					locationMeta.push({
						cordinate: {lat:location.latitude, lng:location.longitude},
						date: location.date,
						marker: marker
						});
				} // End location iterator

				/*
				 * Normally each path would be attached but the slider has to be able to
				 * selectively hide particular paths.
				 */
				for(var i = 0; i < locationMeta.length -1; i++){
					var Path = function(){
						var markers = [locationMeta[i].marker, locationMeta[i+1].marker];
						//Data for leaflet
						this.color = pathSet.color;
						this.latlngs = [locationMeta[i].cordinate, locationMeta[i+1].cordinate];
						this.type = 'polyline';


						//Data for manipulation
						this.data = {
							piece: standardizedDataObject,
							markerNames: markerNames,
							date: locationMeta[i].date
						};

						//If there is no date for this location
						if(!this.data.date){
							//Then make this a dashed line
							this.dashArray=[5,10];
						}

						this.pathSet = pathSet;

						this.wasClicked = function(){
							this.pathSet.wasClicked();
						};

						this.addMarker = function(marker){
							markers.push(marker);
						};

						/*
						 * Hide this path if it's associated date is outside the
						 * given date range. If there isn't a date associated
						 * simply reset it back to default.
						 */
						this.setElementVisibiltyBasedOnDate = function(firstDate, secondDate){
							if(!this.data.date ||
							   firstDate < this.data.date &&
							   this.data.date < secondDate){
								angular.forEach(markers, function(marker){
									marker.resetMarker();
								});
								this.resetPath();
							} else {
								this.hidePath();
							}
						};

						//Methods
						this.hasMarker = function(aMarkerName){
							for(var m in this.data.markerNames){
								if(angular.equals(this.data.markerNames[m], aMarkerName)){
									return true;
								}
							}
							return false;
						};

						/*
						 * Make this path stand out
						 */
						this.highlightPath = function(){
							this.weight = 7;
							this.opacity = 1;
						};

						/*
						 * Make this path dull
						 */
						this.dullPath = function(){
							this.weight = 2;
							this.opacity = .1;
						};

						/*
						 * Totally hides this path
						 */
						this.hidePath = function(){
							this.weight = 0;
							this.opacity = 0;
						};

						/*
						 * Resets this path back to its default view.
						 */
						this.resetPath = function(){
							this.weight = 3;
							this.opacity = 1;
						};
						this.resetPath();
					};
					var path = new Path();
					pathSet.addPath(path);
					service.paths["id" + standardizedDataObject.pvid + "value" + i] = path;
				}
				service.count ++;
			}

		}; //End service definition

		return service;
	});
