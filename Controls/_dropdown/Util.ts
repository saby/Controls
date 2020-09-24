import Controller from 'Controls/_dropdown/_Controller';
import {Controller as HistoryController} from 'Controls/history';
import rk = require('i18n!Controls');
import {DropdownReceivedState} from 'Controls/_dropdown/BaseDropdown';
import {error as dataSourceError} from 'Controls/dataSource';

export function prepareEmpty(emptyText) {
   if (emptyText) {
      return emptyText === true ? rk('Не выбрано') : emptyText;
   }
}

export function loadItems(
    controller: Controller,
    historyController: HistoryController,
    receivedState: DropdownReceivedState,
    source: unknown
): Promise<void | DropdownReceivedState> {
   if (receivedState) {
      const preparedItems = historyController.getPreparedItems(receivedState.items, receivedState.history);
      return controller.setItems(preparedItems).then(() => {
          historyController.setHistory(receivedState.history);
      });
   } else if (source) {
      return controller.loadItems().catch((error) => {
         dataSourceError.process({error});
      });
   }
}
