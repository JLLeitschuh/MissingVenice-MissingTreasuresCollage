"use strict";
/**
 * Extracts the value from the given item using the
 * given filterOn value.
 */
var extractValueToCompare = function (item, filterOn) {
	if (angular.isObject(item) && angular.isString(filterOn)) {

		/**
		 * Recursive function that resolves the filterOn
		 * returns the object that is resolved from the search
		 *         or undefined if the string location does not exist
		 */
		var resolveSearch = function(object, string){
			if(typeof object == 'undefined'){
				return object;
			}
			var values = string.split(".");
			var firstValue = values[0];
			string = string.replace(firstValue + ".", "");
			if(values.length > 1){
				return resolveSearch(object[firstValue], string);
			} else {
				return object[firstValue];
			}
		}

		return resolveSearch(item, filterOn);
	} else {
		return item;
	}
};


angular.module('ArtifactFeederApp.filters', [])
	/*****************************
	 Filter removes duplicates.
	*****************************/
	.filter('unique', function () {
		return function (items, filterOn) {

			if (filterOn === false) {
				return items;
			}

			if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
				var hashCheck = {}, newItems = [];

				angular.forEach(items, function (item) {
					var valueToCheck, isDuplicate = false;

					for (var i = 0; i < newItems.length; i++) {
						if (angular.equals(extractValueToCompare(newItems[i], filterOn),
						                   extractValueToCompare(item, filterOn))) {
							isDuplicate = true;
							break;
						}
					}
					if (!isDuplicate) {
						if(typeof item != 'undefined'){
							newItems.push(item);
						}
					}

				});
				items = newItems;
			}
			return items;
		};
	})
	/*****************************
	 Filter removes blank and
	 undefined values.
	*****************************/
	.filter('noBlank', function(){
		return function(items, filterOn){
			//console.log("noBlank");
			var newItems = [];
			if(angular.isArray(items)){
				angular.forEach(items, function(item){
					var extracted = extractValueToCompare(item, filterOn);
					if(angular.isDefined(extracted) && !angular.equals(extracted, "")){
						newItems.push(item);
					}
				});
				items = newItems;
			}
			return items;
		};
	});
