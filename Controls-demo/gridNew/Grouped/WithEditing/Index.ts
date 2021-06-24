import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Grouped/WithEditing/WithEditing';
import {Memory} from 'Types/source';
import {getTasks} from '../../DemoHelpers/DataCatalog';
import 'wml!Controls-demo/gridNew/Grouped/WithEditing/_cellEditor';
import { IColumn } from 'Controls/grid';

interface IItem {
    get: (item: string) => string;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = getTasks().getDefaultWithEditingColumns();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getTasks().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
