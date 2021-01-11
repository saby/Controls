define('Controls-demo/List/List/EditableListPG',
   [
      'UI/Base',
      'Types/source',
      'Controls-demo/List/List/resources/DataDemoPG',
      'tmpl!Controls-demo/PropertyGrid/DemoPG',
      'json!Controls-demo/List/List/resources/EditableListPG/cfg',
      'wml!Controls-demo/List/List/resources/EditableListPG/itemTemplate'
   ],

   function(Base, sourceLib, data, template, config, ItemTemplate) {
      'use strict';
      var Component = Base.Control.extend({
         _template: template,
         _metaData: null,
         _content: 'Controls/list:View',
         _dataObject: null,
         _componentOptions: null,

         _beforeMount: function() {
            this._dataObject = {
               editingConfig: {
                  editorType: 'EditingConfig',
                  value: {
                     editOnClick: true,
                     sequentialEditing: true,
                     toolbarVisibility: false,
                     autoAdd: false
                  }
               }
            };
            this._componentOptions = {
               keyProperty: 'id',
               name: 'EditableListPG',
               source: new sourceLib.Memory({
                  keyProperty: 'id',
                  data: data.gadgets
               }),
               itemTemplate: ItemTemplate,
               itemActionsPosition: 'inside',
               editingConfig: this._dataObject.editingConfig.value
            };

            this._metaData = config[this._content].properties['ws-config'].options;
         }


      });
      return Component;
   });
