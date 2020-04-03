import {default as ListControl} from 'Controls/_list/ListControl';
import {TemplateFunction} from 'UI/Base';
import ListControlTpl = require('wml!Controls/_list/ColumnsControl');
import {SyntheticEvent} from "sbis3-ws/Vdom/Vdom";

export default class ColumnsControl extends ListControl {
    protected _template: TemplateFunction = ListControlTpl;
    private _keyDownHandler: Function;
    protected _afterMount(): void {
        this._keyDownHandler = this.keyDownHandler.bind(this);
    }
    protected keyDownHandler(e: SyntheticEvent<KeyboardEvent>): boolean {
        return this._children.innerView.keyDownHandler.call(this._children.innerView, e);
    }
}
