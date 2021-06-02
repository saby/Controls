import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/EmptyActions/EmptyActions';
import {Memory} from 'Types/source';
import 'wml!Controls-demo/gridNew/EditInPlace/EditingCell/_cellEditor';
import { IColumn } from 'Controls/grid';
import { Editing } from 'Controls-demo/gridNew/DemoHelpers/Data/Editing';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Editing.getEditingColumns();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Editing.getEditingData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
