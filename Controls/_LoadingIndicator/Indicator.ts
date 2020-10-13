import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls/_LoadingIndicator/Indicator');

export default class Indicator extends Control<IControlOptions> {
    _template: TemplateFunction = Template;
    protected _keydownHandler(event: Event): void {
        // Отмена закрытия окна по esc.
        event.preventDefault();
        event.stopPropagation();
    }
}
