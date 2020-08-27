import Controller from 'Controls/_dropdown/_Controller';
import HistoryController from 'Controls/_dropdown/HistoryController';
import rk = require('i18n!Controls');
import {ICrudPlus} from 'Types/source';
import {DropdownReceivedState} from 'Controls/_dropdown/BaseDropdown';

export function prepareEmpty(emptyText) {
   if (emptyText) {
      return emptyText === true ? rk('Не выбрано') : emptyText;
   }
}

export function loadItems(
    controller: Controller,
    historyController: HistoryController,
    receivedState: DropdownReceivedState,
    source: ICrudPlus
): Promise<void | DropdownReceivedState> {
   if (receivedState) {
      const preparedItems = historyController.getPreparedItems(receivedState.items, receivedState.history);
      return controller.setItems(preparedItems).then(() => {
          historyController.setHistory(receivedState.history);
      });
   } else if (source) {
      return controller.loadItems();
   }
}
