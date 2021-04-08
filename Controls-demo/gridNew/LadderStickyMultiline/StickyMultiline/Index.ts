import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';

import {getMultilineLadder} from '../../DemoHelpers/DataCatalog';

import * as Template from 'wml!Controls-demo/gridNew/LadderStickyMultiline/StickyMultiline/StickyMultiline';

interface IStickyLadderColumn {
    template: string;
    width: string;
    stickyProperty?: string | string[];
    resultTemplate?: TemplateFunction;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IStickyLadderColumn[] = getMultilineLadder().getColumns();
    protected _ladderProperties: string[] = ['date', 'time'];

    protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getMultilineLadder().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
