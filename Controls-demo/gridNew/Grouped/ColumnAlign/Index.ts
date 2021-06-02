import { Control, TemplateFunction } from 'UI/Base';
import { Memory } from 'Types/source';
import { IColumn } from 'Controls/grid';

import * as Template from 'wml!Controls-demo/gridNew/Grouped/ColumnAlign/ColumnAlign';
import {Tasks} from "Controls-demo/gridNew/DemoHelpers/Data/Tasks";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = [
        {
            displayProperty: 'id',
            align: 'right',
            width: '30px'
        },
        {
            displayProperty: 'state',
            align: 'left',
            width: '200px'
        },
        {
            displayProperty: 'date',
            align: 'right',
            width: '100px'
        },
        {
            displayProperty: 'message',
            align: 'right',
            width: '200px',
            textOverflow: 'ellipsis'
        }
    ];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Tasks.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
