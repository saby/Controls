import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/PopupTemplate/Sticky/FooterContentTemplate/Index');
import 'css!Controls-demo/PopupTemplate/Sticky/Sticky';
import 'css!Controls-demo/Controls-demo';

class BodyContentTemplate extends Control {
    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];
}
export default BodyContentTemplate;
