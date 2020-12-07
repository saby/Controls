import { default as Base, IBaseInputOptions} from 'Controls/_input/Base';
import {descriptor} from 'Types/entity';
import ViewModel from 'Controls/_input/Text/ViewModel';
import {Logger} from 'UI/Utils';
import {ITextOptions} from 'Controls/_input/interface/IText';

interface ITextInputOptions extends ITextOptions, IBaseInputOptions {}

/**
 * Однострочное поле ввода текста.
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FExample%2FInput">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/input/text/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_input.less">переменные тем оформления</a>
 *
 * @class Controls/_input/Text
 * @extends Controls/input:Base
 *
 * @mixes Controls/input:IText
 *
 * @public
 * @demo Controls-demo/Input/Text/Base/Index
 *
 * @author Красильников А.С.
 */
class Text extends Base<ITextInputOptions> {
    _defaultValue: string = '';
    _punycodeToUnicode: Function;
    protected _controlName: string = 'Text';

    protected _beforeMount(options: ITextInputOptions): void | Promise<void> {
        if (options.convertPunycode) {
            return this._loadConverterPunycode().then(() => {
                this._syncBeforeMount(options);
            });
        }

        this._syncBeforeMount(options);
    }

    protected _beforeUpdate(newOptions: ITextInputOptions): void {
        super._beforeUpdate(newOptions);

        if (this._options.constraint !== newOptions.constraint) {
            Text._validateConstraint(newOptions.constraint);
        }
    }

    protected _getViewModelOptions(options: ITextInputOptions): object {
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

    private _syncBeforeMount(options: ITextInputOptions): void {
        super._beforeMount(options);

        Text._validateConstraint(options.constraint);
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

    static getDefaultOptions(): ITextInputOptions {
        const defaultOptions: ITextInputOptions = Base.getDefaultOptions();

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

export default Text;
