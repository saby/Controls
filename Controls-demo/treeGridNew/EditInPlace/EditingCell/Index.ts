import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/EditInPlace/EditingCell/EditingCell';
import * as ColumnTemplate from 'wml!Controls-demo/treeGridNew/EditInPlace/EditingCell/ColumnTemplate';
import {Memory} from 'Types/source';
import {IColumn} from 'Controls/grid';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _columns: IColumn[] = Flat.getColumns();

    protected _beforeMount(): void {
        this._columns = Flat.getColumns().map((c) => ({...c, template: ColumnTemplate}));
        this._columns[0].cellPadding = {left: 'S', right: 'S'};
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Flat.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
