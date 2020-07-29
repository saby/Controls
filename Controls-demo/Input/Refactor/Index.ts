import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/Refactor/Refactor');

class Refactor extends Control<IControlOptions> {
    protected _value: string = 'Тест';
    protected _visible: boolean = false;

    protected _template: TemplateFunction = controlTemplate;

    _toggle(): void {
        this._visible = !this._visible;
    }

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Input/Refactor/Refactor'];
}

export default Refactor;
