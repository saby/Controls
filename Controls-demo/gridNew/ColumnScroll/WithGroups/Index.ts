import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/ColumnScroll/WithGroups/WithGroups';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { Tasks } from 'Controls-demo/gridNew/DemoHelpers/Data/Tasks';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _separatorVisibility: boolean = false;
    protected _columns: IColumn[] = [
        ...Tasks.getDefaultColumns(),
        {
            displayProperty: 'message',
            width: '150px'
        },
        {
            displayProperty: 'fullName',
            width: '150px'
        }
    ];
    protected _header = this._columns.map((c) => ({caption: c.displayProperty}));

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Tasks.getData()
        });
    }

    protected _onToggleSeparatorVisibility(): void {
        this._separatorVisibility = !this._separatorVisibility;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
