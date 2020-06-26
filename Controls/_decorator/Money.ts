import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {
    INumberFormatOptions,
    INumberFormat,
    ITooltipOptions,
    ITooltip,
    IFontColorStyle,
    IFontColorStyleOptions,
    IFontSize,
    IFontSizeOptions,
    IFontWeight,
    IFontWeightOptions,
    getFontWeightTypes
} from 'Controls/interface';
import {Logger} from 'UI/Utils';
import {descriptor, DescriptorValidator} from 'Types/entity';
import numberToString from 'Controls/Utils/Formatting/numberToString';
import splitIntoTriads from 'Controls/Utils/splitIntoTriads';
// tslint:disable-next-line:ban-ts-ignore
//@ts-ignore
import * as template from 'wml!Controls/_decorator/Money/Money';

type TValue = string | number | null;

interface IPaths {
    integer: string;
    fraction: string;
    number: string;
}

/**
 * @interface Controls/_decorator/Money/IMoneyOptions
 * @public
 * @author Красильников А.С.
 */
export interface IMoneyOptions extends IControlOptions, INumberFormatOptions, ITooltipOptions,
    IFontColorStyleOptions, IFontWeightOptions, IFontSizeOptions {
    /**
     * Декорируемое число.
     * @type string|number|null
     * @default null
     * @demo Controls-demo/Decorator/Money/Value/Index
     */
    value: TValue;
}

/**
 * Графический контрол, декорирующий число таким образом, что оно приводится к денежному формату.
 * Денежным форматом является число с неограниченной целой частью, и двумя знаками в дробной части.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_decorator.less">переменные тем оформления</a>
 *
 * @class Controls/_decorator/Money
 * @extends UI/Base:Control
 *
 * @mixes Controls/interface:ITooltip
 * @mixes Controls/interface:IFontColorStyle
 * @mixes Controls/interface:IFontWeightOptions
 * @mixes Controls/interface:IFontSize
 * @mixes Controls/interface:INumberFormat
 * @mixes Controls/_decorator/Money/IMoneyOptions
 *
 * @public
 * @demo Controls-demo/Decorator/Money/Index
 *
 * @author Красильников А.С.
 */
class Money extends Control<IMoneyOptions> implements INumberFormat, ITooltip, IFontColorStyle, IFontSize, IFontWeight {
    private _value: TValue;
    private _useGrouping: boolean;
    protected _tooltip: string;
    private _parsedNumber: IPaths;
    private _fontColorStyle: string;
    private _fontSize: string;
    private _readOnly: boolean;
    private _fontWeight: string;

    readonly '[Controls/_interface/ITooltip]': boolean = true;
    readonly '[Controls/_interface/IFontColorStyle]': boolean = true;
    readonly '[Controls/_interface/IFontSize]': boolean = true;
    readonly '[Controls/_interface/IFontWeight]': boolean = true;
    readonly '[Controls/_interface/INumberFormat]': boolean = true;

    protected _options: IMoneyOptions;
    protected _template: TemplateFunction = template;

    // Used in template
    protected _isDisplayFractionPath(value: string, showEmptyDecimals: boolean): boolean {
        return showEmptyDecimals || value !== '.00';
    }


    private _getTooltip(options: IMoneyOptions): string {

        if (options.hasOwnProperty('tooltip')) {
            return options.tooltip;
        }

        return this._parsedNumber.number;
    }

    private _changeState(options: IMoneyOptions, useLogging: boolean): boolean {
        const value = options.value;
        const useGrouping = options.useGrouping;

        if (this._value !== value || this._useGrouping !== useGrouping) {
            this._value = value;
            this._useGrouping = useGrouping;

            return true;
        }

        return false;
    }

    private _parseNumber(): IPaths {
        const value = Money.toFormat(Money.toString(this._value));
        let exec: RegExpExecArray | string[] = Money.SEARCH_PATHS.exec(value);

        if (!exec) {
            Logger.error('Controls/_decorator/Money: That is not a valid option value: ' + this._value + '.', this);
            exec = ['0.00', '0', '.00'];
        }

        const integer = this._useGrouping ? splitIntoTriads(exec[1]) : exec[1];
        const fraction = exec[2];

        return {
            integer: integer,
            fraction: fraction,
            number: integer + fraction
        };
    }

    private _setFontState(options: IMoneyOptions): void {
        this._fontSize = options.fontSize;
        this._fontWeight = options.fontWeight;
        this._fontColorStyle = options.readOnly ? 'readonly' : options.fontColorStyle;
    }

    protected _beforeMount(options: IMoneyOptions): void {
        this._setFontState(options);
        this._changeState(options, true);
        this._parsedNumber = this._parseNumber();
        this._tooltip = this._getTooltip(options);
    }

    protected _beforeUpdate(newOptions: IMoneyOptions): void {
        this._setFontState(newOptions);
        if (this._changeState(newOptions, false)) {
            this._parsedNumber = this._parseNumber();
        }
        this._tooltip = this._getTooltip(newOptions);
    }

    private static FRACTION_LENGTH: number = 2;
    private static ZERO_FRACTION_PATH: string = '0'.repeat(Money.FRACTION_LENGTH);
    private static SEARCH_PATHS: RegExp = new RegExp(`(-?[0-9]*?)(\\.[0-9]{${Money.FRACTION_LENGTH}})`);

    static _theme: string[] = ['Controls/Classes', 'Controls/decorator'];

    private static toString(value: TValue): string {
        if (value === null) {
            return '0.' + Money.ZERO_FRACTION_PATH;
        }
        if (typeof value === 'number') {
            return numberToString(value);
        }

        return value;
    }

    /**
     * Приводит value к формату:
     * 1. Значение должно иметь {Money.FRACTION_LENGTH} знака в дробной части. Недостоющие знаки заменяются нулями.
     */
    private static toFormat(value: string): string {
        const dotPosition = value.indexOf('.');

        if (dotPosition === -1) {
            return value + `.${Money.ZERO_FRACTION_PATH}`;
        }

        const fractionLength = value.length - dotPosition - 1;
        if (fractionLength < Money.FRACTION_LENGTH) {
            return value + '0'.repeat(Money.FRACTION_LENGTH - fractionLength);
        }

        return value;
    }

    static getDefaultOptions(): Partial<IMoneyOptions> {
        return {
            value: null,
            fontColorStyle: 'default',
            fontSize: 'm',
            fontWeight: 'default',
            useGrouping: true,
            showEmptyDecimals: true
        };
    }

    static getOptionTypes(): Partial<Record<keyof IMoneyOptions, DescriptorValidator>> {
        return {
            ...getFontWeightTypes(),
            fontColorStyle: descriptor(String),
            fontSize: descriptor(String),
            useGrouping: descriptor(Boolean),
            showEmptyDecimals: descriptor(Boolean),
            value: descriptor(String, Number, null)
        };
    }
}

export default Money;
