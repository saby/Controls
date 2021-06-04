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
    IFontWeightOptions
} from 'Controls/interface';
import {descriptor, DescriptorValidator} from 'Types/entity';
import splitIntoTriads from 'Controls/_decorator/inputUtils/splitIntoTriads';
import numberToString from 'Controls/_decorator/inputUtils/toString';
import {abbreviateNumber} from 'Controls/_decorator/resources/Formatter';
// tslint:disable-next-line:ban-ts-ignore
//@ts-ignore
import * as MoneyTemplate from 'Controls/_decorator/Money/Money';
import 'css!Controls/decorator';
import 'css!Controls/CommonClasses';

/**
 * Тип данных для форматируемого значения
 * @typedef {string|number|null} Controls/_decorator/IMoney/TValue
 */
type TValue = string | number | null;

/**
 * Тип данных для аббревиатуры
 * @typedef {string} Controls/_decorator/IMoney/TAbbreviationType
 * @variant long
 * @variant none
 */
type TAbbreviationType = 'long' | 'none';
/**
 * Тип данных для отображаемой валюты
 * @typedef {string} Controls/_decorator/IMoney/TCurrency
 * @variant Ruble
 * @variant Euro
 * @variant Dollar
 */
type TCurrency = 'Ruble' | 'Euro' | 'Dollar';
/**
 * Тип данных для позиции отображаемой валюты
 * @typedef {string} Controls/_decorator/IMoney/TCurrencyPosition
 * @variant right
 * @variant left
 */
type TCurrencyPosition = 'right' | 'left';
/**
 * Тип данных для размера отображаемой валюты
 * @typedef {string} Controls/_decorator/IMoney/TCurrencySize
 * @variant 2xs
 * @variant xs
 * @variant s
 * @variant m
 * @variant l
 */
type TCurrencySize = '2xs' | 'xs' | 's' | 'm' | 'l';

interface IPaths {
    integer: string;
    fraction: string;
    number: string;
}

export interface IMoneyOptions extends IControlOptions, INumberFormatOptions, ITooltipOptions,
    IFontColorStyleOptions, IFontWeightOptions, IFontSizeOptions {
    /**
     * @name Controls/_decorator/IMoney#value
     * @cfg {Controls/_decorator/IMoney/TValue.typedef} Декорируемое число.
     * @default null
     * @demo Controls-demo/Decorator/Money/Value/Index
     */
    value: TValue;
    /**
     * @name Controls/_decorator/IMoney#abbreviationType
     * @cfg {Controls/_decorator/IMoney/TAbbreviationType.typedef} Тип аббревиатуры.
     * @default none
     * @demo Controls-demo/Decorator/Money/Abbreviation/Index
     */
    abbreviationType?: TAbbreviationType;
    /**
     * @name Controls/_decorator/IMoney#currency
     * @cfg {Controls/_decorator/IMoney/TCurrency.typedef} Отображаемая валюта.
     * @demo Controls-demo/Decorator/Money/Currency/Index
     */
    currency?: TCurrency;
    /**
     * @name Controls/_decorator/IMoney#currencySize
     * @cfg {Controls/_decorator/IMoney/TCurrencySize.typedef} Размер отображаемой валюты.
     * @default s
     * @demo Controls-demo/Decorator/Money/CurrencySize/Index
     */
    currencySize?: TCurrencySize;
    /**
     * @name Controls/_decorator/IMoney#currencyPosition
     * @cfg {Controls/_decorator/IMoney/TCurrencyPosition.typedef} Позиция отображаемой валюты относительно суммы.
     * @default right
     * @demo Controls-demo/Decorator/Money/Currency/Index
     */
    currencyPosition?: TCurrencyPosition;
}

/**
 * Графический контрол, декорирующий число таким образом, что оно приводится к денежному формату.
 * Денежным форматом является число с неограниченной целой частью, и двумя знаками в дробной части.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_decorator.less переменные тем оформления}
 *
 * @class Controls/_decorator/Money
 * @extends UI/Base:Control
 *
 * @mixes Controls/interface:ITooltip
 * @mixes Controls/interface:IFontColorStyle
 * @mixes Controls/interface:IFontWeightOptions
 * @mixes Controls/interface:IFontSize
 * @mixes Controls/interface:INumberFormat
 * @mixes Controls/decorator:IMoney
 *
 * @public
 * @demo Controls-demo/Decorator/Money/Index
 *
 * @author Красильников А.С.
 *
 * TODO Необходимо избавиться от контрола в пользу функционального компонента https://online.sbis.ru/doc/5bbf7182-c95d-42e2-a8ab-b83f77b53a91
 */

