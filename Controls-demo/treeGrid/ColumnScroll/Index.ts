import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/ColumnScroll/ColumnScroll';
import {Memory} from 'Types/source';
import {Gadgets} from '../DemoHelpers/DataCatalog';
import {getActionsForContacts as getItemActions} from '../../list_new/DemoHelpers/ItemActionsCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _itemActions = getItemActions();
    private _columns = Gadgets.getColumnsForColumnScroll();
    private _header = Gadgets.getHeaderForColumnScroll();
    private _expandedItems = [1];

    protected _beforeMount() {
        const data = Gadgets.getFlatData();
        const country = 'Соединенные Штаты Америки';
        data[2].country = `${country} ${country} ${country}`;

        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
