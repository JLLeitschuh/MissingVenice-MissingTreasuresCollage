/****************************************************************
 Missing Venice 2014
 Created by Jonathan Leitschuh
 Dependencies: ck-console.js (For CK Console Firebase requests)
 ****************************************************************/


/********************************************************************************************
 Standardized Data Set
 Note: Understanding this object is the key to the project

 This object is designed to standardize the object data that we are retriving from the
 CK console. This allows us to treat all datasets exactly the same regardless of the way
 that they are stored on the CK Console.
 ********************************************************************************************/
function StandardizedDataSet(object, id, parentDataName){
	this.parentDataName = parentDataName;
	this.id = id;

	/**
	 * The Image URL Data object allows us to store
	 * the various sized versions of given images.
	 * Since there may be more than one image per
	 * per data element we must collect each into
	 * its own specific object.
	 * @param blob {imageData, width, height}
	 *        A dictionary containing the image data from the CK console.
	 */
	function ImageURLData(blob){
		//Store a version of 'this' that can be used by internally defined objects
		var _this = this;
		this.thumb = blob.imageData.thumb;
		this.small = blob.imageData.small;
		this.medium = blob.imageData.medium;
		this.original = blob.imageData.original;

		/**
		 * Recursive function to get the Image Meta data
		 * if we don't already have it.
		 * If we already have it the data is automatically
		 * stored in the height and width variables
		 */
		function getImageMeta(var_width, var_height) {
			//If the height is defined
			if (typeof var_height !== 'undefined') {
				//Then we know the size and can store it.
				_this.width = var_width;
				_this.height = var_height;
			} else {
				/*
				 * Otherwise we need to wait on the image to load
				 * to retrive this meta info.
				 */
				var img = new Image();
				//Get the size of the smallest image for short load times
				img.src = imageDataSet.thumb;
				img.onload = function() {
					getImageMeta(this.width, this.height);
				}
			}
		} // END: function
		getImageMeta(blob.width, blob.height);
	} // END: ImageURLData

	/**
	 * Stores each header's data for display on the site.
	 * @param blob {header, text}
	 */
	function HeaderTextData(blob){
		this.header = blob.header;
		this.text = blob.text;
	}


	/*
	 * HARD CODING ALERT! IF THE FORMAT FOR THESE DATA SETS CHANGE IT WILL BREAK HERE!
	 *
	 * All of this data has been custom taylored to the existing datasets.
	 *
	 * NOTE: The best way to do this is to print the object to the console
	 * (using console.log()) and manually find the fields that work with this object.
	 */
	switch(parentDataName){
		case 'Demolished Churches merge':
			//This is the id that the image url is stored behind
			var mediaID = object['merged-media-ids'].images['Demolished Churches Media'];
			this.name = object.data.name;
			this.shortDescription = object.data.description;
			this.sections = [new HeaderTextData({header:"Test Header", text:'A lot of text'})];
			this.imageData = [new ImageURLData({imageData: object.media.images[mediaID], width: object.data.width, height: object.data.height})];
			break;
		case 'Venice Churches':
			//This is the id that the image url is stored behind
			var mediaID = object['merged-media-ids'].images['Church Facade Images 2012'];
			this.name = object.data["Page Title"];
			//Make this more descriptive. There is more data here.
			this.shortDescription = object.data['History Blurb'];
			this.sections = [new HeaderTextData({header:"Test Header", text:'A lot of text'})];
			this.imageData = [new ImageURLData({imageData: object.media.images[mediaID], width: object.data.width, height: object.data.height})];
			break;
		case 'Convents Merge':
			var mediaID = object['merged-media-ids'].images['convents facade images'];
			this.name = object.data['Full Name'];
			this.shortDescription = "Current Use: " + object.data['Current Use'];
			this.sections = [new HeaderTextData({header:"Test Header", text:'A lot of text'})];
			this.imageData = [new ImageURLData({imageData: object.media.images[mediaID], width: object.data.width, height: object.data.height})];
			break;
		default:
			this.name = "Unsuported Data Set";
			this.shortDescription = "";
			break;
	} // END: Switch Case

	this.getImageWrapper = function(){
		return new ImageWrapper(this.name,
			this.year,
			this.shortDescription,
			this.imageData[0].small,
			this.imageData[0].width,
			this.imageData[0].height,
			this.parentDataName,
			this.id
		);
	};
} // END: StandardizedDataSet



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

	app = angular.module('collageapp', ['ckServices']);
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
				//attachImagesToScope();
			});
		});

	}]);
}

/**
 * Loads the object data for a single data set given a given dataset name and id.
 */
function loadObjectData(dataSetName, id){
	app = angular.module('collageapp', ['ckServices']);
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
