import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Grouped/WithEditing/WithEditing';
import {Memory} from 'Types/source';
import 'wml!Controls-demo/gridNew/Grouped/WithEditing/_cellEditor';
import { IColumn } from 'Controls/grid';
import {Tasks} from "Controls-demo/gridNew/DemoHelpers/Data/Tasks";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Tasks.getDefaultWithEditingColumns();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Tasks.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
