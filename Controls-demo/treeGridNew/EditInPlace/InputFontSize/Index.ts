import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/EditInPlace/InputFontSize/InputFontSize';
import {HierarchicalMemory} from 'Types/source';
import * as TitleCellTemplate from 'wml!Controls-demo/treeGridNew/EditInPlace/InputFontSize/ColumnTemplate/Title';
import * as CountryCellTemplate from 'wml!Controls-demo/treeGridNew/EditInPlace/InputFontSize/ColumnTemplate/Country';
import { IColumn } from 'Controls/grid';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    private _columns: IColumn[] = Flat.getColumns();

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'key',
            data: Flat.getData(),
            parentProperty: 'parent'
        });
        this._columns[0].template = TitleCellTemplate;
        // tslint:disable-next-line
        this._columns[2].template = CountryCellTemplate;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
