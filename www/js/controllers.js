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
        var show = $localstorage.get('alerts')
        if(show){
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
          }else{
            inventoryRef.child(id).set({
              "Date" : Firebase.ServerValue.TIMESTAMP,
              "Inventory": selectedStorage
            });
            //locaal opslaan van de inventarisID, zodat we deze in andere controllers ook kunnen gebruiken
            $localstorage.set('dbKey', id);

            //Ga naar andere pagina
            $state.go('tab.category');
          }
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
                  $state.go('tab.category');
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
  var totalBoxenRef = productsRef.child('TotalBoxes');
  var totalBottlesRef = productsRef.child('TotalBottles');

  var exCountBoxes = 0;
  var exCountBottles = 0;

  productsRef.on("value", function(snapshot){
    var oldPost = snapshot.val();

    exCountBoxes = oldPost.TotalBoxes;
    exCountBottles = oldPost.TotalBottles;
  })

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
    boxes = 1;
  }

  $scope.editInventory = function(form, invent, inventory){
    //form.$valid -> kijken of alles in de form netjes is ingevuld
    if(form.$valid){
      if(typeof invent != "undefined"){
        var full = invent.full;
      }else{
        var full = null;
      }

      console.log(inventory);
      if(typeof inventory != "undefined"){
        var half = inventory.test;

        boxes++;
      }else{
        var half = null;
      }

      newFull += full;
      newHalf += half;

      var sizeBox =  Categories[index].Size;
      var totalBox = full + boxes;
      var totalBot = full * sizeBox + half;

      exCountBoxes += totalBox;
      exCountBottles += totalBot;

      productsRef.update({
        "TotalBoxes": exCountBoxes ,
        "TotalBottles": exCountBottles
      })
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
    this.invent = undefined;
    this.test = undefined;
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
              var sizeBox =  Categories[index].Size;

              if(type == "full"){
                newFull -= result;
                exCountBoxes -= result;
                exCountBottles -= result * sizeBox;

                productsRef.update({
                  "TotalBoxes": exCountBoxes,
                  "TotalBottles": exCountBottles
                })

                check.update({
                  "full": newFull
                })
              }else if(type =="half"){
                newHalf -= result;
                exCountBottles -= result;

                productsRef.update({
                  "TotalBottles": exCountBottles
                })
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
  var ref1 = new Firebase("https://testdb-1.firebaseio.com/Inventories");
  ref1.on("value", function(snapshot){
    $scope.inventories = snapshot.val();
    console.log($scope.inventories);
  })

  $scope.excel = function () {
    var blob = new Blob([document.getElementById('exportable').innerHTML], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
    });
    saveAs(blob, 'Report.xls')
  };
  // $scope.excel = function(){
  //   $state.go('tab.excel');
  // }

  $scope.changePagetoSearchCat = function(){
    $state.go('tab.searchProducts');
  }

  $scope.changePagetoSearchInStorage = function(){
    $state.go('tab.searchInStorages');
  }
})

.controller('ExcelCtrl', function($scope){
  $scope.$on('$ionicView.beforeEnter', function(){
    screen.lockOrientation('landscape');
  });
  var ref1 = new Firebase("https://testdb-1.firebaseio.com/Inventories");
  ref1.on("value", function(snapshot){
    $scope.inventories = snapshot.val();
    console.log($scope.inventories);
  })

  $scope.exportData = function () {
    var blob = new Blob([document.getElementById('exportable').innerHTML], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
    });
    saveAs(blob, 'Report.xls')
  };
})

.controller('searchProductsCtrl', function($scope, $firebaseObject, $filter, Categories, Inventory){
  $scope.categories = Categories;

  $scope.searchInventory = function(data){
    var word = data.singleSelect;

    var ref = new Firebase('https://testdb-1.firebaseio.com/');
    var testRef = new Firebase('https://testdb-1.firebaseio.com/Inventories/')
    var invenRef = ref.child('Inventories');
    var prodRef = invenRef.child('Products');

    var arrInv = [];
    var arrDate = [];

    invenRef.on("child_added", function(snapshot){
      var data = snapshot.val();
      var store = data.Inventory;
      var prod = data.Products;

      var newArr = [];
      var test = Object.keys(prod);

      for( var i = 0; i < test.length; i++){
        if (test[i] == word) {
         var convertDate = $filter('date')(data.Date, 'dd-MM-yyyy');
         arrDate.push(convertDate);
         arrInv.push(data.Inventory);
        };
      };

      for (var y = arrInv.length - 1; y > 0; y--) {
        var found = undefined;
        for (var z = 0; z < newArr.length; z++) { //
          if (arrInv[y] === newArr[z]) {
            found = true;
            break;
          };
        };
        if (!found) {
        newArr.push(arrInv[y]);
        }
      };

      $scope.show = newArr;
    });
 };

 $scope.groups = [];
  for (var i=0; i<10; i++) {
    $scope.groups[i] = {
      name: i,
      items: []
    };
    for (var j=0; j<3; j++) {
      $scope.groups[i].items.push(i + '-' + j);
    }
  }

 $scope.toggleGroup = function(group) {
   if ($scope.isGroupShown(group)) {
     $scope.shownGroup = null;
   } else {
     $scope.shownGroup = group;
   }
 };
 $scope.isGroupShown = function(group) {
   return $scope.shownGroup === group;
 };


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

  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };
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

  $scope.changePageToSettings = function(){
    $state.go('tab.settings')
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
})

.controller('settingsCtrl', function($scope, $localstorage){
  $scope.myVar = $localstorage.get('alerts');
  $scope.changeSettings = function(alerts){
    $localstorage.set('alerts', alerts.check);
    console.log($localstorage.get('alerts'));
  }
});
