angular.module('starter.controllers', ['starter.services', 'firebase', 'ngCordova'])

.controller('HomeCtrl', function($scope, $ionicHistory, $state){
  //Go back functie
  $scope.myGoBack = function(){
    $ionicHistory.goBack();
  }

  // Beheer rechtsbovenaan
  $scope.goToSettings = function(){
    $state.go('overview');
  }
})

//Controller van de pagina waar je inventarissen toevoegt
.controller('InventoryCtrl', function($scope, $ionicTabsDelegate, $state, $ionicPopup, $filter, $localstorage, $ionicModal, Storages, Categories, Inventory, sharedProperties) {

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
                //lokaal opslaan van de inventarisID, zodat we deze in andere controllers ook kunnen gebruiken
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
            //lokaal opslaan van de inventarisID, zodat we deze in andere controllers ook kunnen gebruiken
            $localstorage.set('dbKey', id);

            //Ga naar andere pagina
            $state.go('tab.category');
          }
        }
        else{
          // Custom popup
          var alertPopup = $ionicPopup.show({
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

  //Opvragen van categorie properties
  var sizeBox =  Categories[index].Size;
  var category = Categories[index].Category;
  $scope.cat = Categories[index].Category;
  var optional = Categories[index].Optional;
  $scope.categories = Categories;
  $scope.size = Categories[index].Size;

  if(typeof sizeBox == "undefined"){
    sizeBox = 1;
  }

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

  // Initialiseren van counters voor totaal boxes en bottles (algemeen niveau)
  var exCountBoxes = 0;
  var exCountBottles = 0;

  lineRef.on("value", function(snapshot){
    var oldPost = snapshot.val();
    exCountBoxes = oldPost.TotalBoxes;
    exCountBottles = oldPost.TotalBottles;
  })

  // Kijken of de variabelen niet undefined zijn, anders krijgen we problemen bij de berekeningen onderaan
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

  // Kijken of de variabelen niet undefined zijn, anders krijgen we problemen bij de berekeningen onderaan
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

  // Effectief toevoegen aan een inventory
  $scope.editInventory = function(form, invent, inventory){
    //form.$valid -> kijken of alles in de form netjes is ingevuld
    if(form.$valid){
      if(typeof invent != "undefined"){
        var test = invent.full + '';
        var array = test.split(".");
        var full = Math.abs(parseInt(array[0]));
      }else{
        var full = null;
      }

      if(typeof boxes == "NaN" || typeof boxes == "undefined"){
        boxes = 0;
      }

      if(typeof inventory != "undefined"){
        var testHalf = inventory.test + '';
        var arrayHalf = testHalf.split(".");
        var half = Math.abs(parseInt(arrayHalf[0]));
        newBox = 1;
        boxes++;
      }else{
        var half = null;
        newBox = 0;
      }

      // Berekenen van nieuwe waarden van volle en halve bakken
      newFull += full;
      newHalf += half;

      console.log()
      // Berekenen van nieuwe waarden voor algemeen totaal boxes en bottles
      var totalBox = full + newBox;
      var totalBot = full * sizeBox + half;
      exCountBoxes += totalBox;
      exCountBottles += totalBot;

      // Berekenen van nieuwe waarden voor totaal boxes en bottles op cateogie niveau
      totalBoxesCat += totalBox;
      totalBottlesCat += totalBot;

      // Effectief toevoegen van nieuwe waarden in de DB
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

      // Soort van toast message om bevestiging te geven of de flessen effectief zijn toegevoegd in de DB
      window.plugins.toast.showWithOptions(
      {
        message: "Gegevens toegevoegd",
        duration: "short",
        position: "center",
        addPixelsY: -40  // (optional) added a negative value to move it up a bit (default 0)
      });
    }
    else{
      // Alertmessage wanneer de hoeveelheid flesjes groter is dan de maximum hoeveelheid dat in een bak kan zitten.
      var alertPopup = $ionicPopup.alert({
         title: 'Waarschuwing',
         template: 'Het aantal ingevulde losse flesjes is groter dan de maximum hoeveelheid dat in een bak aanwezig kan zijn.'
       });
       alertPopup.then(function(res) {
         $state.go('tab.inventoryDetail');
       });
    }

    // Leegmaken van tekstvelden in html
    this.invent = undefined;
    this.test = undefined;
    inventory = undefined;
  }

  // Functie om een aantal reeds toegevoegde flesjes terug te verwijderen
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
          text: '<b>Aanpassen</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.data.min) {
              e.preventDefault();
            } else {
              var testResult = $scope.data.min + '';
              var arrayResult = testResult.split(".");
              var result = Math.abs(parseInt(arrayResult[0]));
              var sizeBox =  Categories[index].Size;
              console.log(result);


              // Volle bakken verwijderen
              if(type == "full"){
                if(result > newFull){
                  window.plugins.toast.showWithOptions(
                  {
                    message: "Opgepast, gelieve een waarde in te geven die kleiner is.",
                    duration: "short",
                    position: "center",
                    addPixelsY: -40  // (optional) added a negative value to move it up a bit (default 0)
                  });
                }else{
                  newFull -= result;
                  exCountBoxes -= result;
                  exCountBottles -= result * sizeBox;
                  totalBoxesCat -= result;
                  totalBottlesCat -= result * sizeBox;

                  // Effectief aanpassen
                  lineRef.update({
                    "TotalBoxes": exCountBoxes,
                    "TotalBottles": exCountBottles
                  })

                  check.update({
                    "full": newFull,
                    "totalBoxesCat": totalBoxesCat,
                    "totalBottlesCat": totalBottlesCat
                  })
                }
                // Halve bakken/losse flessen verwijderen
              }else if(type =="half"){
                if(result > newHalf){
                  window.plugins.toast.showWithOptions(
                  {
                    message: "Opgepast, gelieve een waarde in te geven die kleiner is.",
                    duration: "short",
                    position: "center",
                    addPixelsY: -40  // (optional) added a negative value to move it up a bit (default 0)
                  });
                }else{
                  newHalf -= result;
                  exCountBottles -= result;
                  totalBottlesCat -= result;

                  // Effectief aanpassen in de DB
                  lineRef.update({
                    "TotalBottles": exCountBottles
                  })
                  check.update({
                    "half": newHalf,
                    "boxes": boxes,
                    "totalBottlesCat": totalBottlesCat
                  })
                }

                // Boxes verwijderen
              }else if (type == "boxes") {
                if(result > boxes){
                  window.plugins.toast.showWithOptions(
                  {
                    message: "Opgepast, gelieve een waarde in te geven die kleiner is.",
                    duration: "short",
                    position: "center",
                    addPixelsY: -40  // (optional) added a negative value to move it up a bit (default 0)
                  });
                }else{
                  boxes -= result;
                  exCountBoxes -= result;
                  totalBoxesCat -= result;

                  // Effectief aanpassen in de DB
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
        }
      ]
    });
  }

  // Functie om volle bakken en halve bakken volledig te verwijderen
  $scope.remove = function(type){
    if(type == "full"){
      // Herberekenen van algemene totalen
      exCountBoxes -= newFull;
      exCountBottles -= newFull * sizeBox;
      totalBoxesCat -= newFull;
      totalBottlesCat -= newFull * sizeBox;


      // Alegemene totalen aanpassen in de DB
      lineRef.update({
        "TotalBoxes": exCountBoxes,
        "TotalBottles": exCountBottles
      })

      check.update({
        "full": 0,
        "totalBoxesCat": totalBoxesCat,
        "totalBottlesCat": totalBottlesCat
      })

      // Waarden op 0 zetten in html
      newFull = null;
      $scope.checks = null;
      // Halve bakken verwijderen
    }else if (type == "half") {
      var newBoxes = 0;
      // Huidige waarden opvragen in de DB
      check.on("value", function(snapshot) {
        var newPost = snapshot.val();
        newBoxes = newPost.boxes;
        half = newPost.half;
      });

      // Algemene totalen opnieuw berekenen
      exCountBottles -= half;
      exCountBoxes -= newBoxes;
      totalBoxesCat -= newBoxes;
      totalBottlesCat -= half;

      lineRef.update({
        "TotalBottles": exCountBottles,
        "TotalBoxes" : exCountBoxes
      })
      check.update({
        "half": 0,
        "boxes": 0,
        "totalBoxesCat": totalBoxesCat,
        "totalBottlesCat": totalBottlesCat
      })

      // Aanpassen in html
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
  var ref1 = new Firebase("https://testdb-1.firebaseio.com/Inventories");
  ref1.on("value", function(snapshot){
    $scope.inventories = snapshot.val();
    referentie = snapshot.val();
  })

  // Datum vandaag
  var date = new Date();
  var today =  $filter('date')(date, "dd-MM-yyyy");

  $scope.excel = function() {
    var inventories = $scope.inventories;

    // CSV variabele aanmaken met de header
    var CSV = "ID,Datum,Opslagplaats,Totaal Flessen,Totaal boxes,Categorie,Totaal flessen Cat,Totaal boxes Cat,Volle bakken,Losse flessen,boxes  \r\n";
    var head = "";
    // met angular.forEach kunnen we itereren over elk object binnen de verzameling van objecten (inventories)
    // https://docs.angularjs.org/api/ng/function/angular.forEach
    angular.forEach(inventories, function(value, key){
      var key = key;
      // Datum filteren naar het gewenste formaat
      var date = $filter('date')(value.Date, "dd-MM-yyyy");
      var inventory = value.Inventory;
      var totalBot = value.TotalBottles;
      var totalBox = value.TotalBoxes;
      head = key + "," + date + "," + inventory + "," + totalBot + "," + totalBox + ",";
      // Omdat products nog eens een object is binnen ons huidig object een nieuwe angular.foreach
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

    // Als het pionic klaar is gaan we kijken of de dir inventories al bestaat op de phone
    $ionicPlatform.ready(function() {
      $cordovaFile.checkDir("file:///storage/sdcard0/inventories")
      .then(function (result) {
      }, function (err) {
        // Indien het nog niet bestaat gaan we de directory toevoegen aan het lokale geheugen op de phone
        $cordovaFile.createDir("file:///storage/sdcard0/", "inventories", false)
        .then(function (success) {
          // success
        }, function (error) {
          // error
        });

      });



      // Nu gaan we een de CSV effectief wegschrijven op de phone
      $cordovaFile.createFile("file:///storage/sdcard0/inventories/" + today + ".csv", true).then( function(fileEntry) {
      });
      $cordovaFile.writeFile("file:///storage/sdcard0/inventories", today + '.csv', CSV, true).then( function(success) {

      }), function(error){
        alert(JSON.stringify(error))
      };
    });

    // Als ionic klaar is met bovenstaande gaat hij op de phone zoeken naar alle programma's waarmee hij een mail kan versturen
    // Hier wordt ook dropbox en dergerlike bijgerekend om de file in op te slaan
    $ionicPlatform.ready(function() {
      $cordovaEmailComposer.isAvailable().then(function() {
      }, function () {
      });
        var email = {
          to: '',
          attachments: [
            'file:///storage/sdcard0/inventories/' + today+'.csv'
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

  // Ga naar het report om producten te zoeken
  $scope.changePagetoSearchCat = function(){
    $state.go('tab.searchProducts');
  }

  // Ga naar het report om inventarissen te zoeken op datum
  $scope.changePagetoSearchInStorage = function(){
    $state.go('tab.searchInStorages');
  }

  $scope.changePagetoCharts = function(){
    $state.go('tab.charts');
  }
})

// Controller voor het zoeken van producten
.controller('searchProductsCtrl', function($scope, $firebaseObject, $filter, Categories, Inventory){
  $scope.categories = Categories;

  $scope.searchInventory = function(data){
    var word = data.singleSelect;

    var ref = new Firebase('https://testdb-1.firebaseio.com/');
    var testRef = new Firebase('https://testdb-1.firebaseio.com/Inventories/')
    var invenRef = ref.child('Inventories');

    var myData = [];
    var newArr = [];

    invenRef.on("child_added", function(snapshot){
      var data = snapshot.val();
      var prod = data.Products;

      var myProd = Object.keys(prod);

      for( var i = 0; i < myProd.length; i++){
        if (myProd[i] == word) {
          myData.push(data);
          console.log(myData);
        };
      };

    });

      //de loops uit de functie van firebase halen. anders raken de loops in de war.
      //omdat die firebase functie in de db zelf loopt en deze loops ook --> zorgt voor conflicten
      for (var y = myData.length - 1; y >= 0; y--) {//reversed loop voor meest recente data vooraan in de array te zetten
        console.log(myData[y]);
        var found = undefined;
        for (var z = 0; z < newArr.length; z++) {
         console.log(newArr[z]);
          //op de onderstaande manier logt het wel juist, maar het doet niets in werkelijkheid.
          //if (myData[y.Inventory] === newArr[z.Inventory]) {
            //alleen op deze manier kun je de waardes van de properties van een object eruit halen
            if (myData[y]['Inventory'] === newArr[z]['Inventory']) {
            found = true;
            break;
          };
        };

        if (!found) {
          newArr.push(myData[y]);
          console.log(newArr);
        }
      };

      $scope.show = newArr;
      console.log($scope.show);
 };
// Dit is nodig voor de accordion lists
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

// Controller voor het zoeken naar inventarissen op datum
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

  // Kalender
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

  // Scope voor datums uit de DB te halen en deze aan te duiden op de kalender
  $scope.getDate = function(date){
    var date = date.dt;
    // filteren van de datum naar juiste formaat
    var dt = $filter('date')(date, "dd-MM-yyyy");
    var ref = new Firebase("https://testdb-1.firebaseio.com/Inventories");

    var arrData = [];
    var myStore = [];
    var myTestDate = [];

    ref.on("child_added", function(snapshot){
      var data = snapshot.val();
      var convertDate = $filter('date')(data.Date, 'dd-MM-yyyy');
      // Array met alle data uit de DB
      var myDate = [convertDate];

      for (var j = 0; j < myDate.length; j++) {
        if (myDate[j] == dt) {

          var store = data.Inventory;

          myStore.push(store);
          $scope.plaatsen = myStore;

          arrData.push(data);
        }
      }
    })
    if(arrData.length != 0){
      console.log('vol')
      $scope.details = arrData;
    }else{
      console.log('leeg');
      var test = [];
      $scope.details = test;
    }
  }

  $scope.open = function($event) {
    $scope.status.opened = true;
  };

  $scope.formats = ['dd-MM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];

  $scope.status = {
    opened: false
  };

  // Nodig voor de accordion list
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

.controller('chartCtrl', function($scope, $filter, Categories){
  var exists;
  var ref = new Firebase('https://testdb-1.firebaseio.com/Inventories');
  var data = [];
  var arrInv = [];
  var arrData = [];
  var teller = 0;

  var category = [];
  var refCat = new Firebase('https://testdb-1.firebaseio.com/Categorie');
  refCat.on('value', function(snapshot){
    var categories = snapshot.val();

    angular.forEach(categories, function(value, key){
      category.push(value.Category);
      var name = value.Category;
      arrInv[teller] = name;
      ref.on("value", function(snapshot){
        var inventories = snapshot.val();
        angular.forEach(inventories, function(value, key){
          var date = $filter('date')(value.Date, "dd-MM-yyyy");
          var storage = value.Inventory;
          angular.forEach(value.Products, function(value, key){
              if(key == name){
                if(typeof(arrData[teller]) == "undefined"){
                  arrData[teller] = date;
                  data[teller] = value.totalBottlesCat;
                }else
                if (date == arrData[teller]) {
                  data[teller] += value.totalBottlesCat;
                }else if (date > arrData[teller]) {
                  arrData[teller] = date;
                  data[teller] = value.totalBottlesCat;
                }
                // }
              }else{
                // data[teller] = 0;
              }

          })
        })
      })
      teller++;
    })
  })

  $scope.labels = arrInv;
  $scope.data = [
     data
  ];
})

//Controller voor de manage tab
.controller('ManageCtrl', function($scope, $state, $localstorage) {
  $scope.changePage = function(){
    $state.go('overviewInventories');
  }

  $scope.changePageToCat = function(){
    $state.go('overviewCat')
  }

  $scope.changePageTStorage = function(){
    $state.go('stockage')
  }

  // Controleren of checkbox is aanvinkt en opslaan in localstorage
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

  // Verwijderen van een storageplace
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

  // Aanpassen van een storageplace
  $scope.edit = function(id){
    $localstorage.set('stockageId', id);
    $state.go('editStorageplace');
  }

  $scope.changePageToAdd = function(){
    $state.go('addStorageplace');
  }
})

// Controller voor het aanpassen van een storageplace
.controller('EditstorageCtrl', function($scope, $state, $localstorage, $ionicListDelegate, Storages){
  // Id van de storageplace die men wilt aanpassen opvragen uit de localstorage
  var storages = Storages[$localstorage.get('stockageId')];
  var id = storages.$id;
  // Opvragen van data over de storageplace
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

  // Reeds gekende informatie invullen in html
  $scope.storage = {storageName: storages.name, address: address, city: city};

  // Functie voor aanpassingen aan te brengen in de DB
  $scope.editStorage = function(form, storage){
    if(form.$valid){
      // Gegevens opvragen in de html
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

      // Aanpassen van de naam in de reeds bestaande inventarissen
      var inventories;
      var invenRef = new Firebase('https://testdb-1.firebaseio.com/Inventories');
      invenRef.once("value", function(snapshot){
        inventories = snapshot.val();
      })

      angular.forEach(inventories, function(value, key){
        // console.log(value.Inventory);
        if(value.Inventory == storages.name){
          var date = key.substring(0, 10);
          var newId = date+storageName;
          var changeRef = new Firebase('https://testdb-1.firebaseio.com/Inventories');
          changeRef.child(key).update({
            "Inventory": storageName
          });
          var child = changeRef.child(key);
          child.once("value", function(snapshot){
            changeRef.child(newId).set(snapshot.val());
            child.remove();
          })
        }

      })

      // Wijzigingen effectief opslaan in de DB
      var ref = new Firebase('https://testdb-1.firebaseio.com/Storages');
      ref.child(id).set({
        "name": storageName,
        "address": address,
        "city": city
      });

      $state.go('stockage');
    }else{
      window.plugins.toast.showWithOptions(
      {
        message: "Gelieve een correcte naam in te geven.",
        duration: "short",
        position: "center",
        addPixelsY: -40  // (optional) added a negative value to move it up a bit (default 0)
      });
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

      // Wijzigingen effectief opslaan in de DB
      var ref = new Firebase('https://testdb-1.firebaseio.com/Storages');
      var alreadyExist = false;
      ref.once("value", function(snapshot){
        var storages = snapshot.val();
        angular.forEach(storages, function(value, key){
          console.log(value);
          if(value.name == storageName){
            alreadyExist = true;
          }
        })
      })

      if(!alreadyExist){
        //Toevoegen in de database
        var add = $scope.storages.$add({
          "name": storageName,
          "address": address,
          "city": city
        });
      }else{
        window.plugins.toast.showWithOptions(
        {
          message: "Deze naam bestaat reeds voor een opslagplaats.",
          duration: "short",
          position: "center",
          addPixelsY: -40  // (optional) added a negative value to move it up a bit (default 0)
        });
      }

      //Als het goed is opgeslagen in de database, verder gaan naar de volgende pagina
      if(add){
          $state.go('stockage');
      };
    }
    else{
      // Soort van toast message om bevestiging te geven of de flessen effectief zijn toegevoegd in de DB
      window.plugins.toast.showWithOptions(
      {
        message: "Gelieve een correcte naam in te geven.",
        duration: "short",
        position: "center",
        addPixelsY: -40  // (optional) added a negative value to move it up a bit (default 0)
      });

    }
  }
})

// Controller voor het aanpassen van een categorie
.controller('editCatCtrl', function($scope, $localstorage, $state, Categories){
  // gegevens opvragen van de categorie die men gaat aanpassen uit de localstore
  var categories = Categories[$localstorage.get('editCat')];
  var id = categories.$id;
  if(categories.Size == "null"){
    var size = "";
  }else{
    var size = categories.Size;
  }
  // het html formulier vullen bij het laden van de pagina
  $scope.cat = {catName: categories.Category, number: size, isChecked: categories.Optional};

  // Functie voor het aanpassen van een categorie
  $scope.editCat = function(form, cat){
    if(form.$valid){
      // Gegevens van het formulier opvragen
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

      var inventories;
      var invenRef = new Firebase('https://testdb-1.firebaseio.com/Inventories');
      invenRef.once("value", function(snapshot){
        inventories = snapshot.val();
      })

      var changeRef = new Firebase('https://testdb-1.firebaseio.com/Inventories/');
      angular.forEach(inventories, function(value, key){
        var inventory = changeRef.child(key);
        var products = inventory.child('Products');
        angular.forEach(value.Products, function(value, key){
          console.log(key);
          if(key == categories.Category){
            var child = products.child(key);
            child.once("value", function(snapshot){
              var product = snapshot.val();
              var full = product.full;
              var half = product.half;
              var boxes = product.boxes;
              var totalbottles = product.totalBottlesCat;
              var totalBoxes = product.totalBoxesCat;
              products.child(catName).set({
                "full": full,
                "half": half,
                "boxes": boxes,
                "totalBoxesCat": totalBoxes,
                "totalBottlesCat": totalbottles
              })
              // products.child(catName).set(snapshot.val());
              child.remove();
            })
          }
        })
      })

      // Effectief toevoegen van de aangepaste categorie in de DB
      var ref = new Firebase('https://testdb-1.firebaseio.com/Categorie')
      ref.child(id).set({
        Category: catName,
        Size: number,
        Optional: optional
      });
      $state.go('overviewCat');
    }
    else{
      window.plugins.toast.showWithOptions(
      {
        message: "Gelieve een correcte naam in te geven.",
        duration: "short",
        position: "center",
        addPixelsY: -40  // (optional) added a negative value to move it up a bit (default 0)
      });
    }
  };
})

//Controller voor het overzicht van alle categorieën in manage tab
.controller('OverviewCatCtrl', function($scope, $state, $ionicPopup, $localstorage, Categories){
    $scope.categories = Categories;

    // Functie voor het verwijderen van een categorie
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

    // Fuctie om naar de editpagina te gaan
    $scope.edit = function(id){
      $localstorage.set('editCat', id);
      $state.go('editCat');
    }

    // Functie om naar de add pagina te gaan
    $scope.changePageToAdd = function(){
      $state.go('addCat')
    }
})

//Controller voor het toevoegen van categorieën
.controller('addCatCtrl', function($scope, $state, Categories){
  $scope.categories = Categories;

  $scope.addCategory = function(test, cat) {
    if(test.$valid){
      // Gegevens ophalen uit het formulier
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

      // Effectief toevoegen van de aangepaste categorie in de DB
      var ref = new Firebase('https://testdb-1.firebaseio.com/Categorie')
      var alreadyExist = false;
      ref.once("value", function(snapshot){
        var categories = snapshot.val();
        angular.forEach(categories, function(value, key){
          console.log(value.Category);
          console.log("catName   " + catName);
          if(value.Category == catName){
            alreadyExist = true;
          }
        })
      })

      console.log(alreadyExist);
      if(!alreadyExist){
        //Effectief toevoegen in de database
        $scope.categories.$add({
          "Category": catName,
          "Size": number,
          "Optional": optional
        });
        $state.go('overviewCat');
      }else{
        window.plugins.toast.showWithOptions(
        {
          message: "Opgepast deze naam bestaat reeds voor een categorie.",
          duration: "short",
          position: "center",
          addPixelsY: -40  // (optional) added a negative value to move it up a bit (default 0)
        });
        this.cat = "";
      }
    }else{
      //Kan eventueel nog een alertmessage verschijnen als het niet in orde is.
      window.plugins.toast.showWithOptions(
      {
        message: "Gelieve een correcte naam in te geven.",
        duration: "short",
        position: "center",
        addPixelsY: -40  // (optional) added a negative value to move it up a bit (default 0)
      });
      // this.cat = undefined;
    }
  };
})

//Controller voor overzicht van inventarissen in manage tab
.controller('overviewInvenCtrl', function($scope, $ionicPopup, $localstorage, Inventory){
  $scope.inventories = Inventory;

  // alertmessage voor het verwijderen van een inventory
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
