import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/progress/Rating/IconSize/Template';

class Rating extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _value: number = 3;
    protected _iconSize: string[] = ['default', '2xs', 'xs', 's', 'm', 'l'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Rating;
