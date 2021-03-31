import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Classes/Offsets/Template');
import 'css!Controls/CommonClasses';
import 'css!Controls-demo/Classes/Offsets/Style';

class ViewModes extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ViewModes;
