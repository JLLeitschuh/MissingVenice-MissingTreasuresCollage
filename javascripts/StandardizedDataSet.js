"use strict";
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
function StandardizedDataSet(simpleGroupName, object, id, parentDataName, $location){
	var __this = this;
	this.simpleGroupName = simpleGroupName;
	this.groupName = object.birth_certificate.type;
	this.groupNameLink = encodeURI(this.groupName)
	this.originalObject = object;
	this.id = id;
	this.distance;
	this.overrideImageLoad = false;

	//By default this object is not valid for the collage
	this.validForCollage = false;

	/**
	 * This is run once we have the user's GPS location.
	 * Using the current posisiton the distance between the user and this artifact
	 * is calculated.
	 */
	this.calculateDistance = function(position) {
		// This code was found here: http://www.movable-type.co.uk/scripts/latlong.html

		var lat1 = this.latitude;
		var lon1 = this.longitude;

		var lat2 = position.coords.latitude;
		var lon2 = position.coords.longitude;

		var R = 6371; // km
		var φ1 = lat1.toRadians();
		var φ2 = lat2.toRadians();
		var Δφ = (lat2-lat1).toRadians();
		var Δλ = (lon2-lon1).toRadians();
		var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		this.distance = R * c;
		this.tableData.tableData["Distance"] = this.distance + " KM";
	}


	/*
	 * This changes the location that the page is pointing to.
	 */
	this.goToInfoPage = function(){
		var link = "/artifact/group/" + this.groupName + "/id/" + this.id;
		//console.log("Navigating to: " + link);
		$location.path(link);
	}

	/**
	* Stores each header's data for display on the site.
	* @param blob {header, text}
	*/
	function HeaderTextData(blob){
		this.header = blob.header;
		this.text = blob.text;
		this.source = blob.source;
	}

	function HeaderTableData(blob){
		this.header = blob.header;
		this.tableData = blob.tableData;
	}

	this.imageData = [];
	var mediaID;

	/**
	* The Image URL Data object allows us to store
	* the various sized versions of given images.
	* Since there may be more than one image per
	* per data element we must collect each into
	* its own specific object.
	* @param blob {imageData, imageText, width, height}
	*        A dictionary containing the image data from the CK console.
	*/
	function ImageURLData(image_blob){
		//Store a version of 'this' that can be used by internally defined objects
		var _this = this;
		this.mediaID = image_blob.mediaID;
		this.thumb = image_blob.imageData.thumb;
		this.small = image_blob.imageData.small;
		this.medium = image_blob.imageData.medium;
		this.original = image_blob.imageData.original;
		this.imageText = image_blob.imageText;

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
				img.src = image_blob.imageData.thumb;
				img.onload = function() {
					getImageMeta(this.width, this.height);
				}
			}
		} // END: function
		getImageMeta(image_blob.width, image_blob.height);
	} // END: ImageURLData


	/*
	* HARD CODING ALERT! IF THE FORMAT FOR THESE DATA SETS CHANGE IT WILL BREAK HERE!
	*
	* All of this data has been custom taylored to the existing datasets.
	*
	* NOTE: The best way to do this is to print the object to the console
	* (using console.log()) and manually find the fields that work with this object.
	*/
	switch(this.simpleGroupName){
		case 'Demolished Churches':
			this.type = "Demolished";
			//This is the id that the image url is stored behind
			mediaID = object['merged-media-ids'].images['Demolished Churches Media'];
			this.name = object.data.name;
			this.shortDescription = object.data.description;
			this.latitude = object.data.latitude;
			this.longitude = object.data.longitude;
			this.sections = [
				new HeaderTextData({header:"Church Info", text: object.data['description']})
			];

			this.tableData = new HeaderTableData({
				header: 'Demolition Info',
				tableData: {
					'Reason for demolition': object.data.reason_for_demolition,
					'Government in power during demolition': object.data.government_in_power_during_demolition,
					'Year founded': object.data.year_founded,
					'Year of demolition': object.data.year_of_demolition
				}});
			break;


		case 'Venice Churches':
			this.type = "Repurposed";
			//This is the id that the image url is stored behind
			mediaID = object['merged-media-ids'].images['Church Facade Images 2012'];
			this.name = object.data["Page Title"];
			//Make this more descriptive. There is more data here.
			this.shortDescription = object.data['Intro sentence'];
			this.latitude = object.data.latitude;
			this.longitude = object.data.longitude;

			this.sections = [
				new HeaderTextData({header:"Intro", text:object.data["Intro sentence"]}),
				new HeaderTextData({header:"History", text:object.data["History Blurb"]})
			];
			this.tableData = new HeaderTableData({
				header: 'Repurposed Church Info',
				tableData: {
					'Local Name': object.data["Local Name"],
					'Denomination': object.data["Denomination"],
					'Island': object.data["Island"],
					'Year Founded': object.data["Year Founded"],
					'Current Use': object.data["Current Use"],
					'Hours of Operation': object.data["Hours of Operation"],
				}
			});
			break;


		case 'Venice Convents':
			this.type = "Repurposed";
			mediaID = object['merged-media-ids'].images['convents facade images'];
			this.name = object.data['Full Name'];
			this.shortDescription = object.data['Historic Background'];
			this.latitude = object.data["Latitude Coordinate"];
			this.longitude = object.data["Longitude Coordinate"];
			this.sections = [
				new HeaderTextData({header:"Historic Background", text: object.data['Historic Background']}),
			];

			this.tableData = new HeaderTableData({
				header: 'Repurposed Convent Info',
				tableData: {
					'Parish': object.data["Parish"],
					'Sestiere': object.data["Sestiere"],
					'Street Address': object.data["Street Address"],
					'Year Founded': object.data["Year Founded"],
					'Current Use': object.data["Current Use"]
				}
			});
			break;

		case "Rii Tera":
			this.type = "Filled In";
			mediaID = object['merged-media-ids'].images['Rii Tera signs MEDIA'];
			this.name = object.data["name"];
			this.shortDescription = object.data["labeled"];
			this.latitude = object.data.latitude;
			this.longitude = object.data.longitude;
			this.sections = [
				new HeaderTextData({header:"Historic Background", text: "There\'s nothing here yet."}),
			];

			this.tableData = new HeaderTableData({
				header: "Rii Tera Info",
				tableData: {
						'Sestiere': object.data["sestiere"],
						'Street Name': object.data["street name"],
						'Type': object.data["type"],
						'Year Filled': object.data["year"]
				}
			});
			break;


		case 'Missing Art':
			this.type = "Moved";
			this.name = object.data["Item Name"];
			this.pvid = object.data.PVID;
			this.overrideImageLoad = true;

			this.tableData = new HeaderTableData({
				header: "Art Info",
				tableData: {
						'Date Created': object.data["Date Created"],
						'Medium': object.data["Medium"],
						'Type': object.data["Type"],
						'Image Source': object.data["Picture Source"],
						'Current Location Picture Source': object.data["Current Location Picture Source"],
						'Original Location Picture Source': object.data["Orginial Location Picture Source"],
						'Second Location Picture Source': object.data["Second Location Picture Source"],
						'Third Location Picture Source': object.data["Third Location Picture Source"],
						'Artist': object.data["Artist"]
				}
			});


			/* We have to search through
			 * "Art 1 MEDIA", "Art 2 MEDIA"... "Art 7 MEDIA"
			 * in order to find the right dataset
			 */
			for (var i = 1; i < 7; i++) {
				var mediaName = "Art " + i + " MEDIA";
				mediaID = object['merged-media-ids'].images[mediaName];
				if(object.media.images[mediaID]){
					this.validForCollage = true;
					this.imageData.push(new ImageURLData({
						mediaID: mediaID,
						imageData: object.media.images[mediaID],
						width: object.data.width,
						height: object.data.height
					}));
					break;
				}
			}


			//Location data

			this.locations = [];
			var locationTagNames = ['Original', 'Second Location', 'Third Location', 'Current'];
			for(var n in locationTagNames){
				var tagName = locationTagNames[n];
				//If we don't have the latitude then don't include it it in the list
				if(object.data[tagName + " Longitude"]){
					//The object where the location data will be stored
					var newLocation = {};

					//We parse apart our field names pragmatically
					switch (tagName){
						case locationTagNames[2]:
							newLocation.latitude = object.data['Thrid Location Latitude'];
							newLocation.longitude = object.data[tagName + ' Longitude'];
							//Intentioanlly no break
						case locationTagNames[1]:
							newLocation.name = object.data['Name of ' + tagName];
							break;
						case locationTagNames[0]:
							//YES THIS SPELLING MISTAKE IS INTENDED! Grant Screwed up...
							newLocation.latitude = object.data[tagName + ' Latatitude'];
							newLocation.longitude = object.data[tagName + ' Longitude'];
							//Intentioanlly no break
						case locationTagNames[3]:
							newLocation.name = object.data[tagName + ' Location'];
							break;
					}

					// Don't overwrite the data for the spelling mistake
					if(tagName != locationTagNames[0] && tagName != locationTagNames[2] ){
						newLocation.latitude = object.data[tagName + ' Latitude'];
						newLocation.longitude = object.data[tagName + ' Longitude'];
					}

					switch (tagName){
						case locationTagNames[0]:
							newLocation.place = "Original";
							newLocation.date = object.data["Date Created"];

							var partialNames = ["", " 1"];
							for(var n in partialNames){
								var partialName = partialNames[n];
								var mediaID =
								object['merged-media-ids'].images["Art Original Locations" + partialName + " MEDIA"];
								if(object.media.images[mediaID]){
									this.imageData.push(new ImageURLData({
										mediaID: mediaID,
										imageText: newLocation.name,
										imageData: object.media.images[mediaID]}));
									break;
								}
							}

							//Put this here first
							this.latitude = newLocation.latitude;
							this.longitude = newLocation.longitude;
							break;
						case locationTagNames[1]:
							newLocation.place = "Second";
							newLocation.date = object.data["Date Moved to Second Location"];

							var mediaID =
							object['merged-media-ids'].images["Art Second Locations MEDIA"];
							if(object.media.images[mediaID]){
								this.imageData.push(new ImageURLData({
									mediaID: mediaID,
									imageText: newLocation.name,
									imageData: object.media.images[mediaID]}));
							} else {
								//console.log(object)
								//throw "Media does not exist";
							}


							break;
						case locationTagNames[2]:
							newLocation.place = "Third";
							//Again this spelling mistake is intentional
							newLocation.date = object.data['"Date Moved to Thrid Location "'];

							var mediaID =
							object['merged-media-ids'].images["Art Third Location MEDIA"];
							if(object.media.images[mediaID]){
								this.imageData.push(new ImageURLData({
									mediaID: mediaID,
									imageText: newLocation.name,
									imageData: object.media.images[mediaID]}));
							} else {
								//console.log(object)
								//throw "Media does not exist";
							}
							break;
						case locationTagNames[3]:
							newLocation.place = "Current";
							newLocation.date = object.data["Date to Current"];

							var mediaID =
							object['merged-media-ids'].images["Art Current Locations MEDIA"];
							this.imageData.push(new ImageURLData({
								mediaID: mediaID,
								imageText: newLocation.name,
								imageData: object.media.images[mediaID]}));


							//Howerver if we have the current location then use that instead
							this.latitude = newLocation.latitude;
							this.longitude = newLocation.longitude;
							break;
					}


					if( newLocation.date ){
						if(newLocation.date.indexOf(" BC") > -1){
							console.log(newLocation.date);
							newLocation.date = newLocation.date.replace(" BC", "");
							newLocation.date = -1 * parseInt(newLocation.date);
						} else {
							newLocation.date = parseInt(newLocation.date);
						}
					}
					newLocation.latitude = parseFloat(newLocation.latitude);
					newLocation.longitude = parseFloat(newLocation.longitude);

					this.locations.push(newLocation);
				}
			}
			//END Location data

			this.getLocationByName = function(_name){
				for(var l in this.locations){
					var location = this.locations[l];
					if(angular.equals(location.place, _name)){
						return location;
					}
				}
				return {};
			};


			//Generate Provenance
			var generateProvenanceText = function (){
				var returnString = "";
				if(object.data["Date Created"]){
					returnString = __this.name + " was created in " + object.data["Date Created"] + ". ";
				} else {
					returnString = "It is unknown when " + __this.name + " was created.";
				}

				for(var l in __this.locations){
					var location = __this.locations[l];
					switch(location.place){
						case "Original":
							returnString += "It was originally located in " + location.name + ". ";
							break;
						case "Second":
							if(location.date){
								returnString += "In " + location.date + ", it moved to " + location.name + ". ";
							} else {
								returnString += "It moved to " + location.name + " at an unknown date. ";
							}
							break;
						case "Third":
							if(location.date){
								returnString += "In " + location.date + ", it moved to " + location.name + ". ";
							} else {
								returnString += "It moved to " + location.name + " at an unknown date. ";
							}
							break;
						case "Current":
							if(location.date){
								returnString += "It is currently located at " + location.name + " and arrived there in " + location.date + ". ";
							} else {
								returnString += "It is currently located at " + location.name + ". ";
							}
							break;
					}
				}
				return returnString;

			}
			this.sections = [
				new HeaderTextData({
					header:"Description",
					text: object.data["Item Description"],
					source: object.data["Description Source"]
				}),
				new HeaderTextData({header:"Provenance", text: generateProvenanceText()})
			];



			this.shortDescription = "";
			//console.log(object);
			break;
		default:
			console.log("Unsuported Data Set");
			this.name = "Unsuported Data Set";
			this.shortDescription = "";
			break;
	} // END: Switch Case


	// IMAGE MANIPULATION
	if(!this.overrideImageLoad){ //If the switch statement hasn't handeled adding art peices do it here
		if(mediaID){
			//If we have a media id then we have the dimention info (assumption)
			//This is nessasary because the collage code requires an image to have a known dimention
			this.validForCollage = true;
			this.imageData.push(
				new ImageURLData({
					mediaID: mediaID,
					imageData: object.media.images[mediaID],
					width: object.data.width,
					height: object.data.height})
				);
		}

		/*
		 * Grab all of the other images associated with this dataset
		 * This is a catchall for media before this ck console bug was fixed:
		 * https://github.com/cityknowledge/console/issues/15
		 */
		for(var i in object.media.images){
			//If this media id hasn't already been loaded
			if(i != mediaID){
				this.imageData.push(new ImageURLData({
					mediaID: i,
					imageData: object.media.images[i]
				}));
			}
		}
	}

	// END IMAGE MANIPULATION

	this.latitude = parseFloat(this.latitude);
	this.longitude = parseFloat(this.longitude);

	if(this.imageData[0]){
		var textLength = (this.imageData[0].width < 300 ? 10 : 100);
		this.veryShortDescription = this.shortDescription.trunc(textLength, true);
	}
} // END: StandardizedDataSet
