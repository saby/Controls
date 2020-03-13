import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/PopupTemplate/Confirmation/Footer/Footer');
import 'css!Controls-demo/Controls-demo';

class ConfirmationTemplateDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes', 'Controls/popupConfirmation'];
}
export default ConfirmationTemplateDemo;
