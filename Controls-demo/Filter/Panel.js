/**
 * Created by am.gerasimov on 17.07.2018.
 */
define('Controls-demo/Filter/Panel', [
   'UI/Base',
   'wml!Controls-demo/Filter/Panel',
   'Controls/dropdown',
   "wml!Controls-demo/Filter/itemTemplate"
], function(Base, tempalte) {
   
   'use strict';
   
   var Panel = Base.Control.extend({
      _template: tempalte
   });
   
   return Panel;
});