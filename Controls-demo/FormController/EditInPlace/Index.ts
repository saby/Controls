import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/FormController/EditInPlace/EditInPlace');
import {Memory, ISource} from 'Types/source';

class FormController extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _dataSource: ISource = null;

    protected _beforeMount(options: IControlOptions): void {
        this._dataSource = options.dataSource || new Memory({
            keyProperty: 'id',
            data: [{ id: 0}]
        });
    }

    protected _clickHandler(): void {
        this._children.stackOpener.open();
    }
    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/FormController/FormControllerDemo'];
}
export default FormController;
