define('Controls-demo/List/List/DocsBase', [
   'Core/Control',
   'wml!Controls-demo/List/List/resources/DocsBase/DocsBase',
   'Types/source',
   'Controls-demo/List/List/resources/Navigation/Data',
   'Controls-demo/List/List/resources/DataDemoPG',
   'Controls/Constants',

   'wml!Controls-demo/List/List/resources/ItemTemplatePG/noHighlightOnHover',
   'wml!Controls-demo/List/List/resources/BasePG/emptyTemplate',
   'wml!Controls-demo/List/List/resources/BasePG/footerTemplate',
   'wml!Controls-demo/List/List/resources/EditableListPG/itemTemplate'
], function(BaseControl,
   template,
   source,
   data,
   demoData,
   ControlsConstants) {
   'use strict';

   var ModuleClass = BaseControl.extend(
      {
         _template: template,
         _styles: ['Controls-demo/List/List/resources/DocsBase/DocsBase'],
         _eventsList: '',
         _navigationViewType: 'infinity',


         constructor: function() {
            ModuleClass.superclass.constructor.apply(this, arguments);
            this._viewSource = new source.Memory({
               keyProperty: 'id',
               data: data.srcData
            });
            this._groupSource = new source.Memory({
               keyProperty: 'id',
               data: demoData.groupGadgets
            });
            this._emptySource = new source.Memory({
               keyProperty: 'id',
               data: []
            });
            this._firstItemActionsArray = demoData.firstItemActionsArray;
            this._editingConfig = {
               editOnClick: true,
               sequentialEditing: true,
               toolbarVisibility: true,
               autoAdd: false
            };
            this._editingSource = new source.Memory({
               keyProperty: 'id',
               data: demoData.gadgets
            });
            this._filter = { id: [1, 2, 3, 4] };
            this._selectedKeys1 = [];
            this._selectedKeys2 = [];
         },
         _groupByBrand: function(item) {
            if (item.get('brand') === 'apple') {
               return ControlsConstants.view.hiddenGroup;
            }
            return item.get('brand');
         },
         _groupByYear: function(item) {
            return item.get('year');
         },

         _dataLoadCallback: function(items) {
            items.setMetaData({
               groupResults: {
                  asus: '1555 руб. 00 коп.',
                  acer: '7777 руб. 00 коп.',
                  hp: '2318 руб. 55 коп.',
                  2006: 'silver year',
                  2007: 'gold year',
                  2008: 'platinum year',
                  pop: 'Dancing music',
                  Rock: 'For men',
                  Heavy: 'metal'
               }
            });
         }
      }
   );
   return ModuleClass;
});
