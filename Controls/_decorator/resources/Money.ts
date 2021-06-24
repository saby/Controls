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

type TValue = string | number | null;

type TAbbreviationType = 'long' | 'none';
type TCurrency = 'Ruble' | 'Euro' | 'Dollar';
type TCurrencyPosition = 'right' | 'left';
type TCurrencySize = '2xs' | 'xs' | 's' | 'm' | 'l';

export interface IMoneyOptions extends IControlOptions, INumberFormatOptions, ITooltipOptions,
    IFontColorStyleOptions, IFontWeightOptions, IFontSizeOptions {
    value: TValue;
    abbreviationType?: TAbbreviationType;
    currency?: TCurrency;
    currencySize?: TCurrencySize;
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
