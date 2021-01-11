define('Controls-demo/FilterView/resources/Panel',
   [
      'UI/Base',
      'wml!Controls-demo/FilterView/resources/Panel',

      'wml!Controls-demo/FilterView/resources/itemTemplateMainBlock',
      'wml!Controls-demo/FilterView/resources/additionalTemplateItems'
   ],

   function(Base, template) {

      'use strict';
      var FilterViewPanel = Base.Control.extend({

         _template: template,
         _limitWidth: true

      });

      return FilterViewPanel;
   });
