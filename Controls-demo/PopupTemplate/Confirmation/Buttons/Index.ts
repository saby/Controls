import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/PopupTemplate/Confirmation/Buttons/Template');
import 'css!Controls/popupConfirmation';

class ConfirmationTemplateDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _buttons1: unknown;
    protected _buttons2: unknown;

    protected _beforeMount(): void {
        this._buttons1 = [
            {
                caption: 'Да',
                buttonStyle: 'primary',
                value: true
            },
            {
                caption: 'Собрать без конвертацией',
                viewMode: 'link',
                fontColorStyle: 'unaccented',
                value: false
            }
        ];
        this._buttons2 = [
            {
                caption: 'Принять',
                buttonStyle: 'primary',
                value: true
            },
            {
                caption: 'Отклонить',
                value: false
            },
            {
                caption: 'Отмена',
                value: undefined
            }
        ];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ConfirmationTemplateDemo;
