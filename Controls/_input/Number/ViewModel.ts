import BaseViewModel from '../BaseViewModel';
import {decimalSplitter, decimalSplitters} from 'Controls/_input/Number/constant';
import {format} from 'Controls/_input/Number/format';
import {parse, IParsedNumber} from 'Controls/_input/Number/parse';
import {InputType, ISplitValue} from '../resources/Types';
import {IText, paste, replaceWithRepositioning, concatTriads, toString} from 'Controls/decorator';

interface IViewModelOptions {
    useGrouping: boolean;
    onlyPositive: boolean;
    showEmptyDecimals: boolean;
    useAdditionToMaxPrecision: boolean;
    precision?: number;
    integersLength?: number;
}

class ViewModel extends BaseViewModel<string | number, IViewModelOptions> {
    protected _optionsThatAffectDisplayValue: Array<keyof IViewModelOptions> = ['useGrouping', 'useAdditionToMaxPrecision'];

    protected _getStartingPosition(): number {
        /**
         * Каретка должна быть в конце целой части.
         */
        return `${this.displayValue}${decimalSplitter}`.indexOf(decimalSplitter);
    }

    protected _convertToDisplayValue(value: string | number | null): string {
        const displayValue = toString(value);

        if (displayValue === '') {
            return displayValue;
        }

        const parsedNumber: IParsedNumber = parse(displayValue, this._options);
        return format(parsedNumber, this._options, displayValue.length).value;
    }

    protected _convertToValue(displayValue: string): string | number {
        /**
         * The displayed value can be separated by spaces into triads.
         * You need to remove these gaps to parseFloat processed value completely.
         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseFloat
         */
        const value: string = concatTriads(displayValue);

        if (typeof this.value === 'string') {
            return value;
        } else {
            const floatValue: number = parseFloat(value);
            return Number.isNaN(floatValue) ? null : floatValue;
        }
    }

    protected _createText(splitValue: ISplitValue, inputType: InputType): IText {
        if (ViewModel._isEnteredSplitter(splitValue)) {
            const text: IText = {
                value: splitValue.before + splitValue.after,
                carriagePosition: splitValue.before.length
            };
            if (this._displayValue.includes(decimalSplitter)) {
                const splitterPosition: number = text.value.indexOf(decimalSplitter);

                if (splitterPosition !== -1) {
                    text.carriagePosition = splitterPosition + 1;
                }
            } else if (this._options.precision !== 0) {
                text.value = this._displayValue === '' ? '0.0' : this._displayValue + '.0';
                text.carriagePosition = text.value.length - 1;
            }

            return text;
        }

        ViewModel._handleRemovalLiteral(splitValue, inputType);
        const text: IText = ViewModel._recoverText(splitValue);

        if (inputType === 'insert') {
            const parsedNumber: IParsedNumber = parse(splitValue.insert, this._options);

            if (parsedNumber.negative && text.value[0] !== '-') {
                text.carriagePosition++;
                text.value = paste(text.value, '-', 0);
            }

            const splitterPosition: number = text.value.indexOf(decimalSplitter);

            if (splitterPosition === -1) {
                ViewModel._pasteInIntegerPart(text, parsedNumber, splitterPosition);
            } else {
                splitterPosition < text.carriagePosition ?
                    ViewModel._pasteInFractionalPart(text, parsedNumber) :
                    ViewModel._pasteInIntegerPart(text, parsedNumber, splitterPosition);
            }
        } else if (inputType === 'deleteBackward' || inputType === 'deleteForward') {
            if (text.value === '') {
                return {
                    value: '',
                    carriagePosition: 0
                };
            }
            if (ViewModel._leaveOnlyIntegerPath(text.value, splitValue, this._options)) {
                return {
                    value: splitValue.before,
                    carriagePosition: splitValue.before.length
                };
            }
        }

        if (text.value === '') {
            return text;
        }

        const parsedNumber: IParsedNumber = parse(text.value, this._options);

        return format(parsedNumber, this._options, text.carriagePosition);
    }

    trimTrailingZeros(leaveOneZero: boolean): boolean {
        if (this._options.showEmptyDecimals) {
            return false;
        }

        var regExp = leaveOneZero
            ? ViewModel._valueWithOneTrailingZerosRegExp
            : ViewModel._valueWithoutTrailingZerosRegExp;
        var trimmedValue = this._displayValue.match(regExp)[0];

        if (this._displayValue !== trimmedValue) {
            this._displayValue = trimmedValue;
            this._nextVersion();

            return true;
        }

        return false;
    }

    private static _valueWithoutTrailingZerosRegExp: RegExp = /-?[0-9 ]*(([1-9]|([0.])(?!0*$))*)?/;
    private static _valueWithOneTrailingZerosRegExp: RegExp = /-?[0-9 ]*(\.[0-9]([1-9]|0(?!0*$))*)?/;

    private static _isEnteredSplitter(splitValue: ISplitValue): boolean {
        return decimalSplitters.includes(splitValue.insert) && splitValue.delete === '';
    }

    private static _handleRemovalLiteral(splitValue: ISplitValue, inputType: InputType): void {
        if (ViewModel._isLiteral(splitValue.delete)) {
            if (inputType === 'deleteBackward') {
                splitValue.before = splitValue.before.slice(0, -1);
            } else if (inputType === 'deleteForward') {
                splitValue.after = splitValue.after.substring(1);
            }
        }
    }

    private static _isLiteral(value: string): boolean {
        return value === ' ' || value === decimalSplitter;
    }

    private static _recoverText(splitValue: ISplitValue): IText {
        let value: string = splitValue.before;
        const carriagePosition: number = concatTriads(value).length;

        value += splitValue.after;

        value = concatTriads(value);

        if (value && splitValue.delete.includes(decimalSplitter)) {
            value = paste(value, decimalSplitter, carriagePosition);
        }

        return {value, carriagePosition};
    }

    private static _pasteInIntegerPart(text: IText, parsedNumber: IParsedNumber, splitterPosition: number): void {
        text.value = paste(text.value, parsedNumber.integer, text.carriagePosition);

        if (parsedNumber.fractional) {
            if (splitterPosition === -1) {
                splitterPosition = text.value.length;
                text.value += decimalSplitter;
            } else {
                splitterPosition += parsedNumber.integer.length;
            }

            text.value = paste(text.value, parsedNumber.fractional, splitterPosition + 1);
            text.carriagePosition = splitterPosition + parsedNumber.fractional.length + 1;
        } else {
            text.carriagePosition += parsedNumber.integer.length;
        }
    }

    private static _pasteInFractionalPart(original: IText, parsedNumber: IParsedNumber): void {
        const pastedValue: string = parsedNumber.integer + parsedNumber.fractional;
        replaceWithRepositioning(original, pastedValue, original.carriagePosition);
    }

    private static _leaveOnlyIntegerPath(value: string, splitValue: ISplitValue, options: IViewModelOptions): boolean {
        if (value === '-') {
            return true;
        }
        /**
         * Если наличие дробной части управляется пользователем с помощью ввода точки, то
         * целая часть может быть только в случае, когда точка удалена, и после неё ничего нет.
         */
        return splitValue.delete === decimalSplitter && !options.useAdditionToMaxPrecision && splitValue.after === '';
    }
}

export default ViewModel;
