import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Popup/SearchParam/Index');
import 'css!Controls-demo/Controls-demo';

class SearchParamDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
}
export default SearchParamDemo;
