angular.module('starter.controllers', ['starter.services', 'firebase'])

.controller('HomeCtrl', function($scope, $ionicHistory){
  $scope.myGoBack = function(){
    $ionicHistory.goBack();
  }
})

.controller('InventoryCtrl', function($scope, $ionicTabsDelegate, $state, $ionicPopup, Storages, Categories, Inventory, sharedProperties) {
  $scope.storages = Storages;
  $scope.inventories = Inventory;

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

  // $scope.makeInventory = function(storage){
  //   $scope.showConfirm = function() {
  //     var confirmPopup = $ionicPopup.confirm({
  //       title: 'Bevestiging',
  //       template: 'Wilt u de inventaris aanmaken?'
  //     });
  //     confirmPopup.then(function(res) {
  //       if(res) {
  //         var selectedStorage = storage;
  //         console.log(selectedStorage);
  //         $state.go('tab.category');
  //       } else {
  //         console.log('You are not sure');
  //       }
  //     });
  //   };
  //
  // }
  $scope.makeInventory = function(checked){

    var confirmPopup = $ionicPopup.confirm({
      title: 'Bevestiging',
      template: 'Wilt u een nieuwe inventaris aanmaken?'
    });
    confirmPopup.then(function(res) {
      if(res) {
        var selectedStorage = checked.check;
        $scope.inventories.$add({
        "Date" : Firebase.ServerValue.TIMESTAMP,
       // "Date" : $scope.date.OpenDate.getTime(),
        "Inventory": selectedStorage
      });
        $state.go('tab.category');
      } else {
        console.log('You are not sure');
      }
    });

  }
})

.controller('CategoryCtrl', function($scope, $state, sharedProperties, Categories){
  $scope.categories = Categories;

  $scope.goToInventoryDetail = function($index){
    // $scope.cat = sharedProperties.getProperty();
    // var cat = Categories[$cat].Category;
    // console.log(cat);
    sharedProperties.setProperty($index);
    $state.go('tab.inventoryDetail');
  }

})

.controller('DetailCtrl', function($scope, $ionicPopup, $state, sharedProperties, Categories, Inventory, Product){
  $scope.products = Inventory;
  $scope.products = Product;
  var index = sharedProperties.getProperty();

  $scope.cat = Categories[index].Category;
  var optional = Categories[index].Optional;
  $scope.categories = Categories;
  $scope.size = Categories[index].Size;
  if(optional == true){
    $scope.optional = true;
  }else{
    $scope.optional = false;
  }

  $scope.editInventory = function(form, invent){
    if(form.$valid){
      var full = invent.full;
      if(typeof invent.half != "undefined"){
        var half = invent.half;
      }else{
        var half = null;
      }

      console.log(full);
      console.log(half);

      var now = Firebase.ServerValue.TIMESTAMP;
      var local = new Date().getDate();

      Product.on('child_added', function(snapshot){
        snapshot.ref().child("Products").update({
          'Boxes' : full,
          'Bottles' : half
        });
      });
    }
    else{
      var alertPopup = $ionicPopup.alert({
         title: 'Waarschuwing',
         template: 'Het aantal ingevulde losse flesjes is groter dan de maximum hoeveelheid dat in een bak aanwezig kan zijn.'
       });
       alertPopup.then(function(res) {
         console.log('Thank you for not eating my delicious ice cream cone');
         $state.go('tab.inventoryDetail');
       });
    }
  }
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
      if(typeof cat.number == "undefined"){
        var number = null;
      }
      else{
          var number = cat.number
      }
      if(typeof cat.isChecked != "undefined"){
          var optional = true
      }else{
        var optional = false;
      }

      console.log(number);
      $scope.categories.$add({
        "Category": catName,
        "Size": number,
        "Optional": optional
      });
      $state.go('tab.overviewCat');
    }else{

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
