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

// angular.module('starter.services', [])
//
// .factory('Chats', function() {
//   // Might use a resource here that returns a JSON array
//
//   // Some fake testing data
//   var chats = [{
//     id: 0,
//     name: 'Ben Sparrow',
//     lastText: 'You on your way?',
//     face: 'img/ben.png'
//   }, {
//     id: 1,
//     name: 'Max Lynx',
//     lastText: 'Hey, it\'s me',
//     face: 'img/max.png'
//   }, {
//     id: 2,
//     name: 'Adam Bradleyson',
//     lastText: 'I should buy a boat',
//     face: 'img/adam.jpg'
//   }, {
//     id: 3,
//     name: 'Perry Governor',
//     lastText: 'Look at my mukluks!',
//     face: 'img/perry.png'
//   }, {
//     id: 4,
//     name: 'Mike Harrington',
//     lastText: 'This is wicked good ice cream.',
//     face: 'img/mike.png'
//   }];
//
//   return {
//     all: function() {
//       return chats;
//     },
//     remove: function(chat) {
//       chats.splice(chats.indexOf(chat), 1);
//     },
//     get: function(chatId) {
//       for (var i = 0; i < chats.length; i++) {
//         if (chats[i].id === parseInt(chatId)) {
//           return chats[i];
//         }
//       }
//       return null;
//     }
//   };
// });
