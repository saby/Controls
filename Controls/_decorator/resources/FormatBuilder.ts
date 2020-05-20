import {IFormatMaskChars} from './IMask';
import {escapeSpecialChars} from 'Controls/Utils/RegExp';

/**
 * Парные разделители открывающего и закрывающего типа.
 * Открывающему разделителю на i-ой позиции из набора "OPEN_DELIMITERS" соответствует
 * закрывающий на i-ой позиции из набора "CLOSE_DELIMITERS". Код построен на основе этой структуры.
 */
const OPEN_DELIMITERS: string = '({[⟨<\'"«„‘”';
const CLOSE_DELIMITERS: string = ')}]⟩>\'"»“’”';

function getPairDelimiters(): string {
    let pairDelimiters: string = '';

    for (let i = 0; i < OPEN_DELIMITERS.length; i++) {
        pairDelimiters += `${OPEN_DELIMITERS[i]}${CLOSE_DELIMITERS[i]}`;
    }

    return pairDelimiters;
}

export const PAIR_DELIMITERS = getPairDelimiters();

/**
 * TODO: можно переделать на именованные группы в регулярных выражениях, когда появится поддержка
 * во всех браузерах. https://learn.javascript.ru/regexp-groups#imenovannye-gruppy
 */
enum MAP_TYPES_MASK_CHAR {
    key = 1,
    quantifier = 2,
    pairDelimiter = 3,
    singleDelimiter = 4
}

/**
 * Получить регулярное выражение для разбора маски.
 * @remark
 * Разбор маски предполагает определения её структуру(ключи, кванторы, одиночные и парные разделители).
 * @return Регулярное выражение с массивом результатов соответствующим MAP_TYPES_MASK_CHAR.
 *
 * @example
 * const mask: string = 'dx-xd';
 * const parsingMask: RegExp = getMaskParsing('dx');
 * parsingMask.exec(mask); // ['d', undefined, undefined, undefined, index: 0, input: 'dx-xd'];
 * parsingMask.exec(mask); // ['x', undefined, undefined, undefined, index: 1, input: 'dx-xd'];
 * parsingMask.exec(mask); // [undefined, undefined, undefined, '-', index: 2, input: 'dx-xd'];
 * parsingMask.exec(mask); // ['x', undefined, undefined, undefined, index: 3, input: 'dx-xd'];
 * parsingMask.exec(mask); // ['d', undefined, undefined, undefined, index: 4, input: 'dx-xd'];
 * parsingMask.exec(mask); // null;
 */
export function getMaskParsing(maskKeys: string): RegExp {
    const key = `([${maskKeys}])`;
    const quantifier = '\\\\({.*?}|.)';
    const pairDelimiter = `([${escapeSpecialChars(PAIR_DELIMITERS)}])`;
    const singleDelimiter = '(.)';
    return new RegExp(`${key}(?:${quantifier})?|${pairDelimiter}|${singleDelimiter}`, 'g');
}

export function getMaskKeys(formatMaskChars: IFormatMaskChars): string {
    const keys: string = Object.keys(formatMaskChars).join('');
    return escapeSpecialChars(keys);
}

type TSubtype = 'open' | 'close';

export function delimiterSubtype(delimiter: string): TSubtype {
    if (OPEN_DELIMITERS.indexOf(delimiter) !== -1) {
        return 'open';
    }
    if (CLOSE_DELIMITERS.indexOf(delimiter) !== -1) {
        return 'close';
    }

    throw Error('Неверно указан разделитель. Он должен быть парным.');
}

export function pairOfDelimiter(delimiter: string, subtype: TSubtype): string {
    let containsPair: string;
    let containsDelimiter: string;

    switch (subtype) {
        case 'open':
            containsPair = CLOSE_DELIMITERS;
            containsDelimiter = OPEN_DELIMITERS;
            break;
        case 'close':
            containsPair = OPEN_DELIMITERS;
            containsDelimiter = CLOSE_DELIMITERS;
            break;
    }

    const position: number = containsDelimiter.indexOf(delimiter);
    if (position !== -1) {
        return containsPair[position];
    }

    throw Error('Неверно указан разделитель или его подтип.');
}

interface ICharData {
    value: string;
    type: string;
}

interface IKeyData extends ICharData {
    type: 'key';
    quantifier: string;
}

