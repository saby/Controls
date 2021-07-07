import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/StickyBlock/Mode/Template');

export default class MultiHeaderDemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _mode: string = 'notsticky';
    protected _stickyMode: string = 'replaceable';
    protected _groupMode: string = 'replaceable';

    protected _updateEnabled(): void {
        if (this._mode === 'notsticky') {
            this._mode = 'replaceable';
        } else {
            this._mode = 'notsticky';
        }
    }

    protected _toggleStickyMode(event: Event, stickyName: string): void {
        if (this[stickyName] === 'replaceable') {
            this[stickyName] = 'stackable';
        } else {
            this[stickyName] = 'replaceable';
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Scroll/StickyBlock/Mode/Mode'];
}
