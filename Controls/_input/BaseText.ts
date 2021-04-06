import { default as Base, IBaseInputOptions} from 'Controls/_input/Base';
import {descriptor} from 'Types/entity';
import ViewModel from 'Controls/_input/Text/ViewModel';
import {Logger} from 'UI/Utils';
import {ITextOptions} from 'Controls/_input/interface/IText';

export interface IBaseTextInputOptions extends ITextOptions, IBaseInputOptions {}

export class BaseText extends Base<IBaseTextInputOptions> {
    _defaultValue: string = '';
    _punycodeToUnicode: Function;
    protected _controlName: string = 'Text';

    protected _beforeMount(options: IBaseTextInputOptions): void | Promise<void> {
        if (options.convertPunycode) {
            return this._loadConverterPunycode().then(() => {
                this._syncBeforeMount(options);
            });
        }

        this._syncBeforeMount(options);
    }

    protected _beforeUpdate(newOptions: IBaseTextInputOptions): void {
        super._beforeUpdate(newOptions);

        if (this._options.constraint !== newOptions.constraint) {
            BaseText._validateConstraint(newOptions.constraint);
        }
    }

    protected _getViewModelOptions(options: IBaseTextInputOptions): object {
        return {
            maxLength: options.maxLength,
            constraint: options.constraint,
            punycodeToUnicode: this._punycodeToUnicode
        };
    }

    protected _getViewModelConstructor(): ViewModel {
        return ViewModel;
    }

    protected _notifyInputCompleted(): void {
        if (this._options.trim) {
            const trimmedValue = this._viewModel.displayValue.trim();

            if (trimmedValue !== this._viewModel.displayValue) {
                this._viewModel.displayValue = trimmedValue;
                this._notifyValueChanged();
            }
        }

        super._notifyInputCompleted();
    }

    private _syncBeforeMount(options: IBaseTextInputOptions): void {
        super._beforeMount(options);

        BaseText._validateConstraint(options.constraint);
    }

    private _loadConverterPunycode(): Promise<void> {
        return new Promise((resolve) => {
            require(['/cdn/Punycode/1.0.0/punycode.js'],
                () => {
                    this._punycodeToUnicode = Punycode.toUnicode;
                    resolve();
                },
                resolve
            );
        });
    }

    private static _validateConstraint(constraint: string): boolean {
        if (constraint && !/^\[[\s\S]+?\]$/.test(constraint)) {
            Logger.error('Controls/_input/Text', 'The constraint options are not set correctly. More on https://wi.sbis.ru/docs/js/Controls/_input/Text/options/constraint/');
            return false;
        }

        return true;
    }

    static getDefaultOptions(): IBaseTextInputOptions {
        const defaultOptions: IBaseTextInputOptions = Base.getDefaultOptions();

        defaultOptions.trim = true;
        defaultOptions.convertPunycode = false;

        return defaultOptions;
    }

    static getOptionTypes(): object {
        const optionTypes = Base.getOptionTypes();

        optionTypes.maxLength = descriptor(Number, null);
        optionTypes.trim = descriptor(Boolean);
        optionTypes.constraint = descriptor(String);

        return optionTypes;
    }
}
