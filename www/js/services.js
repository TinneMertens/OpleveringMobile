angular.module('starter.services', ['starter.controllers'])

.service('sharedProperties', function () {
  var property = 'First';
  return {
    getProperty: function () {
      return property;
    },
    setProperty: function(value) {
      property = value;
    }
  };
})

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}])

.factory('Storages', ['$firebaseArray', function($firebaseArray) {
  var itemsRef = new Firebase('https://testdb-1.firebaseio.com/Storages');
  return $firebaseArray(itemsRef);
}])

.factory('Categories', ['$firebaseArray', function($firebaseArray) {
  var invenRef = new Firebase('https://testdb-1.firebaseio.com/Categorie');
  return $firebaseArray(invenRef);
}])

/*creeer inventory*/
.factory('Inventory', ['$firebaseArray', function($firebaseArray) {
  var invenRef = new Firebase('https://testdb-1.firebaseio.com/Inventories');
 // var addProductRef = new Firebase('https://testdb-1.firebaseio.com/Inventories/Products');
      return $firebaseArray(invenRef);
}])

/*add products*/
.factory('Product', ['$firebaseArray', function($firebaseArray) {
    var addProductRef = new Firebase('https://testdb-1.firebaseio.com/Inventories');
    return addProductRef;
    //return addProductRef
}])
