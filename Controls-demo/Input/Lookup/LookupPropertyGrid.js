define('Controls-demo/Input/Lookup/LookupPropertyGrid', [
   'Core/Control',
   'wml!Controls-demo/Input/Lookup/LookupPropertyGrid',
   'Types/source',
   'Controls-demo/Utils/MemorySourceFilter',
   'Controls-demo/Input/Lookup/LookupData',
   'json!Controls-demo/PropertyGrid/pgtext',
], function (Control, template, sourceLib, memorySourceFilter, sourceData, config) {
   'use strict';

   var Lookup = Control.extend({
      _selectedKeys: [],
      _template: template,
      _content: 'Controls/lookup:Input',
      _dataObject: null,
      _sourceNames: null,
      _sourceCars: null,
      _componentOptions: null,
      _metaData: null,
      _suggestTemplate: 'Controls-demo/Input/Lookup/Suggest/SuggestTemplate',
      _selectorTemplate: 'Controls-demo/Input/Lookup/FlatListSelector/FlatListSelector',

      _beforeMount: function () {
         this._sourceNames = new sourceLib.Memory({
            data: sourceData.names,
            keyProperty: 'id',
            filter: memorySourceFilter()
         });

         this._sourceCars = new sourceLib.Memory({
            data: sourceData.cars,
            keyProperty: 'id',
            filter: memorySourceFilter()
         });

         this._componentOptions = {
            name: 'Lookup',
            autoDropDown: false,
            multiSelect: false,
            multiLine: false,
            readOnly: false,
            searchParam: 'title',
            placeholder: 'Input text',
            comment: '',
            minSearchLength: '3',
            maxVisibleItems: '7',
            source: this._sourceNames,
            selectedKeys: this._selectedKeys,
            keyProperty: 'id',
            displayProperty: 'title',
            suggestTemplate: {
               templateName: this._suggestTemplate
            },
            selectorTemplate: {
               templateName: this._selectorTemplate
            },
            'itemTemplate.style': 'none',
            'itemTemplate.size': 'm'
         };

         this._dataObject = {
            value: {
               readOnly: true
            },
            displayProperty: {
               keyProperty: 'id',
               displayProperty: 'title',
               placeholder: 'select',
               selectedKey: 1
            },
            'itemTemplate.style': {
               keyProperty: 'id',
               displayProperty: 'title',
               selectedKey: 0
            },
            'itemTemplate.size': {
               keyProperty: 'id',
               displayProperty: 'title',
               selectedKey: 0
            },
            source: {
               items: [
                  {id: '1', title: 'Names', items: this._sourceNames},
                  {id: '2', title: 'Cars', items: this._sourceCars}
               ],
               value: 'Names'
            },
            selectorTemplate: {items: [
               {id: '1', title: 'Template with names', items: {
                  templateName: this._selectorTemplate,
                  templateOptions: {
                     source: this._sourceNames
                  }
               }},
               {id: '2', title: 'Template with cars', items: {
                  templateName: this._selectorTemplate,
                  templateOptions: {
                     source: this._sourceCars
                  }
               }}
            ], value: 'Template with names'}
         };

         this._metaData = config[this._content].properties['ws-config'].options;
      },

      _optionsChanged: function(event, config) {
         var
            options = config.componentOpt,
            pgWrapper = this._children.pgWrapper,
            propertyGrid = pgWrapper._children.PropertyGrid,
            newItemTemplate = 'wml!Controls-demo/Input/Lookup/resources/ItemTemplate_' + options['itemTemplate.style'] + '_' + options['itemTemplate.size'];

         if (options.itemTemplate !== newItemTemplate) {
            require([newItemTemplate], function() {
               propertyGrid._notify('itemsChanged', ['itemTemplate', newItemTemplate]);
            });
         }
      }
   });

   Lookup._styles = ['Controls-demo/Input/Lookup/LookupPropertyGrid'];

   return Lookup;
});
