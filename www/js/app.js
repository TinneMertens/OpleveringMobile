// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngMessages', 'ngAnimate', 'ui.bootstrap', 'firebase'])

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

  .state('tab.inventory', {
    url: '/inventory',
    views: {
      'tab-inventory': {
        templateUrl: 'templates/tab-inventory.html',
        controller: 'InventoryCtrl'
      }
    }
  })

    // .state('tab.chat-detail', {
    //   url: '/chats/:chatId',
    //   views: {
    //     'tab-chats': {
    //       templateUrl: 'templates/chat-detail.html',
    //       controller: 'ChatDetailCtrl'
    //     }
    //   }
    // })

  .state('tab.report', {
    url: '/report',
    views: {
      'tab-report': {
        templateUrl: 'templates/tab-report.html',
        controller: 'ReportCtrl'
      }
    }
  })

  .state('tab.manage', {
    url: '/manage',
    views: {
      'tab-manage': {
        templateUrl: 'templates/tab-manage.html',
        controller: 'ManageCtrl'
      }
    }
  })

.state('tab.stockage', {
    url: '/overviewStockage',
    views: {
      'tab-manage': {
        templateUrl: 'templates/stockageOverview.html',
        controller: 'StockageCtrl'
      }
    }
  })

  .state('tab.addStorageplace', {
    url: '/addstorageplace',
    views: {
      'tab-manage': {
        templateUrl: 'templates/addStoragePlace.html',
        controller: 'AddstorageCtrl'
      }
    }
  })

.state('tab.overviewCat', {
  url: '/overviewCategory',
  views: {
    'tab-manage': {
      templateUrl: 'templates/categoryOverview.html',
      controller: 'OverviewCatCtrl'
    }
  }
})

.state('tab.addCat', {
  url: '/addCategory',
  views: {
    'tab-manage': {
      templateUrl: 'templates/addCategory.html',
      controller: 'addCatCtrl'
    }
  }
})

.state('tab.overviewInventories', {
  url: '/overviewInventories',
  views: {
    'tab-manage': {
      templateUrl: 'templates/overviewInventories.html',
      controller: 'overviewInvenCtrl'
    }
  }
});

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/inventory');

});
