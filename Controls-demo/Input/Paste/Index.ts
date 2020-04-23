import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/Paste/Paste');

class Paste extends Control<IControlOptions> {
    protected _complicate(): void {
        const complicatingValue: string = Math.random().toString(36).substr(2, 3);
        this._children.password.paste(complicatingValue);
    }

    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];

    static _theme: string[] = ['Controls/Classes'];
}

export default Paste;
