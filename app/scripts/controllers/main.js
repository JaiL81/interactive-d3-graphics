'use strict';

/**
 * @ngdoc function
 * @name interactiveD3App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the interactiveD3App
 */
angular.module('interactiveD3App')
  .controller('MainCtrl', function ($http) {

    $http.get("../../json/data.json").then(function (response) {
      console.log(response);
    });

    // SET UP DIMENSIONS
    var w = 500,
      h = 300;

// the width of each side of the chart
    var regionWidth = w/2;

// these are the x-coordinates of the y-axes
    var pointA = regionWidth,
      pointB = w - regionWidth;

// some contrived data
    var exampleData = [
      {group: '0-9', male: 10, female: 12},
      {group: '10-19', male: 14, female: 15},
      {group: '20-29', male: 15, female: 18},
      {group: '30-39', male: 18, female: 18},
      {group: '40-49', male: 21, female: 22},
      {group: '50-59', male: 19, female: 24},
      {group: '60-69', male: 15, female: 14},
      {group: '70-79', male: 8, female: 10},
      {group: '80-89', male: 4, female: 5},
      {group: '90-99', male: 2, female: 3},
      {group: '100-109', male: 1, female: 1}
    ];

// GET THE TOTAL POPULATION SIZE AND CREATE A FUNCTION FOR RETURNING THE PERCENTAGE
    var percentage = function(d) { return d; };


// CREATE SVG
    var svg = d3.select('svg')
      .attr('width',w)
      .attr('height',h)
      // ADD A GROUP FOR THE SPACE WITHIN THE MARGINS
      .append('g');
    //.attr('transform', translation(margin.left, margin.top));

// find the maximum data value on either side
//  since this will be shared by both of the x-axes
    var maxValue = Math.max(
      d3.max(exampleData, function(d) { return percentage(d.male); }),
      d3.max(exampleData, function(d) { return percentage(d.female); })
    );

// SET UP SCALES

// the xScale goes from 0 to the width of a region
//  it will be reversed for the left x-axis
    var xScale = d3.scale.linear()
      .domain([0, maxValue])
      .range([0, regionWidth])
      .nice();

    var yScale = d3.scale.ordinal()
      .domain(exampleData.map(function(d) { return d.group; }))
      .rangeRoundBands([h,0], 0.1);

// MAKE GROUPS FOR EACH SIDE OF CHART
// scale(-1,1) is used to reverse the left side so the bars grow left instead of right
    var leftBarGroup = svg.append('g')
      .attr('transform', translation(pointA, 0) + 'scale(-1,1)');
    var rightBarGroup = svg.append('g')
      .attr('transform', translation(pointB, 0));

// DRAW BARS
    leftBarGroup.selectAll('.bar.left')
      .data(exampleData)
      .enter().append('rect')
      .attr('class', 'bar left')
      .attr('x', 0)
      .attr('y', function(d) { return yScale(d.group); })
      .attr('width', function(d) { return xScale(percentage(d.male)); })
      .attr('height', yScale.rangeBand());

    rightBarGroup.selectAll('.bar.right')
      .data(exampleData)
      .enter().append('rect')
      .attr('class', 'bar right')
      .attr('x', 0)
      .attr('y', function(d) { return yScale(d.group); })
      .attr('width', function(d) { return xScale(percentage(d.female)); })
      .attr('height', yScale.rangeBand());


// so sick of string concatenation for translations
    function translation(x,y) {
      return 'translate(' + x + ',' + y + ')';
    }
  });
