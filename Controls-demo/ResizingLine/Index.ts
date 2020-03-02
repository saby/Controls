import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/ResizingLine/ResizingLine');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/ResizingLine/ResizingLine';
import {SyntheticEvent} from 'Vdom/Vdom';

class ResizingLine extends Control<IControlOptions> {
    private _widthOfRightContainer: number = 100;
    private _widthOfCenterContainer: number = 100;
    private _widthOfLeftContainer: number = 100;

    protected _template: TemplateFunction = controlTemplate;

    protected _offsetHandler(event: SyntheticEvent<Event>, containerName: string, offset: number): void {
        let value: number;
        switch (containerName) {
            case 'leftContainer':
                value = this._widthOfLeftContainer + offset;
                this._widthOfLeftContainer = ResizingLine._limit(value);
                break;
            case 'centerContainer':
                value = this._widthOfCenterContainer + offset;
                this._widthOfCenterContainer = ResizingLine._limit(value);
                break;
            case 'rightContainer':
                value = this._widthOfRightContainer + offset;
                this._widthOfRightContainer = ResizingLine._limit(value);
                break;
        }
    }

    private static MIN_WIDTH: number = 100;
    private static MAX_WIDTH: number = 300;

    static _theme: string[] = ['Controls/Classes'];

    private static _limit(value: number): number {
        return  Math.max(ResizingLine.MIN_WIDTH, Math.min(value, ResizingLine.MAX_WIDTH));
    }
}

export default ResizingLine;
