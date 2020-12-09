import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as coreMerge from 'Core/core-merge';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as StringValueConverter from 'Controls/_input/DateTime/StringValueConverter';
import IDateTimeMask from 'Controls/_input/interface/IDateTimeMask';
import {EventUtils} from 'UI/Events';
import {Popup as PopupUtil} from 'Controls/dateUtils';

import template = require('wml!Controls/_input/Date/Picker/Picker');

/**
 * Поле ввода даты. Поддерживает как ввод с клавиатуры, так и выбор даты из всплывающего календаря с помощью мыши. Не поддерживает ввод времени.
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_input.less">переменные тем оформления input</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_datePicker.less">переменные тем оформления dateRange</a>
 *
 * @class Controls/_input/Date/Picker
 * @extends Core/Control
 * @mixes Controls/interface/IInputDateTime
 * @mixes Controls/_interface/IDateMask
 * @mixes Controls/interface/IInputTag
 * @mixes Controls/_dateRange/interfaces/IDatePickerSelectors
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/interface/IInputPlaceholder
 * @mixes Controls/_input/interface/IValueValidators
 * @mixes Controls/_interface/IOpenPopup
 *
 * @public
 * @demo Controls-demo/Input/Date/Picker
 * @author Красильников А.С.
 */

class Picker extends Control<IControlOptions> {
    _template: TemplateFunction = template;
    _proxyEvent: Function = EventUtils.tmplNotify;
    _shouldValidate: boolean = false;

    openPopup(event: SyntheticEvent<MouseEvent>): void {
        const cfg = {
            ...PopupUtil.getCommonOptions(this),
            target: this._container,
            template: 'Controls/datePopup',
            className: 'controls-PeriodDialog__picker_theme-' + this._options.theme,
            templateOptions: {
                ...PopupUtil.getTemplateOptions(this),
                selectionType: 'single',
                calendarSource: this._options.calendarSource,
                dayTemplate: this._options.dayTemplate,
                headerType: 'input',
                closeButtonEnabled: true,
                range: this._options.range,
                startValueValidators: this._options.valueValidators
            }
        };
        this._children.opener.open(cfg);
    }

    _afterUpdate(): void {
        if (this._shouldValidate) {
            this._shouldValidate = false;
            this._children.input.validate();
        }
    }

    _onResultWS3(event: Event, startValue: Date): void {
        this._onResult(startValue);
    }

    _onResult(startValue: Date): void {
        const stringValueConverter = new StringValueConverter({
                mask: this._options.mask,
                replacer: this._options.replacer,
                dateConstructor: this._options.dateConstructor
            });
        const textValue = stringValueConverter.getStringByValue(startValue);
        this._notify('valueChanged', [startValue, textValue]);
        this._children.opener.close();
        this._notify('inputCompleted', [startValue, textValue]);
        /**
         * Вызываем валидацию, т.к. при выборе периода из календаря не вызывается событие valueChanged
         * Валидация срабатывает раньше, чем значение меняется, поэтому откладываем ее до _afterUpdate
         */
        this._shouldValidate = true;
    }

    static getDefaultOptions(): object {
        return {
            ...IDateTimeMask.getDefaultOptions(),
            valueValidators: []
        };
    }

    static getOptionTypes(): object {
        return coreMerge({}, IDateTimeMask.getOptionTypes());
    }

    static _theme: string[] = ['Controls/Classes', 'Controls/input'];
}

export default Picker;
