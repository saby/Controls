import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/progress/Rating/Base/Template';

class Rating extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _value: number = 3;
    protected _precision: number = 56;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Rating;
