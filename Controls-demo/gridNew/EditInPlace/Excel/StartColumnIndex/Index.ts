import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/Excel/StartColumnIndex/StartColumnIndex';
import {Excel} from 'Controls-demo/gridNew/DemoHelpers/Data/Excel';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {editing} from 'Controls/list';
import {TColumns, View as Grid} from 'Controls/grid';

const NOT_EDITABLE_COLUMN_INDEX = 0;

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _children: {
        grid: Grid
    };

    private _columns: TColumns = Excel.getColumns();
    private _viewSource: Memory = new Memory({
        keyProperty: 'key',
        data: Excel.getData()
    });

    _onBeforeBeginEdit(options: { item?: Model }, item: Model, isAdd: boolean, columnIndex: number): typeof editing.CANCEL | void {
        if (columnIndex === NOT_EDITABLE_COLUMN_INDEX) {
            return editing.CANCEL;
        }
    }

    _addRecord(): void {
        this._children.grid.beginAdd({columnIndex: 3});
    }

    _beginEdit(): void {
        this._children.grid.beginEdit({
            item: this._children.grid.getItems().at(1),
            columnIndex: 2
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
