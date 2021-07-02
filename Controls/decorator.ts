/**
 * Библиотека контролов, которые предназначены для преобразования данных к какому-либо внешнему виду.
 * @library
 * @includes RegExp Controls/_decorator/inputUtils/RegExp
 * @includes IDate Controls/_decorator/IDate
 * @includes IHighlight Controls/_decorator/IHighlight
 * @includes IMoney Controls/_decorator/IMoney
 * @includes INumber Controls/_decorator/INumber
 * @includes IPhone Controls/_decorator/IPhone
 * @includes IWrapURLs Controls/_decorator/IWrapURLs
 * @public
 * @author Крайнов Д.О.
 */

/*
 * Decorator library
 * @library
 * @includes RegExp Controls/_decorator/inputUtils/RegExp
 * @public
 * @author Крайнов Д.О.
 */

import * as Formatter from './_decorator/resources/Formatter';
import * as FormatBuilder from './_decorator/resources/FormatBuilder';
import * as Parser from './_decorator/resources/parse';
import * as numberConstant from './_decorator/resources/NumberConstant';

import * as Money from 'Controls/_decorator/Money';
import * as Number from 'Controls/_decorator/Number';

export {default as Markup} from './_decorator/Markup';
export {default as Phone, IPhoneOptions} from 'Controls/_decorator/Phone';
export {default as WrapURLs, IWrapURLsOptions} from 'Controls/_decorator/WrapURLs';
export {default as Highlight, SearchMode, IHighlightOptions} from 'Controls/_decorator/Highlight';
export {default as MultilineText} from 'Controls/_decorator/MultilineText';
export {default as Date, IDateOptions} from 'Controls/_decorator/Date';
export {Money, Number};
export {IMoneyOptions} from 'Controls/_decorator/resources/Money';
export {INumberOptions, RoundMode} from 'Controls/_decorator/resources/Number';
export * as MoneyFunctions from 'Controls/_decorator/resources/Money';
export * as NumberFunctions from 'Controls/_decorator/resources/Number';
export {default as IOnlyPositive, IOnlyPositiveOptions} from 'Controls/_decorator/interfaces/IOnlyPositive';

export * from './_decorator/resources/IMask';
export * from './_decorator/resources/Util';
export * from './_decorator/Phone/phoneMask';
export {Formatter, FormatBuilder, Parser, numberConstant};

import * as Converter from './_decorator/Markup/Converter';
import {default as InnerText} from './_decorator/Markup/resolvers/innerText';
import {default as _highlightResolver} from './_decorator/Markup/resolvers/highlight';
import {default as noOuterTag} from './_decorator/Markup/resolvers/noOuterTag';
import {default as linkDecorate} from './_decorator/Markup/resolvers/linkDecorate';
import {default as linkWrapResolver} from './_decorator/Markup/resolvers/linkWrap';

import {default as splitIntoTriads, concatTriads, NUMBER_DIGITS_TRIAD, SPLITTER} from './_decorator/inputUtils/splitIntoTriads';
import {default as toString} from './_decorator/inputUtils/toString';
import {default as numberToString} from './_decorator/inputUtils/numberToString';
import {partOfNumber, escapeSpecialChars, addWordCheck} from './_decorator/inputUtils/RegExp';
import {getLinks, parseLinks, linkParseRegExp} from './_decorator/Markup/resources/linkDecorateUtils';

export {
    Converter,
    InnerText,
    noOuterTag,
    linkDecorate,
    linkWrapResolver,
    _highlightResolver,
    splitIntoTriads,
    concatTriads,
    NUMBER_DIGITS_TRIAD,
    SPLITTER,
    toString,
    numberToString,
    partOfNumber,
    escapeSpecialChars,
    addWordCheck,
    getLinks,
    parseLinks,
    linkParseRegExp
};
