import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';

import {getTasks} from '../../DemoHelpers/DataCatalog';

import * as Template from 'wml!Controls-demo/grid/Ladder/NoSticky/NoSticky';

interface INoStickyLadderColumn {
    template: string;
    width: string;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _viewSource: Memory;
    protected _columns: INoStickyLadderColumn[] = getTasks().getColumns();
    protected _ladderProperties: string[] = ['photo', 'date'];

    protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getTasks().getData()
        });
    }
}
