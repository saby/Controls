import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/progress/Rating/IconPadding/Template';

class Rating extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _value: number = 3;
    protected _iconPadding: string[] = ['null', 'default', '3xs', '2xs', 'xs', 's', 'm', 'l', 'xl'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Rating;
