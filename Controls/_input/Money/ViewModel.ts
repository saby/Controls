import BaseViewModel = require('Controls/_input/Base/ViewModel');
import NumberViewModel = require('Controls/_input/Number/ViewModel');

import toString from 'Controls/Utils/Formatting/toString';
import {parse} from 'Controls/_input/Number/parse';
import {format} from 'Controls/_input/Number/format';
import {decimalSplitter} from 'Controls/_input/Number/constant';

class ViewModel extends BaseViewModel {
    protected _convertToValue(displayValue: string): string | number {
        let value: string | number = ViewModel.removeSpaces(displayValue);
        if (typeof this.value !== 'string') {
            value = parseFloat(value);

            return Number.isNaN(value) ? null : value;
        }

        return ViewModel.removeTrailingZeros(value);
    }

    protected _convertToDisplayValue(value: string | number): string {
        const displayValue = toString(value);

        return format(parse(displayValue), this._options, displayValue.length).value;
    }

    private static zeroFractionalPart: RegExp = new RegExp(`\\${decimalSplitter}?0*$`, 'g');

    private static removeSpaces(value: string): string {
        return value.replace(/\s/g, '');
    }

    private static removeTrailingZeros(value: string): string {
        return value.replace(ViewModel.zeroFractionalPart, '');
    }
}

ViewModel.prototype._getStartingPosition = NumberViewModel.prototype._getStartingPosition;
ViewModel.prototype.handleInput = NumberViewModel.prototype.handleInput;

export default ViewModel;
