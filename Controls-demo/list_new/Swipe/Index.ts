import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Swipe/Swipe';
import {Memory} from 'Types/source';
import {getContactsCatalog as getData} from '../DemoHelpers/DataCatalog';
import {getActionsForContacts as getItemActions} from '../DemoHelpers/ItemActionsCatalog';
import { IItemAction } from 'Controls/itemActions';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemActions: IItemAction[] = getItemActions();
      // tslint:disable-next-line
    protected _selectedKeys: number[] = [0, 2];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
