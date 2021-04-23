import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/Expander/ExpanderPosition/Right/Right';
import {Memory, CrudEntityKey} from 'Types/source';
import {Gadgets} from '../../../DemoHelpers/DataCatalog';
import {IColumn} from 'Controls/gridOld';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Gadgets.getGridColumnsForFlat();
    protected _expandedItems: CrudEntityKey[] = [null];
    protected _collapsedItems: CrudEntityKey[] = [12];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getFlatData(),
            filter: (): boolean => true
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
