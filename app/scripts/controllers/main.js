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
    var main = this;

    $http.get("../../json/data.json").then(function (response) {
      buildPopulationGraph(response.data[0].population);
    });


    function buildPopulationGraph(data) {

      // SET UP DIMENSIONS
  //    var w = parseInt(d3.select(".population").attr("width")),
    //    h = parseInt(d3.select(".population").attr("height"));
    var w = 300,
        h = 300;

      var margin = {
        top: 20,
        right: 20,
        bottom: 24,
        left: 20
      };

  // the width of each side of the chart
      var regionWidth = w / 2;

  // these are the x-coordinates of the y-axes
      var pointA = regionWidth,
        pointB = w - regionWidth;

  // GET THE TOTAL POPULATION SIZE AND CREATE A FUNCTION FOR RETURNING THE PERCENTAGE
      var totalPopulation = d3.sum(data, function (d) {
          return d.male + d.female;
        }),
        percentage = function (d) {
          return d / totalPopulation;
        };


  // CREATE SVG
      var svg = d3.select('svg')
        .attr('width', margin.left + w + margin.right)
        .attr('height', margin.top + h + margin.bottom)
        // ADD A GROUP FOR THE SPACE WITHIN THE MARGINS
        .append('g')
        .attr('transform', translation(margin.left, margin.top));

  // find the maximum data value on either side
  //  since this will be shared by both of the x-axes
      var maxValue = Math.max(
        d3.max(data, function (d) {
          return percentage(d.male);
        }),
        d3.max(data, function (d) {
          return percentage(d.female);
        })
      );

  // SET UP SCALES

  // the xScale goes from 0 to the width of a region
  //  it will be reversed for the left x-axis
      var xScale = d3.scale.linear()
        .domain([0, maxValue])
        .range([0, regionWidth])
        .nice();

      var yScale = d3.scale.ordinal()
        .domain(data.map(function (d) {
          return d.group;
        }))
        .rangeRoundBands([h, 0], 0.1);


  // SET UP AXES
      var xAxisRight = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .tickValues(xScale.domain())
        .tickFormat(d3.format('%'));

      var xAxisLeft = d3.svg.axis()
        // REVERSE THE X-AXIS SCALE ON THE LEFT SIDE BY REVERSING THE RANGE
        .scale(xScale.copy().range([pointA, 0]))
        .orient('bottom')
        .tickValues(xScale.domain())
        .tickFormat(d3.format('%'));

  // DRAW AXES
      svg.append('g')
        .attr('class', 'axis x left')
        .attr('transform', translation(0, h))
        .call(xAxisLeft);

      svg.append('g')
        .attr('class', 'axis x right')
        .attr('transform', translation(pointB, h))
        .call(xAxisRight);

  // MAKE GROUPS FOR EACH SIDE OF CHART
  // scale(-1,1) is used to reverse the left side so the bars grow left instead of right
      var leftBarGroup = svg.append('g')
        .attr('transform', translation(pointA, 0) + 'scale(-1,1)');
      var rightBarGroup = svg.append('g')
        .attr('transform', translation(pointB, 0));

  // DRAW BARS
      leftBarGroup.selectAll('.bar.left')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar left')
        .attr('x', 0)
        .attr('y', function (d) {
          return yScale(d.group);
        })
        .attr('width', function (d) {
          return xScale(percentage(d.male));
        })
        .attr('height', yScale.rangeBand());

      rightBarGroup.selectAll('.bar.right')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar right')
        .attr('x', 0)
        .attr('y', function (d) {
          return yScale(d.group);
        })
        .attr('width', function (d) {
          return xScale(percentage(d.female));
        })
        .attr('height', yScale.rangeBand());


  // so sick of string concatenation for translations
      function translation(x, y) {
        return 'translate(' + x + ',' + y + ')';
      }
    }

  });
