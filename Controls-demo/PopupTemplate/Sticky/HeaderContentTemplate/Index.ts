import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/PopupTemplate/Sticky/HeaderContentTemplate/Index');

class CloseButtonVisibility extends Control {
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    static _theme: string[] = ['Controls/Classes'];
}
export default CloseButtonVisibility;
