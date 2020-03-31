import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Control/GroupProperty/Index');
import 'css!Controls-demo/Controls-demo';

class GroupPropertyDemo extends Control {
    protected _template: TemplateFunction = controlTemplate;
}
export default GroupPropertyDemo;
