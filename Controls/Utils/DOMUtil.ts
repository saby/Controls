import {DOMUtil} from 'Controls/sizeUtils';
import oldUtilLogger from 'Controls/Utils/OldUtilLogger';

const getElementsWidth = DOMUtil.getElementsWidth;
const reflow = DOMUtil.reflow;
const width = DOMUtil.width;
const getWidthForCssClass = DOMUtil.getWidthForCssClass;
oldUtilLogger('Controls/Util/DOMUtil', 'Controls/sizeUtils:DOMUtil');

export  {getElementsWidth, reflow, width, getWidthForCssClass};
