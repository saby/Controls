import StringValueConverter = require('Controls/_input/DateTime/StringValueConverter');
import dateUtils = require('Controls/Utils/Date');
import ViewModel = require('Controls/_input/Mask/ViewModel');

class ModuleClass extends ViewModel {
    protected handleInput(splitValue, inputType) {
        let _stringValueConverter = new StringValueConverter({replacer: this.options.replacer}),
            date,
            textLength;
        if (splitValue.insert.length > 1) {
            date = _stringValueConverter.getValueByString(splitValue.insert);
        }
        if (dateUtils.isValidDate(date)) {
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
