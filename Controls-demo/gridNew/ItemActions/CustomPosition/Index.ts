import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {IItemAction} from 'Controls/itemActions';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import {getActionsForContacts as getItemActions} from '../../../list_new/DemoHelpers/ItemActionsCatalog';

import * as Template from 'wml!Controls-demo/gridNew/ItemActions/CustomPosition/CustomPosition';

const MAXINDEX = 4;

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemActions: IItemAction[] = getItemActions();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData().slice(1, MAXINDEX)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
