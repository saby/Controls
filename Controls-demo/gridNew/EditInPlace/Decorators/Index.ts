import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/Decorators/Decorators';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';
import {DecoratedEditing} from "Controls-demo/gridNew/DemoHelpers/Data/DecoratedEditing";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeaderCell[] = DecoratedEditing.getDecoratedEditingHeader();
    protected _columns: IColumn[] = DecoratedEditing.getDecoratedEditingColumns();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: DecoratedEditing.getDecoratedEditingData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
