/**
 * @library Controls/inputUtils
 * @includes splitIntoTriads Controls/_utils/inputUtils/splitIntoTriads
 * @includes toString Controls/_utils/inputUtils/toString
 * @includes numberToString Controls/_utils/inputUtils/numberToString
 * @includes RegExp Controls/_utils/inputUtils/RegExp
 * @public
 * @author Журавлев М.С.
 */

export {default as splitIntoTriads, concatTriads, NUMBER_DIGITS_TRIAD, SPLITTER} from './_utils/inputUtils/splitIntoTriads';
export {default as toString} from './_utils/inputUtils/toString';
export {default as numberToString} from './_utils/inputUtils/numberToString';
export {partOfNumber, escapeSpecialChars, addWordCheck} from './_utils/inputUtils/RegExp';
