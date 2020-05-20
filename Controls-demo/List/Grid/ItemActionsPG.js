define('Controls-demo/List/Grid/ItemActionsPG', [
   'Core/Control',
   'Types/source',
   'Controls-demo/List/Grid/resources/DataDemoPG',
   'tmpl!Controls-demo/PropertyGrid/DemoPG',
   'json!Controls-demo/List/Grid/resources/ItemActionsPG/cfg',
   'wml!Controls-demo/List/Grid/resources/DemoMoney',
   'wml!Controls-demo/List/Grid/resources/DemoRating',
   'wml!Controls-demo/List/Grid/resources/DemoItem',], function(Control, source, data, template, config) {
   'use strict';
   var Component = Control.extend({
      _template: template,
      _metaData: null,
      _content: 'Controls/grid:View',
      _dataObject: null,
      _componentOptions: null,

      _beforeMount: function() {

         this._dataObject = {
            itemActions: {
               value: 'admin actions',
               items: [
                  {
                     id: 1,
                     title: 'none',
                     items: []
                  },
                  {
                     id: 2,
                     title: 'user actions',
                     items: data.firstItemActionsArray
                  },
                  {
                     id: 3,
                     title: 'admin actions',
                     items: data.secondItemActionsArray
                  }
               ]
            },
            itemActionVisibilityCallback: {
               value: 'none',
               items: [
                  {
                     id: 1,
                     title: 'none',
                     template: null
                  },
                  {
                     id: 1,
                     title: 'variant 1',
                     template: function(action, item) {
                        if (item.get('id') === 2) {
                           return (action.id === 2);
                        }
                        if (item.get('id') === 5) {
                           return action.id !== 2;
                        }
                        if (action.id === 5) {
                           return false;
                        }
                        return !((item.get('id') === 2) || (item.get('id') === 4));
                     }
                  }
               ]
            },
            itemActionsPosition: {
               value: 'inside',
               items: [
                  {
                     id: 1,
                     title: 'inside',
                     value: 'inside'
                  },
                  {
                     id: 2,
                     title: 'outside',
                     value: 'outside'
                  }
               ]
            }
         };
         this._componentOptions = {
            name: 'ItemActionsGridPG',
            source: new source.Memory({
               keyProperty: 'id',
               data: data.catalog
            }),
            keyProperty: 'id',
            columns: data.partialColumns,
            header: data.partialHeader,
            markedKey: '4',
            displayProperty: 'title',
            itemActions: data.secondItemActionsArray,
            itemActionVisibilityCallback: null,
            contextMenuEnabled: false,
            itemActionsPosition: 'inside'
         };

         this._metaData = config[this._content].properties['ws-config'].options;
      }
   });
   Component._styles = ['Controls-demo/Filter/Button/PanelVDom', 'Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper'];

   return Component;
});
