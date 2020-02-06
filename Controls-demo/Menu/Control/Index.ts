import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Control/Index');
import 'css!Controls-demo/Controls-demo';

class SourceDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
}
export default SourceDemo;
