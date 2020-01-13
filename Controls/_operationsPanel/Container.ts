import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_operationsPanel/Container/Container';
import { TKeysSelection as TKeys, TKeySelection as TKey } from 'Controls/interface/';

export interface IOperationsPanelContainer extends IControlOptions {
   selectedKeys: TKeys;
   listMarkedKey: TKey;
}

export default class OperationsPanelContainer extends Control<IOperationsPanelContainer> {
   protected _template: TemplateFunction = template;

   protected _getSelectedKeys() {
      if (!this._options.selectedKeys.length && this._options.listMarkedKey !== null) {
         return [this._options.listMarkedKey];
      } else {
         return this._options.selectedKeys;
      }
   }
}
