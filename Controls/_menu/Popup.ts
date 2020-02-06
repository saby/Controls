import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import PopupTemplate = require('wml!Controls/_menu/Popup/popupTemplate');

class Popup extends Control<IControlOptions> {
    protected _template: TemplateFunction = PopupTemplate;

    protected _sendResult(event, action, data): void {
        this._notify('sendResult', [action, data], {bubbling: true});
    }

    static _theme: string[] = ['Controls/menu'];
}

export default Popup;
