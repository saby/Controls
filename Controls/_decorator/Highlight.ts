import {Logger} from 'UI/Utils';
import {descriptor} from 'Types/entity';
import {escapeSpecialChars} from 'Controls/Utils/RegExp';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
//@ts-ignore
import * as template from 'wml!Controls/_decorator/Highlight/Highlight';

import {addWordCheck} from 'Controls/Utils/RegExp';

/**
 * @typedef HighlightMode
 * @variant word Подсветка осуществляется по словам.
 * Слово - это набор символов,  длина не менее 2. Слова разделяются пробелом и пунктуацией.
 * @variant substring Подсветка осуществляется по подстрокам.
 */
export type HighlightMode = 'word' | 'substring';

/**
 * @interface Controls/_decorator/Highlight/IHighlightOptions
 * @public
 * @author Красильников А.С.
 */
export interface IHighlightOptions extends IControlOptions {
    /**
     * Класс обеспечивающий внешнее отображение подсветки.
     * @default controls-Highlight_highlight_theme-{{_options.theme}}
     * @demo Controls-demo/Decorator/Highlight/ClassName/Index
     */
    className: string;
    /**
     * Декорируемый текст.
     * @demo Controls-demo/Decorator/Highlight/Value/Index
     */
    value: string;
    /**
     * Подсвечиваемый текст.
     * @demo Controls-demo/Decorator/Highlight/HighlightedValue/Index
     */
    highlightedValue: string;
    /**
     * Режим подсветки.
     * @type HighlightMode
     * @default substring
     * @demo Controls-demo/Decorator/Highlight/HighlightMode/Index
     */
    highlightMode: HighlightMode;
}

interface IHighlight {
    type: 'highlight';
    value: string;
}

interface IPlain {
    type: 'plain';
    value: string;
}

interface ISearchResult {
    index: number;
    value: string;
}

type SearchBy = 'and' | 'or';
type Element = IHighlight | IPlain;

/**
 * Графический контрол, декорирующий текст таким образом, что все вхождения {@link highlightedValue подсвечиваемого текста} в нём изменяют свой внешний вид.
 * Изменение внешнего вида текста используется с целью акцентирования на нём внимания.
 * @remark
 * Для нахождения подсвечиваемого текста выполняется поиск сопоставления между {@link value текстом} и {@link highlightedValue искомым текстом}.
 *
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_decorator.less">переменные тем оформления</a>
 * * <a href="http://axure.tensor.ru/standarts/v7/%D1%80%D0%B5%D0%B7%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%82%D1%8B_%D0%BF%D0%BE%D0%B8%D1%81%D0%BA%D0%B0__%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D1%8F_02_.html">алгоритм поиска</a>
 *
 * @mixes Controls/_decorator/Highlight/IHighlightOptions
 *
 * @class Controls/_decorator/Highlight
 * @extends UI/Base:Control
 *
 * @public
 * @demo Controls-demo/Decorator/Highlight/Index
 *
 * @author Красильников А.С.
 */
class Highlight extends Control<IHighlightOptions> {
    protected _className: string = null;
    protected _parsedText: Element[];
    protected _template: TemplateFunction = template;
    protected _theme: string[] = ['Controls/decorator'];

    private _parseText(value: string, highlight: string, highlightMode: HighlightMode): Element[] {
        /**
         * Подсвечиваемый текст нужно ограничить, потому что в дальнейшем он будет преобразован в регулярное выражение, которое
         * имеет ограничение длины. При превышении длины регулярное выражение будет считаться невалидным, и с ним невозможно будет работать.
         * Возьмем максимум 10000 символов. Этого точно должно хватить для покрытия всех адекватных сценариев.
         */
        const maxLength: number = 10000;
        const limitHighlight: string = highlight.length > maxLength ? highlight.substring(0, maxLength) : highlight;
        const escapedHighlight: string = escapeSpecialChars(limitHighlight);
        const searchResultByAnd: Element[] = this._searchBy(value, escapedHighlight, highlightMode, 'and');

        if (searchResultByAnd.length) {
            return searchResultByAnd;
        }

        return this._searchBy(value, escapedHighlight, highlightMode, 'or');
    }

    private _prepareParsedText(options: IHighlightOptions): Element[] {
        if (options.highlightedValue) {
            return this._parseText(options.value, options.highlightedValue, options.highlightMode);
        } else {
            return [{
                type: 'plain',
                value: options.value
            }];
        }
    }

