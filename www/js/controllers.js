angular.module('starter.controllers', ['starter.services', 'firebase', 'ngCordova'])

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
        if($localstorage.get('alerts') == "true"){
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
                  inventoryRef.child(id).set({
                    "Date" : Firebase.ServerValue.TIMESTAMP,
                    "Inventory": selectedStorage
                  });
                  $localstorage.set('dbKey', id);
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
  var sizeBox =  Categories[index].Size;

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

  lineRef.on("value", function(snapshot){
    var oldPost = snapshot.val();
    exCountBoxes = oldPost.TotalBoxes;
    exCountBottles = oldPost.TotalBottles;
  })

  if(typeof exCountBoxes == "undefined"){
    exCountBoxes = 0;
  }

  if(typeof exCountBottles == "undefined"){
    exCountBottles = 0;
  }

  //Initialiseer variabelen om boxes en halve boxes op te tellen
  var exFull;
  var exHalf;
  var boxes;
  var totalBoxesCat;
  var totalBottlesCat;

  check.on("value", function(snapshot) {
    var newPost = snapshot.val();
    $scope.fulls = newPost.full;
    exFull = newPost.full;
    $scope.halfs = newPost.half;
    exHalf = newPost.half;
    $scope.boxes = newPost.boxes;
    boxes = newPost.boxes;
    totalBoxesCat = newPost.totalBoxesCat;
    totalBottlesCat = newPost.totalBottlesCat;
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
    boxes = 0;
  }

  if(typeof totalBoxesCat == "undefined"){
    totalBoxesCat = 0;
  }

  if(typeof totalBottlesCat == "undefined"){
    totalBottlesCat = 0;
  }

  $scope.editInventory = function(form, invent, inventory){
    //form.$valid -> kijken of alles in de form netjes is ingevuld
    if(form.$valid){
      if(typeof invent != "undefined"){
        var full = invent.full;
      }else{
        var full = null;
      }
      console.log("Aantal boxen in het begin " + boxes);

      console.log("Boxes: " + boxes);
      if(typeof boxes == "NaN" || typeof boxes == "undefined"){
        boxes = 0;
      }

      if(typeof inventory != "undefined"){
        var half = inventory.test;
        newBox = 1;
        boxes++;
      }else{
        var half = null;
        newBox = 0;
      }
      console.log("nexbox: " + newBox);
      newFull += full;
      newHalf += half;


      var totalBox = full + newBox;
      var totalBot = full * sizeBox + half;

      exCountBoxes += totalBox;
      exCountBottles += totalBot;
      totalBoxesCat += totalBox;
      totalBottlesCat += totalBot;

      console.log(exCountBoxes);

      lineRef.update({
        "TotalBottles": exCountBottles,
        "TotalBoxes": exCountBoxes
      })

      check.update({
        "half": newHalf,
        "boxes": boxes,
        "totalBoxesCat": totalBoxesCat,
        "totalBottlesCat": totalBottlesCat
      })
      check.update({
        "full": newFull
      })

      // if(typeof boxes == "undefined"){
      //   boxes = 0;
      // }
      window.plugins.toast.showWithOptions(
      {
        message: "Gegevens toegevoegd",
        duration: "short",
        position: "center",
        addPixelsY: -40  // (optional) added a negative value to move it up a bit (default 0)
      });
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
              e.preventDefault();
            } else {
              var result = $scope.data.min;
              var sizeBox =  Categories[index].Size;
              console.log(result);

              if(type == "full"){
                newFull -= result;
                exCountBoxes -= result;
                exCountBottles -= result * sizeBox;
                totalBoxesCat -= result;
                totalBottlesCat -= result * sizeBox;

                lineRef.update({
                  "TotalBoxes": exCountBoxes,
                  "TotalBottles": exCountBottles
                })

                check.update({
                  "full": newFull,
                  "totalBoxesCat": totalBoxesCat,
                  "totalBottlesCat": totalBottlesCat
                })
              }else if(type =="half"){
                newHalf -= result;
                exCountBottles -= result;
                totalBottlesCat -= result;

                lineRef.update({
                  "TotalBottles": exCountBottles
                })
                check.update({
                  "half": newHalf,
                  "boxes": boxes,
                  "totalBottlesCat": totalBottlesCat
                })
              }else if (type == "boxes") {
                boxes -= result;
                exCountBoxes -= result;
                totalBoxesCat -= result;

                console.log("aftellen boxes: " + exCountBoxes);
                lineRef.update({
                  "TotalBoxes": exCountBoxes
                })
                check.update({
                  "half": newHalf,
                  "boxes": boxes,
                  "totalBoxesCat": totalBoxesCat
                })

              }
            }
          }
        }
      ]
    });
  }

  $scope.remove = function(type){
    if(type == "full"){
      check.child("full").remove();

      exCountBoxes -= newFull;
      exCountBottles -= newFull * sizeBox;
      totalBoxesCat -= newFull;
      totalBottlesCat -= newFull * sizeBox;

      lineRef.update({
        "TotalBoxes": exCountBoxes,
        "TotalBottles": exCountBottles
      })

      check.update({
        "totalBoxesCat": totalBoxesCat,
        "totalBottlesCat": totalBottlesCat
      })

      newFull = null;
      $scope.checks = null;
    }else if (type == "half") {

      var newBoxes = 0;
      check.on("value", function(snapshot) {
        var newPost = snapshot.val();
        newBoxes = newPost.boxes;
        half = newPost.half;
      });
      console.log("boxes before: " + totalBoxesCat);
      console.log("bottles before: " + totalBottlesCat);
      console.log("remove bottles: " + half);
      console.log("remove boxes: " + newBoxes);
      exCountBottles -= half;
      exCountBoxes -= newBoxes;
      totalBoxesCat -= newBoxes;
      totalBottlesCat -= half;
      console.log("boxes: " + totalBoxesCat);
      console.log("bottles: " + totalBottlesCat);
      lineRef.update({
        "TotalBottles": exCountBottles,
        "TotalBoxes" : exCountBoxes
      })
      check.update({
        "totalBoxesCat": totalBoxesCat,
        "totalBottlesCat": totalBottlesCat
      })
      check.child("half").remove();
      check.child("boxes").remove();
      newHalf = null;
      boxes = null;
      $scope.halfs = null;
      $scope.boxes = null;
    }else if (type == "boxes") {
      // var newBoxes = 0;
      // check.on("value", function(snapshot) {
      //   var newPost = snapshot.val();
      //   newBoxes = newPost.boxes;
      //   exCountBoxes -= newBoxes;
      //   productsRef.update({
      //     "TotalBoxes": exCountBoxes
      //   })
      // })
      // console.log(exCountBoxes);
      // check.child("boxes").remove();
      // console.log(newBoxes);
      // boxes = null;
      // $scope.boxes = null;
    }
  }
})