interface IPairDelimiterData extends ICharData {
    type: 'pairDelimiter';
    pair: string;
    subtype: TSubtype;
}

interface ISingleDelimiterData extends ICharData {
    type: 'singleDelimiter';
}

type TMaskCharData = IKeyData | IPairDelimiterData | ISingleDelimiterData;

/**
 * @param exec Массив результатов после разбора символа маски.
 */
export function getCharData(exec: RegExpExecArray): TMaskCharData {
    const keyValue: string = exec[MAP_TYPES_MASK_CHAR.key];
    const quantifierValue: string = exec[MAP_TYPES_MASK_CHAR.quantifier] || '';

    if (keyValue) {
        return {
            type: 'key',
            value: keyValue,
            quantifier: quantifierValue
        };
    }

    const pairDelimiterValue = exec[MAP_TYPES_MASK_CHAR.pairDelimiter];

    if (pairDelimiterValue) {
        const subtype: TSubtype = delimiterSubtype(pairDelimiterValue);
        return {
            type: 'pairDelimiter',
            value: pairDelimiterValue,
            pair: pairOfDelimiter(pairDelimiterValue, subtype),
            subtype
        };
    }

    const singleDelimiterValue = exec[MAP_TYPES_MASK_CHAR.singleDelimiter];

    if (singleDelimiterValue) {
        return {
            type: 'singleDelimiter',
            value: singleDelimiterValue
        };
    }

    throw Error('Неверный массив результатов после разбора символа маски.');
}

export function getReplacingKeyAsValue(formatMaskChars: IFormatMaskChars, key: string, quantifier: string): string {
    const keyValue: string = formatMaskChars[key];

    return `${keyValue}${quantifier}`;
}

export function getReplacingKeyAsValueOrReplacer(formatMaskChars: IFormatMaskChars, replacer: string,
                                                 key: string, quantifier: string): string {
    const keyValue: string = formatMaskChars[key];

    return `(?:${keyValue}|${replacer})${quantifier}`;
}

type TReplaceKey = (key: string, quantifier?: string) => string;

export function getReplacingKeyFn(formatMaskChars: IFormatMaskChars, replacer: string): TReplaceKey {
    if (replacer) {
        return getReplacingKeyAsValueOrReplacer.bind(this, formatMaskChars, replacer);
    }

    return getReplacingKeyAsValue.bind(this, formatMaskChars);
}

export interface IDelimiterGroups {
    [position: number]: ISingleDelimiterData | IPairDelimiterData;
}

export interface IFormat {
    searchingGroups: string;
    delimiterGroups: IDelimiterGroups;
}

interface IGroup {
    keys: string;
    searching: string;
    position: number;
}

interface IResultValidate {
    valid: boolean;
    unclosedDelimiters: string;
}

function isStartOfKeysGroup(data: TMaskCharData, group: IGroup): boolean {
    return data.type === 'key' && group.keys === '';
}

function isEndOfKeysGroup(data: TMaskCharData, group: IGroup): boolean {
    return data.type !== 'key' && group.keys !== '';
}

function validatePairDelimiters(charData: IPairDelimiterData, unclosedDelimiters: string): IResultValidate {
    switch (charData.subtype) {
        case 'open':
            return {
                valid: true,
                unclosedDelimiters: `${unclosedDelimiters}${charData.value}`
            };
        case 'close':
            const lastDelimiter = unclosedDelimiters[unclosedDelimiters.length - 1];

            if (lastDelimiter === charData.pair) {
                return {
                    valid: true,
                    unclosedDelimiters: unclosedDelimiters.slice(0, -1)
                };
            }
            break;
    }

    return {
        valid: false,
        unclosedDelimiters
    };
}

