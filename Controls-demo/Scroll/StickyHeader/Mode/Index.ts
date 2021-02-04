import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/StickyHeader/Mode/Template');

export default class MultiHeaderDemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _mode: string = 'notsticky';

    protected _updateEnabled(): void {
        if (this._mode === 'notsticky') {
            this._mode = 'replaceable';
        } else {
            this._mode = 'notsticky';
        }
    }

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
