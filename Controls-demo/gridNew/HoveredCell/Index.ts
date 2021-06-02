import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/HoveredCell/HoveredCell';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _hoveredCell: string = 'null';
    protected _columns: IColumn[] = Countries.getColumnsWithFixedWidths();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Countries.getData().slice(0, 5)
        });
    }

    protected _hoveredCellChanged(_: SyntheticEvent, item: Model, __: number, cell: number): void {
        this._hoveredCell = item ? ('key: ' + item.getKey() + '; cell: ' + cell) : 'null';
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
