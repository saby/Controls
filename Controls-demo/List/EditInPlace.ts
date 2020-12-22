import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';

import 'Controls/validate';
import 'Controls-demo/List/EditInPlace/Validators';

import * as Constants from 'Controls/list';
import * as template from 'wml!Controls-demo/List/EditInPlace/EditInPlace';

const data = {
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
};

const devices = [
   {
      id: 1,
      title: 'Notebook ASUS X550LC-XO228H 6'
   },
   {
      id: 2,
      title: 'Notebook Lenovo IdeaPad G5030 (80G0001FRK) 7'
   },
   {
      id: 3,
      title: 'Notebook Lenovo G505 59426068 8'
   },
   {
      id: 4,
      title: 'Lenovo 9'
   },
   {
      id: 5,
      title: 'Notebook Lenovo G505 59426068 14'
   },
   {
      id: 6,
      title: 'Editing starts before mounting to DOM'
   },
   {
      id: 7,
      title: 'Notebook ASUS X550LC-XO228H 16'
   },
   {
      id: 8,
      title: 'Notebook Lenovo IdeaPad G5030 (80G0001FRK) 17'
   }
]


function createDevicesData(keys: number[]) {
   return {
      keyProperty: 'id',
      data: keys.map((key) => devices.find((device) => device.id === key)).map((item, index) => ({...item, id: index + 1}))
   }
}

export default class EditInPlace extends Control {
   protected _template: TemplateFunction = template;
   protected editingConfig: null;
   protected _editOnClick: boolean = true;
   protected _sequentialEditing: boolean = true;
   protected _autoAdd: boolean = false;
   protected _toolbarVisibility: boolean = true;
   protected _handleItemClick: boolean = false;
   protected _handleClickError: boolean = false;
   protected _readOnly: boolean = false;
   protected _editingItem: Model;
   protected _addItem: Model;

   private _counter: number = 10;

   // sources
   _viewSource: Memory;
   _viewSource2: Memory;
   _viewSource3: Memory;
   _viewSource4: Memory;
   _viewSource5: Memory;

   _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
      this._viewSource = new Memory(data);
      this._viewSource2 = new Memory(createDevicesData([1, 2]));
      this._viewSource3 = new Memory(createDevicesData([3, 4]));
      this._viewSource4 = new Memory(createDevicesData([5, 6]));
      this._viewSource5 = new Memory(createDevicesData([7, 8]));
      this._editingItem = new Model({
         keyProperty: 'id',
         rawData: {
            id: 2,
            title: 'Editing starts before mounting to DOM',
            randomField: 'text'
         }
      });
      this._addItem = new Model({
         keyProperty: 'id',
         rawData: {
            id: 3,
            title: 'Adding starts before mounting to DOM',
            randomField: 'text'
         }
      });
      return receivedState;
   }

   _onBeforeBeginEdit(e, options, isAdd: boolean) {
      if (isAdd) {
         return this._onItemAdd();
      }
      switch (options.item.get('id')) {
         case 1:
            return Constants.editing.CANCEL;
         case 2:
            return {
               item: new Model({
                  keyProperty: 'id',
                  rawData: {
                     id: 2,
                     title: 'Another record'
                  }
               })
            };
         case 3:
            return new Promise((result) => {
               setTimeout(function() {
                  result({
                     item: new Model({
                        keyProperty: 'id',
                        rawData: {
                           id: 3,
                           title: 'Record from Deferred'
                        }
                     })
                  });
               }, 3000);
            });
      }
   }

   _onItemAdd() {
      return {
         item: new Model({
            keyProperty: 'id',
            rawData: {
               id: this._counter++,
               title: '',
               extraField: 'text'
            }
         })
      };
   }

   _cancelItemAdd(e, options, isAdd: boolean) {
      if (isAdd) {
         return Constants.editing.CANCEL;
      }
   }

   _deferredItemAdd() {
      return new Promise((result) => {
         setTimeout(function() {
            result({
               item: new Model({
                  keyProperty: 'id',
                  rawData: {
                     id: 3,
                     title: '',
                     extraField: 'text'
                  }
               })
            });
         }, 2000);
      });
   }

   beginAdd() {
      this._children.list.beginAdd();
   }

   beginEdit(options) {
      this._children.list.beginEdit(options);
   }

   _itemClickHandler(e, item, nativeEvent) {
      if (nativeEvent.target.tagName === 'INPUT') {
         this._handleClickError = true;
      }
   }

   static _styles = ['Controls-demo/List/EditInPlace/EditInPlace'];
}
