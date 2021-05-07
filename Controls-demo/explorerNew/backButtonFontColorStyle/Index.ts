import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/explorerNew/backButtonFontColorStyle/backButtonFontColorStyle';
import {Gadgets} from '../DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/explorerNew/ExplorerMemory';
import { TRoot } from 'Controls-demo/types';
import { IColumn } from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: MemorySource;
    protected _columns: IColumn[] = Gadgets.getColumns();
    protected _root: TRoot = 1;

    protected _beforeMount(): void {
        this._viewSource = new MemorySource({
            keyProperty: 'id',
            data: Gadgets.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
