angular.module('starter.controllers', ['starter.services', 'firebase'])

.controller('HomeCtrl', function($scope, $ionicHistory){
  //Go back functie
  $scope.myGoBack = function(){
    $ionicHistory.goBack();
  }
})

//Controller van de pagina waar je inventarissen toevoegt
.controller('InventoryCtrl', function($scope, $ionicTabsDelegate, $state, $ionicPopup, $filter, $localstorage, Storages, Categories, Inventory, sharedProperties) {
  $scope.storages = Storages;
  $scope.inventories = Inventory;

  //Kalender functie
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

  var date = $scope.dt;
  var dt = $filter('date')(date, "dd-MM-yyyy");

  //Functie om inventaris aan te maken in firebase
  $scope.makeInventory = function(checked){
    var selectedStorage = checked.check;
    var id = dt+selectedStorage;

    //Effectief toevoegen
    var ref = new Firebase("https://testdb-1.firebaseio.com/");
    var inventoryRef = ref.child("Inventories");
    inventoryRef.once("value", function(snapshot){
      if (!snapshot.hasChild(id)){
        var confirmPopup = $ionicPopup.confirm({
           title: 'Bevestiging',
           template: 'Wilt u een nieuwe inventaris aanmaken?'
         });
         confirmPopup.then(function(res) {
           if(res) {
              inventoryRef.child(id).set({
                "Date" : Firebase.ServerValue.TIMESTAMP,
                "Inventory": selectedStorage
              });
              //locaal opslaan van de inventarisID, zodat we deze in andere controllers ook kunnen gebruiken
              $localstorage.set('dbKey', id);

              //Ga naar andere pagina
              $state.go('tab.category');
            }
          })
        }
        else{
          // An elaborate, custom popup
          var alertPopup = $ionicPopup.show({
            // template: '<input type="password" ng-model="data.wifi">',
            title: 'Opgelet!',
            subTitle: 'U hebt vandaag al een inventaris toegevoegd, wilt u deze aanpassen of verwijderen?',
            scope: $scope,
            buttons: [
              { text: 'Verwijderen',
                onTap: function(e){
                  var lineRef = inventoryRef.child(id);
                  lineRef.remove();
                }
              },
              {
                text: 'Aanpassen',
                // type: 'button-positive',
                onTap: function(e) {
                  //Ga naar andere pagina
                  $state.go('tab.category');
                }
              }
            ]
          });
         };
      })
    }
})

//Controller voor het overzicht van categorieën bij inventaris toevoegen
.controller('CategoryCtrl', function($scope, $state, $localstorage, Categories){
  $scope.categories = Categories;

  $scope.goToInventoryDetail = function($index){
    //De index van de gekozen categorie lokaal opslaan
    $localstorage.set('catIndex', $index);
    $state.go('tab.inventoryDetail');
  }
})

//Controller voor het toevoegen van boxes en cases bij inventaris
.controller('DetailCtrl', function($scope, $ionicPopup, $state, $localstorage, $ionicModal, $window, $ionicHistory, Categories, Inventory, Product){
  $scope.products = Inventory;
  $scope.products = Product;

  //Verkrijgen van items opgeslagen in localstorage
  var index = $localstorage.get('catIndex');
  var id = $localstorage.get('dbKey');

  //Opvragen van categorie properties
  var category = Categories[index].Category;
  $scope.cat = Categories[index].Category;
  var optional = Categories[index].Optional;
  $scope.categories = Categories;
  $scope.size = Categories[index].Size;

  //aantal flessen zichtbaar maken of niet
  if(optional == true){
    $scope.optional = true;
  }else{
    $scope.optional = false;
  }

  //Toevoegen van producten aan inventaris
  //Eerst gaan we navigeren naar de juiste child directory
  var ref = new Firebase("https://testdb-1.firebaseio.com/");
  var inventoryRef = ref.child("Inventories");
  var lineRef = inventoryRef.child(id);
  var productsRef = lineRef.child('Products');
  var check = productsRef.child(category);
  // var full = check.child("Full");
  // var half = check.child("Half");
  // pathFull = full.toString();
  // pathHalf = half.toString();
  //Initialiseer variabelen om boxes en halve boxes op te tellen
  var exFull;
  var exHalf;
  var boxes;

  check.on("value", function(snapshot) {
    var newPost = snapshot.val();
    $scope.fulls = newPost.full;
    exFull = newPost.full;
    $scope.halfs = newPost.half;
    exHalf = newPost.half;
    $scope.boxes = newPost.boxes;
    boxes = newPost.boxes;
  })

  // Kijken of er al iets in de database zit
  // check.on("value", function(snapshot){
  //   exFull = snapshot.val();
  // })
  // check.on("value", function(snapshot){
  //   exHalf = snapshot.val();
  // })

  if(exFull != null){
    var newFull=exFull;
  }else{
    newFull = null;
  };

  if(exHalf != null){
    var newHalf=exHalf;
  }else{
    newHalf = null;
  }

  if(boxes == null){
    boxes = 0;
  }

  $scope.editInventory = function(form, invent, inventory){
    //form.$valid -> kijken of alles in de form netjes is ingevuld
    if(form.$valid){
      if(typeof invent != "undefined"){
        var full = invent.full;
      }else{
        var full = null;
      }

      if(typeof inventory.half != "undefined"){
        var half = inventory.half;
        boxes++;
      }else{
        var half = null;
      }

      newFull += full;
      newHalf += half;

      check.update({
        "full": newFull
      })

      if(typeof boxes == "undefined"){
        boxes = 0;
      }

      check.update({
        "half": newHalf,
        "boxes": boxes
      })
    }
    else{
      var alertPopup = $ionicPopup.alert({
         title: 'Waarschuwing',
         template: 'Het aantal ingevulde losse flesjes is groter dan de maximum hoeveelheid dat in een bak aanwezig kan zijn.'
       });
       alertPopup.then(function(res) {
         $state.go('tab.inventoryDetail');
       });
    }
  }

  $scope.showEdit = function(type){
    $scope.data = {}

    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: '<input type="number" ng-model="data.min">',
      title: 'Verwijderen',
      subTitle: 'Geef het aantal in dat u wilt verwijderen.',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Save</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.data.min) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              var result = $scope.data.min;
              if(type == "full"){
                newFull -= result;
                check.update({
                  "full": newFull
                })
              }else if(type =="half"){
                newHalf -= result;
                check.update({
                  "half": newHalf,
                  "boxes": boxes
                })
              }else if (type == "boxes") {
                boxes -= result;
                check.update({
                  "half": newHalf,
                  "boxes": boxes
                })
              }
            }
          }
        }
      ]
    });
  }
    // myPopup.then(function(res) {
    //   console.log('Tapped!', res);
    // });
  $scope.remove = function(type){
    if(type == "full"){
      check.child("full").remove();
      newFull = null;
      $scope.checks = null;
    }else if (type == "half") {
      check.child("half").remove();
      newHalf = null;
      $scope.halfs = null;
    }else if (type == "boxes") {
      check.child("boxes").remove();
      boxes = null;
      $scope.boxes = null;
    }
  }
})