class Money extends Control<IMoneyOptions> implements INumberFormat, ITooltip, IFontColorStyle, IFontSize, IFontWeight {
    private _value: string;
    private _useGrouping: boolean;
    protected _tooltip: string;
    private _formattedNumber: string | IPaths;
    private _fontColorStyle: string;
    private _fractionFontSize: string;
    private _currencies: Record<string, string> = {
        Ruble: '₽',
        Dollar: '$',
        Euro: '€'
    };

    readonly '[Controls/_interface/ITooltip]': boolean = true;
    readonly '[Controls/_interface/IFontColorStyle]': boolean = true;
    readonly '[Controls/_interface/IFontSize]': boolean = true;
    readonly '[Controls/_interface/IFontWeight]': boolean = true;
    readonly '[Controls/_interface/INumberFormat]': boolean = true;

    protected _options: IMoneyOptions;
    protected _template: TemplateFunction = MoneyTemplate;

    // Used in template
    protected _isDisplayFractionPath(value: string, showEmptyDecimals: boolean): boolean {
        return showEmptyDecimals || value !== '.00';
    }

    private _getTooltip(options: IMoneyOptions): string {

        if (options.hasOwnProperty('tooltip')) {
            return options.tooltip;
        }

        return this._formattedNumber.number;
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

    private _formatNumber(options: IMoneyOptions): string | IPaths {
        const value = Money.toFormat(Money.toString(this._value));

        let [integer, fraction] = this._splitValueIntoParts(value);

        if (options.abbreviationType === 'long') {
            integer = abbreviateNumber(options.value, options.abbreviationType);
        } else {
            integer = this._useGrouping ? splitIntoTriads(integer) : integer;
        }

        return {
            integer,
            fraction,
            number: integer + fraction
        };
    }

    private _splitValueIntoParts(value: string): string[] {
        let [integer, fraction] = value.split('.');
        fraction = '.' + fraction;

        return [integer, fraction];
    }

    private _setFontState(options: IMoneyOptions): void {
        if (options.readOnly || options.stroked) {
            this._fontColorStyle = 'readonly';
        } else {
            this._fontColorStyle = options.fontColorStyle;
        }

        if (options.fontSize === '6xl' || options.fontSize === '8xl') {
            this._fractionFontSize = '3xl';
        } else {
            this._fractionFontSize = 'xs';
        }
    }

    protected _beforeMount(options: IMoneyOptions): void {
        this._setFontState(options);
        this._changeState(options, true);
        this._formattedNumber = this._formatNumber(options);
        this._tooltip = this._getTooltip(options);
    }

    protected _beforeUpdate(newOptions: IMoneyOptions): void {
        this._setFontState(newOptions);
        if (this._changeState(newOptions, false)) {
            this._formattedNumber = this._formatNumber(newOptions);
        }
        this._tooltip = this._getTooltip(newOptions);
    }

    private static FRACTION_LENGTH: number = 2;
    private static ZERO_FRACTION_PATH: string = '0'.repeat(Money.FRACTION_LENGTH);

    private static toString(value: string): string {
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
        } else if (fractionLength > Money.FRACTION_LENGTH) {
            return value.substr(0, dotPosition + Money.FRACTION_LENGTH + 1);
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
            showEmptyDecimals: true,
            currencySize: 's',
            currencyPosition: 'right',
            abbreviationType: 'none',
            stroked: false,
            underline: 'none'
        };
    }

    static getOptionTypes(): Partial<Record<keyof IMoneyOptions, DescriptorValidator>> {
        return {
            fontWeight: descriptor<string>(String).oneOf(['default', 'bold']),
            fontColorStyle: descriptor(String),
            fontSize: descriptor(String),
            useGrouping: descriptor(Boolean),
            showEmptyDecimals: descriptor(Boolean),
            value: descriptor(String, Number, null),
            currencySize: descriptor(String),
            currencyPosition: descriptor(String),
            abbreviationType: descriptor(String).oneOf([
                'none',
                'long'
            ]),
            stroked: descriptor(Boolean),
            underline: descriptor(String)
        };
    }
}

Object.defineProperty(Money, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return Money.getDefaultOptions();
    }
});

export default Money;

/**
 * Интерфейс для опций контрола {@link Controls/decorator:Money}.
 * @interface Controls/_decorator/IMoney
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/_decorator/Money#useGrouping
 * @cfg
 * @default true
 */
/**
 * @name Controls/_decorator/Money#fontColorStyle
 * @cfg
 * @default default
 * @demo Controls-demo/Decorator/Money/FontColorStyle/Index
 */
/**
 * @name Controls/_decorator/Money#showEmptyDecimals
 * @cfg
 * @default true
 */
/**
 * @name Controls/_decorator/Money#fontSize
 * @cfg
 * @default m
 * @demo Controls-demo/Decorator/Money/FontSize/Index
 */
