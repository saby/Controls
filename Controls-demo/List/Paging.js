/**
 * Created by kraynovdo on 01.11.2017.
 */
define('Controls-demo/List/Paging', [
   'UI/Base',
   'wml!Controls-demo/List/Paging/Paging'
], function (Base,
             template
   ) {
   'use strict';



   var ModuleClass = Base.Control.extend(
      {
         _template: template,
         _selectedKey: 1

      });
   return ModuleClass;
});