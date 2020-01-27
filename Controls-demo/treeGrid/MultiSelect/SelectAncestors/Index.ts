import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/MultiSelect/SelectAncestors/SelectAncestors';
import 'css!Controls-demo/Controls-demo';

export default class extends Control {
    protected _template: TemplateFunction = Template;
}
