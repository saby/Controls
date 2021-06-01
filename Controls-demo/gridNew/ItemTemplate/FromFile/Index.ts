import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/ItemTemplate/FromFile/FromFile';
import * as ItemTemplate from 'wml!Controls-demo/gridNew/ItemTemplate/FromFile/ItemTemplate';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _itemTemplate: TemplateFunction = ItemTemplate;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithFixedWidths();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: getCountriesStats().getData().slice(0, 5)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
