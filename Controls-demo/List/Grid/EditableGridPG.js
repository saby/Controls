define('Controls-demo/List/Grid/EditableGridPG',
   [
      'Core/Control',
      'Types/source',
      'Controls-demo/List/Grid/resources/DataDemoPG',
      'tmpl!Controls-demo/PropertyGrid/DemoPG',
      'json!Controls-demo/List/Grid/resources/EditableGridPG/cfg',
      'wml!Controls-demo/List/Grid/resources/DemoMoney',
      'wml!Controls-demo/List/Grid/resources/DemoRating',
      'wml!Controls-demo/List/Grid/resources/EditableGridPG/editableItem',
   ],

   function(Control, source, data, template, config) {
      'use strict';
       var Component = Control.extend({
           _template: template,
           _content: 'Controls/grid:View',

           _beforeMount: function () {
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
                   name: 'EditableGridPG',
                   markedKey: '4',
                   source: new source.Memory({
                       keyProperty: 'id',
                       data: data.catalog
                   }),
                   editingConfig: this._dataObject.editingConfig.value,
                   header: data.partialEditableHeader,
                   columns: data.partialEditableColumns
               };

               this._metaData = config[this._content].properties['ws-config'].options;
           }


       });
      Component._styles = ['Controls-demo/Filter/Button/PanelVDom', 'Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper'];

      return Component;
   });
