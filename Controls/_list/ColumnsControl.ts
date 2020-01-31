import ListControl = require('Controls/_list/ListControl');
import {TemplateFunction} from 'UI/Base';
import ListControlTpl = require('wml!Controls/_list/ColumnsControl');

export default class ColumnsControl extends ListControl {
    protected _template: TemplateFunction = ListControlTpl;
}
