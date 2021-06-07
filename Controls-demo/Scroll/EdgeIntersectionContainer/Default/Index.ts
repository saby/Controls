import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/EdgeIntersectionContainer/Default/Template');
import {SyntheticEvent} from "Vdom/Vdom";

export default class DefaultScrollDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _offset: number = 0;
    protected _logs: string[] = [];

    protected _handler(e: SyntheticEvent, eventType) {
        this._logs.push(`Обновилась видимость блока ${eventType}.`);
    }

    protected _increaseOffsets() {
        this._offset += 50;
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
