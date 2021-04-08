import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/ColumnScroll/WithGroups/WithGroups';
import {Memory} from 'Types/source';
import {getTasks} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _separatorVisibility: boolean = false;
    protected _columns: IColumn[] = [
        ...getTasks().getDefaultColumns(),
        {
            displayProperty: 'message',
            width: '150px'
        },
        {
            displayProperty: 'fullName',
            width: '150px'
        }
    ];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getTasks().getData()
        });
    }

    protected _onToggleSeparatorVisibility(): void {
        this._separatorVisibility = !this._separatorVisibility;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
