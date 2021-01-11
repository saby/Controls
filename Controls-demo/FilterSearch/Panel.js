/**
 * Created by am.gerasimov on 17.07.2018.
 */
define('Controls-demo/FilterSearch/Panel', [
   'UI/Base',
   'wml!Controls-demo/FilterSearch/Panel',
   'Controls/dropdown',
   'wml!Controls-demo/FilterSearch/itemTemplate'
], function(Base, tempalte) {
   
   'use strict';
   
   return Base.Control.extend({
      _template: tempalte
   });
});