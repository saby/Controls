import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Popup/Dialog/ResizeDirection/Popup');

class Popup extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _height: number = 150;
    protected _width: number = 300;
    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Popup/Dialog/ResizeDirection/Popup', 'Controls-demo/Controls-demo'];
    protected _sizeChangedHandler(): void {
        this._notify('controlResize', [], {bubbling: true});
    }
}
export default Popup;
