define('Controls-demo/List/EditAndRemoveOperations', [
   'Core/Control',
   'wml!Controls-demo/List/EditAndRemoveOperations/EditAndRemoveOperations',
   'Types/source',
   'Types/entity',
   'Controls/list',
   'Controls/validate'
], function(Control,
            template,
            source,
            entity,
            Constants
) {
   'use strict';
   var counter = 10;
   var EditInPlace = Control.extend({
      _template: template,
      _itemActions: null,

      _showAction: function(action, item) {
         if (item.get('id') === 1 && action.id === 0) { //первую запись всё равно нельзя редактировать
            return false;
         }
         if (this.__editingItem === item) {
            if (action.id === 3) {
               return true;
            }
            return false;
         }
         if (action.id === 3) {
            return false;
         }
         return true;
      },
      _beforeMount: function() {
         this.showType = {
            //show only in Menu
            MENU: 0,
            //show in Menu and Toolbar
            MENU_TOOLBAR: 1,
            //show only in Toolbar
            TOOLBAR: 2
         };
         this.srcData = [
            {
               id: 1,
               title: 'Не открывается на редактирование',
               description: 'Другое название 1'
            },
            {
               id: 2,
               title: 'Открывается другая запись',
               description: 'Описание вот такое'
            },
            {
               id: 3,
               title: 'Обычная запись 0',
               description: 'Хватит страдать'
            },
            {
               id: 4,
               title: 'Обычная запись1',
               description: 'йцукен'
            },
            {
               id: 5,
               title: 'Обычная запись2',
               description: 'йцукен'
            },
            {
               id: 6,
               title: 'Обычная запись3',
               description: 'йцукен'
            }
         ];
         this.srcData2 = [
            {
               id: 1,
               title: 'Notebook ASUS X550LC-XO228H 6'
            },
            {
               id: 2,
               title: 'Notebook Lenovo IdeaPad G5030 (80G0001FRK) 7'
            }
         ];
         this.srcData3 = [
            {
               id: 1,
               title: 'Notebook Lenovo G505 59426068 8'
            },
            {
               id: 2,
               title: 'Lenovo 9'
            }
         ];
         this.srcData4 = [
            {
               id: 1,
               title: 'Notebook Lenovo G505 59426068 14'
            },
            {
               id: 2,
               title: 'редактирование стартует по опции'
            }
         ];
         this.srcData5 = [
            {
               id: 1,
               title: 'Notebook ASUS X550LC-XO228H 16'
            },
            {
               id: 2,
               title: 'Notebook Lenovo IdeaPad G5030 (80G0001FRK) 17'
            }
         ];
         this._editingItem = new entity.Model({
            rawData: {
               id: 2,
               title: 'редактирование стартует по опции',
               description: 'а может и не стартует',
               randomField: 'поле, которого нет'
            }
         });
         this._addItem = new entity.Model({
            rawData: {
               id: 3,
               title: 'добавление стартует по опции',
               description: 'а может и не стартует',
               randomField: 'поле, которого нет'
            }
         });
         this._showAction = this._showAction.bind(this);
         this._itemActions =  [
            {
               id: 0,
               icon: 'icon-Edit icon-primary',
               title: 'edit',
               showType: this.showType.MENU_TOOLBAR,
               style: 'bordered',
               handler: function(item) {
                  this._children.list.editItem({ item: item });
               }.bind(this)
            },
            {
               id: 1,
               icon: 'icon-Erase icon-error',
               title: 'delete',
               style: 'bordered',
               showType: this.showType.MENU_TOOLBAR,
               handler: function(item) {
                  this._children.remover.removeItems([item.get('id')]);
               }.bind(this)
            },
            {
               id: 3,
               icon: 'icon-ArrowDown icon-error',
               title: 'я прикладная операция и появляюсь только если запись редактируется',
               showType: this.showType.MENU_TOOLBAR,
               style: 'bordered',
               handler: function(item) {
                  if (confirm('Обязательно нажимать было?')) {
                     alert('У меня для вас плохие новости');
                  }
               }
            }
         ];

         this._viewSource = new source.Memory({
            keyProperty: 'id',
            data: this.srcData
         });
         this._viewSource2 = new source.Memory({
            keyProperty: 'id',
            data: this.srcData2
         });
         this._viewSource3 = new source.Memory({
            keyProperty: 'id',
            data: this.srcData3
         });
         this._viewSource4 = new source.Memory({
            keyProperty: 'id',
            data: this.srcData4
         });
         this._viewSource5 = new source.Memory({
            keyProperty: 'id',
            data: this.srcData5
         });
      },
      _beforeItemsRemove: function(event, items) {
         return this._children.popupOpener.open({
            message: 'Remove items?',
            type: 'yesno'
         });
      },
      _onBeginEdit: function(e, itemObj, isAdd) {
         if (isAdd) {
            return this._onBeginAdd();
         }
         var item = itemObj.item;
         this.__editingItem = item;
         switch (item.get('id')) {
            case 1:
               return Constants.editing.CANCEL;
            case 2:
               return {
                  item: new entity.Model({
                     rawData: {
                        id: 2,
                        title: 'Другая запись',
                        description: 'Описание вот такое'
                     }
                  })
               };
         }
      },

      _onEndEdit: function() {
         this.__editingItem = undefined;
      },

      _onBeginAdd: function(e, item) {
         return {
            item: new entity.Model({
               rawData: {
                  id: counter++,
                  title: '',
                  description: 'описание',
                  extraField: 'поле, которого нет у остальных itemов'
               }
            })
         };
      }
   });
   return EditInPlace;
});
