import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_columnScroll/New/DragScrollOverlay/DragScrollOverlay';

export default class DragScrollOverlay extends Control {
    private _template: TemplateFunction = template;
    private readonly _classes: string = 'controls-Grid__DragScrollNew__overlay';
}