    private _searchBy(value: string, highlight: string, highlightMode: HighlightMode, by: SearchBy): Element[] {
        let words: string[];
        switch (by) {
            case 'and':
                words = [highlight];
                break;
            case 'or':
                words = highlight.split(Highlight.WORD_SEPARATOR);

                if (highlightMode === 'word') {
                    words = words.filter(Highlight._isWord);
                }
                break;
            default:
                Logger.error(`"${by}" search is not supported.`, this);
                words = [highlight];
                break;
        }

        words = words.filter(Highlight._isNotEmpty);

        if (words.length === 0) {
            Logger.warn('When searching there is a problem, there are no ' +
                'words in the highlight option. Perhaps the control is not used for its intended purpose or ' +
                'is not required now.', this);
            return [{
                value,
                type: 'plain'
            }];
        }

        const regexp: RegExp = this._calculateRegExp(words, highlightMode);
        const highlightSearchResult: ISearchResult[] = Highlight._search(value, regexp);

        if (highlightSearchResult.length === 0) {
            if (by === 'or') {
                return [{
                    value,
                    type: 'plain'
                }];
            }

            return [];
        }

        return Highlight._split(value, highlightSearchResult);
    }

    private _calculateRegExp(valueArr: string[], highlightMode: HighlightMode): RegExp {
        const flags: string = 'gi';
        const value: string = valueArr.join('|');

        switch (highlightMode) {
            case 'word':
                return addWordCheck(value, flags);
            case 'substring':
                return new RegExp(`${value}`, flags);
            default:
                Logger.error(`Unsupported highlight mode: ${highlightMode}.`, this);
                return new RegExp(`${value}`, flags);
        }
    }

    private _needChangeParsedText(newOptions: IHighlightOptions): boolean {
        return [
            'value',
            'highlightedValue',
            'highlightMode'
        ].some((optionName: string) => this._options[optionName] !== newOptions[optionName]);
    }

    protected _beforeMount(options: IHighlightOptions): void {
        this._className = options.className;
        this._parsedText = this._prepareParsedText(options);
    }

    protected _beforeUpdate(newOptions: IHighlightOptions): void {
        if (this._needChangeParsedText(newOptions)) {
            this._parsedText = this._prepareParsedText(newOptions);
        }
        this._className = newOptions.className;
    }

    private static WORD_SEPARATOR: RegExp = /\s+/g;
    private static MINIMUM_WORD_LENGTH: number = 2;

    static _theme: string[] = ['Controls/decorator'];

    private static _isNotEmpty(value: string): boolean {
        return value !== '';
    }

    private static _isWord(value: string): boolean {
        return value.length >= Highlight.MINIMUM_WORD_LENGTH;
    }

    private static _search(value: string, regexp: RegExp): ISearchResult[] {
        let iterations: number = 1e4;
        const searchResult: ISearchResult[] = [];
        let found: RegExpExecArray | null = regexp.exec(value);

        while (found && iterations >= 1) {
            searchResult.push({
                value: found[0],
                index: found.index
            });

            found = regexp.exec(value);
            iterations--;
        }

        return searchResult;
    }

    private static _split(value: string, found: ISearchResult[]): Element[] {
        const result: Element[] = [];
        const foundLength: number = found.length;

        if (foundLength === 0) {
            result.push({
                type: 'plain',
                value: value
            });

            return result;
        }

        let index: number = 0;
        for (let i = 0; i < foundLength; i++) {
            const highlight = found[i];
            const plainValue: string = value.substring(index, highlight.index);

            if (plainValue) {
                result.push({
                    type: 'plain',
                    value: plainValue
                });
            }

            result.push({
                type: 'highlight',
                value: highlight.value
            });

            index = highlight.index + highlight.value.length;
        }

        if (index !== value.length) {
            result.push({
                type: 'plain',
                value: value.substring(index)
            });
        }

        return result;
    }

    static getDefaultOptions(): Partial<IHighlightOptions> {
        return {
            highlightMode: 'substring'
        };
    }

    static getOptionTypes() {
        return {
            className: descriptor(String),
            highlightMode: descriptor(String).oneOf([
                'word',
                'substring'
            ]),
            value: descriptor(String).required(),
            highlightedValue: descriptor(String).required()
        };
    }
}

export default Highlight;
