import {IControlOptions} from 'UI/Base';

import {IFontColorStyleOptions} from 'Controls/_interface/IFontColorStyle';
import {IFontWeightOptions} from 'Controls/_interface/IFontWeight';
import {IFontSizeOptions} from 'Controls/_interface/IFontSize';
import {ITooltipOptions} from 'Controls/_interface/ITooltip';
import {INumberFormatOptions} from 'Controls/_interface/INumberFormat';

import {abbreviateNumber, correctNumberValue} from 'Controls/_decorator/resources/Formatter';
import splitIntoTriads from 'Controls/_decorator/inputUtils/splitIntoTriads';
import numberToString from 'Controls/_decorator/inputUtils/toString';

interface IPaths {
    integer: string;
    fraction: string;
    number: string;
}

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

const FRACTION_LENGTH: number = 2;
const ZERO_FRACTION_PATH: string = '0'.repeat(FRACTION_LENGTH);

export function calculateMainClass(underline: string, style: string): string {
    return 'controls-DecoratorMoney' + `${underline === 'hovered' ? ' controls-DecoratorMoney__underline' : ''}
            ${style ? ' controls-DecoratorMoney_style-' + style : ''}`;
}

export function calculateCurrencyClass(currencySize: string, fontColorStyle: string, fontWeight: string): string {
    return `${currencySize ? 'controls-fontsize-' + currencySize : ''} ${fontColorStyle ? ' controls-text-' + fontColorStyle : ''}
            ${fontWeight ? ' controls-fontweight-' + fontWeight : ''}`;
}

export function calculateStrokedClass(stroked: boolean): string {
    return `${stroked ? 'controls-DecoratorMoney__stroked' : ''}`;
}

export function calculateIntegerClass(
    fontSize: string,
    fontColorStyle: string,
    fontWeight: string,
    currency: string,
    currencyPosition: string,
    isDisplayFractionPath: boolean
): string {
    return `${fontSize ? 'controls-fontsize-' + fontSize : ''} ${fontColorStyle ? ' controls-text-' + fontColorStyle : ''}
            ${fontWeight ? ' controls-fontweight-' + fontWeight : ''} ${currency && currencyPosition === 'left' ? ' controls-margin_left-2xs' + fontWeight : ''}
            ${currency && currencyPosition === 'right' && isDisplayFractionPath ? ' controls-margin_right-2xs' + fontWeight : ''}`;
}

export function calculateFractionClass(
    fraction: string,
    fontColorStyle: string,
    fractionFontSize: string,
    currency: string,
    currencyPosition: string
): string {
    return 'controls-DecoratorMoney__fraction__colorStyle-' + `${fraction === '.00' ? 'readonly' : fontColorStyle}
            ${fractionFontSize ? ' controls-fontsize-' + fractionFontSize : ''}
            ${currency && currencyPosition === 'right' ? ' controls-margin_right-2xs' : ''}`;
}

export function calculateCurrency(currency: string): string {
    const currencies = {
        Ruble: '₽',
        Dollar: '$',
        Euro: '€'
    };

    return currencies[currency];
}

export function calculateFontColorStyle(stroked: boolean, options: IMoneyOptions): string {
    if (options.readOnly || stroked) {
        return 'readonly';
    } else {
        return options.fontColorStyle;
    }
}

export function calculateTooltip(formattedNumber: object, options: IMoneyOptions): string {
    if (options.hasOwnProperty('tooltip')) {
        return options.tooltip;
    }

    return formattedNumber.number;
}

export function isDisplayFractionPath(value: string, showEmptyDecimals: boolean): boolean {
    return showEmptyDecimals || value !== '.00';
}

export function calculateFormattedNumber(value: TValue, useGrouping: boolean, abbreviationType: TAbbreviationType): string | IPaths {
    const formattedValue = toFormat(toString(value));

    let [integer, fraction] = splitValueIntoParts(formattedValue);

    if (abbreviationType === 'long') {
        integer = abbreviateNumber(formattedValue, abbreviationType);
    } else {
        integer = useGrouping ? splitIntoTriads(integer) : integer;
    }

    integer = correctNumberValue(integer);

    return {
        integer,
        fraction,
        number: integer + fraction
    };
}

function toFormat(value: string): string {
    const dotPosition = value.indexOf('.');

    if (dotPosition === -1) {
        return value + `.${ZERO_FRACTION_PATH}`;
    }

    const fractionLength = value.length - dotPosition - 1;
    if (fractionLength < FRACTION_LENGTH) {
        return value + '0'.repeat(FRACTION_LENGTH - fractionLength);
    } else if (fractionLength > FRACTION_LENGTH) {
        return value.substr(0, dotPosition + FRACTION_LENGTH + 1);
    }

    return value;
}

function toString(value: TValue): string {
    if (value === null) {
        return '0.' + ZERO_FRACTION_PATH;
    }
    if (typeof value === 'number') {
        return numberToString(value);
    }

    return value;
}

function splitValueIntoParts(value: string): string[] {
    let [integer, fraction] = value.split('.');
    fraction = '.' + fraction;

    return [integer, fraction];
}

export function calculateFractionFontSize(fontSize: string): string {
    if (fontSize === '6xl' || fontSize === '8xl') {
        return '3xl';
    } else {
        return 'xs';
    }
}
