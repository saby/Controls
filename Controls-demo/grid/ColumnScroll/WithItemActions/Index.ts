import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/ColumnScroll/WithItemActions/WithItemActions';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import {getActionsForContacts as getItemActions} from '../../../list_new/DemoHelpers/ItemActionsCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    private _viewSource: Memory;
    private _itemActions = getItemActions();
    private _columns = getCountriesStats().getColumnsWithWidths();
    private _header = getCountriesStats().getDefaultHeader();

    protected _beforeMount() {
        const data = getCountriesStats().getData();
        const country = data[2].country;
        data[2].country = `${country} ${country} ${country} ${country} ${country} ${country}`;

        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
    }
}
