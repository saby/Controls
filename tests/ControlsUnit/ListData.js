define('ControlsUnit/ListData', function() {
   'use strict';
   return {
      KEY_PROPERTY: 'id',
      PARENT_PROPERTY: 'Раздел',
      NODE_PROPERTY: 'Раздел@',
      HAS_CHILDREN_PROPERTY: "Раздел$",

      /*
       * 1
       *    2
       *       3
       *       4
       *    5
       * 6
       * 7
       */
      getItems: function() {
         return [{
            'id': 1,
            'Раздел': null,
            'Раздел@': true,
            'Раздел$': true,
            'group': 111
         }, {
            'id': 2,
            'Раздел': 1,
            'Раздел@': false,
            'Раздел$': false,
            'group': 111
         }, {
            'id': 3,
            'Раздел': 2,
            'Раздел@': false,
            'Раздел$': false,
            'group': 111
         }, {
            'id': 4,
            'Раздел': 2,
            'Раздел@': null,
            'Раздел$': false,
            'group': 111
         }, {
            'id': 5,
            'Раздел': 1,
            'Раздел@': null,
            'Раздел$': false,
            'group': 111
         }, {
            'id': 6,
            'Раздел': null,
            'Раздел@': true,
            'Раздел$': false,
            'group': 111
         }, {
            'id': 7,
            'Раздел': null,
            'Раздел@': null,
            'Раздел$': false,
            'group': 222
         }];
      },

      getFlatItems: function() {
         return [{
            'id': 1,
            'Раздел': null,
            'Раздел@': false,
            'Раздел$': true
         }, {
            'id': 2,
            'Раздел': 1,
            'Раздел@': false,
            'Раздел$': true
         }, {
            'id': 3,
            'Раздел': 2,
            'Раздел@': false,
            'Раздел$': false
         }, {
            'id': 4,
            'Раздел': 2,
            'Раздел@': false,
            'Раздел$': false
         }, {
            'id': 5,
            'Раздел': 1,
            'Раздел@': false,
            'Раздел$': false
         }, {
            'id': 6,
            'Раздел': null,
            'Раздел@': false,
            'Раздел$': false
         }, {
            'id': 7,
            'Раздел': null,
            'Раздел@': false,
            'Раздел$': false
         }];
      },

      getRootItems: function() {
         return [{
            'id': 1,
            'Раздел': null,
            'Раздел@': true,
            'Раздел$': true
         }, {
            'id': 6,
            'Раздел': null,
            'Раздел@': true,
            'Раздел$': false
         }, {
            'id': 7,
            'Раздел': null,
            'Раздел@': false,
            'Раздел$': false
         }];
      }
   };
});
