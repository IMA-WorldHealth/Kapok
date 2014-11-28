angular.module('bhima.controllers')
.controller('stock_dashboard', [
  '$scope',
  '$translate',
  '$http',
  '$q',
  'validate',
  'messenger',
  'connect',
  'appstate',
  'stockControler',
  function ($scope, $translate, $http, $q, validate, messenger, connect, appstate, stockControler) {
    var dependencies = {},
        session = $scope.session = {},
        expiredTotal = $scope.expiredTotal = {};

    function startup (models) {
      angular.extend($scope, models);
      stockParProduit();
    }

    appstate.register('enterprise', function (enterprise) {
      $scope.enterprise = enterprise;
      validate.process(dependencies)
      .then(startup);
    });

    $http.get('/getTop10Consumption/').
    success(function(data) {
      $scope.consumptions = data;
    });

    $http.get('/getTop10Donor/').
    success(function(data) {
      $scope.donors = data;
    });

    $http.get('/getPurchaseOrders/',{params : {
          'request' : 'OrdersPayed'
        }  
    }).
    success(function(data) {
      $scope.orderpayed = data;
    });


    $http.get('/getPurchaseOrders/',{params : {
          'request' : 'OrdersWatingPayment'
        }  
    }).
    success(function(data) {    
      $scope.OrdersWatingPayment = data;
    });

    $http.get('/getPurchaseOrders/',{params : {
          'request' : 'OrdersReceived'
        }  
    }).
    success(function(data) {
      $scope.OrdersReceived = data;
    });


    $http.get('/getPurchaseOrders/',{params : {
          'request' : 'InWatingReception'
        }  
    }).
    success(function(data) {  
      $scope.InWatingReception = data;
    });

    /* Consumption By tracking_number */
    $http.get('/getConsumptionTrackingNumber/').
    success(function(data) {  
      $scope.TrackingNumbers = data;
    });

    /* For Expiring date */
    $http.get('/getExpiredTimes/',{params : {
          'request' : 'expired'
        }  
    }).
    success(function(data) {     
      $scope.expired = data;
      $scope.nbExpired = data.length;
      for (var item in $scope.TrackingNumbers){
        var TrackingNumber = $scope.TrackingNumbers[item];
        for(var item2 in data){
          var data2 = data[item2];
          if(data2.tracking_number === TrackingNumber.tracking_number){
            var diffQuantity = data2.quantity - TrackingNumber.quantity;
            if(diffQuantity <= 0){
              $scope.nbExpired -= 1;
            }
          } 
        }
      }
    });

    // Expire dans 30 jours
    $http.get('/getExpiredTimes/',{params : {
          'request' : 'expiredDellai',
          'inf'     : '0',
          'sup'     : '30'
        }  
    }).
    success(function(data) {      
      $scope.expired30 = data;
      $scope.nbExpired30 = data.length;
      for (var item in $scope.TrackingNumbers){
        var TrackingNumber = $scope.TrackingNumbers[item];
        for(var item2 in data){
          var data2 = data[item2];
          if(data2.tracking_number === TrackingNumber.tracking_number){
            var diffQuantity = data2.quantity - TrackingNumber.quantity;
            if(diffQuantity <= 0){
              $scope.nbExpired30 -= 1;
            }
          } 
        }
      }
    });

    // Expire dans 30 90 jours
    $http.get('/getExpiredTimes/',{params : {
          'request' : 'expiredDellai',
          'inf'     : '30',
          'sup'     : '90'
        }  
    }).
    success(function(data) {      
      $scope.expired3090 = data;
      $scope.nbExpired3090 = data.length;
      for (var item in $scope.TrackingNumbers){
        var TrackingNumber = $scope.TrackingNumbers[item];
        for(var item2 in data){
          var data2 = data[item2];
          if(data2.tracking_number === TrackingNumber.tracking_number){
            var diffQuantity = data2.quantity - TrackingNumber.quantity;
            if(diffQuantity <= 0){
              $scope.nbExpired3090 -= 1;
            }
          } 
        }
      }
    });

    // Expire dans 90 180 jours
    $http.get('/getExpiredTimes/',{params : {
          'request' : 'expiredDellai',
          'inf'     : '90',
          'sup'     : '180'
        }  
    }).
    success(function(data) {      
      $scope.expired180 = data;
      $scope.nbExpired180 = data.length;
      for (var item in $scope.TrackingNumbers){

        var TrackingNumber = $scope.TrackingNumbers[item];
        for(var item2 in data){
          var data2 = data[item2];
          if(data2.tracking_number === TrackingNumber.tracking_number){
            var diffQuantity = data2.quantity - TrackingNumber.quantity;
            if(diffQuantity <= 0){
              $scope.nbExpired180 -= 1;
            }
          } 
        }
      }
    });

    // Expire dans 180 365 jours
    $http.get('/getExpiredTimes/',{params : {
          'request' : 'expiredDellai',
          'inf'     : '180',
          'sup'     : '365'
        }  
    }).
    success(function(data) {      
      $scope.expired365 = data;
      $scope.nbExpired365 = data.length;
      for (var item in $scope.TrackingNumbers){

        var TrackingNumber = $scope.TrackingNumbers[item];
        for(var item2 in data){
          var data2 = data[item2];
          if(data2.tracking_number === TrackingNumber.tracking_number){
            var diffQuantity = data2.quantity - TrackingNumber.quantity;
            if(diffQuantity <= 0){
              $scope.nbExpired365 -= 1;
            }
          } 
        }
      }
    });

    // Expire dans 1 year jours
    $http.get('/getExpiredTimes/',{params : {
          'request' : 'oneYear'
        }  
    }).
    success(function(data) {      
      $scope.expired1 = data;
      $scope.nbExpired1 = data.length;
      for (var item in $scope.TrackingNumbers){
        var TrackingNumber = $scope.TrackingNumbers[item];
        for(var item2 in data){
          var data2 = data[item2];
          if(data2.tracking_number === TrackingNumber.tracking_number){
            var diffQuantity = data2.quantity - TrackingNumber.quantity;
            if(diffQuantity <= 0){
              $scope.nbExpired1 -= 1;
            }
          } 
        }
      }
    });
    // STOCK PAR PRODUITS
    $http.get('/getStockEntry/').
    success(function(data) {
      $scope.enterStocks = data;
    });

    $http.get('/getStockConsumption/').
    success(function(data) {
      var stocksOut = 0,
          stocksIn = 0;


      for (var item in $scope.enterStocks){
        var stock = $scope.enterStocks[item];
        for(var item2 in data){
          var data2 = data[item2],
              diff;
          if(data2.inventory_uuid === stock.inventory_uuid){
            diff = stock.quantity - data2.quantity;
            if(diff === 0){
              stocksOut++;
            } else if (diff > 0){
              stocksIn++;
            }
          }
        }
      }
      $scope.stocksOut = stocksOut;
      $scope.stocksIn = stocksIn;
      $scope.OutStocks = data;
    });

    function stockParProduit () {
      // Calcul l'etat du stock par rapport a tous les produits dans le stock
      var def = $q.defer(),
          stock_inventory = [];

      // A FIXE : $http.get instead connect because cannot get distinct data with connect
      $http.get('/getDistinctInventories/')
      .success(function (inventories) {
        inventories.forEach(function (item) {
          var inventory = {};

          stockControler.getStock(item.inventory_uuid)
          .then(function (data) { inventory.stock = data;})
          .then(stockControler.getStockMin(item.inventory_uuid)
                .then(function (data) { inventory.stock_min = data; })
                .then(stockControler.getStockSecurity(item.inventory_uuid)
                      .then(function (data) { inventory.stock_security = data;})
                      .then(stockControler.getStockMax(item.inventory_uuid)
                            .then(function (data) { 
                              inventory.stock_max = data; 
                              inventory.uuid = item.inventory_uuid;
                              stock_inventory.push(inventory);
                              // A FIXE : contrainte execution asynchrone, trop d'imbrication
                              // Process
                                var count_stock = 0;
                                var count_stock_min = 0;
                                var count_stock_max = 0;
                                var count_stock_ok = 0;

                                for(var i in stock_inventory){
                                  if(stock_inventory[i].stock === 0 || stock_inventory[i].stock <= 0){ count_stock++; }
                                  if(stock_inventory[i].stock_min >= stock_inventory[i].stock){ count_stock_min++; }
                                  if(stock_inventory[i].stock_max <= stock_inventory[i].stock){ count_stock_max++; }
                                  if(stock_inventory[i].stock < stock_inventory[i].stock_max && stock_inventory[i].stock > stock_inventory[i].stock_min){ count_stock_ok++; }
                                }
                                $scope.count_stock = count_stock;
                                $scope.count_stock_min = count_stock_min;
                                $scope.count_stock_max = count_stock_max;
                                $scope.count_stock_ok = count_stock_ok;
                              // End process
                            })
                          )
                      )
                );

        });

      });
    }
  }
]);