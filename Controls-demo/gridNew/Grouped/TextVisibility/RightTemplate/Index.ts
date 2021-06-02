import { Control, TemplateFunction } from 'UI/Base';
import { Memory } from 'Types/source';
import { IColumn } from 'Controls/grid';

import * as Template from 'wml!Controls-demo/gridNew/Grouped/TextVisibility/RightTemplate/RightTemplate';
import { Tasks } from 'Controls-demo/gridNew/DemoHelpers/Data/Tasks';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Tasks.getDefaultColumns().concat([
        {
            displayProperty: 'message',
            width: '200px',
            textOverflow: 'ellipsis'
        }
    ]);
    protected _radioSource: Memory;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Tasks.getData()
        });
        // displayProperty: 'caption',
        this._radioSource = new Memory({
            keyProperty: 'id',
            data: [{
                id: null,
                title: 'null'
            }, {
                id: 'left',
                title: 'left'
            }, {
                id: 'right',
                title: 'right'
            }]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
