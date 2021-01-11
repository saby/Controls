define('Controls-demo/FilterView/resources/FastViewPanel',
   [
      'UI/Base',
      'wml!Controls-demo/FilterView/resources/FastViewPanel',
      'Types/util'
   ],

   function(Base, template, Utils) {

      'use strict';
      var FilterViewPanel = Base.Control.extend({

         _template: template,

         _beforeMount: function(options) {
            this._items = options.items;
         },

         _keysChangedHandler: function(event, index, keys) {
            this._items = Utils.object.clone(this._items);
            this._items.at(index).set('selectedKeys', keys);
            if (keys[0] !== null) {
               this._items.at(0).set('selectedKeys', ['reset']);
            } else if (!this._items.at(1).get('selectedKeys')[0] && !this._items.at(2).get('selectedKeys')[0]) {
               this._items.at(0).set('selectedKeys', [null]);
            }
         }

      });

      return FilterViewPanel;
   });
