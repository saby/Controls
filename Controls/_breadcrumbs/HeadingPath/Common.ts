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

function onBackButtonClick(this: Control, e: Event) {
   let item;

   if (this._options.items.length > 1) {
      item = this._options.items[this._options.items.length - 2];
   } else {
      item = getRootModel(this._options.items[0].get(this._options.parentProperty), this._options.keyProperty);
   }

   this._notify('itemClick', [item]);
   e.stopPropagation();
}

export default {
   getRootModel,
   onBackButtonClick
}
