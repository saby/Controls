/**
 * @library Controls/sizeUtils
 * @includes HasScrollbar Controls/_utils/sizeUtils/HasScrollbar
 * @includes hasHorizontalScroll Controls/_utils/sizeUtils/hasHorizontalScroll
 * @includes getDimensions Controls/_utils/sizeUtils/getDimensions
 * @includes DOMUtil Controls/_utils/sizeUtils/DOMUtil
 * @includes getScrollbarWidth Controls/_utils/sizeUtils/getScrollbarWidth
 * @includes getTextWidth Controls/_utils/sizeUtils/getTextWidth
 * @includes getWidth Controls/_utils/sizeUtils/getWidth
 * @public
 * @author Красильников А.С.
 */

import * as DOMUtil from './_utils/sizeUtils/DOMUtil';

export {hasScrollbar} from './_utils/sizeUtils/HasScrollbar';
export {default as hasHorizontalScroll} from './_utils/sizeUtils/hasHorizontalScroll';
export {default as getDimensions} from './_utils/sizeUtils/getDimensions';
export {getScrollbarWidth, getScrollbarWidthByMeasuredBlock} from './_utils/sizeUtils/getScrollbarWidth';
export {getTextWidth} from './_utils/sizeUtils/getTextWidth';
export {getWidth} from './_utils/sizeUtils/getWidth';

export {
    DOMUtil
};
