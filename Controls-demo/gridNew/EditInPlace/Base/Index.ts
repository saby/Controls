import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/Base/Base';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { Ports } from 'Controls-demo/gridNew/DemoHelpers/Data/Ports';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Ports.getColumns();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Ports.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
