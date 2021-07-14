import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Popup/Page/templates/ScrollableWidget';
import 'css!Controls-demo/Popup/Page/templates/ScrollableWidget';

interface IStackOptions extends IControlOptions {
    prefetchResult: Record<string, any>;
}

export default class ScrollableWidget extends Control<IStackOptions> {
    protected _template: TemplateFunction = Template;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
