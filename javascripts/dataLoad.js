
function loadData(imageArray, tagsArray){
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
			
			//This is the id that the image url is stored behind
			var mediaID = church['merged-media-ids'].images['Demolished Churches Media'];
			//Create and add a new image to the image array using the church data
			imageArray[imageArray.length] = new ImageWrapper(church.data.name,
				church.data.year_of_demolition,
				church.data.description,
				church.media.images[mediaID].small);
		}
	});
	
	var veniceChurchesCollector = new DataSetCollector('Venice Churches', ['Churches'], function(input){
		console.log('Loading: ' + this.dataName);
		console.log(input);
		for (var property in input.members) {
			var church = input.members[property];
			if(church.data["Current Use"] != "Active Church"){
				try{
					var mediaID = church['merged-media-ids'].images['Church Facade Images 2012'];
					imageArray[imageArray.length] = new ImageWrapper(church.data['Page Title'],
						church.data['Year Founded'],
						church.data['Intro sentence'],
						church.media.images[mediaID].small);
				} catch (e){
					console.log("No media associated");
				}
			}
		}
	});
	
	app = angular.module('collageapp', ['ckServices']);
	app.controller('DataCtrl', ['$scope', '$compile', 'ckConsole', 'ckConsoleMap', '$http', function($scope, $compile, ckConsole, ckConsoleMap, $http){
		
		
		function getDataset(aDataSetCollector, nextFunction){
			ckConsole.getGroup(aDataSetCollector.dataName).then(function(inputData){
				if(aDataSetCollector.doAnyArgumentsMatch(tagsArray)){
					aDataSetCollector.inputParser(inputData);
				}
				nextFunction();
			});
		}
		
		function attachImagesToScope(){
			$scope.allImages = imageArray;
			lazyLoadImages();
		}
		
		getDataset(demolishedChurchesCollector, function(){
			getDataset(veniceChurchesCollector, attachImagesToScope);
		});
		
	}]);
}
