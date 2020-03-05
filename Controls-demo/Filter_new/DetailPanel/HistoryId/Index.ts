import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Filter_new/DetailPanel/HistoryId/HistoryId';
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Filter_new/Filter';

export default class extends Control {
    protected _template: TemplateFunction = Template;
}
