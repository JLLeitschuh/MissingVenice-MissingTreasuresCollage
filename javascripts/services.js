"use strict";
var module = angular.module('ArtifactFeederApp.services', []);

module.factory('ArtifactService', ['$rootScope', '$location', 'ckConsole', function($rootScope, $location, ckConsole) {
		console.log('ArtifactFeederApp.services: ArtifactService');

		var service = {
			//A list of standardized data objects
			artifacts: [],
			datasetCount: 0,
			artifactGroupLoadedMessage: 'artifacts.group.loaded',
			addArtifact: function(artifact){
				service.artifacts.push(artifact);
				$rootScope.$broadcast( 'artifacts.update' );
			},
			getArtifactFromLinkData: function(blob){
				if(blob.groupName === 'undefined') throw 'groupName is undefined';
				if(blob.id === 'undefined') throw 'id is undefined';
				//Search through the array to find the groupName
				return $.grep(service.artifacts, function(e){
					return (e.id == blob.id) && (e.groupName == blob.groupName);
				});
			}
		};

		/*******************************************
		ALL CK Console Requests Defined
		*******************************************/
		/**
		* Collects the data for a single dataset.
		*/
		function DataSetCollector(dataName, categories, inputParser){
			this.dataName = dataName;
			this.categories = categories;
			this.inputParser = function(input){
				console.log(dataName);
				console.log(input);
				inputParser(input, this);
				//When a group is done being loaded broadcast a message
				$rootScope.$broadcast( service.artifactGroupLoadedMessage, dataName);
			};
		}

		var demolishedChurchesCollector = new DataSetCollector('Demolished Churches with Current Locations MERGE', ['Churches'],
		function(input, _this){
			//console.log("Adding Demolished Church data to artifactAPI.list");
			for (var property in input.members) {
				//This is the individual peice of data pulled form the list
				var church = input.members[property];
				//console.log(church);
				var dataSet = new StandardizedDataSet(church, property, _this.dataName, $location);
				service.addArtifact(dataSet);
			}
		});

		var veniceChurchesCollector = new DataSetCollector('Venice Churches', ['Churches'],
		function(input, _this){
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
						var dataSet = new StandardizedDataSet(church, property, _this.dataName, $location);
						service.addArtifact(dataSet);

					} catch (e){
						console.log("No media associated");
					}
				}
			}
		});

		var conventsCollector = new DataSetCollector('Venice Convents', ['Convents'],
		function (input, _this){
			for (var property in input.members) {
				//This is the individual peice of data pulled form the list
				var convent = input.members[property];
				var currentUse = convent.data["Current Use"];
				if(currentUse != "Convent" &&
				   currentUse != "Closed to the Public" &&
				   currentUse != "Active Church and Art Museum"){
					try{
						var dataSet = new StandardizedDataSet(convent, property, _this.dataName, $location);
						service.addArtifact(dataSet);
					} catch (e){
						console.log("No media associated");
					}
				}
			}
		});

		var riiTeraCollector = new DataSetCollector('Rii Tera Complete MERGE', ['Rio Tera'],
		function (input, _this){
			for (var property in input.members) {
				try {
					var riiTera = input.members[property];
					var dataSet = new StandardizedDataSet(riiTera, property, _this.dataName, $location);
					service.addArtifact(dataSet);
				} catch (e) {
					console.log("No Media Associated");
				}
			}
		});

		/**
		 * Multi-tiered function. In order to use you pass the function a dataSetCollector
		 * and the next funtion in the change to run.
		 * The function will make a request for the given data set if it is valid for the current search tags.
		 */
		function getDataset(aDataSetCollector){
			//The increase the number of datasets that we are retriving
			//This is used to only render the collage when all groups have been loaded
			service.datasetCount ++;

			ckConsole.getGroup(aDataSetCollector.dataName).then(function(inputData){
				console.log('Loading: ' + aDataSetCollector.dataName);
				aDataSetCollector.inputParser(inputData);
			});
		}

		getDataset(demolishedChurchesCollector);
		getDataset(veniceChurchesCollector);
		getDataset(conventsCollector);
		getDataset(riiTeraCollector);

		return service;
	}]);
module.controller( "artifacts.list", [ '$scope', 'ArtifactService', function( $scope, ArtifactService ) {
		//This is called ever time an artifact is added to the ArtifactService
		$scope.$on( 'artifacts.update', function( event ) {
			$scope.artifacts = ArtifactService.artifacts;

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
					collage();
					$('.Collage').collageCaption();
				}
				imgLoad.on( 'always', onAlways );



				console.log("Search test");
				for(var i in $scope.artifacts){
					var artifact = $scope.artifacts[i];

					var resolveSearch = function(object, string){
						var recursionCount = 0;
						var _resolveSearch = function(reduced_object, reduced_string){
							recursionCount ++;
							if(typeof reduced_object == 'undefined'){
								return reduced_object;
							}
							var values = reduced_string.split(".");
							var firstValue = values[0];
							reduced_string = reduced_string.replace(firstValue + ".", "");
							if(values.length > 1){
								return _resolveSearch(reduced_object[firstValue], reduced_string);
							} else {
								return reduced_object[firstValue];
							}
						}
						return _resolveSearch(object, string);
					}
					console.log(resolveSearch(artifact, 'tableData.tableData.Reason for demolition'));
				}
			}
		});

	}]);
