import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_operationsPanel/Container/Container';
import { isEqual } from 'Types/object';
import { TKeysSelection as TKeys, TKeySelection as TKey } from 'Controls/interface/';

export interface IOperationsPanelContainer extends IControlOptions {
   selectedKeys: TKeys;
   listMarkedKey: TKey;
}

export default class OperationsPanelContainer extends Control<IOperationsPanelContainer> {
   protected _template: TemplateFunction = template;
   protected _selectedKeys: Tkeys = [];

   protected _beforeMount(options) {
      this._selectedKeys = this._getSelectedKeys(options);
   }

   protected _beforeUpdate(newOptions) {
      if (!isEqual(this._options.selectedKeys, newOptions.selectedKeys) || this._options.listMarkedKey !== newOptions.listMarkedKey) {
         this._selectedKeys = this._getSelectedKeys(newOptions);
      }
   }

   protected _getSelectedKeys(options) {
      if (!options.selectedKeys.length && options.listMarkedKey !== null) {
         return [options.listMarkedKey];
      } else {
         return options.selectedKeys;
      }
   }
}
