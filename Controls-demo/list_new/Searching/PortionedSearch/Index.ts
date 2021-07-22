import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Searching/PortionedSearch/PortionedSearch';
import PortionedSearchMemory from './PortionedSearchMemory';
import {SyntheticEvent} from "UI/Vdom";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: PortionedSearchMemory = null;
    protected _filter: Object = null;
    protected _position: number = 0;

    protected _longLoad: boolean = false;
    protected _fastLoad: boolean = false;

    protected _beforeMount(): void {
        this._viewSource = new PortionedSearchMemory({keyProperty: 'key'});
        this._filter = {};
    }

    protected _longLoadChangedHandler(event: SyntheticEvent, newValue: boolean): void {
        this._viewSource.setLongLoad(newValue);
        this._fastLoad = false;
    }

    protected _fastLoadChangedHandler(event: SyntheticEvent, newValue: boolean): void {
        this._viewSource.setFastLoad(newValue);
        this._longLoad = false;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
