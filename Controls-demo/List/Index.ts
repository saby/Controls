import {Control, TemplateFunction} from 'UI/Base';

import * as Template from 'wml!Controls-demo/List/List';
import 'css!Controls-demo/Controls-demo';

export default class ListDemo extends Control {
    protected _template: TemplateFunction = Template;
}
