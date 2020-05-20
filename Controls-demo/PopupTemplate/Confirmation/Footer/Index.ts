import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/PopupTemplate/Confirmation/Footer/Footer');

class ConfirmationTemplateDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes', 'Controls/popupConfirmation'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ConfirmationTemplateDemo;
