import rk = require('i18n!Controls');
import Controller from 'Controls/_dropdown/_Controller';
import {ICrudPlus, Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {DropdownReceivedState} from 'Controls/_dropdown/BaseDropdown';
import {IDropdownControllerOptions} from './interface/IDropdownController';
import {error as dataSourceError} from 'Controls/dataSource';
import {TKey} from '../interface';

export function prepareEmpty(emptyText) {
   if (emptyText) {
      return emptyText === true ? rk('Не выбрано') : emptyText;
   }
}

export function isEmptyItem(item: Model, emptyText: string, keyProperty: string, emptyKey: TKey = null): boolean {
   return emptyText && (!item || item.get(keyProperty) === emptyKey);
}

export function loadItems(
    controller: Controller,
    receivedState: DropdownReceivedState,
    options?: IDropdownControllerOptions
): Promise<void | DropdownReceivedState> {
   const source = options.source;
   if (receivedState) {
      return controller.setItems(receivedState.items).then(() => {
         controller.setHistoryItems(receivedState.history);
      });
   } else if (options.items) {
      controller.setItems(options.items);
   } else if (source) {
      return controller.loadItems().catch((error) => {
         dataSourceError.process({error});
      });
   }
}

export function loadSelectedItems(
    controller: Controller,
    receivedState: DropdownReceivedState,
    source: ICrudPlus
): Promise<void | DropdownReceivedState>|void {
   if (receivedState) {
      controller.updateSelectedItems(receivedState.items);
   } else if (source) {
      return controller.loadSelectedItems().catch((error) => {
         dataSourceError.process({error});
      });
   }
}
