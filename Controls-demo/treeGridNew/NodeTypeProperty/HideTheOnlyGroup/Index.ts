import {Control, TemplateFunction} from 'UI/Base';
import {RecordSet} from 'Types/collection';
import {Guid, Model} from 'Types/entity';
import {CrudEntityKey, Memory} from 'Types/source';
import {TColspanCallbackResult} from 'Controls/grid';
import {IGroupNodeColumn} from 'Controls/treeGrid';

import {data} from '../data/NodeTypePropertyData';

import * as Template from 'wml!Controls-demo/treeGridNew/NodeTypeProperty/HideTheOnlyGroup/HideTheOnlyGroup';
import * as PriceColumnTemplate from 'wml!Controls-demo/treeGridNew/NodeTypeProperty/resources/PriceColumnTemplate';

const columns: IGroupNodeColumn[] = [
    {
        displayProperty: 'title',
        width: '300px',
        groupNodeConfig: {
            textAlign: 'center'
        }
    },
    {
        displayProperty: 'count',
        width: '100px',
        align: 'right'
    },
    {
        displayProperty: 'price',
        width: '100px',
        align: 'right',
        template: PriceColumnTemplate
    }
];

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _expandedItems: CrudEntityKey[] = [1];
    protected _collapsedItems: CrudEntityKey[] = undefined;
    protected _columns: IGroupNodeColumn[] = columns;
    protected _items: RecordSet;
    protected _dataLoadCallback: (items: RecordSet) => void;

    protected _beforeMount(): void {
        this._dataLoadCallback = this.__dataLoadCallback.bind(this);
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: data.slice(0, 4),
            filter: (): boolean => true
        });
    }

    protected __dataLoadCallback(items: RecordSet): void {
        this._items = items;
        this._updateMetaData();
    }

    protected _colspanCallback(item: Model, column: IGroupNodeColumn, columnIndex: number, isEditing: boolean): TColspanCallbackResult {
        if (typeof item === 'string' || item.get('nodeType') === 'group') {
            return 'end';
        }
        return 1;
    }

    private _updateMetaData(): void {
        this._items.setMetaData({
            ...this._items.getMetaData(),
            singleGroupNode: this._isSingleGroupNode()
        });
    }

    private _isSingleGroupNode(): boolean {
        let count = 0;
        this._items.each((item) => {
            if (item.get('nodeType') === 'group') {
                count++;
            }
        });
        return count === 1;
    }

    protected _reloadWithTwoGroups(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: data.slice(0, 7),
            filter: (): boolean => true
        });
        this._expandedItems = [1, 2];
        this._children.treeGrid.reload();
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
