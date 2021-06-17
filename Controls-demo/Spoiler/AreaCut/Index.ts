import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Spoiler/AreaCut/AreaCut';

class TextAlignments extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _readOnly1: boolean;
    protected _readOnly2: boolean;
    protected _areaValue1: string = '';
    protected _areaValue2: string = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto maxime quaerat reprehenderit ullam? Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto maxime quaerat reprehenderit ullam?';

    protected _toggleReadOnly(event: Event, propertyName: string): void {
        this[propertyName] = !this[propertyName];
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default TextAlignments;
