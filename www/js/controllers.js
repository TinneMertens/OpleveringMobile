angular.module('starter.controllers', ['starter.services', 'firebase'])

.controller('HomeCtrl', function($scope, $ionicHistory){
  $scope.myGoBack = function(){
    $ionicHistory.goBack();
  }
})

.controller('InventoryCtrl', function($scope, $ionicTabsDelegate) {
  $scope.today = function() {
      $scope.dt = new Date();
    };
    $scope.today();

  $scope.open = function($event) {
    $scope.status.opened = true;
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];

  $scope.status = {
    opened: false
  };

})

.controller('StockageCtrl', function($scope, $ionicPopup, $state, Storages) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.storages = Storages;

  $scope.showConfirm = function(index) {
    // var name = Storages.get(index)
    var confirmPopup = $ionicPopup.confirm({
      title: 'Verwijder',
      template: 'Bent u zeker dat u dit item wilt verwijderen?'
    });
    confirmPopup.then(function(res) {
      if(res) {
        Storages.$remove(index);
      } else {
        console.log('You are not sure');
      }
    });
  };

  // $scope.remove = function(chat) {
  //   Chats.remove(chat);
  // };

  $scope.changePageToAdd = function(){
    $state.go('tab.addStorageplace');
  }
})

// .controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
//   $scope.chat = Chats.get($stateParams.chatId);
// })

.controller('ReportCtrl', function($scope) {
  $scope.goForward = function () {
       var selected = $ionicTabsDelegate.selectedIndex();
       if (selected != -1) {
           $ionicTabsDelegate.select(selected + 1);
       }
   }

   $scope.goBack = function () {
       var selected = $ionicTabsDelegate.selectedIndex();
       if (selected != -1 && selected != 0) {
           $ionicTabsDelegate.select(selected - 1);
       }
   }
  $scope.settings = {
    enableFriends: true
  }
})

.controller('ManageCtrl', function($scope, $state) {
  $scope.changePage = function(){
    $state.go('tab.overviewInventories');
  }

  $scope.changePageToCat = function(){
    $state.go('tab.overviewCat')
  }

  $scope.changePageTStorage = function(){
    $state.go('tab.stockage')
  }

})

.controller('AddstorageCtrl', function($scope, $state, Storages){

  $scope.storages = Storages;
  $scope.addStorage = function(form, storage){
    if(form.$valid){
      var storageName = storage.storageName
      var storageAddress = storage.address
      var storageCity = storage.city

      var add = $scope.storages.$add({
        "name": storageName
      });

      if(add){
          $state.go('tab.stockage');
      };
    }
  }
})

.controller('OverviewCatCtrl', function($scope, $state, $ionicPopup, Categories){
    $scope.categories = Categories;

  $scope.showConfirm = function(index) {
    // var name = Chats.get(index)
    var confirmPopup = $ionicPopup.confirm({
      title: 'Verwijder item ',
      template: 'Bent u zeker dat u dit item wilt verwijderen?'
    });
    confirmPopup.then(function(res) {
      if(res) {
          Categories.$remove(index);
          // $scope.categories.$remove(index);
        // console.log('You are sure');
      } else {
        console.log('You are not sure');
      }
    });
  };

  $scope.changePageToAdd = function(){
    $state.go('tab.addCat')
  }
})

.controller('addCatCtrl', function($scope, $state, Categories){
  // var catName = $scope.text;
  $scope.categories = Categories;
  $scope.addCategory = function(test, cat) {
    if(test.$valid){
      var catName = cat.catName
      var number = cat.number
      $scope.categories.$add({
        "Category": catName
      });
        $state.go('tab.overviewCat');
    }else{
      test.catName.focus();
    }
  };
})

.controller('overviewInvenCtrl', function($scope, $ionicPopup, Chats){
  $scope.chats = Chats.all();

  $scope.showConfirm = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Verwijder',
      template: 'Bent u zeker dat u dit item wilt verwijderen?'
    });
    confirmPopup.then(function(res) {
      if(res) {
        console.log('You are sure');
      } else {
        console.log('You are not sure');
      }
    });
  };

});
