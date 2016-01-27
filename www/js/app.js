// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngMessages', 'ngAnimate', 'ui.bootstrap', 'firebase', 'chart.js'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  // Aanmaken van de inventaris (1ste tab)
  .state('tab.inventory', {
    url: '/inventory',
    views: {
      'tab-inventory': {
        templateUrl: 'templates/tab-inventory.html',
        controller: 'InventoryCtrl'
      }
    }
  })

  .state('tab.category', {
    url:'/category',
    views: {
      'tab-inventory': {
        templateUrl: 'templates/category.html',
        controller: 'CategoryCtrl'
      }
    }
  })

  .state('tab.inventoryDetail', {
    url:'/detail',
    views: {
      'tab-inventory': {
        templateUrl: 'templates/inventoryDetail.html',
        controller: 'DetailCtrl'
      }
    }
  })

  // Raportages (2de tab)

  .state('tab.report', {
    url: '/report',
    views: {
      'tab-report': {
        templateUrl: 'templates/tab-report.html',
        controller: 'ReportCtrl'
      }
    }
  })

  .state('tab.searchProducts', {
    url: '/searchProducts',
    views: {
      'tab-report': {
        templateUrl: 'templates/zoekProducten.html',
        controller: 'searchProductsCtrl'
      }
    }
  })

  .state('tab.searchInStorages',{
    url: '/searchInStorages',
    views:{
      'tab-report':{
        templateUrl: 'templates/searchInStorages.html',
        controller: 'searchinStoragesCtrl'
      }
    }
  })

  .state('tab.charts', {
    url: '/charts',
    views:{
      'tab-report':{
        templateUrl: 'templates/charts.html',
        controller: 'chartCtrl'
      }
    }
  })

// Beheer gedeelte/instellingen (icoontje rechtsbovenaan)
  .state('overview', {
    url: '/overview',
    templateUrl: 'templates/tab-manage.html',
    controller: 'ManageCtrl'
  })
  // .state('manage.overview', {
  //   url: '/overview',
  //   views: {
  //     'manage-overview': {
  //       templateUrl: 'templates/tab-manage.html',
  //       controller: 'ManageCtrl'
  //     }
  //   }
  // })

  .state('stockage', {
    url: '/overviewStockage',
    templateUrl: 'templates/stockageOverview.html',
    controller: 'StockageCtrl'
  })

  .state('addStorageplace', {
    url: '/addstorageplace',
    templateUrl: 'templates/addStoragePlace.html',
    controller: 'AddstorageCtrl'
  })

  .state('editStorageplace', {
    url: '/editstorageplace',
    templateUrl: 'templates/editStoragePlace.html',
    controller: 'EditstorageCtrl'
  })

  .state('overviewCat', {
    url: '/overviewCategory',
    templateUrl: 'templates/categoryOverview.html',
    controller: 'OverviewCatCtrl'
  })

  .state('addCat', {
    url: '/addCategory',
    templateUrl: 'templates/addCategory.html',
    controller: 'addCatCtrl'
  })

  .state('editCat',{
    url: '/editCategory',
    templateUrl: 'templates/editCategory.html',
    controller: 'editCatCtrl'
  })

  .state('overviewInventories', {
    url: '/overviewInventories',
    templateUrl: 'templates/overviewInventories.html',
    controller: 'overviewInvenCtrl'
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('tab/inventory');

});
