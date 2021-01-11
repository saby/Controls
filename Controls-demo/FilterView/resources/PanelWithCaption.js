define('Controls-demo/FilterView/resources/PanelWithCaption',
   [
      'UI/Base',
      'wml!Controls-demo/FilterView/resources/Panel',

      'wml!Controls-demo/FilterView/resources/itemTemplateMainBlock',
      'wml!Controls-demo/FilterView/resources/additionalTemplateItems',
      'wml!Controls-demo/FilterView/resources/topTemplate'
   ],

   function(Base, template) {

      'use strict';
      var FilterViewPanel = Base.Control.extend({

         _template: template,
         _limitWidth: true,
         _caption: 'Long caption for testing',
         _topTemplate: 'wml!Controls-demo/FilterView/resources/topTemplate'

      });

      return FilterViewPanel;
   });
