import Container from 'Controls/_validate/Container';
import {TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_validate/InputContainer');

/**
 * Контрол, регулирующий валидацию своего контента. Используется с контролами, поддерживающими интерфейс {@link Controls/interface/IInputField IInputField}.
 * Валидация запускается автоматически при потере фокуса.
 * @remark
 * Подробнее о работе с валидацией читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/forms-and-validation/validation/ здесь}.
 * @class Controls/_validate/InputContainer
 * @extends Controls/_validate/Container
 * @control
 * @public
 * @author Красильников А.С.
 */

class Input extends Container {
    _template: TemplateFunction = template;
    _shouldValidate: boolean;
    protected _deactivatedHandler() {
        if (!this._options.readOnly) {
            this._shouldValidate = true;
            this._forceUpdate();
        }
    }
    _inputCompletedHandler(event: Event, ...rest: any): void {
        this._notify('inputCompleted', rest);
        // Because of this error:
        // https://online.sbis.ru/opendoc.html?guid=ef52bfb5-56ea-4397-a77f-89e5c3413ed9
        // we need to stop event propagation, otherwise all subscribtions to inputComplete-event of
        // this control will be called twice
        event.stopPropagation();
    }
    _afterUpdate(oldOptions): void {
        if (this._shouldValidate || this._options.value !== oldOptions.value) {
            this._shouldValidate = false;
            this.validate();
        }
    }
}
export default Input;
