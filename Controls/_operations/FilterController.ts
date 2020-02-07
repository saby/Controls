import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_operations/FilterController';
import {isEqual} from 'Types/object';
import selectionToRecord = require('Controls/_operations/MultiSelector/selectionToRecord');

import { TKeysSelection as TKeys } from 'Controls/interface/';
import { Rpc, PrefetchProxy } from 'Types/source';


export interface IOperationsFilterController extends IControlOptions {
   selectionViewMode: string;
   selectedKeys: TKeys;
   excludedKeys: TKeys;
   source: Rpc|PrefetchProxy
   filter: Object;
}

export default class OperationsFilterController extends Control<IOperationsFilterController> {
   protected _template: TemplateFunction = template;
   protected _filter: object = null;

   protected _beforeMount(options: IOperationsFilterController): void {
      this._filter = OperationsFilterController.prepareFilter(options.filter, options.selectedKeys, options.excludedKeys, options.source, options.selectionViewMode);
   }

   protected _beforeUpdate(newOptions: IOperationsFilterController): void {
      if (!isEqual(this._options.filter, newOptions.filter) || this._options.selectionViewMode !== newOptions.selectionViewMode) {
         this._filter = OperationsFilterController.prepareFilter(newOptions.filter, newOptions.selectedKeys, newOptions.excludedKeys, newOptions.source, newOptions.selectionViewMode);
      }
   }

   private static prepareFilter(filter: object, selectedKeys: TKeys, excludedKeys: TKeys, source: Rpc|PrefetchProxy, selectionViewMode: string): object {
      const preparedFilter = {...filter};

      if (selectionViewMode === 'selected') {
         source = source.getOriginal ? source.getOriginal() : source;
         preparedFilter.SelectionWithPath = selectionToRecord({
            selected: selectedKeys || [],
            excluded: excludedKeys || []
         }, source.getAdapter(), 'all', false);
      }

      return preparedFilter;
   }
}
