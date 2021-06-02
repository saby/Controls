import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/EditInPlace/AddInNode/AddInNode';
import * as ColumnTemplate from 'wml!Controls-demo/treeGridNew/EditInPlace/AddInNode/ColumnTemplate';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";
import {Model} from 'Types/entity';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _columns: IColumn[] = Flat.getColumns();
    private _markedKey: number;
    private _showAddButton: boolean = false;
    private _fakeKey: number = 101010;

    protected _beforeMount(): void {
        this._columns.forEach((c) => {
            c.template = ColumnTemplate
        });
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Flat.getData()
        });
    }

    protected _beginAdd(): void {
        this._children.tree.beginAdd({
            item: new Model({
                keyProperty: 'id',
                rawData: {
                    id: this._fakeKey++,
                    title: '',
                    country: '',
                    rating: '',
                    parent: this._markedKey,
                    type: null
                }
            })
        });
    }

    protected _onMarkedKeyChanged(e, key) {
        this._showAddButton = this._children.tree.getItems().getRecordById(key).get('type') !== null;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
