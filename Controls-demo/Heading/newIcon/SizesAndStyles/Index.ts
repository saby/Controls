import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Heading/newIcon/SizesAndStyles/SizesAndStyles');

class ViewModes extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ViewModes;
