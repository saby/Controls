import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as controlTemplate from 'wml!Controls-demo/Buttons/TextAlign/Template';

class ButtonStyle extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default ButtonStyle;
