import {IControlOptions} from 'UI/Base';
import {Logger} from 'UI/Utils';

import {INumberFormatOptions} from 'Controls/_interface/INumberFormat';
import {IFontColorStyleOptions} from 'Controls/_interface/IFontColorStyle';
import {IFontWeightOptions} from 'Controls/_interface/IFontWeight';
import {IFontSizeOptions} from 'Controls/_interface/IFontSize';

import toString from 'Controls/_decorator/inputUtils/toString';
import splitIntoTriads from 'Controls/_decorator/inputUtils/splitIntoTriads';
import {
    abbreviateNumber,
    correctNumberValue,
    fillAdditionalZeros,
    trimTrailingZeros
} from 'Controls/_decorator/resources/Formatter';

type TValue = string | number | null;

type TAbbreviationType = 'none' | 'short' | 'long';
type TUnderline = 'hovered' | 'none';
type RoundingFn = (number: string, precision: number) => string;

export type RoundMode = 'round' | 'trunc';

export interface INumberOptions extends IControlOptions, INumberFormatOptions, IFontColorStyleOptions,
    IFontWeightOptions, IFontSizeOptions {
    value: TValue;
    fractionSize?: number;
    precision?: number;
    roundMode: RoundMode;
    abbreviationType?: TAbbreviationType;
    underline?: TUnderline;
}

export function calculateMainClass(
    fontSize: string,
    fontColorStyle: string,
    stroked: boolean,
    underline: string,
    fontWeight: string
): string {
    return 'controls-DecoratorNumber' + `${fontSize ? ' controls-fontsize-' + fontSize : ''}
    ${fontColorStyle ? ' controls-text-' + fontColorStyle : ''}
    ${stroked ? ' controls-DecoratorNumber__stroked' : ''}
    ${underline === 'hovered' ? ' controls-DecoratorNumber__underline' : ''}`
        + ' controls-fontweight-' + (fontWeight ? fontWeight : 'default');
}

export function calculateFontColorStyle(stroked: boolean, options: INumberOptions): string {
    if (options.readOnly || stroked) {
        return 'readonly';
    } else {
        return options.fontColorStyle;
    }
}

export function calculateFormattedNumber(
    number: string | number | null,
    useGrouping: boolean,
    roundMode: RoundMode,
    fractionSize: string,
    abbreviationType: TAbbreviationType,
    showEmptyDecimals: boolean,
    format: INumberOptions
): string {
    let strNumber = toString(number);

    if (strNumber === '') {
        return '';
    }

    let precision: number = format.precision;

    if (typeof fractionSize === 'number') {
        Logger.warn('Controls/decorator:Number: Option "fractionSize" is deprecated and will be removed soon. Use "precision" option instead.', this);
        precision = fractionSize;
    }

    if (typeof precision === 'number') {
        switch (roundMode) {
            case 'round':
                strNumber = round(strNumber, precision);
                break;
            case 'trunc':
                strNumber = trunc(strNumber, precision);
                break;
        }
        if (showEmptyDecimals) {
            strNumber = fillAdditionalZeros(strNumber, precision);
        }
    }

    if (!showEmptyDecimals) {
        strNumber = trimTrailingZeros(strNumber);
    }

    if (abbreviationType && abbreviationType !== 'none') {
        return correctNumberValue(abbreviateNumber(strNumber, abbreviationType));
    }
    strNumber = correctNumberValue(strNumber);
    if (useGrouping) {
        return splitIntoTriads(strNumber);
    }

    return strNumber;
}

const round: RoundingFn = (number, precision) => {
    return toString(parseFloat(number).toFixed(precision));
};

const trunc: RoundingFn = (number, precision) => {
    if (precision) {
        const regExp = new RegExp(`-?\\d+.?\\d{0,${precision}}`);

        return  String.prototype.match.call(number, regExp)[0];
    } else {
        return  toString(Math.trunc(parseFloat(number)));
    }
};
