import {ISelection} from './resources/Types';

abstract class BaseViewModel<TValue, TOptions extends {}> {
    protected _value: TValue;
    protected _displayValue: string;
    protected _selection: ISelection;
    protected _options: TOptions;

    constructor(value: TValue, options: TOptions) {
        const startingPosition = this._getStartingPosition();

        this._options = options;
        this._setValue(value);
        this._selection = {
            start: startingPosition,
            end: startingPosition
        };
    }

    get options(): TOptions {
        return this._options;
    }

    set options(value: TOptions) {
        this._options = value;
    }

    get selection(): ISelection {
        return this._selection;
    }

    set selection(value: ISelection) {
        this._setSelection(value);
    }

    get value(): TValue {
        return this._value;
    }

    set value(value: TValue) {
        if (this._value === value) {
            return;
        }
        this._setValue(value);
    }

    get displayValue(): string {
        return this._displayValue;
    }

    set displayValue(displayValue: string) {
        if (this._displayValue === displayValue) {
            return;
        }
        this._setDisplayValue(displayValue);
    }

    protected _setValue(value: TValue): void {
        this._value = value;
        this._displayValue = this._convertToDisplayValue(value);
    }

    protected _setDisplayValue(displayValue: string): void {
        this._value = this._convertToValue(displayValue);
        this._displayValue = displayValue;
    }

    protected _setSelection(selection: number | ISelection): void {
        if (typeof selection === 'number') {
            this._selection.start = selection;
            this._selection.end = selection;
        } else {
            this._selection.start = selection.start;
            this._selection.end = selection.end;
        }
    }

    protected _getStartingPosition(): number {
        return this._displayValue.length;
    }

    protected abstract _convertToValue(displayValue: string): TValue;
    protected abstract _convertToDisplayValue(value: TValue): string;
    protected abstract _needToChangeDisplayValue(newOptions: TOptions): boolean;

    select(): void {
        this._setSelection({
            start: 0,
            end: this.displayValue.length
        });
    }
}
