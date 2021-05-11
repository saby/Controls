import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as coreMerge from 'Core/core-merge';
import { SyntheticEvent } from 'UICommon/Events';
import StringValueConverter from 'Controls/_input/DateTime/StringValueConverter';
import IDateTimeMask from 'Controls/_input/interface/IDateTimeMask';
import {EventUtils} from 'UI/Events';
import {Popup as PopupUtil} from 'Controls/dateUtils';
import 'css!Controls/input';
import 'css!Controls/CommonClasses';

import template = require('wml!Controls/_input/Date/Picker/Picker');

/**
 * Поле ввода даты. Поддерживает как ввод с клавиатуры, так и выбор даты из всплывающего календаря с помощью мыши. Не поддерживает ввод времени.
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_input.less переменные тем оформления input}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_datePicker.less переменные тем оформления dateRange}
 *
 * @class Controls/_input/Date/Picker
 * @extends UI/Base:Control
 * @mixes Controls/input:IInputDateTime
 * @mixes Controls/interface:IDateMask
 * @mixes Controls/interface:IInputTag
 * @mixes Controls/input:IBorderVisibility
 * 
 * @mixes Controls/dateRange:IDatePickerSelectors
 * @mixes Controls/dateRange:IDateRangeSelectable
 * @mixes Controls/input:IBase
 * @mixes Controls/input:IValueValidators
 * @mixes Controls/interface:IOpenPopup
 * @mixes Controls/input:IInputDisplayValueValidators
 *
 * @public
 * @demo Controls-demo/Input/Date/Picker
 * @author Красильников А.С.
 */

class Picker extends Control<IControlOptions> {
    _template: TemplateFunction = template;
    _proxyEvent: Function = EventUtils.tmplNotify;
    _shouldValidate: boolean = false;
    private _state: string;

    protected _beforeMount(): void {
        this._stateChangedCallback = this._stateChangedCallback.bind(this);
    }

    openPopup(event: SyntheticEvent<MouseEvent>): void {
        let value;
        // Если передать null в datePopup в качестве начала и конца периода, то он выделит
        // период от -бесконечности до +бесконечности.
        // В режиме выбора одного дня мы не должны выбирать ни один день.
        if (this._options.value === null) {
            value = undefined;
        } else {
            value = this._options.value;
        }
        const cfg = {
            ...PopupUtil.getCommonOptions(this),
            target: this._container,
            template: 'Controls/datePopup',
            className: 'controls-PeriodDialog__picker',
            templateOptions: {
                ...PopupUtil.getTemplateOptions(this),
                startValue: value,
                endValue: value,
                selectionType: 'single',
                calendarSource: this._options.calendarSource,
                dayTemplate: this._options.dayTemplate,
                headerType: 'input',
                closeButtonEnabled: true,
                ranges: this._options.ranges,
                startValueValidators: this._options.valueValidators,
                state: this._state,
                stateChangedCallback: this._stateChangedCallback
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

    protected _stateChangedCallback(state: string): void {
        this._state = state;
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
        this._children.opener?.close();
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
}

Object.defineProperty(Picker, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Picker.getDefaultOptions();
   }
});

export default Picker;
