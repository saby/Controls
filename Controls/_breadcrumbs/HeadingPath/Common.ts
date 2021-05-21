import {Model} from 'Types/entity';
import {Control} from 'UI/Base';

function getRootModel(root, keyProperty) {
   let rawData = {};

   rawData[keyProperty] = root;
   return new Model({
      keyProperty,
      rawData
   });
}

function onBackButtonClick(this: Control, e: Event, itemsProperty: string = 'items'): void {
   let item;
   const items = this._options[itemsProperty];

   if (items.length > 1) {
      item = items[items.length - 2];
   } else {
      item = getRootModel(items[0].get(this._options.parentProperty), this._options.keyProperty);
   }

   this._notify('itemClick', [item]);
   e.stopPropagation();
}

export default {
   getRootModel,
   onBackButtonClick
};
