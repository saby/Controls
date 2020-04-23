import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/toggle/Separator/Index');

class ViewModes extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _expanded1: boolean = false;
    protected _expanded2: boolean = false;
    protected _expanded3: boolean = false;
    protected _expanded4: boolean = false;

    protected _headingClick(): void {
        this._expanded3 = !this._expanded3;
    }

    static _theme: string[] = ['Controls/Classes'];
}
export default ViewModes;
