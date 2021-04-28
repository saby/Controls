import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/EditInPlace/AddingItemInPosition/AddingItemInPosition';
import {HierarchicalMemory} from 'Types/source';
import {createGroupingSource} from 'Controls-demo/treeGridNew/Grouping/Source';
import { IColumn } from 'Controls/grid';
import {Model} from 'Types/entity';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[];
    protected _navigation: object;
    private _targetItemName: string = '';
    private _fakeKey: number = 123412;

    protected _beforeMount(): void {
        this._columns = [{
            displayProperty: 'title',
            width: ''
        }, {
            displayProperty: 'count',
            width: ''
        }];
        this._navigation = {
            source: 'position',
            view: 'infinity',
            sourceConfig: {
                limit: 20,
                field: 'key',
                position: 'key_0',
                direction: 'forward'
            },
            viewConfig: {
                pagingMode: 'basic'
            }
        };
        this._viewSource = createGroupingSource({
            count: 1000
        });
    }

    _beginAdd() {
        const targetKey = this._targetItemName === 'null' || this._targetItemName === '' ? null : this._targetItemName.replace('item', 'key');
        const targetItem = targetKey === null ? undefined : this._children.treeGrid.getItems().getRecordById(targetKey);
        const parentKey = targetItem ? targetItem.get('parent') : null;

        this._children.treeGrid.beginAdd({
            item: new Model({
                keyProperty: 'key',
                rawData: {
                    key: `${ ++this._fakeKey }`,
                    title: '',
                    count: 0,
                    group: 'group_1',
                    hasChildren: false,
                    parent: parentKey,
                    type: null
                }
            })
        }, targetItem);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
