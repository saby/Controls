import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/PopupTemplate/Sticky/FooterContentTemplate/Index');

class BodyContentTemplate extends Control {
    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/PopupTemplate/Sticky/Sticky', 'Controls-demo/Controls-demo'];
}
export default BodyContentTemplate;
