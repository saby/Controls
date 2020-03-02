import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IoC} from 'Env/Env';
import controlTemplate = require('wml!Controls-demo/Buttons/Baseline/Template');

class ViewModes extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    static _styles: string[] = ['Controls-demo/Buttons/Baseline/Style'];
    static _theme: string[] = ['Controls/Classes'];
}
export default ViewModes;
