import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Decorator/Money/DecimalsVisibility/DecimalsVisibility';
import 'css!Controls/CommonClasses';
import 'css!Controls-demo/Controls-demo';

class DecimalsVisibility extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
}

export default DecimalsVisibility;
