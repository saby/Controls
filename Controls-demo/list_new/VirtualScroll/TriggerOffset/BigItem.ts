import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/VirtualScroll/TriggerOffset/BigItem';

export default class extends Control {
    protected _template: TemplateFunction = Template;

    protected _afterMount(): void {
        this._notify('itemRendered', [this._options.key]);
    }

    protected _beforeUnmount(): void {
        this._notify('itemUnmount', [this._options.key]);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
