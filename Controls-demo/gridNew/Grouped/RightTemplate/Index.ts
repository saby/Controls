import { Control, TemplateFunction } from 'UI/Base';
import { Memory } from 'Types/source';
import { IColumn } from 'Controls/grid';

import * as Template from 'wml!Controls-demo/gridNew/Grouped/RightTemplate/RightTemplate';
import {Tasks} from "Controls-demo/gridNew/DemoHelpers/Data/Tasks";

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
    protected _separatorVisibility: boolean = true;

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
