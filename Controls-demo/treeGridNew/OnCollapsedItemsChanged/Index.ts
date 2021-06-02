import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/OnCollapsedItemsChanged/OnCollapsedItemsChanged';
import {HierarchicalMemory, CrudEntityKey} from 'Types/source';
import {IColumn} from 'Controls/grid';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Events} from '../DemoHelpers/Data/Events';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[] = Events.getColumns();
    protected _expandedItems: CrudEntityKey[] = [null];
    protected _collapsedItems: CrudEntityKey[];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            data: Events.getDataCollapsedItemsChanged(),
            parentProperty: 'parent',
            filter: (): boolean => true
        });
    }

    protected _onCollapsedItemsChanged(event: SyntheticEvent, collapsedItems: CrudEntityKey[]): void {
        const allowedToCollapseItemKeys: CrudEntityKey[] = [];
        collapsedItems.forEach((itemKey) => {
            if (itemKey === 1) {
                return;
            }
            allowedToCollapseItemKeys.push(itemKey);
        });
        this._collapsedItems = allowedToCollapseItemKeys;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
