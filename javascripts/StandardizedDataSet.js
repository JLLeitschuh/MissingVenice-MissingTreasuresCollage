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
function StandardizedDataSet(object, id, parentDataName){
	this.groupName = object.birth_certificate.type;
	this.groupNameLink = this.groupName.replace(/ /g, "_");
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

	function HeaderTableData(blob){
		this.header = blob.header;
		this.tableData = blob.tableData;
	}


	/*
	* HARD CODING ALERT! IF THE FORMAT FOR THESE DATA SETS CHANGE IT WILL BREAK HERE!
	*
	* All of this data has been custom taylored to the existing datasets.
	*
	* NOTE: The best way to do this is to print the object to the console
	* (using console.log()) and manually find the fields that work with this object.
	*/
	switch(this.groupName){
		case 'Demolished Churches merge':
			//This is the id that the image url is stored behind
			var mediaID = object['merged-media-ids'].images['Demolished Churches Media'];
			this.name = object.data.name;
			this.shortDescription = object.data.description;
			this.sections = [
				new HeaderTextData({header:"Church Info", text: object.data['description']})
			];
			this.imageData = [new ImageURLData({imageData: object.media.images[mediaID], width: object.data.width, height: object.data.height})];
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
			//This is the id that the image url is stored behind
			var mediaID = object['merged-media-ids'].images['Church Facade Images 2012'];
			this.name = object.data["Page Title"];
			//Make this more descriptive. There is more data here.
			this.shortDescription = object.data['Intro sentence'];
			this.imageData = [new ImageURLData({imageData: object.media.images[mediaID], width: object.data.width, height: object.data.height})];
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
			var mediaID = object['merged-media-ids'].images['convents facade images'];
			this.name = object.data['Full Name'];
			this.shortDescription = "Current Use: " + object.data['Historic Background'];
			this.sections = [
				new HeaderTextData({header:"Historic Background", text: object.data['Historic Background']}),
			];
			this.imageData= [new ImageURLData({imageData: object.media.images[mediaID], width: object.data.width, height: object.data.height})];
			this.tableData = new HeaderTableData({
				header: 'Repurposed Convent Info',
				tableData: {
					'Parish': object.data["Parish"],
					'Sestiere': object.data["Sestiere"],
					'Street Address': object.data["Street Address"],
					'Year Founded': object.data["Year Founded"],
					'Current Use': object.data["Current Use"],
				}
			});
			break;


		default:
			console.log("Unsuported Data Set");
			this.name = "Unsuported Data Set";
			this.shortDescription = "";
			break;
	} // END: Switch Case

	var textLength = (this.imageData[0].width < 300 ? 10 : 100);
	this.veryShortDescription = this.shortDescription.trunc(textLength, true);

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
