/**
 * Утилиты для работы с текстом.
 * @library Controls/inputUtils
 * @includes splitIntoTriads Controls/_utils/inputUtils/splitIntoTriads
 * @includes toString Controls/_utils/inputUtils/toString
 * @includes numberToString Controls/_utils/inputUtils/numberToString
 * @includes RegExp Controls/_utils/inputUtils/RegExp
 * @private
 * @author Журавлев М.С.
 */

export {splitIntoTriads, concatTriads, NUMBER_DIGITS_TRIAD, SPLITTER} from 'Controls/decorator';
export {toString} from 'Controls/decorator';
export {numberToString} from 'Controls/decorator';
export {partOfNumber, escapeSpecialChars, addWordCheck} from 'Controls/decorator';
