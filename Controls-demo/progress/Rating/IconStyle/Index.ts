import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/progress/Rating/IconStyle/Template';

export default class Rating extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _value: number = 3;
    protected _iconStyle: string[] = ['warning', 'info', 'success', 'danger', 'secondary', 'primary', 'default',
        'contrast', 'readonly'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
