import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/Ladder/Sticky/Sticky"
import * as ResultsTpl from "wml!Controls-demo/grid/Ladder/Sticky/ResultsCell"
import {Memory} from "Types/source"
import {getTasks} from "../../DemoHelpers/DataCatalog"

import 'css!Controls-demo/Controls-demo'

import {ListItems} from 'Controls/dragnDrop';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns = getTasks().getColumns();
    protected _ladderProperties = ['photo', 'date'];
    protected _selectedKeys = [];
    protected _header = [{}, { title: 'description' }, { title: 'state' }];

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getTasks().getData()
        });
        this._columns[0].stickyProperty = 'photo';
        this._columns[1].resultTemplate = ResultsTpl;
        this._columns[2].stickyProperty = 'date';
    }

    protected _dragStart(_, items) {
        return new ListItems({
            items
        });
    }

    protected _dragEnd(_, entity, target, position) {
        this._children.listMover.moveItems(entity.getItems(), target, position);
    }
}
