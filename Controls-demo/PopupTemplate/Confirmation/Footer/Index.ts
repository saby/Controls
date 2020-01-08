import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/PopupTemplate/Confirmation/Footer/Footer');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls/popupConfirmation';

class ConfirmationTemplateDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];
}
export default ConfirmationTemplateDemo;