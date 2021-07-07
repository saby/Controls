import LinkView from './LinkView';
import componentTmpl = require('wml!Controls/_dateRange/RangeShortSelectorLink/RangeShortSelectorLink');
import {TemplateFunction} from 'UI/Base';

export default class RangeShortSelectorLink extends LinkView {
    _template: TemplateFunction = componentTmpl;
}