//Controller voor de report tab
.controller('ReportCtrl', function($scope, $state, $cordovaFile, $cordovaEmailComposer, $filter, $ionicPlatform ) {
  var referentie;
  var objArray;
  var ref1 = new Firebase("https://testdb-1.firebaseio.com/Inventories");
  ref1.on("value", function(snapshot){
    $scope.inventories = snapshot.val();
    referentie = snapshot.val();
    dataObject = snapshot;
    dataJson = dataObject.val();
  })

  objArray = $filter('json')(referentie, 1);

  $scope.excel = function() {
    var inventories = $scope.inventories;
    var array;
    var CSV = "ID,Datum,Opslagplaats,Totaal Flessen,Totaal boxes,Categorie,Totaal flessen Cat,Totaal boxes Cat,Volle bakken,Losse flessen,boxes  \r\n";
    var head = "";
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    angular.forEach(inventories, function(value, key){
      var key = key;
      var date = $filter('date')(value.Date, "dd-MM-yyyy");
      var inventory = value.Inventory;
      var totalBot = value.TotalBottles;
      var totalBox = value.TotalBoxes;
      head = key + "," + date + "," + inventory + "," + totalBot + "," + totalBox + ",";
      angular.forEach(value.Products, function(value, key){
        var productKey = key;
        var productBox = value.boxes;
        var productFull = value.full;
        var productHalf = value.half;
        var totalBotCat = value.totalBottlesCat;
        var totalBoxCat = value.totalBoxesCat;
        CSV += head + productKey  + "," + totalBotCat + "," + totalBoxCat + "," + productFull + "," + productHalf + "," + productBox + '\r\n';
      })
    })

    $ionicPlatform.ready(function() {
      $cordovaFile.checkDir("file:///storage/sdcard0/inventories")
      .then(function (result) {
      }, function (err) {
        $cordovaFile.createDir("file:///storage/sdcard0/", "inventories", false)
        .then(function (success) {
          // success
        }, function (error) {
          // error
        });

      });

      $cordovaFile.createFile("file:///storage/sdcard0/inventories/inventory.csv", true).then( function(fileEntry) {
      });
      $cordovaFile.writeFile("file:///storage/sdcard0/inventories", 'inventory.csv', CSV, true).then( function(success) {

      }), function(error){
        alert(JSON.stringify(error))
      };
    });

    $ionicPlatform.ready(function() {
      $cordovaEmailComposer.isAvailable().then(function() {
        // is available
        alert("available");
      }, function () {
        // not available
        alert("not available");
      });
        var email = {
          to: '',
          attachments: [
            'file:///storage/sdcard0/inventories/inventory.csv'
          ],
          subject: 'Inventaris',
          body:'',
          isHtml: true
        };

        $cordovaEmailComposer.open(email).then(null, function () {
          // user cancelled email
        });
      });
    // $state.go('tab.email');
  };

  $scope.changePagetoSearchCat = function(){
    $state.go('tab.searchProducts');
  }

  $scope.changePagetoSearchInStorage = function(){
    $state.go('tab.searchInStorages');
  }
})

