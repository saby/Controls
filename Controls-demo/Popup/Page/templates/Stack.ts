import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Popup/Page/templates/Stack';
import 'css!Controls-demo/Popup/Page/templates/Stack';

interface IStackOptions extends IControlOptions {
    prefetchResult: Record<string, any>;
}

export default class Stack extends Control<IStackOptions> {
    protected _template: TemplateFunction = Template;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
