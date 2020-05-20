import {IText, pasteWithRepositioning} from './Util';
import {IFormat, IDelimiterGroups, IPairDelimiterData, ISingleDelimiterData} from './FormatBuilder';

/**
 * Разобрать значение на группы.
 * Успешный рабор будет, только в том случае, если значение полностью подходит формату маски.
 * @return значения групп.
 */
export function splitValue(format: IFormat, value: string): string[] {
    const resultMatch: RegExpMatchArray = value.match(format.searchingGroups);

    if (resultMatch && resultMatch[0].length === resultMatch.input.length) {
        return Array.prototype.filter.call(resultMatch, (item: string, index: number) => {
            return index > 0 && typeof item === 'string';
        });
    }

    throw Error('Значение не соответствует формату маски.');
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

    groups.forEach((groupValue: string, groupIndex: number): void => {
        // TODO: этот код лишний, но без него падают тесты. Нужно разобраться в проблеме и убрать его.
        // https://online.sbis.ru/opendoc.html?guid=3236bcfd-4ae8-4f90-a1c8-7e2caddde339
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

// TODO: будет удалено по https://online.sbis.ru/opendoc.html?guid=3236bcfd-4ae8-4f90-a1c8-7e2caddde339
interface IData {
    value: string;
    position: number;
}
export {clearData as getClearData};
export function getFormatterData(format: IFormat, cleanData: IData): IData {
    const data: IText = formatData(format, {
        value: cleanData.value,
        carriagePosition: cleanData.position
    });

    return {
        value: data.value,
        position: data.carriagePosition
    };
}
