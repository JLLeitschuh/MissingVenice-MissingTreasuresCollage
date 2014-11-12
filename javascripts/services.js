"use strict";
var module = angular.module('ArtifactFeederApp.services', []);

module.factory('ArtifactService', ['$rootScope', 'ckConsole', function($rootScope, ckConsole) {
		console.log('ArtifactFeederApp.services: ArtifactService');

		var service = {
			artifacts: [],
			datasetCount: 0,
			addArtifact: function(artifact){
				service.artifacts.push(artifact);
				$rootScope.$broadcast( 'artifacts.update' );
			},
			getArtifactFromLinkData: function(blob){
				if(blob.groupName === 'undefined') throw 'groupName is undefined';
				if(blob.id === 'undefined') throw 'id is undefined';
				//Search through the array to find the groupName
				return $.grep(service.artifacts, function(e){
					return (e.id == blob.id) && (e.groupNameLink == blob.groupName);
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
				$rootScope.$broadcast( 'artifacts.group.loaded' );
			};
		}

		var demolishedChurchesCollector = new DataSetCollector('Demolished Churches merge', ['Churches'],
		function(input, _this){
			//console.log("Adding Demolished Church data to artifactAPI.list");
			for (var property in input.members) {
				//This is the individual peice of data pulled form the list
				var church = input.members[property];
				//console.log(church);
				var dataSet = new StandardizedDataSet(church, property, _this.dataName);
				service.addArtifact(dataSet);
			}
		});

		var veniceChurchesCollector = new DataSetCollector('Venice Churches', ['Churches'],
		function(input, _this){
			//console.log(input);
			for (var property in input.members) {
				var church = input.members[property];
				var currentUse = church.data["Current Use"];
				if(currentUse != "Active Church" ||
				   currentUse != "Closed to the Public" ||
				   currentUse != "Active Church and Art Museum"){
					try{
						//This is the individual peice of data pulled form the list
						var church = input.members[property];
						//console.log(church);
						var dataSet = new StandardizedDataSet(church, property, _this.dataName);
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
				if(currentUse != "Convent" ||
				   currentUse != "Closed to the Public" ||
				   currentUse != "Active Church and Art Museum"){
					try{
						var dataSet = new StandardizedDataSet(convent, property, _this.dataName);
						service.addArtifact(dataSet);
					} catch (e){
						console.log("No media associated");
					}
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

		return service;
	}]);
module.controller( "artifacts.list", [ '$scope', 'ArtifactService', function( $scope, ArtifactService ) {
		$scope.progressPercent = 10;
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
			$scope.progressPercent += 30;
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
			}
		});

	}]);
