import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IItemAction} from 'Controls/itemActions';
import {IColumn} from 'Controls/grid';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';
import {getActionsForContacts as getItemActions} from '../../../../list_new/DemoHelpers/ItemActionsCatalog';

import * as template from 'wml!Controls-demo/gridNew/ItemActions/ItemActionsVisibility/Delayed/ItemActions';

const MAXINDEX = 4;

export default class ListDelayedItemActions extends Control<IControlOptions> {
   protected _itemActions: IItemAction[] = getItemActions();
   protected _template: TemplateFunction = template;
   protected _viewSource: Memory;
   protected _itemActionsVisibility: string = 'delayed';
   protected _columns: IColumn[] = getCountriesStats().getColumnsWithFixedWidths();

   protected _beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: getCountriesStats().getData().slice(1, MAXINDEX)
      });
   }
}
