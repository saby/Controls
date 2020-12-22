import {IText} from 'Controls/decorator';
import {VersionableMixin} from 'Types/entity';
import {hasSelectionChanged, prepareEmptyValue} from './resources/Util';
import {InputType, ISelection, ISplitValue} from './resources/Types';

abstract class BaseViewModel<TValue, TOptions extends {} = {}> extends VersionableMixin {
    protected _value: TValue | null;
    protected _displayValue: string;
    protected _selection: ISelection;
    protected _options: TOptions;
    protected _emptyValue: TValue;
    /**
     * Набор имен опций, которые могут повлиять на отображаемое значение.
     * Если хотя бы одна из этих опций изменится, то будет вызван пересчёт отображаемого значения.
     */
    protected _optionsThatAffectDisplayValue: Array<keyof TOptions> = [];

    displayValueBeforeUpdate: string = '';

    constructor(options: TOptions, value: TValue | null) {
        super();

        this._options = options;
        this._setValue(value);

        const startingPosition = this._getStartingPosition();
        this._selection = {
            start: startingPosition,
            end: startingPosition
        };
        if (this._isEmptyValue(value)) {
            this._emptyValue = value;
        }
    }

    get options(): TOptions {
        return this._options;
    }

    set options(options: TOptions) {
        if (this._needToChangeDisplayValue(options)) {
            this._displayValue = this._convertToDisplayValue(this._value);
        }
        this._options = options;
    }

    get selection(): ISelection {
        return this._selection;
    }

    set selection(value: ISelection) {
        this._setSelection(value);
        this._nextVersion();
    }

    get value(): TValue {
        return this._value;
    }

    set value(value: TValue | null) {
        if (this._value === value) {
            return;
        }
        this._setValue(value);
        this._setSelection(this._getStartingPosition());
        this._nextVersion();
    }

    get displayValue(): string {
        return this._displayValue;
    }

    set displayValue(displayValue: string) {
        if (this._displayValue === displayValue) {
            return;
        }
        this._setDisplayValue(displayValue);
        this._setSelection(this._getStartingPosition());
        this._nextVersion();
    }

    private _needToChangeDisplayValue(newOptions: TOptions): boolean {
        return this._optionsThatAffectDisplayValue.some((optionName) => {
            return this._options[optionName] !== newOptions[optionName];
        });
    }

    protected _setValue(value: TValue | null): void {
        this._displayValue = this._convertToDisplayValue(value);
        this._value = value;
    }

    protected _setDisplayValue(displayValue: string): void {
        this._value = this._handleConvertedValue(displayValue);
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

    protected _handleConvertedValue(displayValue: string): TValue {
        const value: TValue = this._convertToValue(displayValue);
        if (this._isEmptyValue(value)) {
            return prepareEmptyValue(value, this._emptyValue);
        }
        return value;
    }

    private _isEmptyValue(value: TValue): boolean {
        return value === null || value === '';
    }

    protected _getStartingPosition(): number {
        return this._displayValue.length;
    }

    protected abstract _createText(splitValue: ISplitValue, inputType: InputType): IText;
    protected abstract _convertToValue(displayValue: string): TValue;
    protected abstract _convertToDisplayValue(value: TValue | null): string;

    select(): void {
        this.selection = {
            start: 0,
            end: this.displayValue.length
        };
    }

    handleInput(splitValue: ISplitValue, inputType: InputType): boolean {
        const text: IText = this._createText(splitValue, inputType);
        const displayValueChanged: boolean = this._displayValue !== text.value;
        const selectionChanged: boolean = hasSelectionChanged(this._selection, text.carriagePosition);

        if (displayValueChanged) {
            this._setDisplayValue(text.value);
        }
        if (selectionChanged) {
            this._setSelection(text.carriagePosition);
        }
        if (displayValueChanged || selectionChanged) {
            this._nextVersion();
        }

        return displayValueChanged;
    }

    isValueChanged(displayValue: string, value?: string): boolean {
        return displayValue !== this._displayValue;
    }
}

export default BaseViewModel;
