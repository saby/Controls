import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/ItemPaddingNull/ItemPaddingNull';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: unknown = getCountriesStats().getColumnsWithWidths();
    protected _itemPadding = { top: 'null', bottom: 'null' };
    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
