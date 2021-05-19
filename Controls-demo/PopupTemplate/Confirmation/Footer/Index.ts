import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/PopupTemplate/Confirmation/Footer/Footer');
import 'css!Controls/popupConfirmation';

class ConfirmationTemplateDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ConfirmationTemplateDemo;
