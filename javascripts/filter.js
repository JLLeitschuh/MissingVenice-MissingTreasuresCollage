angular.module('ArtifactFeederApp.filters', [])

	.filter('unique', function () {
	return function (items, filterOn) {

		if (filterOn === false) {
			return items;
		}

		if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
			var hashCheck = {}, newItems = [];

			var extractValueToCompare = function (item) {
				if (angular.isObject(item) && angular.isString(filterOn)) {

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

			angular.forEach(items, function (item) {
				var valueToCheck, isDuplicate = false;

				for (var i = 0; i < newItems.length; i++) {
					if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
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
});
