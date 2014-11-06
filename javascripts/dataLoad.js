/******************************************************************************************
THIS FILE HAS BEEN ABSTRACTED OUT TO CONTROLLER AND SERVICES! USED FOR REFFERENCE ONLY!
*******************************************************************************************/
function loadImageData(imageArray, tagsArray){
	/*******************************************
	 Once the images have been fully loaded
	 create the collage
	*******************************************/
	function lazyLoadImages(){
		var wrappers = document.querySelector('#image_container');
		var imgLoad = imagesLoaded( wrappers );
		function onAlways( instance ) {
			//This should only happen once all of the images have finished being loaded
			console.log("All images loaded");
			collage();
			$('.Collage').collageCaption();
		}
		imgLoad.on( 'always', onAlways );
	}

	/*******************************************
	 ALL CK Console Requests Defined
	*******************************************/
	/**
	 * Collects the data for a single dataset.
	 */
	function DataSetCollector(dataName, categories, inputParser){
		this.dataName = dataName;
		this.categories = categories;
		this.inputParser = inputParser;
		this.doAnyArgumentsMatch = function(arguments){
			//We aren't parsing for a specific argument
			if(arguments.length == 0) return true;
			//Check if any arguments match
			for(var i = 0; i < categories.length; i++){
				if(arguments.indexOf(categories[i]) != -1) return true;
			}
			//There is no match
			return false;
		};
	}

	var demolishedChurchesCollector = new DataSetCollector('Demolished Churches merge', ['Churches'], function(input){
		console.log("Adding Demolished Church data to images array");
		//XXX There has to be a better way to iterate over the seperate property values
		for (var property in input.members) {
			//This is the individual peice of data pulled form the list
			var church = input.members[property];
			//console.log(church);

			var dataSet = new StandardizedDataSet(church, property, this.dataName);
			//Create and add a new image to the image array using the church data
			imageArray[imageArray.length] = dataSet.getImageWrapper();
		}
	});

	var veniceChurchesCollector = new DataSetCollector('Venice Churches', ['Churches'], function(input){
		//console.log(input);
		for (var property in input.members) {
			var church = input.members[property];
			if(church.data["Current Use"] != "Active Church"){
				try{
					//This is the individual peice of data pulled form the list
					var church = input.members[property];
					//console.log(church);

					var dataSet = new StandardizedDataSet(church, property, this.dataName);
					//Create and add a new image to the image array using the church data
					imageArray[imageArray.length] = dataSet.getImageWrapper();
				} catch (e){
					console.log("No media associated");
				}
			}
		}
	});

	var conventsCollector = new DataSetCollector('Convents Merge', ['Convents'], function (input){
		for (var property in input.members) {
			//This is the individual peice of data pulled form the list
			var convent = input.members[property];
			try{
				var dataSet = new StandardizedDataSet(convent, property, this.dataName);
				//Create and add a new image to the image array using the church data
				imageArray[imageArray.length] = dataSet.getImageWrapper();
			} catch (e){
				console.log("No media associated");
			}
		}
	});

	app.controller('DataCtrl', ['$scope', '$compile', 'ckConsole', 'ckConsoleMap', '$http', function($scope, $compile, ckConsole, ckConsoleMap, $http){

		/**
		 * Multi tiered function. In order to use you pass the function a dataSetCollector and the next funtion in the change to run.
		 * The function will make a request for the given data set if it is valid for the current search tags.
		 */
		function getDataset(aDataSetCollector, nextFunction){
			if(aDataSetCollector.doAnyArgumentsMatch(tagsArray)){
				ckConsole.getGroup(aDataSetCollector.dataName).then(function(inputData){
					console.log('Loading: ' + aDataSetCollector.dataName);
					console.log(inputData);
					aDataSetCollector.inputParser(inputData);
					nextFunction();
				});
			} else {
				nextFunction();
			}
		}

		function attachImagesToScope(){
			console.log("Image count: " + imageArray.length);
			$scope.allImages = imageArray;
			lazyLoadImages();
		}

		getDataset(demolishedChurchesCollector, function(){
			getDataset(veniceChurchesCollector, function(){
				getDataset(conventsCollector, attachImagesToScope);
			});
		});

	}]);
}

/**
 * Loads the object data for a single data set given a given dataset name and id.
 */

function loadObjectData(dataSetName, id){
	app.controller('DataCtrl', ['$scope', '$compile', 'ckConsole', 'ckConsoleMap', '$http', function($scope, $compile, ckConsole, ckConsoleMap, $http){
		if((dataSetName == "") || (dataSetName == "Unsuported")){
			$scope.data.name = "No data set requested";
			$scope.data.shortDescription = "You must request a specific dataset";
		} else {
			ckConsole.getGroup(dataSetName).then(function(inputData){
				var theObject = inputData.members[id];
				var collector;
				console.log(theObject);
				console.log("StandardizedDataSet");
				$scope.data = new StandardizedDataSet(theObject, id, dataSetName);
				console.log($scope.data);

			});
		}
	}]);
}
