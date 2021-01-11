define('Controls-demo/FilterButton/Panel/Panel',
   [
      'UI/Base',
      'Types/source',
      'wml!Controls-demo/FilterButton/Panel/Panel',
      'Controls/filterPopup',
      'wml!Controls-demo/FilterButton/Panel/resources/additionalItemsTemplate2',
      'wml!Controls-demo/Layouts/SearchLayout/FilterButtonTemplate/filterItemsTemplate',
      'wml!Controls-demo/Layouts/SearchLayout/FilterButtonTemplate/additionalItemsTemplate',
      'wml!Controls-demo/FilterButton/Panel/resources/FIO',
      'wml!Controls-demo/FilterButton/Panel/resources/country',
      'wml!Controls-demo/Layouts/SearchLayout/FilterButtonTemplate/vdomFilterButtonTemplate',
      'wml!Controls-demo/FilterButton/Panel/resources/vdomFilterTemplate'
   ],

   function(Base, source, template) {

      /**
       * @class Controls/deprecatedSearch:Container
       * @extends Controls/Control
       * @control
       * @public
       */

      'use strict';
      var Panel = Base.Control.extend({

         _template: template,
         sourceDropdown: null,
         _text: '',
         _filterChangedHandler: function() {
            this._text += 'Стреляет filterChanged\n';
         },
         _beforeMount: function() {
            this.sourceDropdown = new source.Memory({
               data: [
                  {key: 1, title: 'все страны'},
                  {key: 2, title: 'Россия'},
                  {key: 3, title: 'США'},
                  {key: 4, title: 'Великобритания'}
               ],
               keyProperty: 'key'
            });
         },

      });

      return Panel;
   });
