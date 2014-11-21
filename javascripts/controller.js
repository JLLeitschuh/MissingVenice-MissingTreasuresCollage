"use strict";
/****************************************
 All of the controllers for the project.
 These are what define what happens when
 a page is loaded.
 Controllers only run once ever time
 a page is loaded
 (EG: Pressing the home button twice would
 reload its respective controller twice.)
 If you want something that runs once
 (singleton) look into using a service
 or factory (services.js).
****************************************/

angular.module('ArtifactFeederApp.controllers', ['ui.bootstrap']).

	/*
	 * Controller for the loading bar.
	 */
	controller('loadingBarController', function($scope, ArtifactService){
		$scope.percentComplete = 10;
		var groupsLoaded = [];
		/* Displays what groups have been been loaded */
		$scope.getPopOverText = function(){
			var returnString = "";
			if(groupsLoaded.length != 0){
				for(var i in groupsLoaded){
					if(i == 0){
						returnString = groupsLoaded[i];
					} else {
						returnString += ", " + groupsLoaded[i];
					}
				}
			} else {
				returnString = "None";
			}
			return "Loaded: " + returnString;
		};

		var percentPerStep = 90/ArtifactService.datasetCount;

		/* When an artifact group is loaded */
		$scope.$on( ArtifactService.artifactGroupLoadedMessage, function(event, groupName){
			//Increase the the percent complete
			$scope.percentComplete += percentPerStep;
			//Also store the name for the popup text
			groupsLoaded.push(groupName);
		});
	}).
	controller('artifactsController', function($scope, ArtifactService) {
		console.log("ArtifactFeederApp.controllers: artifactsController");
		$scope.nameFilter = null;

		var resizeTimer = null;
		var collageImagesFunction = function() {
			// hide all the images until we resize them
			$('.Collage .Image_Wrapper').css("opacity", 0);
			// set a timer to re-apply the plugin
			if (resizeTimer) clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function(){
				// We have to remove the caption manually or it will be left over on some images.
				$("div.Caption").remove();
				collage();
				$('.Collage').collageCaption();
			}, 250);
		};

		$scope.searchChange = collageImagesFunction;

		$scope.random = function(){
			return 0.5 - Math.random();
		};

		// This is just for the case that the browser window is resized
		$(window).bind('resize', collageImagesFunction);
		collageImagesFunction();
	}).
	controller('artifactController', function($scope, $routeParams, ArtifactService){
		console.log("ArtifactFeederApp.controllers: artifactController");
		$scope.artifact = null;
		var tryLoad = function (event){
			$scope.artifactKey = {groupName: $routeParams.group, id: $routeParams.id};
			$scope.artifact = ArtifactService.getArtifactFromLinkData($scope.artifactKey)[0];
			console.log($scope.artifact);
		};
		$scope.$on( 'artifacts.group.loaded', tryLoad);

		tryLoad();

		$scope.myInterval = 5000;


		var slides = $scope.slides = [];
		$scope.addSlide = function() {
			var newWidth = 600 + slides.length + 1;
			slides.push({
				image: 'http://placekitten.com/' + newWidth + '/300',
				text: ['More','Extra','Lots of','Surplus'][slides.length % 4] + ' ' +
					['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
			});
		};
		for (var i=0; i<4; i++) {
			$scope.addSlide();
		}

	}).
	controller('listController', function($scope, $routeParams, ArtifactService){
		$scope.artifacts = ArtifactService.artifacts;

	}).


	/************************************
	 Map Controller
	*************************************/
	controller('mapController', function($scope, $routeParams, ArtifactService){
		console.log("ArtifactFeederApp.controllers: mapController")

		$scope.sliderData = {
			minValue: 1000,
			maxValue: 2014,
			currentValue: 1500,
			stepSize: 10
		};

		//This runs every time the page loads
		d3.select(window)
			.on("mousemove", mousemove)
			.on("mouseup", mouseup);

		var width = 960,
			height = 500;

		var proj = d3.geo.orthographic()
			.translate([width / 2, height / 2])
			.clipAngle(90)
			.scale(220);

		var sky = d3.geo.orthographic()
			.translate([width / 2, height / 2])
			.clipAngle(90)
			.scale(300);

		var graticule = d3.geo.graticule();

		var path = d3.geo.path().projection(proj).pointRadius(2);

		var swoosh = d3.svg.line()
			.x(function(d) { return d[0] })
			.y(function(d) { return d[1] })
			.interpolate("cardinal")
			.tension(.0);

		var links = [],
			arcLines = [],
			pathsGoing = [];

		/* var zoom = d3.behavior.zoom(true)
			.translate(projection.origin())
			.scale(projection.scale())
			.scaleExtent([100, 800])
			.on("zoom", move);
			*/

		var svg = d3.select("#map-area").append("svg")
					.attr("width", width)
					.attr("height", height)
					.on("mousedown", mousedown)
				//	.call(zoom)
					//.on("dblclick.zoom", null);

		var zoom = d3.behavior.zoom()
			.center([width / 2, height / 2])
			.scaleExtent([0,5])
			//.translate([10,10])
			.on("zoom", zoomed);

		svg.call(zoom);

		queue()
			.defer(d3.json, "javascripts/map/world-110m.json")
			.defer(d3.json, "javascripts/map/places.json")
			.await(ready);

		function ready(error, world, places) {
			// ocean
			var ocean_fill = svg.append("defs").append("radialGradient")
					.attr("id", "ocean_fill")
					.attr("cx", "75%")
					.attr("cy", "25%");
				ocean_fill.append("stop").attr("offset", "5%").attr("stop-color", "#2987ca");
				ocean_fill.append("stop").attr("offset", "100%").attr("stop-color", "#1C6BA0");

			// globe highlight
			var globe_highlight = svg.append("defs").append("radialGradient")
					.attr("id", "globe_highlight")
					.attr("cx", "75%")
					.attr("cy", "25%");
				globe_highlight.append("stop")
					.attr("offset", "5%").attr("stop-color", "#ffd")
					.attr("stop-opacity","0.6");
				globe_highlight.append("stop")
					.attr("offset", "100%").attr("stop-color", "#ba9")
					.attr("stop-opacity","0.2");

			// globe shadow
			var globe_shading = svg.append("defs").append("radialGradient")
					.attr("id", "globe_shading")
					.attr("cx", "55%")
					.attr("cy", "45%");
				globe_shading.append("stop")
					.attr("offset","30%").attr("stop-color", "#fff")
					.attr("stop-opacity","0");
				globe_shading.append("stop")
					.attr("offset","100%").attr("stop-color", "#505962")
					.attr("stop-opacity","0.3");

			// drop shadow
			var drop_shadow = svg.append("defs").append("radialGradient")
					.attr("id", "drop_shadow")
					.attr("cx", "50%")
					.attr("cy", "50%");
				drop_shadow.append("stop")
					.attr("offset","20%").attr("stop-color", "#000")
					.attr("stop-opacity",".5");
				drop_shadow.append("stop")
					.attr("offset","100%").attr("stop-color", "#000")
					.attr("stop-opacity","0");

			// drop shadow
			svg.append("ellipse")
				.attr("cx", 440).attr("cy", 450)
				.attr("rx", proj.scale()*.90)
				.attr("ry", proj.scale()*.25)
				.attr("class", "noclicks")
				.style("fill", "url(#drop_shadow)");

			// globe (ocean)
			svg.append("circle")
				.attr("cx", width / 2).attr("cy", height / 2)
				.attr("r", proj.scale())
				.attr("class", "noclicks")
				.style("fill", "url(#ocean_fill)");

			// land
			svg.append("path")
				.datum(topojson.object(world, world.objects.land))
				.attr("class", "land noclicks")
				.attr("d", path)
				.style("fill", "#19D119");

			svg.append("path")
				.datum(graticule)
				.attr("class", "graticule noclicks")
				.attr("d", path);

			svg.append("circle")
				.attr("cx", width / 2).attr("cy", height / 2)
				.attr("r", proj.scale())
				.attr("class","noclicks")
				.style("fill", "url(#globe_highlight)");

			svg.append("circle")
				.attr("cx", width / 2).attr("cy", height / 2)
				.attr("r", proj.scale())
				.attr("class","noclicks")
				.style("fill", "url(#globe_shading)");

			// points
			svg.append("g").attr("class","points")
				.selectAll("text").data(places.features)
				.enter().append("path")
				.attr("class", "point")
				.attr("d", path);

			// labels
			svg.append("g").attr("class","labels")
				.selectAll("text").data(places.features)
				.enter().append("text")
				.attr("class", "label")
				.text(function(d) { return d.properties.name });

			// uncomment for hover-able country outlines

			// svg.append("g").attr("class","countries")
			// .selectAll("path")
			//.data(topojson.object(world, world.objects.countries).geometries)
			//.enter().append("path")
			//.attr("d", path);

			position_labels();

			var i = 0;

			// spawn links between cities as source/target coord pairs
			places.features.forEach(function(a) {
				places.features.forEach(function(b) {
					if (a !== b) {
						i = i + 1;
						links.push({
							source: a.geometry.coordinates,
							target: b.geometry.coordinates
						});
					}
				});
			});



			/*
			while  ( i < places.features.length) {
				var place1 = places.features[i];
				var place2 = places.features[i+1];
				links.push({
					source: place1.geometry.coordinates,
					target: place2.geometry.coordinates
				});
				i = i + 1;
			};
			*/


			// build geoJSON features from links arrays
			links.forEach(function(e,i,a) {
				var feature =   { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [e.source,e.target] }};
				arcLines.push(feature);
			})

			/*
			var feature =   { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [links[0].source, links[0].target] }};
			arcLines.push(feature);
			var feature =   { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [links[4].source, links[4].target] }};
			arcLines.push(feature);
			var feature =   { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [links[8].source, links[8].target] }};
			arcLines.push(feature);
			*/

			if ($scope.sliderData.currentValue >= 1455){
			svg.append("g").attr("class","arcs")
				.selectAll("path").data(arcLines)
					.enter().append("path")
						.attr("class","arc")
						.attr("d",path);

			svg.append("g").attr("class","flyers")
				.selectAll("path").data(links)
				.enter().append("path")
				.attr("class","flyer")
				.attr("d", function(d) { return swoosh(flying_arc(d)) });

			refresh();
		};
		}

		function flying_arc(pts) {
			var source = pts.source,
				target = pts.target;

			var mid = location_along_arc(source, target, .5);
			var result = [ proj(source),
						sky(mid),
						proj(target) ];
			return result;
		}



		function refresh() {
			svg.selectAll(".land").attr("d", path);
			svg.selectAll(".point").attr("d", path);
			svg.selectAll(".graticule").attr("d", path);

			svg.selectAll(".arc").attr("d", path)
				.attr("opacity", function(d) {
					return fade_at_edge(d)
				});

			svg.selectAll(".flyer")
				.attr("d", function(d) { return swoosh(flying_arc(d)) })
				.attr("opacity", function(d) {
					return fade_at_edge(d);
			});

			position_labels();
		}


		function fade_at_edge(d) {
			var centerPos = proj.invert([width/2,height/2]),
				arc = d3.geo.greatArc(),
				start, end;
			// function is called on 2 different data structures..
			if (d.source) {
				start = d.source,
				end = d.target;
			} else {
				start = d.geometry.coordinates[0];
				end = d.geometry.coordinates[1];
			}

			var start_dist = 1.57 - arc.distance({source: start, target: centerPos}),
				end_dist = 1.57 - arc.distance({source: end, target: centerPos});

			var fade = d3.scale.linear().domain([-.1,0]).range([0,.1])
			var dist = start_dist < end_dist ? start_dist : end_dist;

			return fade(dist)
		}

		function location_along_arc(start, end, loc) {
			var interpolator = d3.geo.interpolate(start,end);
			return interpolator(loc);
		}

		//code taken from other d3js projects

		function position_labels() {
			var centerPos = proj.invert([width/2,height/2]);

			var arc = d3.geo.greatArc();
			svg.selectAll(".label")
				.attr("text-anchor",function(d) {
					var x = proj(d.geometry.coordinates)[0];
					return x < width/2-20 ? "end" :
						x < width/2+20 ? "middle" :
						"start";
				})
				.attr("transform", function(d) {
					var loc = proj(d.geometry.coordinates),
						x = loc[0],
						y = loc[1];
					var offset = x < width/2 ? -5 : 5;
					return "translate(" + (x+offset) + "," + (y-2) + ")"
				})
				.style("display",function(d) {
					var d = arc.distance({source: d.geometry.coordinates, target: centerPos});
					return (d > 1.57) ? 'none' : 'inline';
				});
		}

		// modified from http://bl.ocks.org/1392560
		var m0, o0;
		function mousedown() {
			m0 = [d3.event.pageX, d3.event.pageY];
			o0 = proj.rotate();
			d3.event.preventDefault();
		}

		function mousemove() {
			if (m0) {
				var m1 = [d3.event.pageX, d3.event.pageY],
						o1 = [o0[0] + (m1[0] - m0[0]) / 6, o0[1] + (m0[1] - m1[1]) / 6];
				o1[1] = o1[1] > 30  ? 30  : o1[1] < -30 ? -30 : o1[1];
				proj.rotate(o1);
				sky.rotate(o1);
				refresh();
			}
		}
		function mouseup() {
			if (m0) {
				mousemove();
				m0 = null;
			}
		}


		var slast = 1;

		function zoomed() {
    	if (slast != d3.event.scale) {
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        slast = d3.event.scale;
    	};
		}
	});
