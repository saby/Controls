import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/ColumnScroll/WithItemActions/Inside/Inside';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';
import {getActionsForContacts as getItemActions} from '../../../../list_new/DemoHelpers/ItemActionsCatalog';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';
import { IItemAction } from 'Controls/itemActions';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemActions: IItemAction[] = getItemActions();
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths();
    protected _header: IHeaderCell[] = getCountriesStats().getDefaultHeader();

    protected _beforeMount(): void {
        const data = getCountriesStats().getData();
        // tslint:disable-next-line
        const country = data[2].country;
        // tslint:disable-next-line
        data[2].country = `${country} ${country} ${country} ${country} ${country} ${country}`;

        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
