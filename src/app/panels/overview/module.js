define([
  'angular',
  'app',
  'lodash',
  'components/timeSeries',
  'services/panelSrv',
],
function (angular, app, _, timeSeries) {
  'use strict';

  var module = angular.module('grafana.panels.overview', []);
  app.useModule(module);

  module.controller('OverviewCtrl', function($scope, panelSrv) {

    $scope.panelMeta = {
      description : "A panel to show an overview of different metrics through avg, total, current numbers and sparklines",
      fullEditorTabs : [
        {
          title: 'General',
          src:'app/partials/panelgeneral.html'
        },
        {
          title: 'Metrics',
          src:'app/partials/metrics.html'
        }
      ],
      fullscreenEdit: true,
    };

    // Set and populate defaults
    var _d = {
      targets: [{}]
    };

    _.defaults($scope.panel, _d);

    $scope.init = function() {
      panelSrv.init(this);

      if (!$scope.skipDataOnInit) {
        $scope.get_data();
      }
      //$scope.$on('refresh', $scope.render);
      //$scope.render();
    };

    $scope.get_data = function() {
      delete $scope.panel.error;
      $scope.panelMeta.loading = true;

      $scope.rangeUnparsed = $scope.filter.timeRange(false);

      var metricsQuery = {
        range: $scope.rangeUnparsed,
        interval: '1min',
        targets: $scope.panel.targets,
        maxDataPoints: 100,
      };

      return $scope.datasource.query($scope.filter, metricsQuery)
        .then($scope.dataHandler)
        .then(null, function(err) {
          $scope.panelMeta.loading = false;
          $scope.panel.error = err.message || "Timeseries data request error";
          $scope.inspector.error = err;
          $scope.render([]);
        });
    };

    $scope.dataHandler = function(results) {
      $scope.panelMeta.loading = false;
      $scope.series = _.map(results.data, $scope.seriesHandler);

      console.log($scope.series);
    };

    $scope.seriesHandler = function(seriesData) {
      var datapoints = seriesData.datapoints;
      var alias = seriesData.target;

      var seriesInfo = {
        alias: alias,
        enable: true,
      };

      var series = new timeSeries.ZeroFilled({
        datapoints: datapoints,
        info: seriesInfo,
      });

      series.points = series.getFlotPairs('connected', 'short');

      return series;
    };

    $scope.render = function() {

    };

    $scope.openEditor = function() {
    };

    $scope.init();

  });
});
