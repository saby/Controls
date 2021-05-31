import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Buttons/ButtonStyleFull/Template');

class ButtonStyle extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _buttonStyles: string[] = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'unaccented', 'default', 'pale'];
    protected _functionalButtons: object[] = [
        {
            buttonStyle: 'primary',
            iconStyle: 'contrast'
        },
        {
            buttonStyle: 'secondary',
            iconStyle: 'contrast'
        },
        {
            buttonStyle: 'success',
            iconStyle: 'contrast'
        },
        {
            buttonStyle: 'danger',
            iconStyle: 'contrast'
        },
        {
            buttonStyle: 'warning',
            iconStyle: 'contrast'
        },
        {
            buttonStyle: 'info',
            iconStyle: 'contrast'
        },
        {
            buttonStyle: 'unaccented',
            iconStyle: 'primary'
        },
        {
            buttonStyle: 'default',
            iconStyle: 'primary'
        },
        {
            buttonStyle: 'pale',
            iconStyle: 'primary'
        }];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default ButtonStyle;
