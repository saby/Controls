import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/ResizingLine/Orientation/Template');
import {SyntheticEvent} from 'Vdom/Vdom';

export default class ResizingLine extends Control<IControlOptions> {
    private _heightOfCenterContainer: number = 50;
    private _top: number = 50;
    private _maxOffset: number = 30;
    private _minOffset: number = 0;

    private _widthOfCenterContainer: number = 50;
    private _left: number = 50;
    private _maxOffset2: number = 30;
    private _minOffset2: number = 0;

    protected _template: TemplateFunction = controlTemplate;

    protected _offsetHandler(event: SyntheticEvent<Event>, containerName: string, offset: number): void {
        let value: number;
        let offsetSize: number;
        let prevSize: number;

        switch (containerName) {
            case 'centerContainer':
                prevSize = this._heightOfCenterContainer;
                value = this._heightOfCenterContainer + offset;
                this._heightOfCenterContainer = ResizingLine._limit(value);
                offsetSize = this._heightOfCenterContainer - prevSize;
                this.calcOffset1(offsetSize);
                break;
            case 'centerContainerTop':
                prevSize = this._heightOfCenterContainer;
                value = this._heightOfCenterContainer + offset;
                this._heightOfCenterContainer = ResizingLine._limit(value);
                offsetSize = this._heightOfCenterContainer - prevSize;
                this.calcOffset1(offsetSize);
                this._top -= offsetSize;
                break;
            case 'centerHorizontalContainer':
                prevSize = this._widthOfCenterContainer;
                value = this._widthOfCenterContainer + offset;
                this._widthOfCenterContainer = ResizingLine._limit(value);
                offsetSize = this._widthOfCenterContainer - prevSize;
                this.calcOffset2(offsetSize);
                break;
            case 'centerHorizontalContainerLeft':
                prevSize = this._widthOfCenterContainer;
                value = this._widthOfCenterContainer + offset;
                this._widthOfCenterContainer = ResizingLine._limit(value);
                offsetSize = this._widthOfCenterContainer - prevSize;
                this._left -= offsetSize;
                this.calcOffset2(offsetSize);
                break;
        }
    }

    private calcOffset1(offsetSize: number): void {
        this._maxOffset -= offsetSize;
        this._minOffset += offsetSize;
    }

    private calcOffset2(offsetSize: number): void {
        this._maxOffset2 -= offsetSize;
        this._minOffset2 += offsetSize;
    }

    private static MIN_SIZE: number = 50;
    private static MAX_SIZE: number = 80;

    static _theme: string[] = ['Controls/Classes'];

    private static _limit(value: number): number {
        return  Math.max(ResizingLine.MIN_SIZE, Math.min(value, ResizingLine.MAX_SIZE));
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/ResizingLine/Orientation/Style'];
}
