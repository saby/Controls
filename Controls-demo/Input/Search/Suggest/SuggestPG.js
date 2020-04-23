define('Controls-demo/Input/Search/Suggest/SuggestPG', [
   'Core/Control',
   'tmpl!Controls-demo/PropertyGrid/DemoPG',
   'json!Controls-demo/PropertyGrid/pgtext',
   'Types/source',
], function(Control, template, propertyGridConfig, sourceLib) {

   'use strict';

   var cityData = [
      {id: 1, city: 'Yaroslavl'},
      {id: 2, city: 'Moscow'},
      {id: 3, city: 'Rostov'},
      {id: 4, city: 'Ivanovo'},
      {id: 5, city: 'Kazan'}
   ];

   var namesData = [
      {id: 1, name: 'Sasha'},
      {id: 2, name: 'Aleksey'},
      {id: 3, name: 'Andrey'},
      {id: 4, name: 'Maksim'},
      {id: 5, name: 'Dmitry'}
   ];

   return Control.extend({
      _template: template,
      _styles: ['Controls-demo/Input/Suggest/SuggestPG', 'Controls-demo/Input/Search/Suggest/SuggestPG'],
      _content: 'Controls/suggest:SearchInput',
      _dataObject: null,
      _componentOptions: null,

      _beforeMount: function() {
         var sourceFilter = function(item, queryFilter) {
            var itemValue = item.get('city') || item.get('name');
            var queryValue = queryFilter['city'] || queryFilter['name'];

            if (queryValue) {
               queryValue = queryValue && queryValue.toLowerCase();
               itemValue = itemValue && itemValue.toLowerCase();
               return itemValue.indexOf(queryValue) !== -1;
            }
            return true;
         };

         this._citiesSource = new sourceLib.Memory({
            keyProperty: 'id',
            data: cityData,
            filter: sourceFilter
         });
         this._namesSource = new sourceLib.Memory({
            keyProperty: 'id',
            data: namesData,
            filter: sourceFilter
         });
         this._componentOptions = {
            name: 'Input/Search/Suggest',
            readOnly: false,
            searchDelay: 300,
            minSearchLength: 3,
            displayProperty: 'city',
            searchParam: 'city',
            autoDropDown: false,
            value: '',
            source: this._citiesSource,
            suggestTemplate: {
               templateName: 'Controls-demo/Input/Suggest/resources/SuggestTemplatePG'
            },
            emptyTemplate: {
               templateName: 'wml!Controls-demo/Input/Suggest/resources/emptyTemplatePG'
            }
         };
         this._metaData = propertyGridConfig[this._content].properties['ws-config'].options;
         this._dataObject = {
            emptyTemplate: {
               items: [
                  {id: 1, title: 'default empty template', template: undefined},
                  {id: 2, title: 'Empty template set to null', template: null},
                  {id: 3, title: 'Empty template with custom text', template: {templateName: 'wml!Controls-demo/Input/Suggest/resources/emptyTemplatePG2'}}
               ],
               value: 'Not specified'
            },
            source: {
               items: [
                  {id: 1, title: 'Not specified', items: undefined},
                  {id: 2, title: 'cities', items: this._citiesSource},
                  {id: 3, title: 'names', items: this._namesSource}
               ],
               value: 'cities'
            },
            suggestTemplate: {
               items: [
                  {id: 1, title: 'Suggest with simple itemTemplate', template: {templateName: 'Controls-demo/Input/Suggest/resources/SuggestTemplatePG'}},
                  {id: 2, title: 'Suggest with custom itemTemplate', template: {templateName: 'Controls-demo/Input/Suggest/resources/SuggestTemplatePG2'}}
               ],
               value: 'Suggest with simple itemTemplate'
            },
            footerTemplate: {
               items: [
                  {id: 1, title: 'default footer template', template: undefined},
                  {id: 2, title: 'Suggest with custom footer template', template: {templateName: 'Controls-demo/Input/Suggest/resources/SuggestFooterTemplatePG'}}
               ],
               value: 'default footer template'
            },
            navigation: {
               items: [
                  {id: 1, title: 'Page size is 5 items',
                     template: {
                        source: 'page',
                        view: 'page',
                        sourceConfig: {
                           pageSize: 5,
                           page: 0,
                           hasMore: false
                        }
                     }
                  },
                  {id: 2, title: 'Page size is 2 items',
                     template: {
                        source: 'page',
                        view: 'page',
                        sourceConfig: {
                           pageSize: 2,
                           page: 0,
                           hasMore: false
                        }
                     }
                  },
               ],
               value: 'Page size is 5 items'
            },
         };
      }
   });
});