//Controller voor het tonen van alle opslagplaatsen in de tab manage
.controller('StockageCtrl', function($scope, $ionicPopup, $state, Storages) {
  $scope.storages = Storages;

  $scope.showConfirm = function(index) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Verwijder',
      template: 'Bent u zeker dat u dit item wilt verwijderen?'
    });
    confirmPopup.then(function(res) {
      if(res) {
        //Verwijderen van opslagplaats
        Storages.$remove(index);
      } else {
        console.log('You are not sure');
      }
    });
  };

  $scope.changePageToAdd = function(){
    $state.go('tab.addStorageplace');
  }
})

//Controller voor de report tab
.controller('ReportCtrl', function($scope, $state) {
  $scope.changePagetoSearchCat = function(){
    $state.go('tab.searchProducts');
  }

  $scope.changePagetoSearchInStorage = function(){
    $state.go('tab.searchInStorages');
  }
})

.controller('searchProductsCtrl', function($scope, Categories){
  $scope.categories = Categories;
})

.controller('searchinStoragesCtrl', function($scope, $filter, Storages){
  $scope.storages = Storages;

  //Kalender functie
  $scope.today = function() {
      $scope.dt = new Date();
    };
    $scope.today();

  $scope.open = function($event) {
    $scope.status.opened = true;
  };

  $scope.formats = ['dd-MM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];

  $scope.status = {
    opened: false
  };

  var date = $scope.dt;
  var dt = $filter('date')(date, "dd-MM-yyyy");
})

//Controller voor de manage tab
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

//Controller voor het toevoegen van opslagplaatsen
.controller('AddstorageCtrl', function($scope, $state, Storages){
  $scope.storages = Storages;

  $scope.addStorage = function(form, storage){
    if(form.$valid){
      var storageName = storage.storageName
      var storageAddress = storage.address
      var storageCity = storage.city

      //Toevoegen in de database
      var add = $scope.storages.$add({
        "name": storageName
      });

      //Als het goed is opgeslagen in de database, verder gaan naar de volgende pagina
      if(add){
          $state.go('tab.stockage');
      };
    }
  }
})

//Controller voor het overzicht van alle categorieën in manage tab
.controller('OverviewCatCtrl', function($scope, $state, $ionicPopup, Categories){
    $scope.categories = Categories;

  $scope.showConfirm = function(index) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Verwijder item ',
      template: 'Bent u zeker dat u dit item wilt verwijderen?'
    });
    confirmPopup.then(function(res) {
      if(res) {
          Categories.$remove(index);
      } else {
        console.log('You are not sure');
      }
    });
  };

  $scope.changePageToAdd = function(){
    $state.go('tab.addCat')
  }
})

//Controller voor het toevoegen van categorieën
.controller('addCatCtrl', function($scope, $state, Categories){
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

      //Effectief toevoegen in de database
      $scope.categories.$add({
        "Category": catName,
        "Size": number,
        "Optional": optional
      });
      $state.go('tab.overviewCat');
    }else{
      //Kan eventueel nog een alertmessage verschijnen als het niet in orde is.

    }
  };
})

//Controller voor overzicht van inventarissen in manage tab
.controller('overviewInvenCtrl', function($scope, $ionicPopup, Inventory){
  $scope.inventories = Inventory;

  $scope.showConfirm = function($index) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Verwijder',
      template: 'Bent u zeker dat u dit item wilt verwijderen?'
    });
    confirmPopup.then(function(res) {
      if(res) {
        //Verwijderen van uit de database
        Inventory.$remove($index);
      } else {
        console.log('You are not sure');
      }
    });
  };

});
