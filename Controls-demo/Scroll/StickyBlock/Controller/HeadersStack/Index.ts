import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/StickyBlock/Controller/HeadersStack/Template');
import 'css!Controls-demo/Controls-demo';

export default class HeadersStack1 extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _hideHeader1: boolean = false;
    protected _hideHeader2: boolean = true;

    protected _afterMount(options?: IControlOptions, contexts?: any): void {
        this._children.container.scrollToBottom();
    }

    protected _onClick1(): void {
        this._hideHeader1 = !this._hideHeader1;
    }

    protected _onClick2(): void {
        this._hideHeader2 = !this._hideHeader2;
    }
}
