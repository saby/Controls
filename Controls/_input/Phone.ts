import {default as Base, IBaseInputOptions} from 'Controls/_input/Base';
import * as ViewModel from 'Controls/_input/Phone/ViewModel';

/**
 * Поле ввода телефона.
 * @remark
 * В зависимости от введенных символов формат номера телефона изменяется.
 * Если вы хотите, чтобы поле телефона не меняло формат, используйте {@link Controls/_input/Mask маску}. Например, поле для ввода мобильного телефона или дома.
 *
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/input/phone/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_input.less переменные тем оформления}
 * * {@link http://axure.tensor.ru/standarts/v7/%D0%BF%D0%BE%D0%BB%D0%B5_%D0%B2%D0%B2%D0%BE%D0%B4%D0%B0__%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D1%8F_03_.html стандарт}
 *
 * @class Controls/_input/Phone
 * @extends Controls/_input/Base
 *
 * @public
 * @demo Controls-demo/Input/Phone/Index
 *
 * @author Красильников А.С.
 */

/*
 * A component for entering a phone number. Depending on the characters you enter, the phone number format changes.
 * This behavior is described in the {@link http://axure.tensor.ru/standarts/v7/%D0%BF%D0%BE%D0%BB%D0%B5_%D0%B2%D0%B2%D0%BE%D0%B4%D0%B0__%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D1%8F_03_.html standard}.
 * @remark
 * If you want the phone field without changing the format, you should use the
 * {@link Controls/_input/Mask mask) control. For example, a field to enter a mobile phone or home.
 *
 * @class Controls/_input/Phone
 * @extends Controls/_input/Base
 *
 * @public
 * @demo Controls-demo/Input/Phone/Index
 *
 * @author Красильников А.С.
 */
class Phone extends Base {
    protected _defaultValue: string = '';
    protected _inputMode: string = 'tel';
    protected _controlName: string = 'Phone';
    protected _getViewModelConstructor(): ViewModel {
        return ViewModel;
    }

    protected _focusInHandler(): void {
        if (this.isMoveCarriage()) {
            this._viewModel.moveCarriageToEnd();
        }
        super._focusInHandler.apply(this, arguments);
    }

    private isMoveCarriage(): boolean {
        const model = this._viewModel;
        const hasSelection = model.selection.start !== model.selection.end;

        /**
         * If the focus is not obtained with a mouse click, the user did not select anything and
         * you do not need to select a value and the mask is not completely filled,
         * then you need to move the cursor to the end.
         */
        return !this._focusByMouseDown && !hasSelection && !model.isFilled() && !this._options.selectOnClick;
    }

    static getDefaultOptions(): object {
        return Base.getDefaultOptions();
    }
}

export default Phone;
