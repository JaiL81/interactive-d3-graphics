'use strict';

/**
 * @ngdoc function
 * @name interactiveD3App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the interactiveD3App
 */
angular.module('interactiveD3App')
  .controller('MainCtrl', function ($http, $interval) {
    var vm = this;
    vm.isPlaying = false;

    // SET UP DIMENSIONS
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
    var totalPopulation, percentage;


    var maxValue, xScale, yScale;

    $http.get("../../json/data.json").then(function (response) {
      vm.data = response.data;
      vm.currentYear = vm.data[0].year;
      vm.currentElement = vm.data[0];

      buildPopulationGraph(response.data[0].population);

      buildLineChart();

    });

    function buildLineChart() {

      vm.options = {
        chart: {
          type: 'multiChart',
          height: 400,
          width: 600,
          margin: {
            top: 30,
            right: 60,
            bottom: 50,
            left: 70
          },
          color: d3.scale.category10().range(),
          useInteractiveGuideline: false,
          showLegend: false,
          tooltip: {enabled: false},
          useVoronoi: false,
          interpolate: 'basis',
          duration: 500,
          xAxis: {
            tickFormat: function (d) {
              return d3.format(',f')(d);
            }
          },
          yAxis1: {
            tickFormat: function (d) {
              return d3.format(',.1f')(d);
            }
          },
          yAxis2: {
            tickFormat: function (d) {
              return d3.format(',.1f')(d);
            }
          }
        }
      };
      vm.multiLineData = [
        {
          key: 'Workers per dependent',
          type: 'line',
          yAxis: 1,
          values: _.map(vm.data, function (d) {
            return {x: d.year, y: d.workersPerDependent};
          }),
          color: 'orange'
        },
        {
          key: 'Income per person',
          type: 'line',
          yAxis: 2,
          values: _.map(vm.data, function (d) {
            return {x: d.year, y: d.incomePerPerson};
          }),
          classed: 'dashed',
          color: 'orange'
        }
      ];
    }

    vm.pause = function () {
      stopPlayer();
    };

    vm.play = function () {
      if (angular.isDefined(vm.timer)) return;


      vm.isPlaying = true;
      vm.timer = $interval(function () {
        if (vm.currentYear < _.last(vm.data).year) {
          updateBarChart();
        } else {
          stopPlayer();
        }
      }, 1000);
    };

    vm.stopAndUpdate = function () {
      stopPlayer();
      updateBarChart();
    };


    function stopPlayer() {

      vm.isPlaying = false;
      if (angular.isDefined(vm.timer)) {
        $interval.cancel(vm.timer);
        vm.timer = undefined;
      }
    }


    function updateBarChart() {
      vm.currentYear++;
      vm.currentElement = _.find(vm.data, {year: vm.currentYear});

      var population = vm.currentElement.population;

      updateBars('.bar.left');
      updateBars('.bar.right');

      function updateBars(selection) {
        d3.selectAll(selection)
          .data(population)
          .transition(250)
          .attr('y', function (d) {
            return yScale(d.group);
          })
          .attr('width', function (d) {
            return xScale(percentage(d.male));
          });
      }
    }

    function buildPopulationGraph(data) {
      calculatePercentage(data);

      var svg = d3.select('svg')
        .attr('width', margin.left + w + margin.right)
        .attr('height', margin.top + h + margin.bottom)
        // ADD A GROUP FOR THE SPACE WITHIN THE MARGINS
        .append('g')
        .attr('transform', translation(margin.left, margin.top));

      setUpScales(data);
      drawAxes(svg);

      // MAKE GROUPS FOR EACH SIDE OF CHART
      // scale(-1,1) is used to reverse the left side so the bars grow left instead of right
      var leftBarGroup = svg.append('g')
        .attr('id', 'leftGroup')
        .attr('transform', translation(pointA, 0) + 'scale(-1,1)');
      var rightBarGroup = svg.append('g')
        .attr('id', 'rightGroup')
        .attr('transform', translation(pointB, 0));

      drawGroupBars(leftBarGroup, data, yScale, xScale, rightBarGroup);
    }

    function drawAxes(svg) {
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

    }

    function translation(x, y) {
      return 'translate(' + x + ',' + y + ')';
    }

    function setUpScales(data) {
      // find the maximum data value on either side
      //  since this will be shared by both of the x-axes
      maxValue = Math.max(
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
      xScale = d3.scale.linear()
        .domain([0, maxValue])
        .range([0, regionWidth])
        .nice();

      yScale = d3.scale.ordinal()
        .domain(data.map(function (d) {
          return d.group;
        }))
        .rangeRoundBands([h, 0], 0.1);
    }

    function drawGroupBars(leftBarGroup, data, yScale, xScale, rightBarGroup) {
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
        .attr('height', 15);

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
        .attr('height', 15);
    }

    function calculatePercentage(data) {
      totalPopulation = d3.sum(data, function (d) {
        return d.male + d.female;
      });

      percentage = function (d) {
        return d / totalPopulation;
      };
    }
  });
