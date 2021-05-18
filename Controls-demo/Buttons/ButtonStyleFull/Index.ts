import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Buttons/ButtonStyleFull/Template');

class ButtonStyle extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _buttonStyles: string[] = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'unaccented', 'default', 'pale'];
    protected _toolButtonStyles: string[] = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'unaccented'];
    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default ButtonStyle;
