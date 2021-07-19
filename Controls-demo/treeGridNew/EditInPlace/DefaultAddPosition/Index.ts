import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/EditInPlace/DefaultAddPosition/DefaultAddPosition';
import * as ColumnTemplate from 'wml!Controls-demo/treeGridNew/EditInPlace/DefaultAddPosition/ColumnTemplate';
import {Memory} from 'Types/source';
import {IColumn} from 'Controls/grid';
import {Flat} from 'Controls-demo/treeGridNew/DemoHelpers/Data/Flat';
import {Model} from 'Types/entity';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _columns: IColumn[] = Flat.getColumns();
    private _addingItemKey: number = 101010;

    protected _beforeMount(): void {
        this._columns.forEach((c) => {
            c.template = ColumnTemplate;
        });
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Flat.getData()
        });
    }

    protected _beginAdd(): void {
        this._children.tree.beginAdd({
            item: new Model({
                keyProperty: 'key',
                rawData: {
                    id: this._addingItemKey++,
                    title: '',
                    country: '',
                    rating: '',
                    parent: this._children.tree.getDefaultAddParentKey(),
                    type: null
                }
            })
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
