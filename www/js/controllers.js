angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('MyStocks', ['$scope',
  function($scope) {
    $scope.myStocksArray = [
      {ticker: 'AAPL '},
      {ticker: 'GPRO'},
      {ticker: 'FB'},
      {ticker: 'NFLX'},
      {ticker: 'TLSA'},
      {ticker: 'BRK-A'},
      {ticker: 'INTC'},
      {ticker: 'MSFT'},
      {ticker: 'GE'},
      {ticker: 'BAC'},
      {ticker: 'C'},
      {ticker: 'T'},
    ];
  }])

.controller('Stock', ['$scope', '$stateParams', '$window', 'stockDataService', 'dateService', 'chartDataService',
  function($scope, $stateParams, $window, stockDataService, dateService, chartDataService) {
    $scope.ticker     = $stateParams.stockTicker;
    $scope.chartView  = 4;

    $scope.$on('$ionicView.afterEnter', function() {
      getPriceData();
      getDetailsData();
      getChartData();
    });

    $scope.chartViewFunction = function(n) {
      $scope.chartView = n;
    };

    function getDetailsData() {
      var promise = stockDataService.getDetailsData($scope.ticker);

      promise.then(function(data) {
        $scope.stockDetailsData = data;
      });
    }

    function getPriceData() {
      var promise = stockDataService.getPriceData($scope.ticker);

      promise.then(function(data) {
        $scope.stockPriceData = data;
        console.log(data);
        if (data.chg_percent >= 0 && data !== null) {
          $scope.reactiveColor = {'background-color': '#33cd5f'};
        } else if (data.chg_percent < 0 && data !== null) {
          $scope.reactiveColor = {'background-color': '#ef473a'};
        }
      });
    }

    $scope.oneYearAgoDate = dateService.oneYearAgoDate();
    $scope.todayDate      = dateService.currentDate();

    function getChartData() {
      var promise = chartDataService.historicalData($scope.ticker, $scope.oneYearAgoDate, $scope.todayDate);

      promise.then(function(data) {
        $scope.data = data.map(function(series) {
          series.values = series.values.map(function(d) {
            return {
              x: d[0], y: d[1]
            };
          });

          return series;
        });
      });
    }

    var marginBottom = ($window.innerWidth / 100) * 5;

    $scope.options = {
      chart: {
        type: 'linePlusBarChart',
        height: 500,
        tooltips: false,
        showLegend: false,
        useVoronoi: false,
        xShowMaxMin: false,
        useInteractiveGuideline:false,
        yShowMaxMin: false,
        margin: {
            top: 30,
            right: 75,
            bottom: marginBottom,
            left: 75
        },
        bars: {
            forceY: [0]
        },
        bars2: {
            forceY: [0]
        },
        color: ['#2ca02c', 'darkred'],
        x: function(d, i) {return i;},
        xAxis: {
          axisLabel: '',
          tickFormat: function(d) {
            var dx = $scope.data[0].values[d] && $scope.data[0].values[d].x || 0;
            if (dx > 0) {
              return d3.time.format('%b %d')(new Date(dx));
            }

            return null;
          }
        },
        x2Axis: {
          tickFormat: function(d) {
            var dx = $scope.data[0].values[d] && $scope.data[0].values[d].x || 0;
            return d3.time.format('%b %Y')(new Date(dx));
          },
          showMaxMin: false
        },
        y1Axis: {
          axisLabel: 'Volume',
          tickFormat: function(d){
              return d3.format(',f')(d);
          }
        },
        y2Axis: {
          axisLabel: 'Price',
          tickFormat: function(d) {
              return '$' + d3.format('s')(d);
          }
        },
        y3Axis: {
          axisLabel: 'Volume',
          tickFormat: function(d){
            return d3.format(',.2s')(d);
          }
        },
        y4Axis: {
          tickFormat: function(d) {
            return '$' + d3.format(',.2s')(d);
          }
        }
      }
    };
  }]);
