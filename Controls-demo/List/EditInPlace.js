define('Controls-demo/List/EditInPlace', [
   'Core/Control',
   'wml!Controls-demo/List/EditInPlace/EditInPlace',
   'Types/source',
   'Types/entity',
   'Core/Deferred',
   'Controls/Constants',
   'Controls/validate',
], function (Control,
             template,
             source,
             entity,
             Deferred,
             Constants
) {
   'use strict';

   var counter = 10;
   var EditInPlace = Control.extend({
      _template: template,
      _styles: ['Controls-demo/List/EditInPlace/EditInPlace'],
      editingConfig: null,
      _editOnClick: true,
      _sequentialEditing: true,
      _autoAdd: false,
      _handleItemClick: false,
      _handleClickError: false,
      _readOnly: false,
      _editingItem: null,
      _addItem: null,
      _beforeMount: function() {
         this._viewSource = new source.Memory({
            keyProperty: 'id',
            data: [
               {
                  id: 1,
                  title: 'Not editable'
               },
               {
                  id: 2,
                  title: 'Another record will open on editing'
               },
               {
                  id: 3,
                  title: 'Returns Deferred and after 3 seconds editing will start'
               },
               {
                  id: 4,
                  title: 'Record1'
               },
               {
                  id: 5,
                  title: 'Record2'
               },
               {
                  id: 6,
                  title: 'Record3'
               }
            ]
         });
         this._viewSource2 = new source.Memory({
            keyProperty: 'id',
            data: [
               {
                  id: 1,
                  title: 'Notebook ASUS X550LC-XO228H 6'
               },
               {
                  id: 2,
                  title: 'Notebook Lenovo IdeaPad G5030 (80G0001FRK) 7'
               }
            ]
         });
         this._viewSource3 = new source.Memory({
            keyProperty: 'id',
            data: [
               {
                  id: 1,
                  title: 'Notebook Lenovo G505 59426068 8'
               },
               {
                  id: 2,
                  title: 'Lenovo 9'
               }
            ]
         });
         this._viewSource4 = new source.Memory({
            keyProperty: 'id',
            data: [
               {
                  id: 1,
                  title: 'Notebook Lenovo G505 59426068 14'
               },
               {
                  id: 2,
                  title: 'Editing starts before mounting to DOM'
               }
            ]
         });
         this._viewSource5 = new source.Memory({
            keyProperty: 'id',
            data: [
               {
                  id: 1,
                  title: 'Notebook ASUS X550LC-XO228H 16'
               },
               {
                  id: 2,
                  title: 'Notebook Lenovo IdeaPad G5030 (80G0001FRK) 17'
               }
            ]
         });
         this._editingItem = new entity.Model({
            rawData: {
               id: 2,
               title: 'Editing starts before mounting to DOM',
               randomField: 'text'
            }
         });
         this._addItem = new entity.Model({
            rawData: {
               id: 3,
               title: 'Adding starts before mounting to DOM',
               randomField: 'text'
            }
         });
      },

      _onBeforeBeginEdit: function(e, options, isAdd) {
         if (isAdd) {
            return this._onItemAdd();
         }
         switch (options.item.get('id')) {
            case 1:
               return Constants.editing.CANCEL;
            case 2:
               return {
                  item: new entity.Model({
                     rawData: {
                        id: 2,
                        title: 'Another record'
                     }
                  })
               };
            case 3:
               var def = new Deferred();
               setTimeout(function() {
                  def.callback({
                     item: new entity.Model({
                        rawData: {
                           id: 3,
                           title: 'Record from Deferred'
                        }
                     })
                  });
               }, 3000);
               return def;
         }
      },

      _onItemAdd: function(e, item) {
         return {
               item: new entity.Model({
                  rawData: {
                     id: counter++,
                     title: '',
                     extraField: 'text'
                  }
               })
            };
      },

      _cancelItemAdd: function(e, options, isAdd) {
         if (isAdd) {
            return Constants.editing.CANCEL;
         }
      },

      _deferredItemAdd: function() {
         var
            options = {
               item: new entity.Model({
                  rawData: {
                     id: 3,
                     title: '',
                     extraField: 'text'
                  }
               })
            },
            def = new Deferred();
         setTimeout(function() {
            def.callback(options);
         }, 2000);
         return def;
      },

      beginAdd: function() {
         var options = {};
         this._children.list.beginAdd();
      },

      beginEdit: function(options) {
         this._children.list.beginEdit(options);
      },

      _itemClickHandler: function(e, item, nativeEvent) {
         if (nativeEvent.target.tagName === 'INPUT') {
            this._handleClickError = true;
         }
      }
   });
   return EditInPlace;
});
