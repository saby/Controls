import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import * as Template from 'wml!Controls-demo/grid/MarkerClassName/MarkerClassName';
import {IColumn} from 'Controls/_grid/interface/IColumn';
import {forShowWidths, getTasks} from '../DemoHelpers/DataCatalog';

interface INoStickyLadderColumn {
    template: string;
    width: string;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSourceImage: Memory;
    protected _viewSourceText: Memory;
    protected _columnsImage: INoStickyLadderColumn[] = getTasks().getColumns();
    protected _columnsText: IColumn[] = forShowWidths().getColumns1();
    protected _ladderProperties: string[] = ['photo', 'date'];

    protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
        this._viewSourceImage = new Memory({
            keyProperty: 'id',
            data: getTasks().getData()
        });

        this._viewSourceText = new Memory({
            keyProperty: 'id',
            data: forShowWidths().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
