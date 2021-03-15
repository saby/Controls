import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Classes/InlineHeight/InlineHeight');
import 'css!Controls/CommonClasses';
import 'css!Controls-demo/Classes/InlineHeight/InlineHeight';

class ViewModes extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ViewModes;
