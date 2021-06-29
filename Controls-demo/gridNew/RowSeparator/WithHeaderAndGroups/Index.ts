import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/RowSeparator/WithHeaderAndGroups/WithHeaderAndGroups';
import {Memory} from 'Types/source';
import {IColumn, IHeaderCell} from 'Controls/grid';
import { Tasks } from 'Controls-demo/gridNew/DemoHelpers/Data/Tasks';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Tasks.getDefaultColumns();
    protected _header: IHeaderCell[] = Tasks.getHeader();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Tasks.getData().slice(3)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
