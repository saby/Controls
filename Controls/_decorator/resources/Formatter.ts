import {IText, pasteWithRepositioning} from './Util';
import {IDelimiterGroups, IFormat, IPairDelimiterData, ISingleDelimiterData} from './FormatBuilder';
import {IParsedNumber, parse} from './parse';
import {Logger} from 'UI/Utils';
import rk = require('i18n!Controls');

type TValue = string | number | null;
type TAbbreviationType = 'none' | 'short' | 'long';

/**
 * Разобрать значение на группы.
 * Успешный разбор будет, только в том случае, если значение полностью подходит формату маски.
 * @return значения групп.
 */
export function splitValue(format: IFormat, value: string): string[] {
    const resultMatch: RegExpMatchArray = value.match(format.searchingGroups);

    if (resultMatch && resultMatch[0].length === resultMatch.input.length) {
        return Array.prototype.filter.call(resultMatch, (item: string, index: number) => {
            return index > 0 && typeof item === 'string';
        });
    }

    Logger.warn('Значение не соответствует формату маски.');
    return null;
}

export interface ICleanData {
    value: string;
    positions: number[];
}

export function clearData(format: IFormat, value: string): ICleanData {
    let currentPosition: number = 0;
    const cleanData: ICleanData = {
        value: '',
        positions: []
    };
    const groups: string[] = splitValue(format, value);

    if (groups) {
        groups.forEach((groupValue: string, groupIndex: number): void => {
            // При разборе регулярки можем получить пустое значение, поэтому не обрабатываем его
            // https://regex101.com/r/KGL2Xa/1
            if (groupValue === '') {
                return;
            }
            if (groupIndex in format.delimiterGroups) {
                const delimiterLength: number = format.delimiterGroups[groupIndex].value.length;
                for (let i = 0; i < delimiterLength; i++) {
                    cleanData.positions.push(currentPosition);
                }
            } else {
                cleanData.value += groupValue;
                const groupLength: number = groupValue.length;
                for (let i = 0; i < groupLength; i++) {
                    cleanData.positions.push(currentPosition);
                    currentPosition++;
                }
            }
        });
        return cleanData;
    }
    return null;
}

interface IRawDelimiters {
    value: string;
    starting: boolean;
    ending: boolean;
    openPositions: number[];
}

function indexLastGroupOfKeys(groups: string[], delimiterGroups: IDelimiterGroups): number {
    for (let index = groups.length - 1; index > -1; index--) {
        if (!(index in delimiterGroups)) {
            return index;
        }
    }

    return -1;
}

function processingSingleDelimiter(text: IText, rawDelimiters: IRawDelimiters, delimiter: ISingleDelimiterData): void {
    /**
     * Всегда добавляем одиночные разделители, которые стоят в начале маски.
     */
    if (rawDelimiters.starting) {
        pasteWithRepositioning(text, delimiter.value, text.value.length);
        return;
    }
    rawDelimiters.value += delimiter.value;
}

function processingPairDelimiter(text: IText, rawDelimiters: IRawDelimiters, delimiter: IPairDelimiterData): void {
    if (delimiter.subtype === 'open') {
        const position: number = text.value.length + rawDelimiters.value.length;
        rawDelimiters.openPositions.push(position);
    } else if (delimiter.subtype === 'close') {
        const pairPosition: number = rawDelimiters.openPositions.pop();

        pasteWithRepositioning(text, delimiter.pair, pairPosition);
        if (rawDelimiters.ending) {
            text.value += delimiter.value;
        } else {
            pasteWithRepositioning(text, delimiter.value, text.value.length);
        }
    }
}

export function formatData(format: IFormat, cleanText: IText): IText {
    const text: IText = {
        value: '',
        carriagePosition: cleanText.carriagePosition
    };
    const rawDelimiters: IRawDelimiters = {
        value: '',
        starting: true,
        openPositions: [],
        ending: null
    };
    const groups: string[] = splitValue(format, cleanText.value);
    if (groups) {
        const lastGroupOfKeys: number = indexLastGroupOfKeys(groups, format.delimiterGroups);

        groups.forEach((groupValue: string, groupIndex: number) => {
            rawDelimiters.ending = groupIndex > lastGroupOfKeys;
            if (groupIndex in format.delimiterGroups) {
                if (groupValue) {
                    text.carriagePosition -= groupValue.length;
                }
                const delimiterType: string = format.delimiterGroups[groupIndex].type;

                if (delimiterType === 'singleDelimiter') {
                    processingSingleDelimiter(
                        text, rawDelimiters,
                        format.delimiterGroups[groupIndex] as ISingleDelimiterData
                    );
                } else if (delimiterType === 'pairDelimiter') {
                    processingPairDelimiter(
                        text, rawDelimiters,
                        format.delimiterGroups[groupIndex] as IPairDelimiterData
                    );
                }
            } else {
                pasteWithRepositioning(text, rawDelimiters.value, text.value.length);
                text.value += groupValue;

                rawDelimiters.value = '';
                rawDelimiters.starting = false;
            }
        });
        return text;
    }
    return null;
}

export function abbreviateNumber(value: TValue, abbreviationType: TAbbreviationType): string {
    if (!value) {
        return '0';
    }
    if (value >= 1000000000000 || value <= -1000000000000) {
        return intlFormat(value / 1000000000000) + `${abbreviationType === 'long' ? ' ' + rk('трлн') : 'Т'}`;
    }
    if (value >= 1000000000 || value <= -1000000000) {
        return intlFormat(value / 1000000000) + `${abbreviationType === 'long' ? ' ' + rk('млрд') : rk('Г')}`;
    }
    if (value >= 1000000 || value <= -1000000) {
        return intlFormat(value / 1000000) + `${abbreviationType === 'long' ? ' ' + rk('млн') : 'М'}`;
    }
    if (value >= 1000 || value <= -1000) {
        return intlFormat(value / 1000) + `${abbreviationType === 'long' ? ' ' + rk('тыс') : 'К'}`;
    }

    return Math.round(value).toString();
}

function intlFormat(num: number): string {
    return new Intl.NumberFormat('ru-RU').format(Math.round(num * 10) / 10);
}

const valueWithoutTrailingZerosRegExp: RegExp = /-?[0-9 ]*(([1-9]|([0.])(?!0*$))*)?/;
const valueWithOneTrailingZerosRegExp: RegExp = /-?[0-9 ]*(\.[0-9]([1-9]|0(?!0*$))*)?/;

export function trimTrailingZeros(str: string, leaveOneZero: boolean = false): string {
    const regExp = leaveOneZero ? valueWithOneTrailingZerosRegExp : valueWithoutTrailingZerosRegExp;
    return str.match(regExp)[0];
}

export function fillAdditionalZeros(str: string, precision: number) {
    const parsedString: IParsedNumber = parse(str);
    const additionalZeros = precision - parsedString.fractional.length;
    const zeros = '0'.repeat(additionalZeros);
    return `${str}${zeros}`;
}
