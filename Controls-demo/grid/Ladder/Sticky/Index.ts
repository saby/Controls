import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Collection} from 'Controls/display';
import {Record} from 'Types/entity';

import {getTasks} from '../../DemoHelpers/DataCatalog';

import * as Template from 'wml!Controls-demo/grid/Ladder/Sticky/Sticky';
import * as ResultsTpl from 'wml!Controls-demo/grid/Ladder/Sticky/ResultsCell';

import {ListItems} from 'Controls/dragnDrop';

interface IStickyLadderColumn {
    template: string;
    width: string;
    stickyProperty?: string;
    resultTemplate?: TemplateFunction;
}
interface IStickyLadderHeader {
    title?: string;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _viewSource: Memory;
    protected _columns: IStickyLadderColumn[] = getTasks().getColumns();
    protected _ladderProperties: string[] = ['photo', 'date'];
    protected _selectedKeys: number[] = [];
    protected _header: IStickyLadderHeader[] = [{}, { title: 'description' }, { title: 'state' }];

    protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getTasks().getData()
        });
        this._columns[0].stickyProperty = 'photo';
        this._columns[1].resultTemplate = ResultsTpl;
        this._columns[2].stickyProperty = 'date';
    }

    protected _dragStart(_: SyntheticEvent, items: string[]): ListItems {
        return new ListItems({
            items
        });
    }

    protected _dragEnd(_: SyntheticEvent, entity: Collection<Record>, target: any, position: any): void {
        this._children.listMover.moveItems(entity.getItems(), target, position);
    }
}
