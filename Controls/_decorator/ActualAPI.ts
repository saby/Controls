/**
 * Модуль для совместимости устаревшего и актуального API контролов декораторов.
 * Удалить по https://online.sbis.ru/opendoc.html?guid=d04dc579-2453-495f-b0a7-282370f6a9c5.
 */

import {Logger} from 'UI/Utils';
import {IMoneyOptions} from 'Controls/_decorator/Money';
import {IHighlightOptions} from 'Controls/_decorator/Highlight';

interface IActualMoneyFont {
    fontSize: string;
    fontWeight: string;
    fontColorStyle: string;
}

export function styleOptions(style: string): IActualMoneyFont {
    switch (style) {
        case 'accentResults':
            return {
                fontColorStyle: 'secondary', fontSize: 'l', fontWeight: 'bold'
            };
        case 'noAccentResults':
            return {
                fontColorStyle: 'unaccented', fontSize: 'l', fontWeight: 'bold'
            };
        case 'group':
            return {
                fontColorStyle: 'readonly', fontSize: 'm', fontWeight: 'default'
            };
        case 'basicRegistry':
            return {
                fontColorStyle: 'default', fontSize: 'm', fontWeight: 'default'
            };
        case 'noBasicRegistry':
            return {
                fontColorStyle: 'unaccented', fontSize: 'm', fontWeight: 'default'
            };
        case 'accentRegistry':
            return {
                fontColorStyle: 'secondary', fontSize: 'l', fontWeight: 'bold'
            };
        case 'noAccentRegistry':
            return {
                fontColorStyle: 'unaccented', fontSize: 'l', fontWeight: 'bold'
            };
        case 'error':
            return {
                fontColorStyle: 'danger', fontSize: 'm', fontWeight: 'bold'
            };
        case 'default':
            return {
                fontColorStyle: 'default', fontSize: 'm', fontWeight: 'default'
            };
        default:
            return {
                fontColorStyle: 'default', fontSize: 'm', fontWeight: 'default'
            };
    }
}

export function moneyStyle(options: IMoneyOptions): IActualMoneyFont {
    if ('style' in options) {
        Logger.warn('Controls.decorator:Money - опция style устарела, используйте опции fontSize, fontWeight, fontColorStyle.');
        return styleOptions(options.style);
    }

    return {
        fontSize: options.fontSize,
        fontWeight: options.fontWeight,
        fontColorStyle: options.readOnly ? 'readonly' : options.fontColorStyle
    };
}

export function wrapURLsValue(text?: string, value?: string, useLogging: boolean = false): string {
    if (typeof text === 'string') {
        if (useLogging) {
            Logger.warn('Controls.decorator:WrapURLs - опция text устарела, используйте опцию value.');
        }
        return text;
    }

    return value;
}

export function phoneValue(number?: string, value?: string, useLogging: boolean = false): string {
    if (typeof number === 'string') {
        if (useLogging) {
            Logger.warn('Controls.decorator:Phone - опция number устарела, используйте опцию value.');
        }
        return number;
    }

    return value;
}

export function numberValue(number: number, value?: string | number | null, useLogging: boolean = false): string | number | null {
    if (typeof number === 'number') {
        if (useLogging) {
            Logger.warn('Controls.decorator:Number - опция number устарела, используйте опцию value.');
        }
        return number;
    }

    return value;
}

export function moneyUseGrouping(delimiters?: boolean, useGrouping?: boolean, useLogging: boolean = false): boolean {
    if (typeof delimiters === 'boolean') {
        if (useLogging) {
            Logger.warn('Controls.decorator:Money - опция delimiters устарела, используйте опцию useGrouping.');
        }
        return delimiters;
    }

    return useGrouping;
}

export function moneyValue(number: number, value?: string | number | null, useLogging: boolean = false): string | number | null {
    if (typeof number === 'number') {
        if (useLogging) {
            Logger.warn('Controls.decorator:Money - опция number устарела, используйте опцию value.');
        }
        return number;
    }

    return value;
}

export function moneyOptions(options: {title?: string, tooltip?: string}, useLogging: boolean = false): {tooltip?: string} {
    if ('title' in options) {
        if (useLogging) {
            Logger.warn('Controls.decorator:Money - опция title устарела, используйте опцию tooltip.');
        }
        return {
            tooltip: options.title
        }
    }
    if ('tooltip' in options) {
        return {
            tooltip: options.tooltip
        }
    }

    return {}
}

export function highlightOptions(options: IHighlightOptions, useLogging: boolean = false): IHighlightOptions {
    let {value, highlightedValue, className, highlightMode} = options;
    if (typeof options.text === 'string') {
        if (useLogging) {
            Logger.warn('Controls.decorator:Highlight - опция text устарела, используйте опцию value.');
        }
        value = options.text;
    }

    if (typeof options.highlight === 'string') {
        if (useLogging) {
            Logger.warn('Controls.decorator:Highlight - опция highlight устарела, используйте опцию value.');
        }
        highlightedValue = options.highlight;
    }

    if (typeof options.class === 'string') {
        if (useLogging) {
            Logger.warn('Controls.decorator:Highlight - опция class устарела, используйте опцию className.');
        }
        className = options.class;
    }

    if (typeof options.searchMode === 'string') {
        if (useLogging) {
            Logger.warn('Controls.decorator:Highlight - опция searchMode устарела, используйте опцию highlightMode.');
        }
        highlightMode = options.searchMode;
    }

    return <IHighlightOptions>{value, highlightedValue, className, highlightMode};
}
