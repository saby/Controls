import Control = require('Core/Control');
import template = require('wml!Controls-demo/Async/_asyncDemo/ShowHide');

export default class extends Control {
    protected _template: Function = template;

    protected showAsync: boolean = true;
    protected buttonCaption: string = 'Скрыть';

    protected toggleAsync(): void {
        this.showAsync = !this.showAsync;
        this.buttonCaption = this.showAsync ? 'Скрыть' : 'Показать';
    }
}
