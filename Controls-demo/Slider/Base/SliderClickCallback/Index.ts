import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/Slider/Base/SliderClickCallback/Template');

class Base extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _timeoutId: NodeJS.Timeout;
    protected _info: string;

    protected _beforeMount(): void {
        this._sliderClickCallback = this._sliderClickCallback.bind(this);
    }

    protected _sliderClickCallback(value: number): void {
        this._info = `Произошло нажатие на ползунок слайдера. Новое значение слайдера = ${value}.`;
        if (this._timeoutId) {
            clearTimeout(this._timeoutId);
        }
        this._timeoutId = setTimeout(() => {
            this._info = '';
        }, 3000);
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Base;
