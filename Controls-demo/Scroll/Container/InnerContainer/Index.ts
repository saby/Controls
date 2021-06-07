import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/Container/InnerContainer/Template');

export default class ContainerBaseDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
