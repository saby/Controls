import { TouchContextField } from 'Controls/context';

import { compatibility } from 'Env/Env';

class TouchDetectorController {
    private _touchObjectContext;

    // При инициализации необходимо проставить значение, далее значение определяется в зависимости от событий
    private _state: boolean = compatibility.touch;
    private _lastState: boolean = compatibility.touch;

    private _moveInRow: number = 1;

    createContext(): object {
        this._touchObjectContext = new TouchContextField(this._state);
        return this._touchObjectContext;
    }

    private _updateTouchObject(): void {
        if (this._state !== this._lastState) {
            this._touchObjectContext.setIsTouch(this._state);
            this._lastState = this._state;
        }
    }

    touchHandler(): void {
        this._state = true;
        this._updateTouchObject();
        this._moveInRow = 0;
    }

    moveHandler(): void {
        if (this._moveInRow > 0) {
            this._state = false;
            this._updateTouchObject();
        }
        this._moveInRow++;
    }

    isTouch(): boolean {
        return !!this._state;
    }

    getClass(): string {
        return this._state ? 'ws-is-touch' : 'ws-is-no-touch';
    }

}

export = TouchDetectorController;
