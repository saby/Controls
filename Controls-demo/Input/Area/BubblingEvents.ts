import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/Area/BubblingEvents');
import 'css!Controls-demo/Controls-demo';

class BubblingEvents extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _keyDown: boolean = false;
    protected _keyPress: boolean = false;
    protected _keyUp: boolean = false;

    protected _beforeMount(): void {
        this._keyDown = false;
        this._keyPress = false;
        this._keyUp = false;
    }

    private _keyDownHandler(): void {
        this._keyDown = true;
    }

    private _keyPressHandler(): void {
        this._keyPress = true;
    }

    private _keyUpHandler(): void {
        this._keyUp = true;
    }

    private clear(): void {
        this._keyDown = false;
        this._keyPress = false;
        this._keyUp = false;
    }
}

export default BubblingEvents;
