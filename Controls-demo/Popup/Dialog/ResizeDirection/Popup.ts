import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Popup/Dialog/ResizeDirection/Popup');

class Popup extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _height: number = 300;
    protected _width: number = 600;
    protected _applyHeight: number = 300;
    protected _applyWidth: number = 600;
    protected _minHeight: number = 300;
    protected _minWidth: number = 600;
    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Popup/Dialog/ResizeDirection/Popup', 'Controls-demo/Controls-demo'];
    protected _sizeChangedHandler(): void {
        this._notify('controlResize', [], {bubbling: true});
    }
    protected _handleClick(): void {
        this._applyHeight = this._height < this._minHeight ? this._minHeight: this._height;
        this._applyWidth = this._width < this._minWidth ? this._minWidth : this._width;
    }
}
export default Popup;
