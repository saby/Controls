const MOUSE_LEAVE_DELAY = 40;
/**
 * HoverController
 * @author Мочалов М.А.
 * @private
 */
export default class HoverController {
    private _mouseLeaveCallback: Function;
    private _timerId: number = null;

    constructor(callback: Function) {
        this._mouseLeaveCallback = callback;
    }

    mouseEnter(): void {
        if (this._timerId !== null) {
            clearTimeout(this._timerId);
        }
    }

    mouseLeave(): void {
        this._timerId = setTimeout(this._mouseLeaveCallback, MOUSE_LEAVE_DELAY);
    }
}
