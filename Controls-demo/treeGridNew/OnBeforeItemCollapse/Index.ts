import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/OnBeforeItemCollapse/OnBeforeItemCollapse';
import {HierarchicalMemory, CrudEntityKey} from 'Types/source';
import {Model} from 'Types/entity';
import {IColumn} from 'Controls/grid';
import {SyntheticEvent} from 'Vdom/Vdom';
import {eventsData} from '../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[] = eventsData.getColumns();
    protected _expandedItems: CrudEntityKey[] = [1, 2];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            data: eventsData.getDataBeforeCollapsed(),
            parentProperty: 'parent',
            filter: (): boolean => true
        });
    }

    protected _onBeforeItemCollapse(event: SyntheticEvent, item: Model): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
