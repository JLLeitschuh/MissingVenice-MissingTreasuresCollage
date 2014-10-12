function StandardizedDataSet(object, id, parentDataName){
	this.parentDataName = parentDataName;
	this.id = id;
	switch(parentDataName){
		case 'Demolished Churches merge':
			//This is the id that the image url is stored behind
			var mediaID = object['merged-media-ids'].images['Demolished Churches Media'];
			this.name = object.data.name;
			this.shortDescription = object.data.description;
			this.imageSmallUrl = object.media.images[mediaID].small;
			this.imageWidth = object.data.width;
			this.imageHeight = object.data.height;
			break;
		case 'Venice Churches':
			this.name = theObject.data["Page Title"];
			//Make this more descriptive. There is more data here.
			this.shortDescription = theObject.data['History Blurb'];
			break;
		default:
			this.name = "Unsuported Data Set";
			this.shortDescription = "";
			break;
	}
	
	this.getImageWrapper = function(){
		return new ImageWrapper(this.name,
			this.year,
			this.shortDescription,
			this.imageSmallUrl,
			this.imageWidth,
			this.imageHeight,
			this.parentDataName,
			this.id
		);
	};
}

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
	
	/**
	 * 
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
					var mediaID = church['merged-media-ids'].images['Church Facade Images 2012'];
					imageArray[imageArray.length] = new ImageWrapper(church.data['Page Title'],
						church.data['Year Founded'],
						church.data['Intro sentence'],
						church.media.images[mediaID].small,
						church.data.width,
						church.data.height,
						this.dataName,
						property
					);
				} catch (e){
					console.log("No media associated");
				}
			}
		}
	});
	
	var conventsCollector = new DataSetCollector('Convents Merge', ['Convents'], function (input){
		for (var property in input.members) {
			var convent = input.members[property];
			var mediaID = convent['merged-media-ids'].images['convents facade images'];
			imageArray[imageArray.length] = new ImageWrapper(convent.data['Full Name'],
						convent.data['Year Founded'],
						"Current Use: " + convent.data['Current Use'],
						convent.media.images[mediaID].small,
						convent.data.width,
						convent.data.height,
						this.dataName,
						property
						);
		}
	});
	
	app = angular.module('collageapp', ['ckServices']);
	app.controller('DataCtrl', ['$scope', '$compile', 'ckConsole', 'ckConsoleMap', '$http', function($scope, $compile, ckConsole, ckConsoleMap, $http){
		
		
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
				//getDataset(conventsCollector, attachImagesToScope);
				attachImagesToScope();
			});
		});
		
	}]);
}

function loadObjectData(dataSetName, id){
	app = angular.module('collageapp', ['ckServices']);
	app.controller('DataCtrl', ['$scope', '$compile', 'ckConsole', 'ckConsoleMap', '$http', function($scope, $compile, ckConsole, ckConsoleMap, $http){
		if(dataSetName == "" || dataSetName == "Unsuported"){
			$scope.data.name = "No data set requested";
			$scope.data.shortDescription = "You must request a specific dataset";
		} else {
			ckConsole.getGroup(dataSetName).then(function(inputData){
				var theObject = inputData.members[id];
				var collector;
				console.log(theObject);
				$scope.data = new StandardizedDataSet(theObject, id, dataSetName);
				
			});
		}
	}]);
}
