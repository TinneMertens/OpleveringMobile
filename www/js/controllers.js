angular.module('starter.controllers', [])

.controller('HomeCtrl', function($scope, $ionicHistory){
  $scope.myGoBack = function(){
    $ionicHistory.goBack();
  }
})

.controller('InventoryCtrl', function($scope, $ionicTabsDelegate) {
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
})

.controller('StockageCtrl', function($scope, $ionicPopup, $state, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();

  $scope.showConfirm = function(index) {
    var name = Chats.get(index)
    var confirmPopup = $ionicPopup.confirm({
      title: 'Verwijder ' + name.name,
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

  $scope.remove = function(chat) {
    Chats.remove(chat);
  };

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

.controller('AddstorageCtrl', function($scope, Chats){

  $scope.addStorage = function(form, storage){
    if(form.$valid){
      var storageName = storage.storageName
      var storageAddress = storage.address
      var storageCity = storage.city
      console.log(storageName, storageAddress, storageCity)
    }
  }
})

.controller('OverviewCatCtrl', function($scope, $state, $ionicPopup, Chats){
  $scope.chats = Chats.all();

  $scope.showConfirm = function(index) {
    var name = Chats.get(index)
    var confirmPopup = $ionicPopup.confirm({
      title: 'Verwijder item ' + name.name,
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

  $scope.changePageToAdd = function(){
    $state.go('tab.addCat')
  }
})

.controller('addCatCtrl', function($scope, $state){
  // var catName = $scope.text;

  $scope.addCategory = function(test, cat) {
    if(test.$valid){
      var catName = cat.catName
      var number = cat.number
      console.log(catName, number);
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
