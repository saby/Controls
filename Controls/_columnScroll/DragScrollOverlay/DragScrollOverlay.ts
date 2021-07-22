import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_columnScroll/DragScrollOverlay/DragScrollOverlay';
import {isFullGridSupport} from 'Controls/display';

export const OVERLAY_JS_SELECTOR = 'controls-DragScroll__overlay';

export default class DragScrollOverlay extends Control {
    private _template: TemplateFunction = template;
    private readonly _classes: string = DragScrollOverlay.getClasses();

    static getClasses(): string {
        let classes = OVERLAY_JS_SELECTOR;
        if (!isFullGridSupport()) {
            classes += ` ${OVERLAY_JS_SELECTOR}_not-full-grid-support`;
        }
        return classes;
    }
}
