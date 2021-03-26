import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Classes/Blocks/Template');
import {StackOpener} from 'Controls/popup';
import 'Controls-demo/Classes/Blocks/Stack/Template';

class ViewModes extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    private _opener: StackOpener = new StackOpener();

    protected _openStackPanel(): void {
        return this._opener.open({
            template: 'Controls-demo/Classes/Blocks/Stack/Template',
            width: 700,
            opener: this
        });
    }
    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ViewModes;
