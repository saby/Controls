import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/dateRange/Input/Tag/Tag');

class Range extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    protected _tagClickHandler(e, fieldName: string, target: HTMLElement): void {
        this._children.infoBox.open({
            target,
            message: `This field ${fieldName} is required`
        });
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Range;