/**
 * Модифицирует маску в формате регулярного выражения под работу с пустым символом замены.
 * @remark
 * Вместо ключа может быть символ заменяющий его. Когда он не пустой, то регулярное выражение преобразуется
 * в (<key>|replacer) (1). А когда он пустой такая конструкция не подойдет. Причина в том, что порядок
 * символов должен сохраняться. Проще говоря, указав маску dl-ld, значение 12 не должно ей соответствовать, потому что
 * после цифры должны быть 2 буквы. При использовании конструкция (1) символы l при поиске заменяться на пустые, и
 * значение пройдет проверку на соответствие маске. Решение данной проблемы это использовать конструкцию
 * <part 1><key>...<part n-1><key><part n>? => <part 1><key>...<part n-1><key><part n>?|<part 1><key>...<key><part n-1>|
 * <part 1><key>...<part n-2><key>|...|<part 1><key>|<part 1> (2). Это означает дублировать часть маски без последнего ключа с
 * использованием |(или) до тех пор, пока есть ключи.
 * Конструкция (2) позволяет сохранить порядок символов.
 * @param searching маска в формате регулярного выражения.
 * @param keyPositions массив с позицией ключей.
 * @return маска в формате регулярного выражения с поддержкой работы пустого символа замены.
 */
function processingEmptyReplacer(searching: string, keyPositions: number[]): string {
    return keyPositions.reduceRight((acc: string, keyPosition: number): string => {
        let part: string = searching.substring(0, keyPosition);

        /**
         * Если ключ на позиции ${keyPosition} является первым в группе, то
         * после его удаления останет символ открытия группы. От него нужно избавиться, чтобы
         * регулярное выражение было валидным. Иначе нужно закрыть группу, потому что символ
         * закрытия группы стоит после ключа, а всё после ключа было удалено.
         */
        const lastChar: string = part[part.length - 1];
        if (lastChar === '(') {
            part = part.slice(0, -1);
        } else {
            part += ')';
        }

        return `${acc}|${part}`;
    }, searching);
}

function exactMatch(searching: string): string {
    return `^(?:${searching})$`;
}

export function getFormat(mask: string, formatMaskChars: IFormatMaskChars, replacer: string): IFormat {
    const maskKeys: string = getMaskKeys(formatMaskChars);
    const parsingMask: RegExp = getMaskParsing(maskKeys);
    const escapeReplacer: string = escapeSpecialChars(replacer);
    const replaceKey: TReplaceKey = getReplacingKeyFn(formatMaskChars, escapeReplacer);
    const delimiterGroups: IDelimiterGroups = {};
    const keyPositions: number[] = [];
    const group: IGroup = {
        keys: '',
        searching: '',
        position: 0
    };

    let iteration: number = 1;
    const maxIteration: number = 1000;
    let unclosedDelimiters: string = '';
    let execParseMask: RegExpExecArray = parsingMask.exec(mask);
    /**
     * Группы ключей и разделители включаются в массив результатов с помощью конструкции (x).
     * Подробнее https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/RegExp#quantifiers
     */
    while (execParseMask) {
        if (iteration > maxIteration) {
            throw RangeError('Превышено допустимое количество итераций.');
        }
        const charData = getCharData(execParseMask);

        if (isStartOfKeysGroup(charData, group)) {
            group.searching += '(';
        }

        if (isEndOfKeysGroup(charData, group)) {
            group.keys = '';
            group.searching += ')';
            group.position++;
        }

        /**
         * Валидируем парные разделители на предмет соответствия открых и закрытых.
         */
        if (charData.type === 'pairDelimiter') {
            const resultValidate: IResultValidate = validatePairDelimiters(charData, unclosedDelimiters);

            if (!resultValidate.valid) {
                throw Error('Неверный формат парных разделителей. Открытые и закрытые не соответствуют друг другу.');
            }
            unclosedDelimiters = resultValidate.unclosedDelimiters;
        }

        if (charData.type === 'key') {
            group.keys += charData.value;
            keyPositions.push(group.searching.length);
            group.searching += replaceKey(charData.value, charData.quantifier);
        }

        if (charData.type === 'singleDelimiter' || charData.type === 'pairDelimiter') {
            group.searching += `(${escapeSpecialChars(charData.value)}?)`;
            delimiterGroups[group.position] = charData;
            group.position++;
        }

        iteration++;
        execParseMask = parsingMask.exec(mask);
    }

    /**
     * Группа ключей закрывается в цикле после обработки символа отличного от ключа.
     * Если последний символ в маске будет ключом, то из-за того, что после него ничего нет,
     * группа не будет закрыта после выхода из цикла.
     */
    if (group.keys) {
        group.searching += ')';
    }

    if (replacer === '') {
        group.searching = processingEmptyReplacer(group.searching, keyPositions);
    }

    return {
        searchingGroups: exactMatch(group.searching),
        delimiterGroups
    };
}
