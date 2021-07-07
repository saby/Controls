import StringValueConverter = require('Controls/_input/DateTime/StringValueConverter');
import {Base as dateUtils} from 'Controls/dateUtils';
import ViewModel = require('Controls/_input/Mask/ViewModel');

// new Date, без указания года, использует по умолчанию 1900 год. В некоторых контроллах ввода даты
// можно задать только день и месяц. В некоторых случаях может быть необходимо выбрать 29 февраля.
// 1900 год високосным не является, поэтому валидатор такую дату не пропустит,
// поэтому испольуем близжающий к нему високосный 1904 год
const DEFAULT_YEAR_NUM = 1904;
const DEFAULT_YEAR_STR = '1904';

class ModuleClass extends ViewModel {
    protected handleInput(splitValue, inputType) {
        let _stringValueConverter = new StringValueConverter({replacer: this.options.replacer}),
            date,
            textLength;
        if (splitValue.insert.length > 1) {
            date = _stringValueConverter.getValueByString(splitValue.insert);
        }
        if (dateUtils.isValidDate(date) &&
            (this.options.mask.indexOf('Y') >= 0 && date.getFullYear() === DEFAULT_YEAR_NUM ?
                splitValue.insert.indexOf(DEFAULT_YEAR_STR) >= 0 : true)) {
            const dateValue = _stringValueConverter.getStringByValue(date, this.options.mask);
            const displayValue = dateValue;
            const hasChangedDisplayValue = this._displayValue !== displayValue;

            this._displayValue = displayValue;
            this._value = this._convertToValue(displayValue);
            textLength = displayValue.length;
            this._selection.start = textLength;
            this._selection.end = textLength;

            this._shouldBeChanged = true;

            return hasChangedDisplayValue;
        } else {
            return super.handleInput.apply(this, arguments);
        }
    }
}

export default ModuleClass;
