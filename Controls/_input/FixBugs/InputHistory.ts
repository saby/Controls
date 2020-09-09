import {IText} from 'Controls/decorator';

export class InputHistory {
    private _cursor: number = 0;
    private _history: IText[] = [];

    constructor(text: IText) {
        this._add(text);
    }

    private _add(text: IText): void {
        this._cursor++;
        this._history.push(text);
    }

    private _clearHistory(): void {
        if (this._history.length === this._cursor) {
            return;
        }

        this._history.splice(this._cursor);
    }

    private _updateCursor(cursor: number): IText | false {
        const text: IText = this._history[cursor - 1];

        if (text) {
            this._cursor = cursor;
            return text;
        }

        return  false;
    }

    back(): IText | false {
        return this._updateCursor(this._cursor - 1);
    }

    forward(): IText | false {
        return this._updateCursor(this._cursor + 1);
    }

    add(text: IText): void {
        this._clearHistory();
        this._add(text);
    }
}
