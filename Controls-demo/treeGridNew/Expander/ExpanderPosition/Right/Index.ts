import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/Expander/ExpanderPosition/Right/Right';
import {Memory} from 'Types/source';
import {Gadgets} from '../../../DemoHelpers/DataCatalog';
import {IColumn} from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Gadgets.getGridColumnsForFlat();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
