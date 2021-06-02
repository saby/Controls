import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';

import * as Template from 'wml!Controls-demo/gridNew/Ladder/NoSticky/NoSticky';
import { Tasks } from 'Controls-demo/gridNew/DemoHelpers/Data/Tasks';

interface INoStickyLadderColumn {
    template: string;
    width: string;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: INoStickyLadderColumn[] = Tasks.getColumns();
    protected _ladderProperties: string[] = ['photo', 'date'];

    protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Tasks.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
