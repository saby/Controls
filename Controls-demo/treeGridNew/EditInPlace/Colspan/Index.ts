import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/EditInPlace/Colspan/Colspan';
import * as ColumnTemplate from 'wml!Controls-demo/treeGridNew/EditInPlace/Colspan/ColumnTemplate';
import {Memory} from 'Types/source';
import {Gadgets} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import { TColspanCallbackResult } from 'Controls/display';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _columns: IColumn[] = Gadgets.getGridColumnsForFlat();

    protected _beforeMount(): void {
        this._columns[0].template = ColumnTemplate;
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
    }

    protected _colspanCallback(item, column, columnIndex, isEditing): TColspanCallbackResult {
        return isEditing ? 'end' : undefined;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