.controller('EmailCtrl', function($scope, $cordovaEmailComposer, $ionicPlatform){
  $scope.send = function(emailReceiver){
    $ionicPlatform.ready(function() {
      $cordovaEmailComposer.isAvailable().then(function() {
        // is available
        alert("available");
      }, function () {
        // not available
        alert("not available");
      });
        var email = {
          to: emailReceiver,
          attachments: [
            'file:///storage/sdcard0/inventories/inventory.csv'
          ],
          subject: 'Mail subject',
          body: 'How are you? Nice greetings from Leipzig',
          isHtml: true
        };

        $cordovaEmailComposer.open(email).then(null, function () {
          // user cancelled email
        });
      });
  }
})

.controller('ExcelCtrl', function($scope){
  var ref1 = new Firebase("https://testdb-1.firebaseio.com/Inventories");
  ref1.on("value", function(snapshot){
    $scope.inventories = snapshot.val();
  })

  $scope.exportData = function () {
    var blob = new Blob([document.getElementById('exportable').innerHTML], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
    });
    // saveAs(blob, 'Report.xls')
  }
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

      for (var y = arrInv.length - 1; y >= 0; y--) {
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

.controller('searchinStoragesCtrl', function($scope, $filter, Storages, Inventory){
  $scope.storages = Storages;
  $scope.inventories = Inventory.Date;
  var inventoryDate = Inventory;
  var date;
  var ref = new Firebase('https://testdb-1.firebaseio.com/Inventories');
  ref.on("value", function(snapshot){
    values = snapshot.val();
  })

  var dateArr = [];
  angular.forEach(values, function(value, key){
    var date = $filter('date')(value.Date, 'MM-dd-yyyy');
    var item = {
      date: date,
      status: 'full'
    };
    dateArr.push(item);
  })
  // for(i=0; i< values.length; i++){
  //
  // }

  $scope.getDayClass = function(date, mode) {
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i=0;i<dateArr.length;i++){
        var currentDay = new Date(dateArr[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return dateArr[i].status;
        }
      }
    }

    return '';
  };

  //Kalender functie
  // $scope.today = function() {
  //     $scope.dt = new Date();
  // };
  // $scope.today();
  $scope.getDate = function(date){
    var date = date.dt;
    var dt = $filter('date')(date, "dd-MM-yyyy");
    var ref = new Firebase("https://testdb-1.firebaseio.com/Inventories");
    // var invenRef = ref.child('Inventories');

    var arrData = [];
    var myStore = [];
    var myTestDate = [];

    ref.on("child_added", function(snapshot){
      var data = snapshot.val();
      var convertDate = $filter('date')(data.Date, 'dd-MM-yyyy');
      var myDate = [convertDate];

      for (var j = 0; j < myDate.length; j++) {
        if (myDate[j] == dt) {

          var store = data.Inventory;

          myStore.push(store);
          $scope.plaatsen = myStore;

          arrData.push(data);
          $scope.details = arrData;
        }
      }
    })
    console.log($scope.plaatsen);
    console.log($scope.details);
  }

  $scope.open = function($event) {
    $scope.status.opened = true;
  };

  $scope.formats = ['dd-MM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];

  $scope.status = {
    opened: false
  };

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
.controller('ManageCtrl', function($scope, $state, $localstorage) {
  $scope.changePage = function(){
    $state.go('tab.overviewInventories');
  }

  $scope.changePageToCat = function(){
    $state.go('tab.overviewCat')
  }

  $scope.changePageTStorage = function(){
    $state.go('tab.stockage')
  }

  var check = $localstorage.get('alerts');
  if($localstorage.get('alerts') == "true"){
      $scope.isChecked = {checked: true};
  }else{
    $scope.isChecked = {checked: false};
  }
  $scope.changeSettings = function(checked){
    $localstorage.set('alerts', checked.checked);
    console.log($localstorage.get('alerts'));
  }

})

//Controller voor het tonen van alle opslagplaatsen in de tab manage
.controller('StockageCtrl', function($scope, $ionicPopup, $state, $localstorage, Storages) {
  $scope.storages = Storages;

  $scope.showConfirm = function(index) {
    if($localstorage.get('alerts') == "true"){
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
    }else{
      Storages.$remove(index);
    }
  };

  $scope.edit = function(id){
    $localstorage.set('stockageId', id);
    $state.go('tab.editStorageplace');
  }

  $scope.changePageToAdd = function(){
    $state.go('tab.addStorageplace');
  }
})

.controller('EditstorageCtrl', function($scope, $state, $localstorage, $ionicListDelegate, Storages){
  var storages = Storages[$localstorage.get('stockageId')];
  var id = storages.$id;
  if(storages.address == "null"){
    var address = "";
  }else{
    var address = storages.address;
  }
  if(storages.city == "null"){
    var city = "";
  }else{
    var city = storages.city;
  }
  $scope.storage = {storageName: storages.name, address: address, city: city};
  $scope.editStorage = function(form, storage){
    if(form.$valid){
      var storageName = storage.storageName;
      if(typeof storage.address != "undefined"){
          var address = storage.address;
      }else{
        var address = "null";
      }
      if(typeof storage.city != "undefined"){
          var city = storage.city;
      }else{
        var city = "null";
      }

      var ref = new Firebase('https://testdb-1.firebaseio.com/Storages');
      ref.child(id).set({
        "name": storageName,
        "address": address,
        "city": city
      });

      $state.go('tab.stockage');
    }
  };
})

//Controller voor het toevoegen van opslagplaatsen
.controller('AddstorageCtrl', function($scope, $state, Storages){
  $scope.storages = Storages;

  $scope.addStorage = function(form, storage){
    if(form.$valid){
      if(typeof storage.storageName != "undefined"){
          var storageName = storage.storageName;
      }else{
        var storageName = "null";
      }
      if(typeof storage.address != "undefined"){
          var address = storage.address;
      }else{
        var address = "null";
      }
      if(typeof storage.city != "undefined"){
          var city = storage.city;
      }else{
        var city = "null";
      }


      //Toevoegen in de database
      var add = $scope.storages.$add({
        "name": storageName,
        "address": address,
        "city": city
      });

      //Als het goed is opgeslagen in de database, verder gaan naar de volgende pagina
      if(add){
          $state.go('tab.stockage');
      };
    }
  }
})

.controller('editCatCtrl', function($scope, $localstorage, $state, Categories){
  var categories = Categories[$localstorage.get('editCat')];
  var id = categories.$id;
  if(categories.Size == "null"){
    var size = "";
  }else{
    var size = categories.Size;
  }
  $scope.cat = {catName: categories.Category, number: size, isChecked: categories.Optional};
  $scope.editCat = function(form, cat){
    if(form.$valid){
      if(typeof cat.catName != "undefined"){
          var catName = cat.catName;
      }else{
        var catName = "null";
      }
      if(typeof cat.number != "undefined"){
          var number = cat.number;
      }else{
        var number = "null";
      }
      if(typeof cat.isChecked != "undefined"){
          var optional = cat.isChecked;
      }else{
        var optional = cat.isChecked;
      }
      console.log(optional);
      var ref = new Firebase('https://testdb-1.firebaseio.com/Categorie')
      // var catRef = ref.child(id);
      ref.child(id).set({
        Category: catName,
        Size: number,
        Optional: optional
      });
      $state.go('tab.overviewCat');
    }
  };
})

//Controller voor het overzicht van alle categorieën in manage tab
.controller('OverviewCatCtrl', function($scope, $state, $ionicPopup, $localstorage, Categories){
    $scope.categories = Categories;

  $scope.showConfirm = function(index) {
    if($localstorage.get('alerts') == "true"){
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
    }else{
      Categories.$remove(index);
    }
  };

  $scope.edit = function(id){
    $localstorage.set('editCat', id);
    $state.go('tab.editCat');
  }

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
.controller('overviewInvenCtrl', function($scope, $ionicPopup, $localstorage, Inventory){
  $scope.inventories = Inventory;

  $scope.showConfirm = function($index) {
    if($localstorage.get('alerts') == "true"){
      var confirmPopup = $ionicPopup.confirm({
        title: 'Verwijder',
        template: 'Bent u zeker dat u dit item wilt verwijderen?'
      });
      confirmPopup.then(function(res) {
        if(res) {
          //Verwijderen van uit de database
        } else {
          Inventory.$remove($index);
          console.log('You are not sure');
        }
      });
    }else{
      Inventory.$remove($index);
    }
  };
});
