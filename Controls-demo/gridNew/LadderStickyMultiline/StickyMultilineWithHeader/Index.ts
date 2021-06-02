import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';

import * as Template from 'wml!Controls-demo/gridNew/LadderStickyMultiline/StickyMultilineWithHeader/StickyMultilineWithHeader';
import { IHeaderCell } from 'Controls/grid';
import { MultilineLadder } from 'Controls-demo/gridNew/DemoHelpers/Data/MultilineLadder';

interface IStickyLadderColumn {
    template: string;
    width: string;
    stickyProperty?: string | string[];
    resultTemplate?: TemplateFunction;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IStickyLadderColumn[] = MultilineLadder.getColumns();
    protected _header: IHeaderCell[] = MultilineLadder.getHeader();
    protected _ladderProperties: string[] = ['date', 'time'];

    protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: MultilineLadder.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
