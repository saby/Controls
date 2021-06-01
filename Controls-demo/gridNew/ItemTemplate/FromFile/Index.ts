import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/ItemTemplate/FromFile/FromFile';
import * as ItemTemplate from 'wml!Controls-demo/gridNew/ItemTemplate/FromFile/ItemTemplate';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {Countries} from "Controls-demo/gridNew/DemoHelpers/Data/Countries";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _itemTemplate: TemplateFunction = ItemTemplate;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Countries.getColumnsWithFixedWidths();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Countries.getData().slice(0, 5)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
