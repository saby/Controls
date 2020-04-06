import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/list_new/VirtualScroll/Resize/Element/ExpandingElement';

export default class ExpandingElement extends Control {
    protected _template: TemplateFunction = template;
    protected _isBig: boolean = false;

    protected _afterMount(): void {
        setTimeout(() => {
            this._isBig = true;
        }, 3000);
    }
}
